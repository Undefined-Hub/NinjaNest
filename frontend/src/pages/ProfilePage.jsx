import React, { useState } from 'react'
import pfp from '../assets/pfp.png'
import house1 from '../assets/house1.jpg'
import pay from '../assets/pay.svg'
import calendar from '../assets/calendar.svg'
import people from '../assets/people.svg'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux';
const ProfilePage = () => {
    let navigate = useNavigate()
    const { user, loading, error } = useSelector((state) => state.user);
    // user.user && console.log(`User Details: (ProfilePage) `, user);
    const [activeTab, setActiveTab] = useState('Overview') // State to hold the active tab
    return (
        <>
            <div className='flex justify-center items-center bg-main-bg p-3'> {/* Main container for profile page */}
                <div className='w-full max-w-5xl mx-auto my-6 flex flex-col lg:flex-row'> {/* Responsive inner container */}
                    <div className='flex w-full lg:w-1/4 bg-sub-bg rounded-xl p-5 mb-3 lg:mb-0 lg:mr-3'> {/* Left section for profile name & tabs */}
                        <div className='flex flex-col w-full'>
                            <div className='flex justify-start items-center space-x-3'> {/* Profile image and details */}
                                <img src={pfp} alt='profile' className='h-14 w-14 rounded-full object-cover' />
                                <div className='flex flex-col'>
                                    <p className='text-white text-lg font-bold hover:cursor-pointer'>{user?.user?.name || "Guest"}</p>
                                    <p className='text-secondary-text text-base font-semibold hover:cursor-pointer'>@{user?.user?.username}</p>
                                </div>
                            </div>
                            <div className='flex flex-col w-full h-full mt-5 space-y-3'> {/* Tabs section */}
                                {['Overview', 'Properties'].map((tab) => (
                                    <div key={tab} className={`p-2 rounded-lg text-base font-semibold hover:cursor-pointer transition-all duration-300 ${activeTab === tab ? 'bg-menu-active-bg text-tertiary-text' : 'bg-transparent text-secondary-text'}`} onClick={() => setActiveTab(tab)}>
                                        {tab}
                                    </div>
                                ))}
                                {['Roommates', 'Payment', 'Settings'].map((tab) => (
                                    <div key={tab} className='p-2 rounded-lg text-secondary-text text-base font-semibold hover:cursor-pointer transition-all duration-300'>
                                        {tab}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className='flex w-full lg:w-3/4'> {/* Right section */}
                        {activeTab === 'Overview' &&
                            <div className='flex flex-col w-full space-y-4'>
                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                                    {[{
                                        title: 'Next Payment',
                                        value: '₹1,800',
                                        date: 'Due March 1, 2025',
                                        icon: pay,
                                        color: 'bg-green-900'
                                    }, {
                                        title: 'Lease Ends',
                                        value: '250 Days',
                                        date: 'December 31, 2025',
                                        icon: calendar,
                                        color: 'bg-violet-900'
                                    }, {
                                        title: 'Roommates',
                                        value: '3 Active',
                                        date: 'All verified',
                                        icon: people,
                                        color: 'bg-blue-900'
                                    }].map((card, index) => (
                                        <div key={index} className='flex flex-col justify-center items-center text-white bg-sub-bg rounded-xl p-5 space-y-2'>
                                            <div className={`flex justify-center items-center h-10 w-10 ${card.color} rounded-xl`}>
                                                <img src={card.icon} alt={card.title} className='h-5 w-5' />
                                            </div>
                                            <p className='text-secondary-text font-semibold text-base'>{card.title}</p>
                                            <p className='text-white font-semibold text-xl'>{card.value}</p>
                                            <p className='text-secondary-text font-semibold text-base'>{card.date}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className='w-full bg-sub-bg rounded-xl p-5'>
                                    <div className='flex justify-between'>
                                        <p className='text-white text-lg font-bold'>Current Property</p>
                                        <p className='text-tertiary-text text-base font-semibold hover:cursor-pointer hover:underline'
                                            onClick={() => navigate('/details')}>View Details</p>
                                    </div>
                                    <div className='flex flex-col md:flex-row gap-3 mt-3'>
                                        <img src={house1} alt='property' className='w-full md:w-1/2 h-44 object-cover rounded-xl' />
                                        <div className='flex flex-col space-y-2 w-full md:w-1/2'>
                                            <p className='text-white text-lg font-semibold'>Bhoot Bangla</p>
                                            <p className='text-secondary-text font-semibold text-base'>1.2 Kilometers away from D. Y. Patil College</p>
                                            <div className='grid grid-cols-2 gap-3'>
                                                <div className='flex flex-col bg-cards-bg rounded-xl p-2'>
                                                    <p className='text-secondary-text text-base font-semibold'>Room Type</p>
                                                    <p className='text-white text-base font-semibold'>3 BHK</p>
                                                </div>
                                                <div className='flex flex-col bg-cards-bg rounded-xl p-2'>
                                                    <p className='text-secondary-text text-base font-semibold'>Floor</p>
                                                    <p className='text-white text-base font-semibold'>5th Floor</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='w-full bg-sub-bg rounded-xl p-5'>
                                    <p className='text-white text-lg font-bold'>Roommates</p>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mt-3'>
                                        {[{ name: 'Aryan Patil', course: 'Computer Science & Engg.' }, { name: 'Harshwardhan Patil', course: 'Computer Science & Engg.' }].map((mate, index) => (
                                            <div key={index} className='flex items-center bg-cards-bg rounded-xl p-2 space-x-3'>
                                                <img src='https://placehold.co/100' alt={mate.name} className='h-12 w-12 rounded-full' />
                                                <div className='flex flex-col'>
                                                    <p className='text-white text-base font-semibold'>{mate.name}</p>
                                                    <p className='text-secondary-text text-base font-semibold'>{mate.course}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        }
                        {activeTab === 'Properties' &&
                            <div className='w-full h-full flex flex-col space-y-6'> {/* Section to show the properties */}
                                {/* First Property card */}
                                <div className='w-full bg-sub-bg rounded-xl p-5'>
                                    <div className='flex justify-between'>
                                        <p className='text-white text-lg font-bold'>Nagala Park Property</p>
                                        <p className='text-tertiary-text text-base font-semibold hover:cursor-pointer hover:underline'>View Details</p>
                                    </div>
                                    <div className='flex flex-col md:flex-row gap-3 mt-3'>
                                        <img src={house1} alt='property' className='w-full md:w-1/2 h-44 object-cover rounded-xl' />
                                        <div className='flex flex-col space-y-2 w-full md:w-1/2'>
                                            <p className='text-white text-lg font-semibold'>Bhoot Bangla</p>
                                            <p className='text-secondary-text font-semibold text-base'>1.2 Kilometers away from D. Y. Patil College</p>
                                            <div className='grid grid-cols-2 gap-3'>
                                                <div className='flex flex-col bg-cards-bg rounded-xl p-2'>
                                                    <p className='text-secondary-text text-base font-semibold'>Room Type</p>
                                                    <p className='text-white text-base font-semibold'>3 BHK</p>
                                                </div>
                                                <div className='flex flex-col bg-cards-bg rounded-xl p-2'>
                                                    <p className='text-secondary-text text-base font-semibold'>Floor</p>
                                                    <p className='text-white text-base font-semibold'>5th Floor</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Second Property Card */}
                                <div className='w-full bg-sub-bg rounded-xl p-5'>
                                    <div className='flex justify-between'>
                                        <p className='text-white text-lg font-bold'>Kasaba Bawada Property</p>
                                        <p className='text-tertiary-text text-base font-semibold hover:cursor-pointer hover:underline'>View Details</p>
                                    </div>
                                    <div className='flex flex-col md:flex-row gap-3 mt-3'>
                                        <img src={house1} alt='property' className='w-full md:w-1/2 h-44 object-cover rounded-xl' />
                                        <div className='flex flex-col space-y-2 w-full md:w-1/2'>
                                            <p className='text-white text-lg font-semibold'>Hogwarts Castle</p>
                                            <p className='text-secondary-text font-semibold text-base'>0.3 Kilometers away from D. Y. Patil College</p>
                                            <div className='grid grid-cols-2 gap-3'>
                                                <div className='flex flex-col bg-cards-bg rounded-xl p-2'>
                                                    <p className='text-secondary-text text-base font-semibold'>Room Type</p>
                                                    <p className='text-white text-base font-semibold'>3 BHK</p>
                                                </div>
                                                <div className='flex flex-col bg-cards-bg rounded-xl p-2'>
                                                    <p className='text-secondary-text text-base font-semibold'>Floor</p>
                                                    <p className='text-white text-base font-semibold'>5th Floor</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </>
    )
}

export default ProfilePage