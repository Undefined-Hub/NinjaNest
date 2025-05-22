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
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import { FiCamera } from "react-icons/fi";
import { FiEdit } from "react-icons/fi";
import { FiUser, FiSave, FiRefreshCw } from "react-icons/fi";
import api from "../api/axiosInstance";
import { IoLogOut } from "react-icons/io5";
import roommate from '/images/roommate.svg'
import payment from '/images/payment.svg'
import profile from '/images/profile.svg'
import CurrentRental from '../components/CurrentRental'
import { setHydrated, fetchUser } from "../features/User/userSlice";
const menuItems = [
    { label: "Overview", icon: <AiOutlineHome /> },
    { label: "My Properties", icon: <FaRegBuilding /> },
    { label: "Notifications", icon: <AiOutlineBell /> },
    { label: "Roommates", icon: <FaUserFriends /> },
    { label: "Payment", icon: <BiCreditCard /> },
    { label: "Profile", icon: <FiUser /> },
    // { label: "Settings", icon: <FiSettings /> },
];

const Dashboard = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    useEffect(() => {
        window.scrollTo(0, 0);
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const fetchResult = await dispatch(fetchUser(user?.user?.username));
            console.log('Fetched user data:', fetchResult);
        }
        catch (error) {
            console.error('Error fetching user data:', error);
        }
    };


    const handleLogout = () => {
        // Set logout flag BEFORE dispatch
        sessionStorage.setItem("isLoggingOut", "true");

        dispatch(logoutUser());
        // Show loading toast first
        const toastId = toast.loading('Logging out...');

        setTimeout(() => {
            toast.success('You’ve been logged out.', {
                id: toastId,
                // icon: <FiLogOut className='text-red-500 font-bold text-lg' />,
            });
        }, 200);
        // Delay navigation to allow PrivateRoute to check isLoggingOut
        setTimeout(() => {
            sessionStorage.removeItem("redirectAfterLogin");
            sessionStorage.removeItem("isLoggingOut");
            navigate('/');
        }, 500); // even 50ms might work, but 100ms is safer
    };


    const [activeTab, setActiveTab] = useState('Overview') // State to hold the active tab
    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location.state?.activeTab]);

    let navigate = useNavigate()
    const { user, loading, error } = useSelector((state) => state.user);
    user.user && console.log(`User Details: (ProfilePage) `, user);
    const [dashboardProperty, setDashboardProperty] = useState(null);
    const [dashboardNextRent, setDashboardNextRent] = useState(null);
    const [dashboardLeaseEnd, setDashboardLeaseEnd] = useState(null);
    const [dashboardRoommates, setDashboardRoommates] = useState([]);
    const [dashboardLoading, setDashboardLoading] = useState(true);


    const fetchUserBooking = async (propertyId) => {
        try {
            const response = await axios.get(
                `http://localhost:3000/api/booking/bookings/user/${user.user._id}/property/${propertyId}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            return response.data.booking;
        } catch (err) {
            console.error('Error fetching user booking:', err);
            return null;
        }
    };


    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user?.user?.currentRental) {
                setDashboardLoading(false);
                return;
            }
            try {
                // Fetch property
                const propRes = await axios.get(
                    `http://localhost:3000/api/property/${user.user.currentRental}`,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );

                // Get user-specific booking
                const userBooking = await fetchUserBooking(user.user.currentRental);

                if (userBooking) {
                    // Calculate lease end date
                    const moveIn = new Date(userBooking.moveInDate);
                    const leaseMonths = userBooking.durationMonths || 12;
                    const leaseEnd = new Date(moveIn.setMonth(moveIn.getMonth() + leaseMonths));
                    setDashboardLeaseEnd(leaseEnd);

                    // Get roommates from property
                    setDashboardRoommates(propRes.data.property?.roomDetails?.members || []);

                    // Fetch user's rent entries
                    const rentRes = await axios.get(
                        `http://localhost:3000/api/rents/${userBooking._id}`,
                        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                    );

                    const rents = Array.isArray(rentRes.data) ? rentRes.data : [];
                    const currentDate = new Date();

                    // Find unpaid rents that are due (including current month)
                    const unpaidRents = rents.filter(r => {
                        const dueDate = new Date(r.due_date);
                        // Include rents that are unpaid and either:
                        // 1. Due in current month OR
                        // 2. Overdue from previous months
                        return r.payment_status !== "paid" &&
                            dueDate.getMonth() <= currentDate.getMonth() &&
                            dueDate.getFullYear() <= currentDate.getFullYear();
                    });

                    if (unpaidRents.length > 0) {
                        // Sort by due date to get the earliest unpaid rent
                        unpaidRents.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
                        setDashboardNextRent(unpaidRents[0]);
                    } else {
                        // If no unpaid rents found for current or previous months
                        // Find the next upcoming rent payment
                        const futureRents = rents.filter(r => {
                            const dueDate = new Date(r.due_date);
                            return r.payment_status !== "paid" &&
                                dueDate > currentDate;
                        });

                        if (futureRents.length > 0) {
                            futureRents.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
                            setDashboardNextRent(futureRents[0]);
                        } else {
                            setDashboardNextRent(null);
                        }
                    }
                }
                setDashboardLoading(false);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setDashboardLoading(false);
            }
        };

        fetchDashboardData();
    }, [user?.user?.currentRental]);
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
                                        src={user?.user?.profilePicture || pfp}
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


                    {/* Right section */}
                    {activeTab === 'Overview' &&
                        <div className='flex flex-col space-y-4 w-4/5'>
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                                {/* Next Payment */}
                                <div className='flex flex-col justify-center items-center text-white bg-sub-bg rounded-xl p-5 space-y-2'>
                                    <div className="flex justify-center items-center h-10 w-10 bg-green-900 rounded-xl">
                                        <img src={pay} alt="Next Payment" className='h-5 w-5' />
                                    </div>
                                    <p className='text-secondary-text font-semibold text-base'>Next Payment</p>
                                    <p className='text-white font-semibold text-xl'>
                                        {dashboardNextRent
                                            ? `₹${dashboardNextRent.amount_due?.toLocaleString('en-IN')}`
                                            : "No due"}
                                    </p>
                                    <p className='text-secondary-text font-semibold text-base'>
                                        {dashboardNextRent
                                            ? `Due ${new Date(dashboardNextRent.due_date).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}`
                                            : ""}
                                    </p>
                                </div>
                                {/* Lease Ends */}
                                <div className='flex flex-col justify-center items-center text-white bg-sub-bg rounded-xl p-5 space-y-2'>
                                    <div className="flex justify-center items-center h-10 w-10 bg-violet-900 rounded-xl">
                                        <img src={calendar} alt="Lease Ends" className='h-5 w-5' />
                                    </div>
                                    <p className='text-secondary-text font-semibold text-base'>Lease Ends</p>
                                    <p className='text-white font-semibold text-xl'>
                                        {dashboardLeaseEnd
                                            ? `${Math.max(0, Math.ceil((dashboardLeaseEnd - new Date()) / (1000 * 60 * 60 * 24)))} Days`
                                            : "Unknown"}
                                    </p>
                                    <p className='text-secondary-text font-semibold text-base'>
                                        {dashboardLeaseEnd
                                            ? dashboardLeaseEnd.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
                                            : ""}
                                    </p>
                                </div>
                                {/* Roommates */}
                                <div className='flex flex-col justify-center items-center text-white bg-sub-bg rounded-xl p-5 space-y-2'>
                                    <div className="flex justify-center items-center h-10 w-10 bg-blue-900 rounded-xl">
                                        <img src={people} alt="Roommates" className='h-5 w-5 object-cover' />
                                    </div>
                                    <p className='text-secondary-text font-semibold text-base'>Roommates</p>
                                    <p className='text-white font-semibold text-xl'>
                                        {dashboardRoommates.length > 0
                                            ? `${dashboardRoommates.length} Active`
                                            : "No roommates"}
                                    </p>
                                    <p className='text-secondary-text font-semibold text-base'>
                                        {dashboardRoommates.length > 0 ? "All verified" : ""}
                                    </p>
                                </div>
                            </div>

                            <div className='w-full bg-sub-bg rounded-xl '>
                                {/* <p className='text-white text-lg font-bold mb-2'>Current Property</p> */}

                                {user?.user?.currentRental ? (
                                    <CurrentRental propertyId={user.user.currentRental} />
                                ) : (
                                    <div className='flex justify-center flex-col items-center h-44'>
                                        <p className='text-secondary-text p-2 '>You don't have any property, Explore and rent one.</p>
                                        <button
                                            className='bg-main-purple text-white font-semibold p-3 rounded-lg hover:bg-[#6b2bd2] transition-all duration-300'
                                            onClick={() => navigate('/explore')}
                                        >
                                            Browse Properties
                                        </button>

                                    </div>
                                )}
                            </div>

                            <div className='w-full bg-sub-bg rounded-xl p-5'>
                                <p className='text-white text-lg font-bold'>Roommates</p>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mt-3'>
                                    {dashboardRoommates.length > 0 ? (
                                        dashboardRoommates.map((mate, index) => (
                                            <div key={index} className='flex items-center bg-cards-bg rounded-xl p-2 space-x-3'>
                                                <img src={mate.profilePicture || 'https://placehold.co/100'} alt={mate.name} className='h-12 w-12 rounded-full object-cover' />
                                                <div className='flex flex-col'>
                                                    <p className='text-white text-base font-semibold'>{mate.name}</p>
                                                    <p className='text-secondary-text text-base font-semibold'>{mate.course}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className='text-secondary-text text-base'>No roommates found.</p>
                                    )}
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

                    {activeTab === 'Roommates' &&
                        <Roommates />
                    }



                    {activeTab === 'Payment' &&
                        <div className='flex flex-col items-center justify-center h-[64vh] space-y-4 w-4/5'>
                            <img
                                src={payment} // Replace with your illustration URL
                                alt='No Payment History'
                                className='w-1/2 h-auto'
                            />
                            <p className='text-secondary-text text-lg font-semibold text-center'>
                                No payment history is available yet. <br />Stay tuned for updates or make your first payment!
                            </p>
                        </div>
                    }

                    {activeTab === 'Profile' &&
                        // <div className='flex flex-col items-center justify-center h-[64vh] space-y-4 w-4/5'>
                        //     <img
                        //         src={profile} // Replace with your illustration URL
                        //         alt='Settings Coming Soon'
                        //         className='w-1/3 h-auto'
                        //     />
                        //     <p className='text-secondary-text text-lg font-semibold text-center'>
                        //         Settings functionality is coming soon. <br />Stay tuned for updates!
                        //     </p>
                        // </div>
                        <Profile />
                    }


                </div>
            </div>
        </>
    )
}



import notification from '/images/notification.svg'

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
        <div className="flex flex-col  space-y-4 w-4/5">
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
                                    {[...notifications]
                                        .filter(notification => notification.ownerId._id === user_id._id)
                                        .reverse()
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
                                        ))
                                    }
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
            {notifications.length > 0 ? (
                <div className="w-full flex flex-col space-y-3 h-[64vh] overflow-y-auto">
                    {[...notifications].reverse().map((notification) => (
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
            ) : (
                <div className="flex flex-col items-center justify-center h-[64vh] space-y-4 w-4/5">
                    <img
                        src={notification} // Replace with your illustration URL
                        alt="No Notifications"
                        className="w-1/3 h-auto"
                    />
                    <p className="text-secondary-text text-lg font-semibold text-center">
                        You have no notifications at the moment. <br />Stay tuned for updates!
                    </p>
                </div>
            )}
        </div>
    );
};

const Roommates = () => {
    // State for search term and results
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [currentRoommates, setCurrentRoommates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pendingInvitations, setPendingInvitations] = useState({ received: [], sent: [] });
    const [loadingInvitations, setLoadingInvitations] = useState(true);
    // Get current user's information
    const { user: currentUser } = useSelector((state) => state.user);

    // Fetch current roommates on component mount
    useEffect(() => {
        const fetchRoommates = async () => {
            try {
                // First check if user has a current rental
                if (!currentUser?.user?.currentRental) {
                    setCurrentRoommates([]);
                    setLoading(false);
                    return;
                }

                // Fetch property details with populated roommates
                const propertyResponse = await axios.get(
                    `http://localhost:3000/api/property/${currentUser.user.currentRental}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );

                const property = propertyResponse.data.property;

                // Check if property has roomDetails.members
                if (property && property.roomDetails && Array.isArray(property.roomDetails.members)) {
                    // Filter out current user from roommates list
                    const roommates = property.roomDetails.members.filter(
                        member => member._id !== currentUser.user._id
                    );

                    setCurrentRoommates(roommates);
                } else {
                    setCurrentRoommates([]);
                }
            } catch (error) {
                console.error('Error fetching roommates:', error);
                setCurrentRoommates([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRoommates();
    }, [currentUser?.user?._id, currentUser?.user?.currentRental]);

    useEffect(() => {
        const fetchInvitations = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/invitation/user', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                setPendingInvitations(response.data);
            } catch (error) {
                console.error('Error fetching invitations:', error);
            } finally {
                setLoadingInvitations(false);
            }
        };

        fetchInvitations();
    }, []);
    console.log('Search results: ', searchResults);

    const handleInviteRoommate = async (user) => {
        const loadingToast = toast.loading('Sending invitation...');

        try {

            // Need to fetch the current property the user is in
            const propertyResponse = await axios.get(
                `http://localhost:3000/api/property/${currentUser.user.currentRental}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            const property = propertyResponse.data.property;

            if (!property) {
                toast.dismiss(loadingToast);
                toast.error("You need to have a property to invite roommates");
                return;
            }

            // Create the invitation
            const invitationData = {
                inviterId: currentUser.user._id,
                inviteeId: user._id,
                propertyId: property._id,
                inviterName: currentUser.user.name,
                inviteeName: user.name,
                message: `${currentUser.user.name} has invited you to be their roommate`
            };

            console.log('Invitation data:', invitationData);

            const invitationResponse = await axios.post(
                'http://localhost:3000/api/invitation/create',
                invitationData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            console.log('Invitation response:', invitationResponse.data);

            // If invitation created successfully, send email
            if (invitationResponse.data && invitationResponse.data.invitation) {
                const { invitation } = invitationResponse.data;

                // Prepare email data
                const emailData = {
                    inviteeEmail: user.email,
                    inviterName: currentUser.user.name,
                    inviterUsername: currentUser.user.username,
                    inviteeFirstName: user.name.split(' ')[0],
                    propertyName: property.title,
                    propertyLocation: property.location,
                    propertyType: property.propertyType,
                    propertyImage: property.mainImage || (property.images && property.images.length > 0 ? property.images[0] : null),
                    invitationId: invitation._id,
                    invitationExpiry: invitation.expiresAt
                };

                // Send invitation email
                await axios.post(
                    'http://localhost:3000/api/mail/invite',
                    emailData,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );

                toast.dismiss(loadingToast);
                toast.success(`Invitation sent to ${user.name}`);
            }
        } catch (error) {
            console.error('Error sending invitation:', error);
            toast.dismiss(loadingToast);

            // Show appropriate error message
            if (error.response && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to send invitation. Please try again.');
            }
        }
    };

    // Handle search input change
    const handleSearchChange = async (e) => {
        setSearchTerm(e.target.value);
        if (e.target.value.length > 2) { // ? Only search after 2+ characters
            setIsSearching(true);
            try {
                const response = await axios.get(`http://localhost:3000/api/user/search/users?query=${e.target.value}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                // Make sure searchResults is always an array
                if (response.data && Array.isArray(response.data.users)) {
                    setSearchResults(response.data.users);
                } else {
                    console.warn("API response missing users array:", response.data);
                    setSearchResults([]);
                }
            } catch (error) {
                console.error("Error searching users:", error.response || error);
                setSearchResults([]); // Ensure searchResults is reset to an empty array on error
            }
        } else {
            setIsSearching(false);
            setSearchResults([]); // Reset to empty array, not undefined
        }
    };

    // If loading, show a loading state
    if (loading) {
        return (
            <div className='flex justify-center items-center h-[64vh] w-4/5'>
                <div className='animate-pulse text-secondary-text'>Loading roommates...</div>
            </div>
        );
    }

    return (
        <div className='flex flex-col w-4/5 max-h-[85vh] overflow-y-auto pr-1'>
            <div className='flex flex-col pb-6'> {/* Added padding to bottom to ensure content doesn't get cut off */}
                {/* Empty state illustration - only shown when no roommates */}
                {currentRoommates.length === 0 && (
                    <div className='flex flex-col items-center justify-center space-y-4 mb-8'>
                        <img
                            src={roommate}
                            alt='No Roommates'
                            className='w-1/3 h-auto'
                        />
                        <p className='text-secondary-text text-lg font-semibold text-center'>
                            No roommates have joined the room yet. <br />Search and invite friends below!
                        </p>
                    </div>
                )}

                {/* Current Roommates Section - only shown when there are roommates */}
                {currentRoommates.length > 0 && (
                    <div className='bg-sub-bg rounded-xl p-5 w-full mb-4'>
                        <h2 className='text-white text-lg font-bold mb-4'>Your Roommates</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                            {currentRoommates.map((mate, index) => (
                                <div key={index} className='flex items-center bg-cards-bg rounded-xl p-3 space-x-3'>
                                    <img src={mate.profilePicture || 'https://placehold.co/100'} alt="pfp" className='h-12 w-12 rounded-full object-cover' />
                                    <div className='flex flex-col'>
                                        <p className='text-white text-base font-semibold'>{mate.name}</p>
                                        <p className='text-secondary-text text-base font-semibold'>{mate.course}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Search Section - always shown */}
                <div className='bg-sub-bg rounded-xl p-5 w-full'>
                    <h2 className='text-white text-lg font-bold mb-4'>
                        {currentRoommates.length > 0 ? 'Find More Roommates' : 'Find Roommates'}
                    </h2>

                    {/* Search Input */}
                    <div className='relative mb-4'>
                        <input
                            type='text'
                            placeholder='Search by name, email, or username...'
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className='w-full bg-cards-bg text-white rounded-lg py-3 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-main-purple'
                        />
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-text"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Search Results */}
                    {isSearching && (
                        <div className='space-y-4'>
                            {searchResults && searchResults.length > 0 ? (
                                <>
                                    <p className='text-secondary-text font-semibold mb-2'>Search Results</p>
                                    <div className='space-y-3 max-h-60 overflow-y-auto pr-2'>
                                        {searchResults.map((user, index) => (
                                            <div key={index} className='flex items-center justify-between bg-cards-bg rounded-xl p-3'>
                                                <div className='flex items-center space-x-3'>
                                                    <img src={user.profilePicture || 'https://placehold.co/100'} alt="Profile" className='h-12 w-12 rounded-full object-cover' />
                                                    <div>
                                                        <p className='text-white font-semibold'>{user.name}</p>
                                                        <p className='text-secondary-text text-sm'>@{user.username}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleInviteRoommate(user)} className='bg-main-purple text-white px-4 py-2 rounded-lg hover:bg-[#6b2bd2] transition-all text-sm'>
                                                    Invite
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className='flex flex-col items-center justify-center py-8 bg-cards-bg rounded-xl'>
                                    <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                    </svg>
                                    <p className='text-secondary-text text-center'>No users found matching "{searchTerm}"</p>
                                    <p className='text-secondary-text text-sm text-center mt-1'>Try a different search term</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tips for when not searching */}
                    {!isSearching && (
                        <div className='bg-cards-bg rounded-xl p-4'>
                            <p className='text-tertiary-text font-semibold mb-2'>Search Tips</p>
                            <ul className='text-gray-400 space-y-2 text-sm list-disc pl-5 font-bold'>
                                <li>Search by full name, username, or email</li>
                                <li>Users must have an account on NinjaNest to be invited</li>
                                <li>Invited users will need to accept your invitation</li>
                                <li>You can invite up to the number of available beds in your room</li>
                            </ul>
                        </div>
                    )}
                </div>

                {/* Pending Invitations Section */}
                <div className='bg-sub-bg rounded-xl p-5 w-full mt-4'>
                    <h2 className='text-white text-lg font-bold mb-2'>Pending Invitations</h2>

                    {loadingInvitations ? (
                        <div className='bg-cards-bg rounded-xl p-4 flex items-center justify-center'>
                            <p className='text-secondary-text'>Loading invitations...</p>
                        </div>
                    ) : (
                        <>
                            {pendingInvitations.received.length > 0 ? (
                                <div className='space-y-3'>
                                    <p className='text-secondary-text font-semibold'>Received Invitations</p>
                                    {pendingInvitations.received.map((invitation) => (
                                        <div key={invitation._id} className='bg-cards-bg rounded-xl p-4'>
                                            <div className='flex items-center justify-between'>
                                                <div className='flex items-center space-x-3'>
                                                    <img
                                                        src={invitation.inviterId.profilePicture || 'https://placehold.co/100'}
                                                        alt="Profile"
                                                        className='h-10 w-10 rounded-full object-cover'
                                                    />
                                                    <div>
                                                        <p className='text-white font-semibold'>{invitation.inviterId.name}</p>
                                                        <p className='text-secondary-text text-sm'>@{invitation.inviterId.username}</p>
                                                    </div>
                                                </div>
                                                <div className='flex space-x-2'>
                                                    <a
                                                        href={`http://localhost:3000/api/invitation/accept/${invitation._id}`}
                                                        className='bg-main-purple text-white px-3 py-1 rounded-lg hover:bg-[#6b2bd2] transition-all text-sm'
                                                    >
                                                        Accept
                                                    </a>
                                                    <a
                                                        href={`http://localhost:3000/api/invitation/decline/${invitation._id}`}
                                                        className='bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition-all text-sm'
                                                    >
                                                        Decline
                                                    </a>
                                                </div>
                                            </div>
                                            <p className='text-secondary-text text-sm mt-2'>
                                                Property: {invitation.propertyId.title}, {invitation.propertyId.location}
                                            </p>
                                            <p className='text-gray-400 text-xs mt-1'>
                                                Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : null}

                            {pendingInvitations.sent.length > 0 ? (
                                <div className='space-y-3 mt-4'>
                                    <p className='text-secondary-text font-semibold'>Sent Invitations</p>
                                    {pendingInvitations.sent.map((invitation) => (
                                        <div key={invitation._id} className='bg-cards-bg rounded-xl p-4'>
                                            <div className='flex items-center justify-between'>
                                                <div className='flex items-center space-x-3'>
                                                    <img
                                                        src={invitation.inviteeId.profilePicture || 'https://placehold.co/100'}
                                                        alt="Profile"
                                                        className='h-10 w-10 rounded-full object-cover'
                                                    />
                                                    <div>
                                                        <p className='text-white font-semibold'>{invitation.inviteeId.name}</p>
                                                        <p className='text-secondary-text text-sm'>@{invitation.inviteeId.username}</p>
                                                    </div>
                                                </div>
                                                <span className='text-yellow-500 text-sm font-semibold'>Pending</span>
                                            </div>
                                            <p className='text-secondary-text text-sm mt-2'>
                                                Property: {invitation.propertyId.title}, {invitation.propertyId.location}
                                            </p>
                                            <p className='text-gray-400 text-xs mt-1'>
                                                Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : null}

                            {pendingInvitations.received.length === 0 && pendingInvitations.sent.length === 0 && (
                                <div className='bg-cards-bg rounded-xl p-4 flex flex-col items-center justify-center'>
                                    <p className='text-secondary-text text-center'>No pending invitations</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};


import not_found from '/images/not_found.svg'
import { useForm, FormProvider } from "react-hook-form";

const MyProperties = () => {
    const [properties, setProperties] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await api.get('/property/landlord/allproperty', {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
                );

                console.log('Fetched properties:', response.data.properties);
                setProperties(response.data.properties);
            } catch (error) {
                console.error('Error fetching properties:', error);
            }
        };

        fetchProperties();
    }, []);

    return (
        <div className='flex flex-col w-4/5 space-y-4'>
            {properties.length > 0 ? (
                <button
                    className='flex items-center justify-center space-x-2 w-1/5 bg-main-purple hover:bg-[#6b2bd2] transition-all duration-300 p-3 rounded-lg self-end'
                    onClick={() => navigate('/add-property')}
                >
                    <AiOutlinePlus className='text-white text-base' />
                    <span className='text-white font-semibold text-sm'>Add Property</span>
                </button>

            ) : (
                "")}
            {properties.length > 0 ? (
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
            ) : (
                <div className='flex flex-col items-center justify-center h-[75vh] space-y-4'>
                    <img
                        src={not_found} // Replace with your illustration URL
                        alt='No Properties'
                        className='w-1/3 h-auto'
                    />
                    <p className='text-secondary-text text-lg font-semibold'>
                        You have not listed any properties yet. Add your first property now!
                    </p>
                    <button
                        className='flex items-center justify-center space-x-2 bg-main-purple hover:bg-[#6b2bd2] transition-all duration-300 p-3 rounded-lg'
                        onClick={() => navigate('/add-property')}
                    >
                        <AiOutlinePlus className='text-white text-base' />
                        <span className='text-white font-semibold text-sm'>Add Property</span>
                    </button>
                </div>
            )}
        </div>
    );
};

const Profile = () => {
    const methods = useForm({
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            dob: "",
            college: "",
            course: "",
        },
    });


    const { register, formState: { errors }, handleSubmit, reset } = methods;
    const { user } = useSelector((state) => state.user);
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showDelete, setShowDelete] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [profilePic, setProfilePic] = useState(pfp);

    // const handleProfilePicChange = (e) => {
    //     const file = e.target.files[0];
    //     if (file) {
    //         const reader = new FileReader();
    //         reader.onloadend = () => {
    //             setProfilePic(reader.result);
    //         };
    //         reader.readAsDataURL(file);
    //     }
    // };
    useEffect(() => {
        const fetchUserDetails = async () => {
            const username = user?.user?.username;
            try {
                const response = await api.get(`/user/getUser/${username}`);
                const userData = response.data.user;
                methods.reset({
                    name: userData.name || "",
                    email: userData.email || "",
                    phone: userData.phone || "",
                    dob: userData.dob ? userData.dob.slice(0, 10) : "",
                    college: userData.college || "",
                    course: userData.course || "",
                    username: userData.username || "",
                });
                // If profilePicture exists, update profilePic state
                if (userData.profilePicture) {
                    setProfilePic(userData.profilePicture);
                }
            } catch (error) {
                // Optionally handle error
            }
        };
        fetchUserDetails();
        // eslint-disable-next-line
    }, []);
    const handleCurrentPasswordCheck = () => {
        console.log(user?.user);
        if (currentPassword === "yourCurrentPassword") {
            setShowPasswordFields(true);
            setPasswordError("");
        } else {
            setPasswordError("Current password is incorrect.");
            setShowPasswordFields(false);
        }
    };

    const handleSetNewPassword = () => {
        if (!newPassword || !confirmPassword) {
            setPasswordError("Please fill both password fields.");
            setPasswordSuccess("");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match.");
            setPasswordSuccess("");
            return;
        }
        setPasswordSuccess("Password updated successfully!");
        setPasswordError("");
        setShowPasswordFields(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    const handleDeleteAccount = () => {
        alert("Account deleted (dummy)");
    };

    const onSubmit = async (data, e) => {
        try {
            const userId = user?.user?._id;
            if (!userId) {
                throw new Error("User ID not found");
            }
            console.log(data);
            const response = await axios.put(
                `http://localhost:3000/api/user/updateUser/${userId}`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            console.log("Saved changes:", response.data);
            setIsEditing(false);
            // Remove focus from all input fields
            if (e && e.target) {
                e.target.blur();
                // Remove focus from all inputs in the form
                const form = e.target.closest('form');
                if (form) {
                    const inputs = form.querySelectorAll('input, select, textarea, button');
                    inputs.forEach(input => input.blur());
                }
            }
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    // Modal for profile picture preview and upload
    const [showPicModal, setShowPicModal] = useState(false);
    const [selectedPic, setSelectedPic] = useState(null);
    const [previewPic, setPreviewPic] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Open modal and show current profile pic
    const handleOpenPicModal = () => {
        setPreviewPic(profilePic);
        setSelectedPic(null);
        setShowPicModal(true);
    };

    // Handle file selection in modal
    const handleModalPicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedPic(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewPic(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Upload to Cloudinary and update backend
    const handleSetProfilePic = async () => {
        if (!selectedPic) return;
        setUploading(true);
        try {
            // 1. Upload to Cloudinary
            const formData = new FormData();
            formData.append("file", selectedPic);
            formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET); // from env
            const cloudinaryRes = await axios.post(
                `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, // from env
                formData
            );
            const imageUrl = cloudinaryRes.data.secure_url;

            // 2. Update backend user profile
            const userId = user?.user?._id;
            await axios.put(
                `http://localhost:3000/api/user/updateUser/${userId}`,
                { profilePicture: imageUrl },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            setProfilePic(imageUrl);
            setShowPicModal(false);
            setUploading(false);
            toast.success("Profile picture updated successfully!");
        } catch (err) {
            setUploading(false);
            toast.error("Failed to upload image. Please try again.");
        }
    };

    // Password visibility toggles
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <div className='flex flex-col items-center overflow-scroll h-[85vh] space-y-4 w-4/5'>
            {/* Profile Picture Section */}
            <div className='w-full h-60 bg-sub-bg rounded-xl p-5 flex items-center justify-center'>
                <div className='relative'>
                    <img
                        src={profilePic}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover cursor-pointer"
                        onClick={handleOpenPicModal}
                    />
                    <label
                        htmlFor="profile-pic-upload"
                        className="absolute bottom-0 right-0 bg-main-purple p-1 rounded-full cursor-pointer"
                        onClick={handleOpenPicModal}
                    >
                        <FiCamera className="text-white" />
                    </label>
                </div>
            </div>

            {/* Profile Picture Modal */}

            {/* Rest of the profile form */}
            <div className='w-full bg-sub-bg rounded-xl p-5'>
                <div className='flex items-center justify-between'>
                    <p className='text-white text-lg font-semibold'>Personal Information</p>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-main-purple text-white px-4 py-2 rounded-lg hover:bg-[#6b2bd2] transition-all"
                        >
                            <FiEdit className="inline mr-2" /> Edit Info
                        </button>
                    )}
                </div>
                <FormProvider {...methods}>
                    <form className="grid grid-cols-2 gap-3 mt-3" onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-secondary-text">Full Name</label>
                            <input
                                {...register("name", { required: "Full Name is required" })}
                                placeholder="Enter your full name"
                                className={`bg-cards-bg px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text ${!isEditing ? 'cursor-not-allowed' : ''}`}
                                defaultValue={user?.user?.name || ""}
                                disabled={!isEditing}
                            />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-secondary-text">Username</label>
                            <input
                                {...register("username", { required: "Full Name is required" })}
                                placeholder="Enter your full name"
                                className={`bg-cards-bg px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-main-purple text-secondary-text ${!isEditing ? 'cursor-not-allowed' : 'cursor-not-allowed'}`}
                                defaultValue={user?.user?.username || ""}
                                disabled
                            />
                            {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-secondary-text">Email</label>
                            <input
                                {...register("email")}
                                placeholder="Enter your email"
                                className={`bg-cards-bg px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-main-purple text-secondary-text ${!isEditing ? 'cursor-not-allowed' : 'cursor-not-allowed'}`}
                                defaultValue={user?.user?.email || ""}
                                disabled
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-secondary-text">Phone Number</label>
                            <input
                                {...register("phone", { required: "Phone number is required" })}
                                placeholder="Enter your phone number"
                                className={`bg-cards-bg px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text ${!isEditing ? 'cursor-not-allowed' : ''}`}
                                defaultValue={user?.user?.phone || ""}
                                disabled={!isEditing}
                            />
                            {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-secondary-text">Date of Birth</label>
                            <input
                                {...register("dob", { required: "Date of Birth is required" })}
                                type="date"
                                className={`bg-cards-bg px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text ${!isEditing ? 'cursor-not-allowed' : ''}`}
                                defaultValue={user?.user?.dob || ""}
                                disabled={!isEditing}
                            />
                            {errors.dob && <p className="text-red-500 text-sm">{errors.dob.message}</p>}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-secondary-text">College Name</label>
                            <input
                                {...register("college", { required: "College name is required" })}
                                placeholder="Enter your college name"
                                className={`bg-cards-bg px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text ${!isEditing ? 'cursor-not-allowed' : ''}`}
                                defaultValue={user?.user?.college || ""}
                                disabled={!isEditing}
                            />
                            {errors.college && <p className="text-red-500 text-sm">{errors.college.message}</p>}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-secondary-text">Course Name</label>
                            <input
                                {...register("course", { required: "Course name is required" })}
                                placeholder="Enter your course name"
                                className={`bg-cards-bg px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text ${!isEditing ? 'cursor-not-allowed' : ''}`}
                                defaultValue={user?.user?.course || ""}
                                disabled={!isEditing}
                            />
                            {errors.course && <p className="text-red-500 text-sm">{errors.course.message}</p>}
                        </div>
                        {isEditing && (
                            <div className="col-span-2 flex justify-end gap-3 mt-4">
                                <button
                                    type="submit"
                                    className="bg-main-purple text-white px-4 py-2 rounded-lg hover:bg-[#6b2bd2] transition-all"
                                >
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-all"
                                    onClick={() => {
                                        setIsEditing(false);
                                        // Reset form to original user data
                                        const userData = user?.user;
                                        methods.reset({
                                            name: userData?.name || "",
                                            email: userData?.email || "",
                                            phone: userData?.phone || "",
                                            dob: userData?.dob ? userData.dob.slice(0, 10) : "",
                                            college: userData?.college || "",
                                            course: userData?.course || "",
                                            username: userData?.username || "",
                                        });
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                        {showPicModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                                <div className="bg-sub-bg rounded-xl p-6 flex flex-col items-center w-[90vw] max-w-md relative">
                                    <button
                                        className="absolute top-2 right-3 text-white text-2xl"
                                        onClick={() => setShowPicModal(false)}
                                        aria-label="Close"
                                    >
                                        &times;
                                    </button>
                                    <img
                                        src={previewPic}
                                        alt="Preview"
                                        className="w-60 h-60 rounded-full object-cover border-4 border-main-purple mb-4"
                                    />
                                    <div className="flex flex-col items-center space-y-3 w-full">
                                        {!selectedPic ? (
                                            <label
                                                htmlFor="modal-profile-pic-upload"
                                                className="bg-main-purple text-white w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:cursor-pointer hover:bg-[#6b2bd2] transition-all"
                                            >
                                                <FiCamera className="inline h-5 w-5" />
                                                <span>Change Image</span>
                                                <input
                                                    type="file"
                                                    id="modal-profile-pic-upload"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleModalPicChange}
                                                />
                                            </label>
                                        ) : (
                                            <div className="flex w-full gap-3 mt-2">
                                                <label
                                                    htmlFor="modal-profile-pic-upload"
                                                    className="bg-white text-black w-1/2 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:cursor-pointer hover:bg-slate-100"
                                                >
                                                    <FiRefreshCw className="inline h-5 w-5" />
                                                    <span>Reupload</span>
                                                    <input
                                                        type="file"
                                                        id="modal-profile-pic-upload"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={handleModalPicChange}
                                                    />
                                                </label>
                                                <button
                                                    className="flex-1 flex items-center justify-center bg-main-purple text-white px-4 py-2 rounded-lg hover:bg-[#6b2bd2] transition-all space-x-2"
                                                    onClick={handleSetProfilePic}
                                                    disabled={uploading}
                                                >
                                                    <FiSave className="inline h-5 w-5" />
                                                    <span>{uploading ? "Uploading..." : "Save"}</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </FormProvider>
            </div>

            {/* Change Password Section */}
            <div className='w-full bg-sub-bg rounded-xl p-5'>
                <p className='text-white text-lg font-semibold'>Change Password</p>
                <div className="flex flex-col space-y-4 mt-3">
                    <form
                        className="flex flex-col space-y-3"
                        onSubmit={async (e) => {
                            e.preventDefault();
                            setPasswordError("");
                            setPasswordSuccess("");
                            const oldPassword = e.target.oldPassword.value;
                            const newPasswordVal = e.target.newPassword.value;
                            const confirmPasswordVal = e.target.confirmPassword.value;
                            if (!oldPassword || !newPasswordVal || !confirmPasswordVal) {
                                setPasswordError("Please fill all password fields.");
                                return;
                            }
                            if (newPasswordVal !== confirmPasswordVal) {
                                setPasswordError("Passwords do not match.");
                                return;
                            }
                            try {
                                await axios.post(
                                    "http://localhost:3000/api/auth/change-password",
                                    {
                                        email: user?.user?.email,
                                        oldPassword,
                                        newPassword: newPasswordVal,
                                        purpose: "change"
                                    },
                                    {
                                        headers: {
                                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                                            'Content-Type': 'application/json',
                                        }
                                    }
                                );
                                setPasswordSuccess("Password updated successfully!");
                                setPasswordError("");
                                setCurrentPassword("");
                                setNewPassword("");
                                setConfirmPassword("");
                                toast.success("Password updated successfully!");
                                e.target.reset();
                            } catch (err) {
                                setPasswordError(
                                    err?.response?.data?.message ||
                                    "Failed to update password. Please try again."
                                );
                                toast.error(
                                    err?.response?.data?.message ||
                                    "Failed to update password. Please try again."
                                );
                            }
                        }}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="flex flex-col gap-1 relative">
                                <label className="text-sm text-secondary-text">Current Password</label>
                                <input
                                    type={showOldPassword ? "text" : "password"}
                                    name="oldPassword"
                                    className="bg-cards-bg px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text pr-10"
                                    placeholder="Current Password"
                                />
                                <span
                                    className="absolute right-3 top-8 cursor-pointer text-secondary-text"
                                    onClick={() => setShowOldPassword((prev) => !prev)}
                                    style={{ top: '38px' }}
                                >
                                    {showOldPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-.274.832-.64 1.627-1.09 2.372M15.362 17.362A9.953 9.953 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95M9.88 9.88a3 3 0 104.24 4.24" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95M6.228 6.228A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.21 5.293M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                                        </svg>
                                    )}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1 relative">
                                <label className="text-sm text-secondary-text">New Password</label>
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    name="newPassword"
                                    className="bg-cards-bg px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text pr-10"
                                    placeholder="New Password"
                                />
                                <span
                                    className="absolute right-3 top-8 cursor-pointer text-secondary-text"
                                    onClick={() => setShowNewPassword((prev) => !prev)}
                                    style={{ top: '38px' }}
                                >
                                    {showNewPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-.274.832-.64 1.627-1.09 2.372M15.362 17.362A9.953 9.953 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95M9.88 9.88a3 3 0 104.24 4.24" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95M6.228 6.228A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.21 5.293M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                                        </svg>
                                    )}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1 relative">
                                <label className="text-sm text-secondary-text">Confirm New Password</label>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    className="bg-cards-bg px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text pr-10"
                                    placeholder="Confirm New Password"
                                />
                                <span
                                    className="absolute right-3 top-8 cursor-pointer text-secondary-text"
                                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                                    style={{ top: '38px' }}
                                >
                                    {showConfirmPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-.274.832-.64 1.627-1.09 2.372M15.362 17.362A9.953 9.953 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95M9.88 9.88a3 3 0 104.24 4.24" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95M6.228 6.228A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.21 5.293M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                                        </svg>
                                    )}
                                </span>
                            </div>
                        </div>
                        {/* Hide error/success after a few seconds */}
                        {(passwordError || passwordSuccess) && (
                            <AutoHideMessage
                                passwordError={passwordError}
                                passwordSuccess={passwordSuccess}
                                setPasswordError={setPasswordError}
                                setPasswordSuccess={setPasswordSuccess}
                            />
                        )}
                        <div className='flex justify-end'>
                            <button
                                type="submit"
                                className="w-full md:w-1/4 bg-main-purple text-white font-semibold py-2 rounded-lg hover:bg-[#6b2bd2] transition-all duration-300 cursor-pointer"
                            >
                                Set New Password
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="w-full bg-sub-bg rounded-xl p-5">
                <p className="text-white text-lg font-semibold mb-2">Delete Your Account</p>
                <p className="text-gray-400 text-sm mb-4">
                    Deleting your account is a permanent action and cannot be undone. All your data will be lost.
                </p>
                {!showDelete ? (
                    <button
                        className="bg-logout-red text-logout-text font-semibold px-4 py-2 rounded-lg hover:bg-[#6b2e2e] transition-all"
                        onClick={() => setShowDelete(true)}
                    >
                        Delete Account
                    </button>
                ) : (
                    <div className="space-y-4">
                        <p className="text-red-400 text-sm font-semibold">
                            Are you absolutely sure you want to delete your account? This action cannot be undone.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                className="w-full sm:w-1/2 bg-logout-red text-logout-text font-semibold py-2 rounded-lg hover:bg-[#6b2e2e] transition-all duration-300"
                                onClick={handleDeleteAccount}
                            >
                                Confirm Delete
                            </button>
                            <button
                                className="w-full sm:w-1/2 bg-gray-700 text-white font-semibold py-2 rounded-lg hover:bg-gray-600 transition-all duration-300"
                                onClick={() => setShowDelete(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )

    // Helper component to auto-hide error/success messages
    function AutoHideMessage({ passwordError, passwordSuccess, setPasswordError, setPasswordSuccess }) {
        useEffect(() => {
            if (passwordError || passwordSuccess) {
                const timer = setTimeout(() => {
                    setPasswordError("");
                    setPasswordSuccess("");
                }, 3000);
                return () => clearTimeout(timer);
            }
        }, [passwordError, passwordSuccess, setPasswordError, setPasswordSuccess]);
        return (
            <>
                {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                {passwordSuccess && <p className="text-green-500 text-sm">{passwordSuccess}</p>}
            </>
        );
    }
};


export default Dashboard