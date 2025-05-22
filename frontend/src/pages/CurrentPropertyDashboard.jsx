import React, { useEffect, useState } from 'react'

import agreement_svg from '../assets/agreement_svg.svg'
import id_proof_svg from '../assets/id_proof_svg.svg'
import pfp from '../assets/pfp.png'
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux'
import { Star } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import { useRef } from 'react';
import toast from 'react-hot-toast';
// Inside your component
// In your imports section, add:
import PaymentHistorySection from '../components/PaymentHistorySection';


const { BaseLayer } = LayersControl;
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});
const CurrentPropertyDashboard = () => {
    const [showPaymentModal, setShowPaymentModal] = useState(false);
const [nextUnpaidMonth, setNextUnpaidMonth] = useState(null);
    const mapSectionRef = useRef(null);
    const [property, setProperty] = useState(null);
    const { propertyId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useSelector((state) => state.user);
    const [allRents, setAllRents] = useState([]);
    const [landlordRating, setLandlordRating] = React.useState(0);
    const [propertyRating, setPropertyRating] = React.useState(0);
    const [propertyComment, setPropertyComment] = React.useState('');
    const [landlordHover, setLandlordHover] = React.useState(0);
    const [propertyHover, setPropertyHover] = React.useState(0);
    const [leaseDuration, setLeaseDuration] = useState(0);
    const [nextMonthRent, setNextMonthRent] = useState(null);
    // Get current month in "YYYY-MM"
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentMonthRent = allRents.find(r => r.month === currentMonth);
    const isCurrentMonthRentPaid = currentMonthRent && currentMonthRent.payment_status === "paid";
    const [depositPaid, setDepositPaid] = useState(false);




    const [showLeavePropertyModal, setShowLeavePropertyModal] = useState(false);
const [leaveReason, setLeaveReason] = useState('');
const [leaveRequestStatus, setLeaveRequestStatus] = useState(null);

// Add this function to handle the leave property request
const handleLeavePropertyRequest = async () => {
    try {
        const requestData = {
            propertyId,
            requestedPrice: { fixed: 0 }, // since this is not a rent request
            requestorName: user.user?.name,
            ownerName: property?.landlord_id.name,
            ownerId: property?.landlord_id._id,
            requestorId: user.user?._id,
            status: 'Pending',
            requestType: 'Leave Request',
            message: leaveReason, // using the leave reason as the message
        };

        const loadingToast = toast.loading('Sending leave request...');

        const response = await axios.post(
            'http://localhost:3000/api/request',
            requestData,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            }
        );

        toast.dismiss(loadingToast);
        setLeaveRequestStatus('success');
        toast.success('Leave request sent successfully!');

        // Reset form after 5 seconds
        setTimeout(() => {
            setShowLeavePropertyModal(false);
            setLeaveRequestStatus(null);
            setLeaveReason('');
        }, 5000);

    } catch (error) {
        console.error('Error sending leave request:', error);
        toast.error('Failed to send leave request. Please try again.');
        setLeaveRequestStatus('error');
    }
};
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
            // Check if user already has a booking for this property
            const existingBooking = await fetchUserBooking();
            if (existingBooking) {
                throw new Error('You already have a booking for this property');
            }

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
                    }
                }
            );

            const booking = bookingResponse.data.booking || bookingResponse.data;
            await createInitialRentEntry(booking._id);

            toast.success('Booking created successfully!');
            return booking;
        } catch (error) {
            toast.error(error.message || 'Failed to create booking.');
            throw error;
        }
    };


    const createInitialRentEntry = async (bookingId) => {
        try {
            const monthRentPayload = {
                booking_id: bookingId,
                property_id: propertyId,
                user_id: user.user._id,
                landlord_id: property.landlord_id._id,
                month: new Date().toISOString().slice(0, 7),
                due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                amount_due: property.rent,
                amount_paid: 0,
                payment_status: "pending",
                payment_method: null,
                transaction_id: null,
                late_fee: 0,
                remarks: "Initial rent entry"
            };

            await axios.post(
                `http://localhost:3000/api/rents/`,
                monthRentPayload,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    }
                }
            );
        } catch (error) {
            console.error('Failed to create initial rent entry:', error);
            throw error;
        }
    };


    const handlePayRent = async (paymentType) => {
    try {
        const userBooking = await fetchUserBooking();

        if (paymentType === 'rent') {
            if (!userBooking || userBooking.paymentStatus !== "completed") {
                toast.error('Please pay deposit first');
                return;
            }

            // Check if current month's rent is already paid
            const currentMonthRent = allRents.find(r => r.month === currentMonth);
            if (currentMonthRent?.payment_status === "paid") {
                // Find next unpaid month
                const nextUnpaidRent = allRents
                    .filter(r => r.payment_status !== "paid")
                    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];

                if (nextUnpaidRent) {
                    const nextMonth = new Date(nextUnpaidRent.month + '-01')
                        .toLocaleString('en-US', { month: 'long', year: 'numeric' });
                    
                    setNextUnpaidMonth(nextMonth);
                    setShowPaymentModal(true);
                    return;
                } else {
                    toast.error('No pending rent payments found');
                    return;
                }
            }
        }

        // Continue with payment initiation
        await initiatePayment(paymentType);
    } catch (error) {
        toast.error(error.message || 'Failed to initiate payment');
    }
};
const initiatePayment = async (paymentType) => {
    try {
        const response = await axios.post('http://localhost:3000/api/payment/initiate', {
            user_id: user.user._id,
            price: paymentType === 'deposit' ? property.deposit : property.rent,
            phone: '9876543210',
            name: property.title,
            property_id: propertyId,
        });

        if (response.data.txnId) {
            localStorage.setItem('lastTxnId', response.data.txnId);
            localStorage.setItem('paymentType', paymentType);
        }

        if (response.data.redirectUrl) {
            window.location.href = response.data.redirectUrl;
        } else {
            toast.error('Failed to initiate payment');
        }
    } catch (error) {
        throw error;
    }
};
    const fetchUserBooking = async () => {
        try {
            const response = await axios.get(
                `http://localhost:3000/api/booking/bookings/user/${user.user._id}/property/${propertyId}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            return response.data.booking;
        } catch (err) {
            console.error('Error fetching user booking:', err);
            return null;
        }
    };


    const createNextMonthRent = async (currentRent) => {
        try {
            // Calculate next month's date
            const [year, month] = currentRent.month.split('-');
            const nextMonthDate = new Date(Number(year), Number(month), 1);
            const nextMonthStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}`;

            const monthRentPayload = {
                booking_id: currentRent.booking_id,
                property_id: propertyId,
                user_id: user.user._id,
                landlord_id: property.landlord_id._id,
                month: nextMonthStr,
                due_date: new Date(new Date(currentRent.due_date).getTime() + 30 * 24 * 60 * 60 * 1000),
                amount_due: property.rent,
                amount_paid: 0,
                payment_status: "pending",
                payment_method: null,
                transaction_id: null,
                late_fee: 0,
                remarks: "Auto-generated for next month"
            };

            await axios.post(
                `http://localhost:3000/api/rents/`,
                monthRentPayload,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
        } catch (error) {
            console.error('Failed to create next month rent entry:', error);
            throw error;
        }
    };

    useEffect(() => {
        const txnId = localStorage.getItem('lastTxnId');
        if (txnId && property) {
            axios.get(`http://localhost:3000/api/payment/status/${txnId}`)
                .then(async res => {
                    if (res.data.paymentDetails && res.data.paymentDetails[0].state === "COMPLETED") {
                        try {
                            const userBooking = await fetchUserBooking();
                            const paymentType = localStorage.getItem('paymentType');

                            if (paymentType === 'deposit') {
                                if (!userBooking) {
                                    // New user flow
                                    await addMemberToProperty();
                                    await createBookingRequest();
                                } else if (userBooking.paymentStatus !== "completed") {
                                    // Update existing booking's deposit status
                                    await axios.put(
                                        `http://localhost:3000/api/booking/bookings/${userBooking._id}`,
                                        { paymentStatus: "completed" },
                                        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                                    );
                                }
                                toast.success('Deposit payment successful!');
                            } else if (paymentType === 'rent') {
                                if (!userBooking || userBooking.paymentStatus !== "completed") {
                                    throw new Error('Please pay deposit first');
                                }

                                // Handle rent payment
                                const monthRentRes = await axios.get(
                                    `http://localhost:3000/api/rents/${userBooking._id}`,
                                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                                );

                                const unpaidRents = monthRentRes.data.filter(r => r.payment_status !== "paid");
                                if (unpaidRents.length > 0) {
                                    const currentRent = unpaidRents[0];
                                    await axios.put(
                                        `http://localhost:3000/api/rents/rent/${currentRent._id}`,
                                        {
                                            payment_status: "paid",
                                            amount_paid: currentRent.amount_due,
                                            payment_method: "UPI",
                                            transaction_id: txnId
                                        },
                                        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                                    );
                                    await createNextMonthRent(currentRent);
                                    toast.success('Rent payment successful!');
                                }
                            }

                            localStorage.removeItem('lastTxnId');
                            localStorage.removeItem('paymentType');
                            await fetchPropertyAndNextRent();
                        } catch (error) {
                            toast.error(error.message || 'Payment processing failed');
                        }
                    } else {
                        toast.error('Payment failed or pending.');
                    }
                })
                .catch(err => {
                    toast.error('Could not verify payment status.');
                });
        }
    }, [property]);


    const fetchPropertyAndNextRent = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/api/property/${propertyId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setProperty(response.data.property);

            // Fetch user-specific booking
            const userBooking = await fetchUserBooking();

            if (userBooking) {
                setLeaseDuration(userBooking.durationMonths);
                setDepositPaid(userBooking.paymentStatus === "completed");

                // Fetch month rents for user's booking
                const monthRentRes = await axios.get(
                    `http://localhost:3000/api/rents/${userBooking._id}`,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
                const rents = Array.isArray(monthRentRes.data)
                    ? monthRentRes.data
                    : (monthRentRes.data.monthRents || []);

                setAllRents(rents);

                // Find earliest unpaid rent
                const unpaidRents = rents.filter(r => r.payment_status !== "paid");
                if (unpaidRents.length > 0) {
                    unpaidRents.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
                    setNextMonthRent(unpaidRents[0]);
                } else {
                    setNextMonthRent(null);
                }
            } else {
                setDepositPaid(false);
                setNextMonthRent(null);
                setAllRents([]);
            }

            setLoading(false);
        } catch (err) {
            console.error('Error fetching property or next rent:', err);
            setError('Failed to load property details.');
            setLoading(false);
        }
    };
    useEffect(() => {


        fetchPropertyAndNextRent();
    }, [propertyId]);

    const handleSubmitReview = async () => {
        console.log('Submitting review with data:', {
            user_id: user?.user?._id,
            property_id: propertyId,
            landlord_id: property?.landlord_id?._id,
            comment: propertyComment,
            rating: propertyRating,
        });

        try {
            const response = await axios.post(`http://localhost:3000/api/review/${propertyId}/review`, {
                user_id: user?.user?._id,
                property_id: propertyId,
                landlord_id: property?.landlord_id?._id,
                comment: propertyComment,
                rating: propertyRating,
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            console.log('Review submitted successfully:', response.data);
            toast.success('Review submitted successfully!');
            setPropertyComment(''); // Clear the comment input
            setPropertyRating(0); // Reset the rating
            setPropertyHover(0); // Reset the hover state
        } catch (err) {
            console.error('Error submitting review:', err);
            toast.error('Error submitting review. Please try again.');
        }


    };

    const handleSubmitRating = async () => {
        console.log('Submitting review with data:', {
            user_id: user?.user?._id,
            property_id: propertyId,
            landlord_id: property?.landlord_id?._id,
            trustScore: landlordRating,
        });

        try {
            const response = await axios.post(`http://localhost:3000/api/review/${propertyId}/landlord-rating`, {
                user_id: user?.user?._id,
                property_id: propertyId,
                landlord_id: property?.landlord_id?._id,
                trustScore: landlordRating,
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            console.log('Landlord rating submitted successfully:', response.data);
            toast.success('Landlord rating submitted successfully!');
            setLandlordRating(0); // Reset the rating
            setLandlordHover(0); // Reset the hover state
        } catch (err) {
            console.error('Error submitting landlord rating:', err);
            toast.error('Error submitting landlord rating. Please try again.');
        }
    };

const EarlyPaymentModal = ({ isOpen, onClose, onConfirm, month }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-sub-bg rounded-xl p-4 max-w-md w-full mx-4 transform transition-all">
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-white text-lg font-semibold">Early Rent Payment</h3>
                        <button 
                            onClick={onClose}
                            className="text-secondary-text hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="bg-cards-bg rounded-lg p-4">
                        <p className="text-secondary-text font-semibold">Current month's rent is <span className="text-main-purple ">{"already paid. "}</span></p>
                        <p className="text-white mt-2">Would you like to pay rent early for <span className="text-white ">{month}</span>?</p>
                    </div>

                    <div className="flex space-x-3 justify-end mt-4">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-cards-bg text-secondary-text rounded-lg hover:bg-opacity-80 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 bg-main-purple text-white rounded-lg hover:bg-opacity-80 transition-colors"
                        >
                            Pay Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <p className="text-white text-lg">Loading...</p>
            </div>
        );
    }

    return (
        <div className='items-center bg-main-bg p-4'> 
         <EarlyPaymentModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            onConfirm={() => {
                setShowPaymentModal(false);
                initiatePayment('rent');
            }}
            month={nextUnpaidMonth}
        />{/* Main Container with consistent padding */}
            <div className='w-full h-full max-w-6xl mx-auto my-6 space-y-6 flex flex-col'> {/* Content Area with consistent spacing */}
                {/* Profile Name Section */}
                <div className='w-full flex gap-4 px-4 rounded-xl bg-main-bg'>
                    {/* Profile Image */}
                    <div>
                        <img src={user?.user?.profilePicture || pfp} alt="Profile" className='w-12 h-12 rounded-full object-cover' />
                    </div>
                    <div className='flex flex-col'>
                        <h1 className='text-lg text-white font-bold w-full'>Welcome back, {user?.user?.name || "Guest"}</h1>
                        <p className='text-start text-secondary-text w-full'>Your NinjaNest Dashboard</p>
                    </div>
                </div>

                {/* Property Summary Section */}
                <div className='w-full flex flex-col space-y-4 p-4 bg-sub-bg rounded-xl'>
                    {/* Title & Description Section */}
                    <div className='flex flex-col sm:flex-row w-full'>
                        <div className='flex flex-col w-full'>
                            <p className='text-white font-semibold text-lg'>{property?.title || "Unknown Property"}</p>
                            <p className='text-secondary-text font-semibold'>{property?.address || "Unknown Address"}</p>
                            <p className='bg-cards-bg text-secondary-text mt-1 rounded-full w-fit px-3 text-center text-sm font-semibold'>{property?.flatType || "Unknown Flat Type"}</p>
                        </div>
                        <div className='flex justify-start sm:justify-end items-center w-full mt-4 sm:mt-0'>
                            <button
                                className='bg-cards-bg text-white font-semibold px-4 py-2 rounded-lg hover:bg-main-purple'
                                onClick={() => {
                                    console.log(mapSectionRef.current); // Should log a DOM element
                                    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                                }}
                            >
                                View on Map
                            </button>
                        </div>

                    </div>

                    {/* Property Images Section */}
                    <div className='flex flex-col md:flex-row w-full gap-4'>
                        <div className='bg-cards-bg w-full h-[200px] rounded-xl flex justify-center items-center text-white'>
                            <img src={property?.images[0] || "https://placehold.co/200"} alt="Property" className='w-full h-full object-cover rounded-xl' />
                        </div>
                        <div className='bg-cards-bg w-full h-[200px] rounded-xl flex justify-center items-center text-white mt-4 md:mt-0'>
                            <img src={property?.images[1] || "https://placehold.co/200"} alt="Property" className='w-full h-full object-cover rounded-xl' />
                        </div>
                        <div className='bg-cards-bg w-full h-[200px] rounded-xl flex justify-center items-center text-white mt-4 md:mt-0'>
                            <img src={property?.images[2] || "https://placehold.co/200"} alt="Property" className='w-full h-full object-cover rounded-xl' />
                        </div>

                    </div>
                </div>

                <div className='w-full flex flex-col lg:flex-row gap-6'> {/* Changed space-x-6 to gap-6 for better responsiveness */}
                    {/* Rent Details */}
                    <div className='flex flex-col bg-sub-bg w-full text-white rounded-xl p-4'>
                        <p className='font-semibold text-lg text-tertiary-text'>Rent & Lease Details</p>
                        <div className='mt-4 flex items-center gap-2'>
                            <p className='text-secondary-text font-semibold'>Current Monthly Rent</p>
                        </div>
                        <p className='text-white font-semibold text-lg flex items-center'>
                            ₹ {property?.rent?.toLocaleString('en-IN') || "Unknown"}
                            {isCurrentMonthRentPaid && (
                                <span className="ml-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">Paid</span>
                            )}
                        </p>

                        <div className='mt-4 flex items-center gap-2'>
                            <p className='text-secondary-text font-semibold'>Security Deposit</p>
                        </div>
                        <p className='text-white font-semibold text-md flex items-center'>
                            ₹ {property?.deposit?.toLocaleString('en-IN') || "Unknown"}
                            {depositPaid && (
                                <span className="ml-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">Paid</span>
                            )}
                        </p>

                        <div className='mt-4'> {/* Lease Period */}
                            <p className='text-secondary-text font-semibold'>Lease Period</p>
                            <p className='text-white font-semibold text-md'>{leaseDuration + " Months" || "Unknown"}</p>
                        </div>
                        <div className='mt-4'> {/* Next Payment */}
                            <p className='text-secondary-text font-semibold'>Next Payment</p>
                            <p className='text-white font-semibold text-md'>
                                {nextMonthRent
                                    ? `₹${nextMonthRent.amount_due?.toLocaleString('en-IN')} for month ${new Date(nextMonthRent.month + '-01').toLocaleString('en-US', { month: 'long' })}`
                                    : "No upcoming rent due"}
                            </p>
                        </div>
                        <div className='mt-4 flex'> {/* Pay Now */}
                            {!depositPaid && (
                                <button
                                    className='bg-white text-black w-full py-2 rounded-xl font-semibold hover:cursor-pointer hover:bg-slate-100'
                                    onClick={() => handlePayRent('deposit')}
                                >
                                    Pay Deposit
                                </button>
                            )}
                            {depositPaid && (
                                <button
                                    className='bg-white text-black w-full py-2 rounded-xl font-semibold hover:cursor-pointer hover:bg-slate-100'
                                    onClick={() => handlePayRent('rent')}
                                >
                                    Pay Rent
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Your Roommates */}
                    <div className='bg-sub-bg w-full text-white rounded-xl p-4 mt-6 lg:mt-0'>
                        <p className='font-semibold text-lg text-tertiary-text'>Your Roomates</p>
                        {/* Roommate List */}
                        {property?.roomDetails?.members && property.roomDetails.members.length > 0 ? (
                            property.roomDetails.members.map((mate, index) => (
                                console.log(mate),
                                <div key={index} className='flex items-center bg-cards-bg rounded-xl p-3 space-x-3 mt-4'>
                                    <img src={mate.profilePicture || 'https://placehold.co/100'} alt="pfp" className='h-12 w-12 rounded-full object-cover' />
                                    <div className='flex flex-col'>
                                        <p className='text-white text-base font-semibold'>{mate.name}</p>
                                        <p className='text-secondary-text text-base font-semibold'>{mate.course}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className='bg-cards-bg p-4 rounded-lg text-center mt-4'>
                                <p className='text-slate-300 font-medium'>No roommates found.</p>
                            </div>
                        )}
                    </div>

                    {/* Documents */}
                    <div className='bg-sub-bg w-full text-white rounded-xl p-4 mt-6 lg:mt-0'>
                        <p className='font-semibold text-lg text-tertiary-text'>Documents</p>
                        <div className='flex items-center bg-cards-bg rounded-xl p-3 space-x-3 mt-4'> {/* Increased padding for consistency */}
                            <img src={agreement_svg} alt="agreement" className='h-6 w-6 rounded-full' />
                            <div className='flex flex-col'>
                                <p className='text-white text-base py-2 text-center'>Rental Agreement</p>
                            </div>
                        </div>
                        <div className='flex items-center bg-cards-bg rounded-xl p-3 space-x-3 mt-4'> {/* Increased padding for consistency */}
                            <img src={id_proof_svg} alt="id proof" className='h-6 w-6 rounded-full' />
                            <div className='flex flex-col'>
                                <p className='text-white text-base py-2 text-center'>ID Proof</p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Maintenance Requests */}
                <div className='w-full flex flex-col bg-sub-bg space-y-4 p-4 rounded-xl'>
                    <div className='flex flex-wrap items-center justify-between w-full'> {/* Flex container for title and button */}
                        <p className='font-semibold text-lg text-tertiary-text'>Maintenance Requests</p>
                        <button className='bg-white text-black py-2 px-3 rounded-xl font-semibold hover:cursor-pointer hover:bg-slate-100 mt-2 sm:mt-0'>New Request</button>
                    </div>
                    {[
                        {
                            title: 'Bathroom Tap Leakage',
                            reportedOn: 'Apr 28, 2025',
                            status: 'In Progress',
                            statusClass: 'text-yellow-500',
                        },
                        {
                            title: 'Wi-Fi Router Issues',
                            reportedOn: 'Apr 25, 2025',
                            status: 'Resolved',
                            statusClass: 'text-green-500',
                        },
                    ].map((request, index) => (
                        <div
                            key={index}
                            className='flex flex-col sm:flex-row items-start sm:items-center bg-cards-bg rounded-xl py-3 px-4 mt-4'
                        >
                            <div className='flex flex-col w-full'> {/* Request Content */}
                                <p className='text-white font-semibold'>{request.title}</p>
                                <p className='text-secondary-text font-semibold'>Reported on {request.reportedOn}</p>
                            </div>
                            <div className='flex justify-start sm:justify-end w-full mt-2 sm:mt-0'> {/* Request Status */}
                                <p className={`${request.statusClass} rounded-full px-3 text-sm py-1 font-semibold`}>
                                    {request.status}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                <PaymentHistorySection 
                    propertyId={propertyId} 
                    userId={user?._id}
                    mode="tenant" 
                />
                <div
                    ref={mapSectionRef}
                    className='w-full flex flex-col bg-sub-bg p-4 rounded-xl'
                >
                    <p className='font-semibold text-lg text-tertiary-text mb-4'>Location</p>
                    <PropertyMap
                        latitude={property?.latitude}
                        longitude={property?.longitude}
                        propertyName={property?.title}
                    />
                </div>

                {/* Reviews Section - IMPROVED */}
                <div className='w-full flex flex-col bg-sub-bg p-4 rounded-xl'>
                    <p className='font-semibold text-lg text-tertiary-text mb-4'>Reviews</p>

                    {/* Landlord Review */}
                    <div className='flex flex-col bg-cards-bg rounded-xl p-4 mb-4'>
                        <p className='text-white font-semibold text-base mb-3'>Rate your Landlord</p>
                        <div className="flex justify-between items-center"> {/* Added items-center */}
                            {/* Star Rating for Landlord */}
                            <div className='flex items-center'> {/* Removed mb-4 */}
                                <div className="flex items-center justify-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setLandlordRating(star)}
                                            onMouseEnter={() => setLandlordHover(star)}
                                            onMouseLeave={() => setLandlordHover(0)}
                                            className='mr-1 p-1 transition-transform hover:scale-110'
                                        >
                                            <Star
                                                size={28}
                                                fill={(landlordHover || landlordRating) >= star ? '#8561FF' : 'transparent'}
                                                color={(landlordHover || landlordRating) >= star ? '#8561FF' : '#6B7280'}
                                                strokeWidth={1.5}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <span className='ml-3 text-white font-medium bg-cards-bg px-2 py-1 rounded-md'>
                                    {landlordRating > 0 ? `${landlordRating}/5` : 'Not rated'}
                                </span>
                            </div>

                            <div className="flex justify-end">
                                <button onClick={handleSubmitRating} className='bg-main-purple text-white py-2 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors'>
                                    Submit Rating
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Property Review */}
                    <div className='flex flex-col bg-cards-bg rounded-xl p-4'>
                        <p className='text-white font-semibold text-base mb-3'>Rate & Review Property</p>

                        {/* Star Rating for Property */}
                        <div className='flex items-center mb-4'>
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setPropertyRating(star)}
                                        onMouseEnter={() => setPropertyHover(star)}
                                        onMouseLeave={() => setPropertyHover(0)}
                                        className='mr-1 p-1 transition-transform hover:scale-110'
                                    >
                                        <Star
                                            size={28}
                                            fill={(propertyHover || propertyRating) >= star ? '#8561FF' : 'transparent'}
                                            color={(propertyHover || propertyRating) >= star ? '#8561FF' : '#6B7280'}
                                            strokeWidth={1.5}
                                        />
                                    </button>
                                ))}
                            </div>
                            <span className='ml-3 text-white font-medium bg-cards-bg px-2 py-1 rounded-md'>
                                {propertyRating > 0 ? `${propertyRating}/5` : 'Not rated'}
                            </span>
                        </div>

                        {/* Comment Input */}
                        <div className="relative">
                            <textarea
                                className='w-full bg-sub-bg text-white p-4 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-main-purple transition-all'
                                rows='4'
                                placeholder='Share your experience with this property...'
                                value={propertyComment}
                                onChange={(e) => setPropertyComment(e.target.value)}
                            ></textarea>
                            <div className="absolute bottom-2 right-2 text-secondary-text text-xs">
                                {propertyComment.length}/500
                            </div>
                        </div>

                        <div className="flex justify-end mt-4">
                            <button onClick={handleSubmitReview} className='bg-main-purple text-white py-2 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors'>
                                Submit Review
                            </button>
                        </div>
                    </div>
                </div>
                <div className='mt-6 bg-sub-bg rounded-xl p-6 flex flex-col items-start'>
                    <h2 className='text-lg font-semibold text-red-500 mb-2 flex items-center'>
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Leave Property
                    </h2>
                    <p className='text-secondary-text mb-4'>
                        If you wish to leave this property before your lease ends, you can submit a leave request to the property owner. Please review your rental agreement for any early termination policies.
                    </p>
                    <button 
                        className='border border-red-500 text-red-500 w-full py-2 rounded-xl font-semibold hover:bg-red-500 hover:text-white transition-all duration-200'
                        onClick={() => setShowLeavePropertyModal(true)}
                    >
                        Submit Leave Request
                    </button>
                </div>
            </div>
         { showLeavePropertyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-sub-bg rounded-xl p-6 max-w-lg w-full">
                <div className="flex flex-col space-y-5">
                    {leaveRequestStatus === 'success' ? (
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="bg-green-500 bg-opacity-20 p-4 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-white text-xl font-bold">Request Submitted!</h3>
                            <p className="text-secondary-text">
                                Your request has been sent to the property owner. You'll be notified once they review it.
                            </p>
                            <button
                                onClick={() => {
                                    setShowLeavePropertyModal(false);
                                    setLeaveRequestStatus(null);
                                    setLeaveReason('');
                                }}
                                className="bg-main-purple text-white py-2 px-8 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    ) : leaveRequestStatus === 'error' ? (
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="bg-red-500 bg-opacity-20 p-4 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-white text-xl font-bold">Request Failed</h3>
                            <p className="text-secondary-text">
                                Something went wrong. Please try again later or contact support.
                            </p>
                            <button
                                onClick={() => {
                                    setLeaveRequestStatus(null);
                                }}
                                className="bg-main-purple text-white py-2 px-8 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-center">
                                <h3 className="text-white text-xl font-bold">Leave Property</h3>
                                <button 
                                    onClick={() => setShowLeavePropertyModal(false)}
                                    className="text-secondary-text hover:text-white transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="bg-cards-bg rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <div className="bg-yellow-500 bg-opacity-20 p-2 rounded-full flex-shrink-0 mt-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold">Important Notice</h4>
                                        <p className="text-secondary-text mt-1 text-sm">
                                            If you're leaving before your lease ends, you may be subject to early termination fees and forfeit your security deposit according to your rental agreement terms.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-white font-medium block">Reason for leaving</label>
                                <textarea
                                    className="w-full bg-cards-bg text-white p-3 rounded-lg resize-none h-32 focus:outline-none focus:ring-2 focus:ring-main-purple transition-all"
                                    placeholder="Please explain why you want to leave this property..."
                                    value={leaveReason}
                                    onChange={(e) => setLeaveReason(e.target.value)}
                                ></textarea>
                            </div>
                            
                            <div className="pt-2">
                                <h4 className="text-white font-semibold">What happens next?</h4>
                                <ul className="mt-2 space-y-2 text-secondary-text text-sm">
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-main-purple mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Your request will be sent to the property owner for review
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-main-purple mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        You'll be notified when they accept or reject your request
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-main-purple mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        If accepted, you'll need to complete the move-out process
                                    </li>
                                </ul>
                            </div>

                            <div className="flex space-x-3 justify-end pt-2">
                                <button
                                    onClick={() => setShowLeavePropertyModal(false)}
                                    className="px-4 py-2 bg-cards-bg text-secondary-text rounded-lg hover:bg-opacity-80 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLeavePropertyRequest}
                                    disabled={!leaveReason.trim()}
                                    className={`px-6 py-2 text-white rounded-lg transition-colors ${
                                        leaveReason.trim() 
                                        ? 'bg-main-purple hover:bg-purple-700' 
                                        : 'bg-gray-600 cursor-not-allowed'
                                    }`}
                                >
                                    Submit Request
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )  }
        </div>
    )
}

export default CurrentPropertyDashboard


const PropertyMap = ({ latitude, longitude, propertyName }) => {
    if (!latitude || !longitude) return null;

    return (
        <div className="w-full h-[50vh] rounded-lg overflow-hidden">
            <MapContainer center={[latitude, longitude]} zoom={16} scrollWheelZoom={false} className="w-full h-full z-0">
                <LayersControl position="topright">
                    {/* Default OSM Layer */}
                    <BaseLayer checked name="Street View">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                    </BaseLayer>

                    {/* Satellite Layer (Esri) */}
                    <BaseLayer name="Satellite View">
                        <TileLayer
                            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, etc.'
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        />
                    </BaseLayer>
                </LayersControl>

                <Marker position={[latitude, longitude]}>
                    <Popup>{propertyName || "This property is located here!"}</Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};