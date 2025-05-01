import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import house from '../assets/house.jpg';
import house1 from '../assets/house1.jpg';
import parking_svg from '../assets/parking.svg';
import wifi_svg from '../assets/wifi.svg';
import water_supply_svg from '../assets/water_supply.svg';
import garden_svg from '../assets/garden.svg';
import review_star_full from '../assets/review_star_full.svg';
import robot from '../assets/robot.svg';
const DetailsPage = () => {
    const { propertyId } = useParams();
    console.log("Property ID:", propertyId);

    const [propertyData, setPropertyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchProperty = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/property/${propertyId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                console.log("Response Data:", response.data);
                setPropertyData(response.data?.property);
            } catch (err) {
                console.error('Error fetching property:', err);
                setError('Failed to load property');
            } finally {
                setLoading(false);
            }
        };

        fetchProperty();
    }, [propertyId]);

    console.log("Property Data:", propertyData);

    const [zoomedImage, setZoomedImage] = useState(null);
    const [zoomedIndex, setZoomedIndex] = useState(null);

    return (
        <>
            {zoomedIndex !== null && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 ">
                    <button
                        className="absolute top-5 right-5 text-white text-3xl font-bold"
                        onClick={() => setZoomedIndex(null)}
                    >
                        &times;
                    </button>

                    <button
                        className="absolute left-5 text-white text-4xl font-bold hover:scale-110 transition"
                        onClick={(e) => {
                            e.stopPropagation();
                            setZoomedIndex((prev) => Math.max(0, prev - 1));
                        }}
                        disabled={zoomedIndex === 0}
                    >
                        &#8592;
                    </button>

                    <img
                        src={propertyData?.images[zoomedIndex]}
                        alt="Zoomed"
                        className="max-w-full max-h-[90%] p-3 rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />

                    <button
                        className="absolute right-5 text-white text-4xl font-bold hover:scale-110 transition"
                        onClick={(e) => {
                            e.stopPropagation();
                            setZoomedIndex((prev) => Math.min(propertyData?.images.length - 1, prev + 1));
                        }}
                        disabled={zoomedIndex === propertyData?.images.length - 1}
                    >
                        &#8594;
                    </button>
                </div>
            )}
            <div className='flex justify-center items-center bg-main-bg p-3'>
                <div className='mx-3 md:mx-8 lg:max-w-6xl w-full my-6 flex flex-col lg:flex-row space-y-4 lg:space-x-5 lg:space-y-0'>
                    <div className='flex flex-col w-full lg:w-2/3 space-y-4'>
                        <div className='flex p-3 bg-sub-bg rounded-xl'>
                            <div className='w-full rounded-xl flex flex-col space-y-3'>
                                <div className='h-56 sm:min-h-[320px] md:h-[400px] lg:h-[480px]' onClick={() => setZoomedIndex(0)}>
                                    <img
                                        src={propertyData?.mainImage}
                                        alt='Property'
                                        className='w-full h-full object-cover rounded-xl hover:cursor-pointer'
                                    />
                                </div>

                                <div>
                                    <div className='grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 relative'>
                                        {propertyData?.images?.slice(0, 4).map((nth_image, index) => (
                                            <div
                                                key={index}
                                                className='w-full h-14 sm:h-20 rounded-xl overflow-hidden'
                                                onClick={() => setZoomedIndex(index)}
                                            >
                                                <img
                                                    src={nth_image}
                                                    alt='Property Thumbnail'
                                                    className='w-full h-full object-cover hover:cursor-pointer'
                                                />
                                            </div>
                                        ))}

                                        {propertyData?.images?.length > 4 && (
                                            <div
                                                className='w-full h-14 sm:h-20 rounded-xl overflow-hidden relative'
                                                onClick={() => setZoomedIndex(4)} // opens the 5th image when clicked
                                            >
                                                <img
                                                    src={propertyData?.images[4]}
                                                    alt='Property Thumbnail'
                                                    className='w-full h-full object-cover opacity-50'
                                                />
                                                <div className='absolute inset-0 bg-black bg-opacity-50 hover:cursor-pointer flex justify-center items-center'>
                                                    <p className='text-white font-semibold text-sm sm:text-base'>
                                                        +{propertyData?.images.length - 4} images
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className='flex flex-col bg-sub-bg w-full rounded-xl p-6'> {/* Property Details Section */}
                            <div className='flex flex-col md:flex-row justify-between items-start w-full space-y-3 md:space-y-0'> {/* Contain the title & the rent of the house */}
                                <div className='flex flex-col space-y-1 md:w-2/3'> {/* Title Section */}
                                    <p className='text-white font-semibold text-xl md:text-3xl'>{propertyData?.title || 'Property Title Not Available'}</p>
                                    <p className='text-secondary-text font-medium md:font-semibold text-base'>1.2 Kilometers away from D. Y. Patil College of Engineering & Technology</p>
                                </div>
                                <div className='flex flex-col space-y-1 md:w-1/3 md:items-end text-right'> {/* Rent Section */}
                                    <p className='text-tertiary-text font-bold text-xl md:text-3xl'>₹{propertyData?.rent?.toLocaleString('en-IN')}</p>
                                    <p className='text-secondary-text font-semibold text-base'>per month</p>
                                </div>
                            </div>
                            <div className='flex flex-wrap w-full gap-2 sm:gap-3 mt-5'> {/* Responsive wrapper */}
                                {
                                    [
                                        { icon: wifi_svg, text: 'Wifi' },
                                        { icon: parking_svg, text: 'Parking' },
                                        { icon: water_supply_svg, text: 'Water Supply' },
                                        { icon: garden_svg, text: 'Garden' }
                                    ].map((amenity, index) => (
                                        <div key={index} className='flex bg-cards-bg px-2 py-2 rounded-xl items-center w-[45%] sm:w-auto'> {/* Keep shape, adjust size */}
                                            <div className='w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center shrink-0'> {/* Adjust icon size */}
                                                <img src={amenity.icon} alt={amenity.text} className='w-full h-full object-contain' />
                                            </div>
                                            <div className='flex-grow flex items-center justify-center px-1 sm:px-3'> {/* Adjust padding for text */}
                                                <p className='text-white font-medium text-xs sm:text-base text-center'>{amenity.text}</p> {/* Responsive text size */}
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>

                            <div className='flex flex-col space-y-3 mt-8'> {/* Description Section */}
                                <div className='flex w-full'> {/* Description Title */}
                                    <p className='text-white text-xl font-semibold'>About this property</p>
                                </div>
                                <div className='flex w-full'> {/* Description Text */}
                                    <p className='text-slate-300 text-base text-justify'>
                                        {propertyData?.description}
                                    </p>
                                </div>
                                <div className='flex w-full justify-end'> {/* Last updated - Right aligned */}
                                    <p className='text-secondary-text text-base font-semibold'>Last updated: {propertyData?.updatedAt?.split('T')[0]}</p>
                                </div>
                            </div>
                        </div>
                        <div className='flex flex-col bg-sub-bg w-full rounded-xl p-6'>
                            <div className='flex flex-col space-y-5'> {/* Additional Property Details */}
                                <div className='flex w-full'>
                                    <p className='text-white text-xl font-semibold'>Property Details</p>
                                </div>
                                <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'> {/* Grid layout for details */}
                                    {[
                                        { label: 'Property Type', value: 'Flat' },
                                        { label: 'Type', value: propertyData?.flatType },
                                        { label: 'Area', value: '1250 sq. ft' },
                                        { label: 'Address', value: propertyData?.address },
                                        { label: 'Initial Deposit', value: '₹' + propertyData?.deposit?.toLocaleString('en-IN') },
                                        { label: 'Furnishing', value: 'Semi-Furnished' },
                                    ].map((item, index) => (
                                        <div key={index} className='bg-cards-bg p-3 rounded-lg flex flex-col space-y-1'>
                                            <p className='text-tertiary-text font-semibold'>{item.label}</p>
                                            <p className='text-white font-semibold text-base'>{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className='flex flex-col bg-sub-bg w-full rounded-xl p-6'>
                            <div className='flex flex-col space-y-5'>
                                <div className='flex w-full'>
                                    <p className='text-white text-xl font-semibold'>Reviews & Feedback</p>
                                </div>
                                <div className='flex flex-col space-y-3'>
                                    {[
                                        { name: 'Amit Sharma', rating: '4.5', feedback: 'Great place, well maintained, and peaceful environment.' },
                                        { name: 'Priya Desai', rating: '4.0', feedback: 'Good amenities, but a bit far from main market.' }
                                    ].map((review, index) => (
                                        <div key={index} className='bg-cards-bg p-3 rounded-lg'>
                                            <div className='flex justify-between items-center'>
                                                <p className='text-white font-semibold'>{review.name}</p>
                                                <p className='text-yellow-400 font-semibold'>{review.rating} ★</p>
                                            </div>
                                            <p className='text-slate-300 mt-2 font-medium'>{review.feedback}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='bg-sub-bg w-full lg:w-1/3 p-5 rounded-xl flex flex-col space-y-6 self-start'> {/* Right Section - Contact Info */}
                        <div className='flex flex-col w-full rounded-lg p-4 bg-menu-active-bg space-y-4'> {/* AI Price Analysis Card*/}
                            <div className='flex items-center space-x-3'> {/* Centering both icon and text */}
                                <img src={robot} alt='' className='w-6 h-6 object-contain' />
                                <p className='text-white text-lg font-semibold flex items-center h-full'>AI Price Analysis</p>
                            </div>
                            <div className='flex w-full space-x-3 justify-between'> {/* AI Price Analysis Content */}
                                <p className='text-green-400 font-semibold text-base'>• Fair Price</p>
                                <p className='text-slate-300 text-base font-medium'>Market Avg.: ₹15,500</p>
                            </div>
                        </div>
                        {/* Contact details here */}
                        <div className='flex flex-col w-full rounded-lg space-y-3'> {/* Contact Card */}
                            <div className='flex items-center w-full space-x-3 border-b border-secondary-text pb-4'> {/* Contain profile picture and name of landlord */}
                                <div className='w-14 h-14 flex items-center justify-center'> {/* Profile Picture */}
                                    <img src='https://placehold.co/200x200' alt='Profile' className='w-14 h-14 object-cover rounded-full' />
                                </div>
                                <div className='flex flex-col justify-center'> {/* Name Section */}
                                    <p className='text-white font-semibold text-base'>Raja Babu</p>
                                    <div className='flex w-full items-center space-x-2'> {/* Rating Section */}
                                        {/* <img src={review_star_full} alt='Rating' className='w-4 h-4 object-contain' /> */}
                                        <p className='text-slate-400 font-semibold text-base'><span className='text-yellow-400'>★ 4.2</span>  • <span className='text-tertiary-text'>Verified Landlord</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='flex flex-col w-full space-y-3'> {/* Availability details */}
                            <div className='flex w-full justify-between'> {/* Availability */}
                                <p className='text-base text-secondary-text font-semibold'>Available from</p>
                                <p className='text-base text-white font-semibold'>March 1, 2025</p>
                            </div>
                            <div className='flex w-full justify-between'> {/* Minimum Stay */}
                                <p className='text-base text-secondary-text font-semibold'>Minimum Stay</p>
                                <p className='text-base text-white font-semibold'>12 Months</p>
                            </div>
                        </div>
                        <div className='flex flex-col space-y-3'> {/* Contact Button */}
                            <button className='flex w-full bg-main-purple p-3 rounded-lg justify-center items-center hover:bg-violet-700'> {/* Contact Button */}
                                <p className='text-white font-bold text-base'>Book Now</p>
                            </button> {/* Contact Button */}
                            <button className='flex w-full bg-slate-600 p-3 rounded-lg justify-center items-center hover:bg-slate-700'> {/* Contact Button */}
                                <p className='text-white font-bold text-base'>Contact Landlord</p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DetailsPage