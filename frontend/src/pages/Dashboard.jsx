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
import { useDispatch } from 'react-redux';
import { logoutUser } from '../features/User/userSlice';
import axios from 'axios'
import { MdManageAccounts } from "react-icons/md";
import { useAuth } from "../CustomHook/useAuth";

const menuItems = [
    { label: "Overview", icon: <AiOutlineHome /> },
    { label: "My Properties", icon: <FaRegBuilding /> },
    { label: "Notifications", icon: <AiOutlineBell /> },
    { label: "Roommates", icon: <FaUserFriends /> },
    { label: "Payment", icon: <BiCreditCard /> },
    { label: "Settings", icon: <FiSettings /> },
];

const Dashboard = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
 

    const handleLogout = () => {
        dispatch(logoutUser());
        alert('Logged out successfully!')
        navigate('/'); // or navigate to login page
    };

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
                                <button 
                                onClick={handleLogout}
                                className='w-full flex items-center justify-start space-x-2 bg-logout-red text-logout-text font-semibold p-2 rounded-lg hover:bg-[#6b2e2e] transition-all duration-300'>
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
                                            onClick={() => navigate('/dashboard')}>View Details</p>
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
                        {activeTab === 'Notifications' &&
                            <Notifications />

                        }
                    </div>
                </div>
            </div>
        </>
    )
}





