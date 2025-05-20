import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import house1 from '../assets/house1.jpg'
import { useSelector } from 'react-redux' // Assuming you have a custom hook for Redux selector

const CurrentRental = ({ propertyId }) => {
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user);
    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/property/${propertyId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setProperty(response.data.property);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching property:', err);
                setError('Failed to load property details.');
                setLoading(false);
            }
        };

        fetchProperty();
    }, [propertyId]);

    const handlePayRent = async () => {
        try {
            // Send a request to the backend to initiate the payment
            const response = await axios.post('http://localhost:3000/api/payment/initiate', {
                user_id: user.user._id, // Assuming user ID is stored in localStorage
                price: property.rent, // Rent amount
                phone: '9876543210', // Replace with the user's phone number
                name: property.title, // Property name
                redirectUrl: 'http://localhost:3000/dashboard', // Redirect back to dashboard after payment
            });

            // Redirect the user to the payment gateway URL
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
            {/* <div className="flex flex-col md:flex-row bg-cards-bg rounded-xl p-5 space-y-4 md:space-y-0 md:space-x-4">
                <img
                    src={property.mainImage || 'https://placehold.co/300x200'}
                    alt={property.title}
                    className="w-full md:w-1/3 h-44 object-cover rounded-lg"
                />
                <div className="flex flex-col w-full">
                    <p className="text-white text-lg font-bold">{property.title}</p>
                    <p className="text-secondary-text text-base font-semibold">{property.location}</p>
                    <p className="text-secondary-text text-sm">{property.address}</p>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="flex flex-col bg-sub-bg rounded-lg p-2">
                            <p className="text-secondary-text text-sm font-semibold">Rent</p>
                            <p className="text-white text-base font-semibold">₹{property.rent}</p>
                        </div>
                        <div className="flex flex-col bg-sub-bg rounded-lg p-2">
                            <p className="text-secondary-text text-sm font-semibold">Deposit</p>
                            <p className="text-white text-base font-semibold">₹{property.deposit}</p>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 mt-4">
                        <button
                            onClick={() => navigate(`/explore/property/${property._id}`)}
                            className="bg-main-purple text-white font-semibold p-2 rounded-lg hover:bg-[#6b2bd2] transition-all duration-300"
                        >
                            View Details
                        </button>
                        <button
                            onClick={handlePayRent}
                            className="bg-green-600 text-white font-semibold p-2 rounded-lg hover:bg-green-700 transition-all duration-300"
                        >
                            Pay Rent
                        </button>
                    </div>
                </div>
            </div> */}
            <div className='w-full bg-sub-bg rounded-xl p-5'>
                <div className='flex justify-between'>
                    <p className='text-white text-lg font-bold'>Current Property</p>
                    <p className='text-tertiary-text text-base font-semibold hover:cursor-pointer hover:underline'
                        // TODO: Change this to navigate to the property details page of active property
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
                                <p className='text-secondary-text text-base font-semibold'>Room Type</p>
                                <p className='text-white text-base font-semibold'>{property.flatType}</p>
                            </div>
                            <div className='flex flex-col bg-cards-bg rounded-xl p-2'>
                                <p className='text-secondary-text text-base font-semibold'>Rent</p>
                                <p className='text-white text-base font-semibold'>₹{property.rent}</p>
                            </div>
                            <div>

                            </div>

                        </div>
                        <button
                            onClick={handlePayRent}
                            className='bg-white text-black w-full py-2 rounded-lg font-semibold hover:cursor-pointer hover:bg-slate-100'
                        >
                            Pay Rent
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CurrentRental;