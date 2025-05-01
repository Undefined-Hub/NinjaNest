import React, { useState, useEffect } from 'react'
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
import { AiOutlineBell } from "react-icons/ai";
import axios from 'axios';

const menuItems = [
    { label: "Overview", icon: <AiOutlineHome /> },
    { label: "My Properties", icon: <FaRegBuilding /> },
    { label: "Notifications", icon: <AiOutlineBell /> },
    { label: "Roommates", icon: <FaUserFriends /> },
    { label: "Payment", icon: <BiCreditCard /> },
    { label: "Settings", icon: <FiSettings /> },
];

const ProfilePage = () => {

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

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
                                        className={`flex items-center space-x-3 p-2 rounded-lg text-base font-semibold hover:cursor-pointer transition-all duration-300 ${activeTab === label ? 'bg-menu-active-bg text-tertiary-text' : 'bg-transparent text-secondary-text'
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
                                            // TODO: Change this to navigate to the property details page of active property
                                            onClick={() => navigate('/properties/property/68132ad859d60fe9cba7ef05')}>View Details</p>
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
        const [properties, setProperties] = useState([]);
        const navigate = useNavigate();

        useEffect(() => {
            const fetchProperties = async () => {
                try {
                    const response = await axios.get('http://localhost:3000/api/property/');
                    console.log('Fetched properties:', response.data.properties);
                    setProperties(response.data.properties);
                } catch (error) {
                    console.error('Error fetching properties:', error);
                }
            };

            fetchProperties();
        }, []);

        return (
            <div className='flex flex-col w-full space-y-4'>
                <button
                    className='flex items-center justify-center space-x-2 w-1/5 bg-main-purple hover:bg-[#6b2bd2] transition-all duration-300 p-3 rounded-lg self-end'
                    onClick={() => navigate('/add-property')}
                >
                    <AiOutlinePlus className='text-white text-base' />
                    <span className='text-white font-semibold text-sm'>Add Property</span>
                </button>

                <div className='w-full flex flex-col space-y-6 h-[75vh] overflow-y-auto'>
                    {properties.map((property, index) => (
                        <div key={index} className='w-full bg-sub-bg rounded-xl p-5'>
                            <div className='flex justify-between'>
                                <p className='text-white text-lg font-bold'>{property.title}</p>
                                <p
                                    className='text-tertiary-text text-base font-semibold hover:cursor-pointer hover:underline'
                                    onClick={() => navigate(`/properties/property/${property._id}`)}
                                >
                                    View Details
                                </p>
                            </div>
                            <div className='flex flex-col md:flex-row gap-3 mt-3'>
                                <img
                                    src={property.mainImage}
                                    alt={property.title}
                                    className='w-full md:w-1/2 h-44 object-cover rounded-xl'
                                />
                                <div className='flex flex-col space-y-2 w-full md:w-1/2'>
                                    <p className='text-white text-lg font-semibold'>{property.location}</p>
                                    <p className='text-secondary-text font-semibold text-base'>{property.address}</p>
                                    <div className='grid grid-cols-2 gap-3'>
                                        <div className='flex flex-col bg-cards-bg rounded-xl p-2'>
                                            <p className='text-secondary-text text-base font-semibold'>Rent</p>
                                            <p className='text-white text-base font-semibold'>₹{property.rent}</p>
                                        </div>
                                        <div className='flex flex-col bg-cards-bg rounded-xl p-2'>
                                            <p className='text-secondary-text text-base font-semibold'>Deposit</p>
                                            <p className='text-white text-base font-semibold'>₹{property.deposit}</p>
                                        </div>
                                    </div>
                                    <p className='text-secondary-text text-sm'>{property.description.slice(0, 100)}...</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };
   



export default ProfilePage