import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { useNavigate } from 'react-router-dom';
import house1 from '../assets/house1.jpg'
import { useSelector } from 'react-redux' // Assuming you have a custom hook for Redux selector
import toast from 'react-hot-toast';

const CurrentRental = ({ propertyId }) => {
    const [property, setProperty] = useState(null);
    const [depositPaid, setDepositPaid] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user);
    useEffect(() => {
        const fetchPropertyAndBooking = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/property/${propertyId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setProperty(response.data.property);

                // Fetch booking to check deposit status
                const bookingRes = await axios.get(
                    `http://localhost:3000/api/booking/bookings/property/${propertyId}`,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
                const booking = bookingRes.data.booking || bookingRes.data;
                if (booking[0] && booking[0].paymentStatus === "completed") {
                    setDepositPaid(true);
                } else {
                    setDepositPaid(false);
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching property or booking:', err);
                setError('Failed to load property details.');
                setLoading(false);
            }
        };

        fetchPropertyAndBooking();
    }, [propertyId]);


    

    const addMemberToProperty = async () => {
        try {
            await axios.post(`http://localhost:3000/api/property/members/${propertyId}/`, {
                userId: user.user._id
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                }
            });
            toast.success('You have been added as a member!');
        } catch {
            toast.error('Failed to update property membership.');
        }
    };






    const createBookingRequest = async () => {
        try {
            console.log("Property : ");
            console.log(property);

            const bookingResponse = await axios.post(
                `http://localhost:3000/api/booking/bookings`,
                {
                    property_id: propertyId,
                    user_id: user.user._id,
                    landlord_id: property.landlord_id._id,
                    moveInDate: new Date().toISOString(),
                    durationMonths: 12,
                    occupants: 1,
                    rentAmount: property.rent,
                    depositAmount: property.deposit,
                    paymentStatus: "completed",
                    bookingStatus: "completed",
                    paymentMethod: "UPI",
                    transaction_id: localStorage.getItem('lastTxnId'),
                    contract_url: null,
                    verificationStatus: "not_verified",
                    cancellationReason: null,
                    bookingDate: new Date().toISOString(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            // Extract booking_id from response
            const booking = bookingResponse.data.booking || bookingResponse.data; // adjust as per your API
            const booking_id = booking._id;

            // Prepare month rent data
            const monthRentPayload = {
                booking_id: booking_id,
                property_id: propertyId,
                user_id: user.user._id,
                landlord_id: property.landlord_id._id,
                month: new Date().toISOString().slice(0, 7), // e.g. "2025-03"
                due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // or set to your logic
                amount_due: property.rent,
                amount_paid: property.rent,
                payment_status: "paid",
                payment_method: "UPI",
                transaction_id: localStorage.getItem('lastTxnId'),
                late_fee: 0,
                remarks: "Rent paid via PhonePe"
            };

            // Call MonthRent API
            const rentResponse = await axios.post(
                `http://localhost:3000/api/rents/`,
                monthRentPayload,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            toast.success('Booking and rent recorded successfully!');
            console.log('Month rent response:', rentResponse.data);

        } catch (error) {
            console.error('Failed to send booking or rent request:', error.response?.data || error.message);
            toast.error('Failed to send booking or rent request.');
        }
    };

    useEffect(() => {
        const txnId = localStorage.getItem('lastTxnId');
        if (txnId && property) {
            axios.get(`http://localhost:3000/api/payment/status/${txnId}`)
                .then(async res => {
                    if (res.data.paymentDetails && res.data.paymentDetails[0].state === "COMPLETED") {
                        // 1. Check if deposit is already paid by fetching booking for this property
                        const bookingRes = await axios.get(
                            `http://localhost:3000/api/booking/bookings/property/${property._id}`,
                            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                        );
                        const booking = bookingRes.data.booking || bookingRes.data;
                        console.log("Booking : ");
                        console.log(booking);
                        if (!booking[0] || booking[0].paymentStatus !== "completed") {
                            // Deposit not paid yet, so this is the first time
                            toast.success('Deposit payment successful!');
                            await addMemberToProperty();
                            await createBookingRequest();
                        } else {
                           
                            // Deposit already paid, so this is a rent payment
                            // Find month rent for this booking where payment_status is not "paid"
                            const monthRentRes = await axios.get(
                                `http://localhost:3000/api/rents/${booking[0]._id}`,
                                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                            );

                            // monthRentRes.data should be an array of rents
                            const rents = Array.isArray(monthRentRes.data) ? monthRentRes.data : (monthRentRes.data.monthRents || []);
                            const latestRent = rents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

                            if (latestRent && latestRent.payment_status !== "paid") {
                                // Update latest month rent payment status
                                await axios.put(
                                    `http://localhost:3000/api/rents/rent/${latestRent._id}`,
                                    {
                                        payment_status: "paid",
                                        amount_paid: latestRent.amount_due,
                                        payment_method: "UPI",
                                        transaction_id: txnId,
                                    },
                                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                                );
                                toast.success('Monthly rent payment successful!');
                                // --- Create next month's rent entry ---
                                // Calculate next month in "YYYY-MM" format
                                const [year, month] = latestRent.month.split('-');
                                const nextMonthDate = new Date(Number(year), Number(month), 1); // JS months are 0-based
                                const nextMonthStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}`;

                                const nextMonthRentPayload = {
                                    booking_id: latestRent.booking_id,
                                    property_id: latestRent.property_id,
                                    user_id: latestRent.user_id,
                                    landlord_id: latestRent.landlord_id,
                                    month: nextMonthStr,
                                    due_date: new Date(new Date(latestRent.due_date).getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days after last due date
                                    amount_due: latestRent.amount_due,
                                    amount_paid: 0,
                                    payment_status: "pending",
                                    payment_method: null,
                                    transaction_id: null,
                                    late_fee: 0,
                                    remarks: "Auto-generated for next month"
                                };

                                await axios.post(
                                    `http://localhost:3000/api/rents/`,
                                    nextMonthRentPayload,
                                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                                );
                                toast.success('Next month rent entry created!');

                            } else {
                                toast.success('Payment successful!');
                            }
                        }
                        localStorage.removeItem('lastTxnId');
                    } else {
                        alert('Payment failed or pending.');
                    }
                })
                .catch(err => {
                    alert('Could not verify payment status.');
                });
        }
    }, [property]);

    const handlePayRent = async (paymentType) => {
        try {

            const response = await axios.post('http://localhost:3000/api/payment/initiate', {
                user_id: user.user._id,
                price: paymentType == 'deposit' ? property.deposit : property.rent,
                phone: '9876543210',
                name: property.title,

                // No need to send redirectUrl if your backend uses a fixed one
            });
            // alert('Payment Initiated. Please complete the payment on PhonePe.');
            // Save transaction ID for status check after redirect
            if (response.data.txnId) {
                localStorage.setItem('lastTxnId', response.data.txnId);
            }

            // Redirect to PhonePe payment gateway
            if (response.data.redirectUrl) {
                window.location.href = response.data.redirectUrl;
            } else {
                alert('Failed to initiate payment. Please try again.');
            }
        } catch (error) {
            console.error('Error initiating payment:', error.response?.data || error.message);
            alert('Failed to initiate payment. Please try again.');
        }
    };



    if (loading) {
        return <p className="text-white">Loading current rental...</p>;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    if (!property) {
        return <p className="text-secondary-text">No property found for the current rental.</p>;
    }
    console.log(property);
    return (
        <>
            <div className='w-full bg-sub-bg rounded-xl p-5'>
                <div className='flex justify-between'>
                    <p className='text-white text-lg font-bold'>Current Property</p>
                    <p className='text-tertiary-text text-base font-semibold hover:cursor-pointer hover:underline'
                        onClick={() => navigate(`/currentpropertydashboard/${property._id}`)}>View Details</p>
                </div>
                <div className='flex flex-col md:flex-row gap-3 mt-3'>
                    <div className='flex flex-col w-full md:w-1/2 gap-4'>
                        <img src={property.mainImage || 'https://placehold.co/300x200'}
                            alt={property.title} className='w-full max-h-[16.6rem]  object-cover rounded-xl' />
                    </div>
                    <div className='flex flex-col space-y-2 w-full md:w-1/2'>
                        <p className='text-white text-lg font-semibold'>{property.title}</p>
                        <p className='text-secondary-text font-semibold text-base'>{property.location} 1.2 Kilometers away from D. Y. Patil College {property.address}</p>
                        <div className='grid grid-cols-2 gap-3'>
                            <div className='flex flex-col bg-cards-bg rounded-xl p-2'>
                                <p className='text-secondary-text text-base font-semibold'>{property.flatType?"Room Type":"Deposit"}</p>
                                <p className='text-white text-base font-semibold'>{property.flatType?property.flatType:"₹"+property.deposit?.toLocaleString('en-IN')}</p>
                            </div>
                            <div className='flex flex-col bg-cards-bg rounded-xl p-2'>
                                <p className='text-secondary-text text-base font-semibold'>Rent</p>
                                <p className='text-white text-base font-semibold'>₹{property.rent?.toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                            </div>
                        </div>
                        {!depositPaid && (
                            <button
                                onClick={async () => {
                                    await handlePayRent('deposit');
                                    setDepositPaid(true); // Optimistically update UI
                                }}
                                className='bg-white text-black w-full py-2 rounded-lg font-semibold hover:cursor-pointer hover:bg-slate-100'
                            >
                                Pay Deposit
                            </button>
                        )}
                        {depositPaid && (
                            <button
                                onClick={async () => {
                                    await handlePayRent('rent');
                                    // Optionally, you can update state here if you want to reflect rent payment
                                }}
                                className='bg-white text-black w-full py-2 rounded-lg font-semibold hover:cursor-pointer hover:bg-slate-100'
                            >
                                Pay Rent
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default CurrentRental;