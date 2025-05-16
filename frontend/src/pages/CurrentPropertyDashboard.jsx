import React, { useEffect, useState } from 'react'
import agreement_svg from '../assets/agreement_svg.svg'
import id_proof_svg from '../assets/id_proof_svg.svg'
import pfp from '../assets/pfp.png'
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux'
import { Star } from 'lucide-react'

const CurrentPropertyDashboard = () => {
    const [property, setProperty] = useState(null);
    const { propertyId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useSelector((state) => state.user);

    const [landlordRating, setLandlordRating] = React.useState(0);
    const [propertyRating, setPropertyRating] = React.useState(0);
    const [propertyComment, setPropertyComment] = React.useState('');
    const [landlordHover, setLandlordHover] = React.useState(0);
    const [propertyHover, setPropertyHover] = React.useState(0);

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/property/${propertyId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setProperty(response.data.property);
                console.log(response.data.property);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching property:', err);
                setError('Failed to load property details.');
                setLoading(false);
            }
        };

        fetchProperty();
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
        } catch (err) {
            console.error('Error submitting review:', err);
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
        } catch (err) {
            console.error('Error submitting landlord rating:', err);
        }
    };


    return (
        <div className='items-center bg-main-bg p-4'> {/* Main Container with consistent padding */}
            <div className='w-full h-full max-w-6xl mx-auto my-6 space-y-6 flex flex-col'> {/* Content Area with consistent spacing */}
                {/* Profile Name Section */}
                <div className='w-full flex gap-4 px-4 rounded-xl bg-main-bg'>
                    {/* Profile Image */}
                    <div>
                        <img src={pfp} alt="Profile" className='w-12 h-12 rounded-full object-cover' />
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
                            <button className='bg-cards-bg text-white font-semibold px-4 py-2 rounded-lg hover:bg-main-purple'>View on Map</button>
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
                        <div className='mt-4'> {/* Monthly Rent */}
                            <p className='text-secondary-text font-semibold'>Monthly Rent</p>
                            <p className='text-white font-semibold text-lg'>₹ {property?.rent?.toLocaleString('en-IN') || "Unknown"}</p>
                        </div>
                        <div className='mt-4'> {/* Security Deposit */}
                            <p className='text-secondary-text font-semibold'>Security Deposit</p>
                            <p className='text-white font-semibold text-md'>₹ {property?.deposit?.toLocaleString('en-IN') || "Unknown"}</p>
                        </div>
                        <div className='mt-4'> {/* Lease Period */}
                            <p className='text-secondary-text font-semibold'>Lease Period</p>
                            <p className='text-white font-semibold text-md'>{property?.leasePeriod || "Unknown"}</p>
                        </div>
                        <div className='mt-4'> {/* Next Payment */}
                            <p className='text-secondary-text font-semibold'>Next Payment</p>
                            <p className='text-white font-semibold text-md'>{property?.nextPayment || "Unknown"}</p>
                        </div>
                        <div className='mt-4 flex'> {/* Pay Now */}
                            <button className='bg-white text-black w-full py-2 rounded-xl font-semibold hover:cursor-pointer hover:bg-slate-100'>Pay Now</button>
                        </div>
                    </div>

                    {/* Your Roommates */}
                    {/* TODO: Implement Roommate List in Property Schema */}
                    <div className='bg-sub-bg w-full text-white rounded-xl p-4 mt-6 lg:mt-0'>
                        <p className='font-semibold text-lg text-tertiary-text'>Your Roomates</p>
                        {/* Roommate List */}
                        {[{ name: 'Aryan Patil', course: 'Computer Science & Engg.' }, { name: 'Harshwardhan Patil', course: 'Computer Science & Engg.' }].map((mate, index) => (
                            <div key={index} className='flex items-center bg-cards-bg rounded-xl p-3 space-x-3 mt-4'> {/* Increased padding for consistency */}
                                <img src='https://placehold.co/100' alt="pfp" className='h-12 w-12 rounded-full' />
                                <div className='flex flex-col'>
                                    <p className='text-white text-base font-semibold'>{mate.name}</p>
                                    <p className='text-secondary-text text-base font-semibold'>{mate.course}</p>
                                </div>
                            </div>
                        ))}
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

                {/* Reviews Section - IMPROVED */}
                <div className='w-full flex flex-col bg-sub-bg p-4 rounded-xl'>
                    <p className='font-semibold text-lg text-tertiary-text mb-4'>Reviews</p>

                    {/* Landlord Review */}
                    <p className='text-white font-semibold text-base mb-3'>Rate your Landlord</p>
                    <div className='flex flex-col bg-cards-bg rounded-xl p-4 mb-4'>
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