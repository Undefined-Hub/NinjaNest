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

            const booking = bookingResponse.data.booking || bookingResponse.data;
            const booking_id = booking._id;

            const monthRentPayload = {
                booking_id: booking_id,
                property_id: propertyId,
                user_id: user.user._id,
                landlord_id: property.landlord_id._id,
                month: new Date().toISOString().slice(0, 7),
                due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                amount_due: property.rent,
                amount_paid: property.rent,
                payment_status: "paid",
                payment_method: "UPI",
                transaction_id: localStorage.getItem('lastTxnId'),
                late_fee: 0,
                remarks: "Rent paid via PhonePe"
            };

            await axios.post(
                `http://localhost:3000/api/rents/`,
                monthRentPayload,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            toast.success('Booking and rent recorded successfully!');
        } catch (error) {
            toast.error('Failed to send booking or rent request.');
        }
    };

    const handlePayRent = async (paymentType) => {
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
            }
            if (response.data.redirectUrl) {
                window.location.href = response.data.redirectUrl;
            } else {
                alert('Failed to initiate payment. Please try again.');
            }
        } catch (error) {
            alert('Failed to initiate payment. Please try again.');
        }
    };

    useEffect(() => {
        const txnId = localStorage.getItem('lastTxnId');
        if (txnId && property) {
            axios.get(`http://localhost:3000/api/payment/status/${txnId}`)
                .then(async res => {
                    if (res.data.paymentDetails && res.data.paymentDetails[0].state === "COMPLETED") {
                        const bookingRes = await axios.get(
                            `http://localhost:3000/api/booking/bookings/property/${property._id}`,
                            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                        );
                        const booking = bookingRes.data.booking || bookingRes.data;
                        if (!booking[0] || booking[0].paymentStatus !== "completed") {
                            toast.success('Deposit payment successful!');
                            await addMemberToProperty();
                            await createBookingRequest();
                            // Refetch property and rent info to update chips/buttons
                            await fetchPropertyAndNextRent();
                        } else {
                            // Rent payment logic
                            const monthRentRes = await axios.get(
                                `http://localhost:3000/api/rents/${booking[0]._id}`,
                                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                            );
                            const rents = Array.isArray(monthRentRes.data) ? monthRentRes.data : (monthRentRes.data.monthRents || []);
                            const latestRent = rents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
                            if (latestRent && latestRent.payment_status !== "paid") {
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
                                // Create next month's rent entry
                                const [year, month] = latestRent.month.split('-');
                                const nextMonthDate = new Date(Number(year), Number(month), 1);
                                const nextMonthStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}`;
                                const nextMonthRentPayload = {
                                    booking_id: latestRent.booking_id,
                                    property_id: latestRent.property_id,
                                    user_id: latestRent.user_id,
                                    landlord_id: latestRent.landlord_id,
                                    month: nextMonthStr,
                                    due_date: new Date(new Date(latestRent.due_date).getTime() + 30 * 24 * 60 * 60 * 1000),
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
    const fetchPropertyAndNextRent = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/api/property/${propertyId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setProperty(response.data.property);

            // Fetch booking for this property
            const bookingRes = await axios.get(
                `http://localhost:3000/api/booking/bookings/property/${propertyId}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            const booking = bookingRes.data.booking || bookingRes.data;
            setLeaseDuration(booking[0].durationMonths);
            let bookingId = Array.isArray(booking) ? booking[0]?._id : booking?._id;

            // Set depositPaid based on booking
            if (booking[0] && booking[0].paymentStatus === "completed") {
                setDepositPaid(true);
            } else {
                setDepositPaid(false);
            }

            // Fetch month rents for this booking
            if (bookingId) {
                const monthRentRes = await axios.get(
                    `http://localhost:3000/api/rents/${bookingId}`,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
                const rents = Array.isArray(monthRentRes.data) ? monthRentRes.data : (monthRentRes.data.monthRents || []);
                setAllRents(rents); // <-- Add this line
                // Find the earliest unpaid rent
                const unpaidRents = rents.filter(r => r.payment_status !== "paid");
                if (unpaidRents.length > 0) {
                    unpaidRents.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
                    setNextMonthRent(unpaidRents[0]);
                } else {
                    setNextMonthRent(null);
                }
            } else {
                setNextMonthRent(null);
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


    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <p className="text-white text-lg">Loading...</p>
            </div>
        );
    }

    return (
        <div className='items-center bg-main-bg p-4'> {/* Main Container with consistent padding */}
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
                                    <img src={mate.profilePicture || 'https://placehold.co/100'} alt="pfp" className='h-12 w-12 rounded-full' />
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

            </div>
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