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
            <div className='flex justify-center items-center bg-main-bg p-4'> {/* Main container for profile page */}
                <div className='w-full max-w-7xl mx-auto my-8 flex flex-col lg:flex-row'> {/* Responsive inner container */}
                    <div className='flex w-full lg:w-1/4 bg-sub-bg rounded-2xl p-6 mb-4 lg:mb-0 lg:mr-4'> {/* Left section for profile name & tabs */}
                        <div className='flex flex-col w-full'>
                            <div className='flex justify-start items-center space-x-4'> {/* Profile image and details */}
                                <img src={pfp} alt='profile' className='h-16 w-16 rounded-full object-cover' />
                                <div className='flex flex-col'>
                                    <p className='text-white text-xl font-bold hover:cursor-pointer'>{user?.user?.name || "Guest"}</p>
                                    <p className='text-secondary-text text-lg font-semibold hover:cursor-pointer'>@{user?.user?.username}</p>
                                </div>
                            </div>
                            <div className='flex flex-col w-full h-full mt-6 space-y-4'> {/* Tabs section */}
                                {['Overview', 'Properties'].map((tab) => (
                                    <div key={tab} className={`p-3 rounded-xl text-lg font-semibold hover:cursor-pointer transition-all duration-300 ${activeTab === tab ? 'bg-menu-active-bg text-tertiary-text' : 'bg-transparent text-secondary-text'}`} onClick={() => setActiveTab(tab)}>
                                        {tab}
                                    </div>
                                ))}
                                {['Roommates', 'Payment', 'Settings'].map((tab) => (
                                    <div key={tab} className='p-3 rounded-xl text-secondary-text text-lg font-semibold hover:cursor-pointer transition-all duration-300'>
                                        {tab}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className='flex w-full lg:w-3/4'> {/* Right section */}
                        {activeTab === 'Overview' &&
                            <div className='flex flex-col w-full space-y-6'>
                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
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
                                        <div key={index} className='flex flex-col justify-center items-center text-white bg-sub-bg rounded-2xl p-6 space-y-3'>
                                            <div className={`flex justify-center items-center h-12 w-12 ${card.color} rounded-2xl`}>
                                                <img src={card.icon} alt={card.title} className='h-6 w-6' />
                                            </div>
                                            <p className='text-secondary-text font-semibold text-lg'>{card.title}</p>
                                            <p className='text-white font-semibold text-2xl'>{card.value}</p>
                                            <p className='text-secondary-text font-semibold text-lg'>{card.date}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className='w-full bg-sub-bg rounded-2xl p-6'>
                                    <div className='flex justify-between'>
                                        <p className='text-white text-xl font-bold'>Current Property</p>
                                        <p className='text-tertiary-text text-lg font-semibold hover:cursor-pointer hover:underline'
                                            onClick={() => navigate('/details')}>View Details</p>
                                    </div>
                                    <div className='flex flex-col md:flex-row gap-4 mt-4'>
                                        <img src={house1} alt='property' className='w-full md:w-1/2 h-52 object-cover rounded-2xl' />
                                        <div className='flex flex-col space-y-3 w-full md:w-1/2'>
                                            <p className='text-white text-xl font-semibold'>Bhoot Bangla</p>
                                            <p className='text-secondary-text font-semibold text-lg'>1.2 Kilometers away from D. Y. Patil College</p>
                                            <div className='grid grid-cols-2 gap-4'>
                                                <div className='flex flex-col bg-cards-bg rounded-2xl p-3'>
                                                    <p className='text-secondary-text text-lg font-semibold'>Room Type</p>
                                                    <p className='text-white text-lg font-semibold'>3 BHK</p>
                                                </div>
                                                <div className='flex flex-col bg-cards-bg rounded-2xl p-3'>
                                                    <p className='text-secondary-text text-lg font-semibold'>Floor</p>
                                                    <p className='text-white text-lg font-semibold'>5th Floor</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='w-full bg-sub-bg rounded-2xl p-6'>
                                    <p className='text-white text-xl font-bold'>Roommates</p>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
                                        {[{ name: 'Aryan Patil', course: 'Computer Science & Engg.' }, { name: 'Harshwardhan Patil', course: 'Computer Science & Engg.' }].map((mate, index) => (
                                            <div key={index} className='flex items-center bg-cards-bg rounded-2xl p-3 space-x-4'>
                                                <img src='https://placehold.co/100' alt={mate.name} className='h-14 w-14 rounded-full' />
                                                <div className='flex flex-col'>
                                                    <p className='text-white text-lg font-semibold'>{mate.name}</p>
                                                    <p className='text-secondary-text text-lg font-semibold'>{mate.course}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        }
                        {activeTab === 'Properties' &&
                            <div className='w-full h-full flex flex-col space-y-8'> {/* Section to show the properties */}
                                {/* First Property card */}
                                <div className='w-full bg-sub-bg rounded-2xl p-6'>
                                    <div className='flex justify-between'>
                                        <p className='text-white text-xl font-bold'>Nagala Park Property</p>
                                        <p className='text-tertiary-text text-lg font-semibold hover:cursor-pointer hover:underline'>View Details</p>
                                    </div>
                                    <div className='flex flex-col md:flex-row gap-4 mt-4'>
                                        <img src={house1} alt='property' className='w-full md:w-1/2 h-52 object-cover rounded-2xl' />
                                        <div className='flex flex-col space-y-3 w-full md:w-1/2'>
                                            <p className='text-white text-xl font-semibold'>Bhoot Bangla</p>
                                            <p className='text-secondary-text font-semibold text-lg'>1.2 Kilometers away from D. Y. Patil College</p>
                                            <div className='grid grid-cols-2 gap-4'>
                                                <div className='flex flex-col bg-cards-bg rounded-2xl p-3'>
                                                    <p className='text-secondary-text text-lg font-semibold'>Room Type</p>
                                                    <p className='text-white text-lg font-semibold'>3 BHK</p>
                                                </div>
                                                <div className='flex flex-col bg-cards-bg rounded-2xl p-3'>
                                                    <p className='text-secondary-text text-lg font-semibold'>Floor</p>
                                                    <p className='text-white text-lg font-semibold'>5th Floor</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Second Property Card */}
                                <div className='w-full bg-sub-bg rounded-2xl p-6'>
                                    <div className='flex justify-between'>
                                        <p className='text-white text-xl font-bold'>Kasaba Bawada Property</p>
                                        <p className='text-tertiary-text text-lg font-semibold hover:cursor-pointer hover:underline'>View Details</p>
                                    </div>
                                    <div className='flex flex-col md:flex-row gap-4 mt-4'>
                                        <img src={house1} alt='property' className='w-full md:w-1/2 h-52 object-cover rounded-2xl' />
                                        <div className='flex flex-col space-y-3 w-full md:w-1/2'>
                                            <p className='text-white text-xl font-semibold'>Hogwarts Castle</p>
                                            <p className='text-secondary-text font-semibold text-lg'>0.3 Kilometers away from D. Y. Patil College</p>
                                            <div className='grid grid-cols-2 gap-4'>
                                                <div className='flex flex-col bg-cards-bg rounded-2xl p-3'>
                                                    <p className='text-secondary-text text-lg font-semibold'>Room Type</p>
                                                    <p className='text-white text-lg font-semibold'>3 BHK</p>
                                                </div>
                                                <div className='flex flex-col bg-cards-bg rounded-2xl p-3'>
                                                    <p className='text-secondary-text text-lg font-semibold'>Floor</p>
                                                    <p className='text-white text-lg font-semibold'>5th Floor</p>
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