const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const { user } = useSelector((state) => state.user)
    const user_id = user.user;// Assuming userId is stored in localStorage
    // console.log(user_id)
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/request', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                console.log(user_id._id === response.data[0].requestorId._id)
                // Filter requests where the user is either the requestor or the owner
                const userRequests = response.data.filter(
                    (request) => request.requestorId._id === user_id._id || request.ownerId._id === user_id._id
                );
                console.log(userRequests)
                setNotifications(userRequests);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching notifications:', err);
                setError('Failed to load notifications.');
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [user_id._id]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'text-yellow-500';
            case 'Accepted':
                return 'text-green-500';
            case 'Rejected':
                return 'text-red-500';
            default:
                return 'text-secondary-text';
        }
    };

    const getNotificationMessage = (notification, userId) => {
        if (notification.requestorId._id === userId) {
            switch (notification.status) {
                case 'Accepted':
                    return 'Request Accepted by Owner.';
                case 'Rejected':
                    return 'Owner Rejected Your Request.';
                default:
                    return 'Request Sent to Owner is reviewing your request.';
            }
        } else {
            return notification.message;
        }
    };
    const handleRequestsClick = () => {
        console.log('Requests button clicked!' + notifications);
        setShowModal(true); // Show the modal when the button is clicked
    };

    const closeModal = () => {
        setShowModal(false); // Close the modal
    };

    if (loading) {
        return <p className="text-white">Loading notifications...</p>;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    return (
        <div className="flex flex-col w-full space-y-4">
            <div className='flex justify-between items-center'>
                <p className="text-white text-lg font-bold">Notifications</p>
                <button onClick={handleRequestsClick} className="flex items-center justify-center space-x-4 w-1/5 bg-main-purple hover:bg-[#6b2bd2] transition-all duration-300 p-2 rounded-lg self-end">
                    <MdManageAccounts className="text-white text-base" />
                    <span className="text-white font-semibold text-sm">Requests</span>
                </button>
                {/* Modal for property requests */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-sub-bg rounded-xl p-5 w-3/4 max-h-[80vh]">
                            <div className="flex justify-between items-center mb-4 h-6 overflow-y-auto">
                                <p className="text-white text-lg font-bold">Property Requests</p>
                                <button
                                    onClick={closeModal}
                                    className="text-white text-lg font-bold hover:text-red-500"
                                >
                                    &times;
                                </button>
                            </div>
                            {notifications.length > 0 ? (
                                <div className="flex flex-col space-y-3 overflow-y-auto h-[60vh]">
                                    {notifications
                                        .filter(notification => notification.ownerId._id === user_id._id)
                                        .map((notification) => (
                                            <div
                                                key={notification._id}
                                                className="flex flex-col bg-cards-bg rounded-xl p-4 space-y-2"
                                            >
                                                <div className="flex justify-between">
                                                    <p className="text-white text-base font-semibold">
                                                        {notification.requestorName} is interested in your property.
                                                    </p>
                                                    <p
                                                        className={`text-base font-semibold ${getStatusColor(
                                                            notification.status
                                                        )}`}
                                                    >
                                                        {notification.status}
                                                    </p>
                                                </div>

                                                <p className="text-secondary-text text-sm font-semibold">
                                                    Property ID: {notification.propertyId._id}
                                                </p>
                                                <p className="text-secondary-text text-sm font-semibold">
                                                    Requested Price: ₹{(notification.requestedPrice.min && notification.requestedPrice.max) ? notification.requestedPrice.min + " - " + notification.requestedPrice.max : (notification.requestedPrice?.fixed)}
                                                </p>
                                                {notification.status === 'Pending' && (
                                                    <div className="flex space-x-3 mt-2">
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    // Accept the request
                                                                    await axios.put(
                                                                        `http://localhost:3000/api/request/${notification._id}`,
                                                                        { status: 'Accepted' },
                                                                        {
                                                                            headers: {
                                                                                Authorization: `Bearer ${localStorage.getItem('token')}`,
                                                                            },
                                                                        }
                                                                    );

                                                                    // Update the requestor's current rental
                                                                    await axios.put(
                                                                        `http://localhost:3000/api/user/updateUser/${notification.requestorId._id}`,
                                                                        { currentRental: notification.propertyId._id },
                                                                        {
                                                                            headers: {
                                                                                Authorization: `Bearer ${localStorage.getItem('token')}`,
                                                                            },
                                                                        }
                                                                    );

                                                                    // Update the property's availability
                                                                    try {
                                                                        const propertyResponse = await axios.get(
                                                                            `http://localhost:3000/api/property/${notification.propertyId._id}`,
                                                                            {
                                                                                headers: {
                                                                                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                                                                                },
                                                                            }
                                                                        );

                                                                        const updatedProperty = {
                                                                            ...propertyResponse.data.property,
                                                                            isAvailable: false,
                                                                        };
                                                                        console.log(updatedProperty)
                                                                        await axios.put(
                                                                            `http://localhost:3000/api/property/${notification.propertyId._id}`,
                                                                            updatedProperty,
                                                                            {
                                                                                headers: {
                                                                                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                                                                                },
                                                                            }
                                                                        );
                                                                    } catch (err) {
                                                                        console.error('Error updating property availability:', err);
                                                                    }

                                                                    // Update the notifications state
                                                                    setNotifications((prev) =>
                                                                        prev.map((notif) =>
                                                                            notif._id === notification._id
                                                                                ? { ...notif, status: 'Accepted' }
                                                                                : notif
                                                                        )
                                                                    );
                                                                } catch (err) {
                                                                    console.error('Error processing request:', err);
                                                                }
                                                            }}
                                                            className="space-x-2 w-1/5 text-white font-bold bg-main-purple hover:bg-[#6b2bd2] transition-all duration-300 p-2 rounded-lg"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    await axios.put(
                                                                        `http://localhost:3000/api/request/${notification._id}`,
                                                                        { status: 'Rejected' },
                                                                        {
                                                                            headers: {
                                                                                Authorization: `Bearer ${localStorage.getItem('token')}`,
                                                                            },
                                                                        }
                                                                    );
                                                                    setNotifications((prev) =>
                                                                        prev.map((notif) =>
                                                                            notif._id === notification._id
                                                                                ? { ...notif, status: 'Rejected' }
                                                                                : notif
                                                                        )
                                                                    );
                                                                } catch (err) {
                                                                    console.error('Error rejecting request:', err);
                                                                }
                                                            }}
                                                            className="bg-secondary-text text-white font-bold px-4 py-2 rounded-lg hover:bg-primary-text hover:text-black"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <p className="text-secondary-text text-base font-semibold">
                                    No requests found for your properties.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <div className="w-full flex flex-col space-y-3 h-[64vh] overflow-y-auto">
                {notifications.map((notification) => (
                    <div
                        key={notification._id}
                        className="flex items-center justify-between bg-cards-bg rounded-xl p-4"
                    >
                        <div className="flex flex-col">
                            <p className="text-white text-base font-semibold">
                                {getNotificationMessage(notification, user_id._id)}
                            </p>
                            <p className="text-secondary-text text-sm font-semibold">
                                Type: {notification.requestorId._id === user_id._id ? 'Sent' : 'Received'}
                            </p>
                            <p className="text-secondary-text text-sm font-semibold">
                                Requested Price: ₹{(notification.requestedPrice.min && notification.requestedPrice.max)
                                    ? notification.requestedPrice.min.toLocaleString('en-IN') + " - " + notification.requestedPrice.max.toLocaleString('en-IN')
                                    : (notification.requestedPrice?.fixed?.toLocaleString('en-IN'))}
                            </p>
                        </div>
                        <p
                            className={`text-base font-semibold ${getStatusColor(
                                notification.status
                            )}`}
                        >
                            {notification.status}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};



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
                                onClick={() => navigate(`/explore/property/${property._id}`)}
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




export default Dashboard