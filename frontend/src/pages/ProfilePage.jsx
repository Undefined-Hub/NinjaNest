import React, { useState } from 'react'
import pfp from '../assets/pfp.png'
import house1 from '../assets/house1.jpg'
import pay from '../assets/pay.svg'
import calendar from '../assets/calendar.svg'
import people from '../assets/people.svg'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux';


import { AiOutlineHome } from "react-icons/ai";
import { FaRegBuilding, FaUserFriends } from "react-icons/fa";
import { BiCreditCard } from "react-icons/bi";
import { FiSettings } from "react-icons/fi";
import { FiLogOut } from "react-icons/fi";
import { AiOutlinePlus } from "react-icons/ai";

const menuItems = [
  { label: "Overview", icon: <AiOutlineHome /> },
  { label: "My Properties", icon: <FaRegBuilding /> },
  { label: "Roommates", icon: <FaUserFriends /> },
  { label: "Payment", icon: <BiCreditCard /> },
  { label: "Settings", icon: <FiSettings /> },
];

const ProfilePage = () => {
    let navigate = useNavigate()
    const { user, loading, error } = useSelector((state) => state.user);
    // user.user && console.log(`User Details: (ProfilePage) `, user);
    const [activeTab, setActiveTab] = useState('Overview') // State to hold the active tab
    return (
        <>
            <div className='flex justify-center items-center bg-main-bg p-3'> {/* Main container for profile page */}
                <div className='w-full max-w-5xl mx-auto my-6 flex flex-col lg:flex-row'> {/* Responsive inner container */}
                <div className='flex w-full h-[600px] lg:w-1/4 bg-sub-bg rounded-xl p-5 mb-3 lg:mb-0 lg:mr-3'>
                    <div className='flex flex-col w-full'>
                        {/* Profile Info */}
                        <div className='flex items-start space-x-3 w-full'>
                            <div className='flex-shrink-0'>
                                <img
                                src={pfp}
                                alt='profile'
                                className='h-14 w-14 rounded-full object-cover'
                                />
                            </div>
                            <div className='flex flex-col flex-grow overflow-hidden'>
                                <p className='text-white text-lg font-bold leading-tight break-words hover:cursor-pointer'>
                                {user?.user?.name || "Guest"}
                                </p>
                                <p className='text-secondary-text text-base font-semibold hover:cursor-pointer truncate'>
                                @{user?.user?.username}
                                </p>
                            </div>
                            </div>

                        {/* Tabs */}
                        <div className='flex flex-col w-full h-full mt-5 space-y-3'>
                        {menuItems.map(({ label, icon }) => (
                            <div
                            key={label}
                            className={`flex items-center space-x-3 p-2 rounded-lg text-base font-semibold hover:cursor-pointer transition-all duration-300 ${
                                activeTab === label ? 'bg-menu-active-bg text-tertiary-text' : 'bg-transparent text-secondary-text'
                            }`}
                            onClick={() => setActiveTab(label)}
                            >
                            <span className='text-lg'>{icon}</span>
                            <span>{label}</span>
                            </div>
                        ))}
                        </div>

                        {/* Logout Button */}
                        <div className='mt-auto'>
                        <button className='w-full flex items-center justify-start space-x-2 bg-logout-red text-logout-text font-semibold p-2 rounded-lg hover:bg-[#6b2e2e] transition-all duration-300'>
                            <FiLogOut className='text-lg' />
                            <span>Logout</span>
                        </button>
                        </div>
                    </div>
                    </div>


                    <div className='flex w-full lg:w-3/4 '> {/* Right section */}
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
                                            onClick={() => navigate('/details/6813200e1e378f29717a5baf')}>View Details</p>
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
                        {activeTab === 'My Properties' && 
                           <MyProperties /> // Call the MyProperties component here
                        }
                    </div>
                </div>
            </div>
        </>
    )
}




const MyProperties = () => {
const properties = [
    {
        id: 1,
        name: 'Nagala Park Property',
        title: 'Bhoot Bangla',
        distance: '1.2 Kilometers away from D. Y. Patil College',
        roomType: '3 BHK',
        floor: '5th Floor',
        image: house1,
    },
    {
        id: 2,
        name: 'Kasaba Bawada Property',
        title: 'Hogwarts Castle',
        distance: '0.3 Kilometers away from D. Y. Patil College',
        roomType: '3 BHK',
        floor: '5th Floor',
        image: house1,
    },
    {
        id: 3,
        name: 'Shivaji Peth Property',
        title: 'Royal Palace',
        distance: '2.0 Kilometers away from D. Y. Patil College',
        roomType: '2 BHK',
        floor: '3rd Floor',
        image: house1,
    },
    {
        id: 4,
        name: 'Rajarampuri Property',
        title: 'Modern Villa',
        distance: '1.5 Kilometers away from D. Y. Patil College',
        roomType: '4 BHK',
        floor: '2nd Floor',
        image: house1,
    },
    {
        id: 5,
        name: 'Tarabai Park Property',
        title: 'Green Meadows',
        distance: '0.8 Kilometers away from D. Y. Patil College',
        roomType: '3 BHK',
        floor: '1st Floor',
        image: house1,
    },
];

return (
    <div className='flex flex-col w-full space-y-4 '>
        <button className='flex items-center justify-center space-x-2 w-1/5 bg-main-purple hover:bg-[#6b2bd2] transition-all duration-300 p-3 rounded-lg self-end'>
            <AiOutlinePlus className='text-white text-base' />
            <span className='text-white font-semibold text-sm'>Add Property</span>
        </button>


        <div className='w-full  flex flex-col space-y-6 h-[75vh] overflow-y-auto'>
            {properties.map((property) => (
                <div key={property.id} className='w-full bg-sub-bg rounded-xl p-5'>
                    <div className='flex justify-between'>
                        <p className='text-white text-lg font-bold'>{property.name}</p>
                        <p className='text-tertiary-text text-base font-semibold hover:cursor-pointer hover:underline'>
                            View Details
                        </p>
                    </div>
                    <div className='flex flex-col md:flex-row gap-3 mt-3'>
                        <img
                            src={property.image}
                            alt={property.title}
                            className='w-full md:w-1/2 h-44 object-cover rounded-xl'
                        />
                        <div className='flex flex-col space-y-2 w-full md:w-1/2'>
                            <p className='text-white text-lg font-semibold'>{property.title}</p>
                            <p className='text-secondary-text font-semibold text-base'>{property.distance}</p>
                            <div className='grid grid-cols-2 gap-3'>
                                <div className='flex flex-col bg-cards-bg rounded-xl p-2'>
                                    <p className='text-secondary-text text-base font-semibold'>Room Type</p>
                                    <p className='text-white text-base font-semibold'>{property.roomType}</p>
                                </div>
                                <div className='flex flex-col bg-cards-bg rounded-xl p-2'>
                                    <p className='text-secondary-text text-base font-semibold'>Floor</p>
                                    <p className='text-white text-base font-semibold'>{property.floor}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
}




export default ProfilePage