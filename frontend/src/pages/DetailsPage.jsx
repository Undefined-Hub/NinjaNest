import React, { useState } from 'react'
import house from '../assets/house.jpg';
import house1 from '../assets/house1.jpg';
import parking_svg from '../assets/parking.svg';
import wifi_svg from '../assets/wifi.svg';
import water_supply_svg from '../assets/water_supply.svg';
import garden_svg from '../assets/garden.svg';
import review_star_full from '../assets/review_star_full.svg';
import robot from '../assets/robot.svg';
const DetailsPage = () => {
    const [zoomedImage, setZoomedImage] = useState(null);
    return (
        <>
            {zoomedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50" onClick={() => setZoomedImage(null)}>
                    <img src={zoomedImage} alt="Zoomed" className="max-w-full max-h-full p-4" />
                </div>
            )}

            <div className='flex justify-center items-center bg-main-bg p-4'>
                <div className='mx-4 md:mx-12 lg:max-w-7xl w-full my-8 flex flex-col lg:flex-row space-y-6 lg:space-x-6 lg:space-y-0'>
                    <div className='flex flex-col w-full lg:w-2/3 space-y-6'>
                        <div className='flex p-4 bg-sub-bg rounded-2xl'>
                            <div className='w-full rounded-2xl flex flex-col space-y-4'>
                                <div className='h-64 sm:min-h-[400px] md:h-[500px] lg:h-[600px]' onClick={() => setZoomedImage(house)}>
                                    <img src='https://placehold.co/600x400' alt='Property' className='w-full h-full object-cover rounded-2xl hover:cursor-pointer' />
                                </div>
                                <div>
                                    <div className='grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4'>
                                        {[...Array(5)].map((_, index) => (
                                            <div key={index} className='w-full h-16 sm:h-24 rounded-2xl overflow-hidden' onClick={() => setZoomedImage(house1)}>
                                                <img src={house1} alt='Property Thumbnail' className='w-full h-full object-cover hover:cursor-pointer' />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='flex flex-col bg-sub-bg w-full rounded-2xl p-8'> {/* Property Details Section */}
                            <div className='flex flex-col md:flex-row justify-between items-start w-full space-y-4 md:space-y-0'> {/* Contain the title & the rent of the house */}
                                <div className='flex flex-col space-y-2 md:w-2/3'> {/* Title Section */}
                                    <p className='text-white font-semibold text-2xl md:text-4xl'>The White House</p>
                                    <p className='text-secondary-text font-medium md:font-semibold text-lg'>1.2 Kilometers away from D. Y. Patil College of Engineering & Technology</p>
                                </div>
                                <div className='flex flex-col space-y-2 md:w-1/3 md:items-end text-right'> {/* Rent Section */}
                                    <p className='text-tertiary-text font-bold text-2xl md:text-4xl'>₹15,000</p>
                                    <p className='text-secondary-text font-semibold text-lg'>per month</p>
                                </div>
                            </div>
                            <div className='flex flex-wrap w-full gap-3 sm:gap-4 mt-6'> {/* Responsive wrapper */}
                                {
                                    [
                                        { icon: wifi_svg, text: 'Wifi' },
                                        { icon: parking_svg, text: 'Parking' },
                                        { icon: water_supply_svg, text: 'Water Supply' },
                                        { icon: garden_svg, text: 'Garden' }
                                    ].map((amenity, index) => (
                                        <div key={index} className='flex bg-cards-bg px-2 sm:px-3 py-2 rounded-2xl items-center w-[45%] sm:w-auto'> {/* Keep shape, adjust size */}
                                            <div className='w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shrink-0'> {/* Adjust icon size */}
                                                <img src={amenity.icon} alt={amenity.text} className='w-full h-full object-contain' />
                                            </div>
                                            <div className='flex-grow flex items-center justify-center px-2 sm:px-4'> {/* Adjust padding for text */}
                                                <p className='text-white font-medium text-sm sm:text-lg text-center'>{amenity.text}</p> {/* Responsive text size */}
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>

                            <div className='flex flex-col space-y-4 mt-10'> {/* Description Section */}
                                <div className='flex w-full'> {/* Description Title */}
                                    <p className='text-white text-2xl font-semibold'>About this property</p>
                                </div>
                                <div className='flex w-full'> {/* Description Text */}
                                    <p className='text-slate-300 text-lg text-justify '>
                                        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nemo molestias delectus eum ad adipisci, ex officiis optio repellat sit alias. Omnis nisi eos, ullam nulla corporis perspiciatis esse a pariatur facere animi necessitatibus impedit deleniti nobis delectus exercitationem quo sed! Alias, fuga. Eos eum odit sint facilis, reprehenderit enim blanditiis!
                                    </p>
                                </div>
                                <div className='flex w-full justify-end'> {/* Last updated - Right aligned */}
                                    <p className='text-secondary-text text-lg font-semibold'>Last updated: 2 days ago</p>
                                </div>
                            </div>

                        </div>
                        <div className='flex flex-col bg-sub-bg w-full rounded-2xl p-8'>
                            <div className='flex flex-col space-y-6'> {/* Additional Property Details */}
                                <div className='flex w-full'>
                                    <p className='text-white text-2xl font-semibold'>Property Details</p>
                                </div>
                                <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'> {/* Grid layout for details */}
                                    {[
                                        { label: 'Property Type', value: 'Flat' },
                                        { label: 'Type', value: '2 BHK' },
                                        { label: 'Area', value: '1250 sq. ft' },
                                        { label: 'Address', value: '123, White House Street, Kolhapur' },
                                        { label: 'Initial Deposit', value: '₹50,000' },
                                        { label: 'Furnishing', value: 'Semi-Furnished' },
                                    ].map((item, index) => (
                                        <div key={index} className='bg-cards-bg p-4 rounded-xl flex flex-col space-y-1'>
                                            <p className='text-tertiary-text font-semibold'>{item.label}</p>
                                            <p className='text-white font-semibold text-lg'>{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className='flex flex-col bg-sub-bg w-full rounded-2xl p-8'>
                            <div className='flex flex-col space-y-6'>
                                <div className='flex w-full'>
                                    <p className='text-white text-2xl font-semibold'>Reviews & Feedback</p>
                                </div>
                                <div className='flex flex-col space-y-4'>
                                    {[
                                        { name: 'Amit Sharma', rating: '4.5', feedback: 'Great place, well maintained, and peaceful environment.' },
                                        { name: 'Priya Desai', rating: '4.0', feedback: 'Good amenities, but a bit far from main market.' }
                                    ].map((review, index) => (
                                        <div key={index} className='bg-cards-bg p-4 rounded-xl'>
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

                    <div className='bg-sub-bg w-full lg:w-1/3 p-6 rounded-2xl flex flex-col space-y-8 self-start'> {/* Right Section - Contact Info */}
                        <div className='flex flex-col w-full rounded-xl p-6 bg-menu-active-bg space-y-5'> {/* AI Price Analysis Card*/}
                            <div className='flex items-center space-x-4'> {/* Centering both icon and text */}
                                <img src={robot} alt='' className='w-8 h-8 object-contain' />
                                <p className='text-white text-xl font-semibold flex items-center h-full'>AI Price Analysis</p>
                            </div>
                            <div className='flex w-full space-x-4 justify-between'> {/* AI Price Analysis Content */}
                                <p className='text-green-400 font-semibold text-lg'>• Fair Price</p>
                                <p className='text-slate-300 text-lg font-medium'>Market Avg.: ₹15,500</p>
                            </div>
                        </div>
                        {/* Contact details here */}
                        <div className='flex flex-col w-full rounded-xl space-y-4'> {/* Contact Card */}
                            <div className='flex items-center w-full space-x-4 border-b border-secondary-text pb-6'> {/* Contain profile picture and name of landlord */}
                                <div className='w-16 h-16 flex items-center justify-center'> {/* Profile Picture */}
                                    <img src='https://placehold.co/200x200' alt='Profile' className='w-16 h-16 object-cover rounded-full' />
                                </div>
                                <div className='flex flex-col justify-center'> {/* Name Section */}
                                    <p className='text-white font-semibold text-lg'>Raja Babu</p>
                                    <div className='flex w-full items-center space-x-2'> {/* Rating Section */}
                                        {/* <img src={review_star_full} alt='Rating' className='w-4 h-4 object-contain' /> */}
                                        <p className='text-slate-400 font-semibold text-lg'><span className='text-yellow-400'>★ 4.2</span>  • <span className='text-tertiary-text'>Verified Landlord</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='flex flex-col w-full space-y-4'> {/* Availability details */}
                            <div className='flex w-full justify-between'> {/* Availability */}
                                <p className='text-lg text-secondary-text font-semibold'>Available from</p>
                                <p className='text-lg text-white font-semibold'>March 1, 2025</p>
                            </div>
                            <div className='flex w-full justify-between'> {/* Minimum Stay */}
                                <p className='text-lg text-secondary-text font-semibold'>Minimum Stay</p>
                                <p className='text-lg text-white font-semibold'>12 Months</p>
                            </div>
                        </div>
                        <div className='flex flex-col space-y-4'> {/* Contact Button */}
                            <button className='flex w-full bg-main-purple p-4 rounded-xl justify-center items-center hover:bg-violet-700'> {/* Contact Button */}
                                <p className='text-white font-bold text-lg'>Book Now</p>
                            </button> {/* Contact Button */}
                            <button className='flex w-full bg-slate-600 p-4 rounded-xl justify-center items-center hover:bg-slate-700'> {/* Contact Button */}
                                <p className='text-white font-bold text-lg'>Contact Landlord</p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DetailsPage
