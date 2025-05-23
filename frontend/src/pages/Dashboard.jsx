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
import PaymentHistorySection from '../components/PaymentHistorySection'
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
                                                    <p className='text-secondary-text text-base font-semibold'>   {mate.course ? mate.course : 'No course info'}</p>
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
                        <div className='flex flex-col  max-h-[82vh] overflow-y-scroll space-y-4 w-4/5'>
                            {/* <img
                                src={payment} // Replace with your illustration URL
                                alt='No Payment History'
                                className='w-1/2 h-auto'
                            />
                            <p className='text-secondary-text text-lg font-semibold text-center'>
                                No payment history is available yet. <br />Stay tuned for updates or make your first payment!
                            </p>  */}
                            <PaymentHistorySection
                                userId={user?.user?._id}
                                mode="user"
                                title="My Payment History"
                            />
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
import { Bell, Home, AlertTriangle, Check, Clock, X, MessageCircle, FileText, User } from 'lucide-react';


const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'sent', 'received'
    const { user } = useSelector((state) => state.user)
    const user_id = user.user;

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/request', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                // Filter requests where the user is either the requestor or the owner
                const userRequests = response.data.filter(
                    (request) => request.requestorId._id === user_id._id || request.ownerId._id === user_id._id
                );

                setNotifications(userRequests);
                console.log('Fetched notifications:', userRequests);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching notifications:', err);
                setError('Failed to load notifications.');
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [user_id._id]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending':
                return <Clock size={18} className="text-yellow-400" />;
            case 'Accepted':
                return <Check size={18} className="text-green-400" />;
            case 'Rejected':
                return <X size={18} className="text-red-400" />;
            default:
                return <AlertTriangle size={18} className="text-secondary-text" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return {
                    text: 'text-yellow-400',
                    bg: 'bg-yellow-400 bg-opacity-20',
                };
            case 'Accepted':
                return {
                    text: 'text-green-400',
                    bg: 'bg-green-400 bg-opacity-20',
                };
            case 'Rejected':
                return {
                    text: 'text-red-400',
                    bg: 'bg-red-400 bg-opacity-20',
                };
            default:
                return {
                    text: 'text-secondary-text',
                    bg: 'bg-secondary-text bg-opacity-20',
                };
        }
    };

    const getNotificationMessage = (notification, userId) => {
        if (notification.requestorId._id === userId) {
            if (notification.requestType === 'Maintenance Request' || notification.requestType === 'Leave Request') {
                if (notification.status === 'Accepted' && notification.requestType === 'Leave Request') {
                    return `Your leave request has been accepted by the property owner. You can leave the property.`;
                }
                switch (notification.requestType) {
                    case 'Maintenance Request':
                        return `Your request has been accepted by the property owner.`;
                    case 'Leave Request':
                        return 'Your leave request has been sent to the property owner.';
                }
            }
            switch (notification.status) {

                case 'Accepted':
                    return 'Your request has been accepted by the property owner.';
                case 'Rejected':
                    return 'Your request was declined by the property owner.';
                default:
                    return 'Your request is pending review by the property owner.';
            }
        } else {
            if (notification.requestType === 'Leave Request') {
                return `${notification.requestorName} has sent a leave request.`;
            } else if (notification.requestType === 'Maintenance Request') {
                return `${notification.requestorName} has sent a maintenance request.`;
            }
            else {
                return `${notification.requestorName} is interested in your property.`;
            }
        }
    };

    const getNotificationIcon = (notification, userId) => {
        if (notification.requestorId._id === userId) {
            // Outgoing notification
            switch (notification.status) {
                case 'Accepted':
                    return <Check className="text-green-400" />;
                case 'Rejected':
                    return <X className="text-red-400" />;
                default:
                    return <Clock className="text-yellow-400" />;
            }
        } else {
            // Incoming notification
            return <MessageCircle className="text-tertiary-text" />;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleRequestsClick = () => {
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const getFilteredNotifications = () => {
        if (activeFilter === 'sent') {
            return notifications.filter(notification => notification.requestorId._id === user_id._id);
        } else if (activeFilter === 'received') {
            return notifications.filter(notification => notification.ownerId._id === user_id._id);
        } else {
            return notifications;
        }
    };

    const filteredNotifications = getFilteredNotifications();

    const sentCount = notifications.filter(n => n.requestorId._id === user_id._id).length;
    const receivedCount = notifications.filter(n => n.ownerId._id === user_id._id).length;
    const pendingCount = notifications.filter(n => n.status === 'Pending' && n.ownerId._id === user_id._id).length;

    if (loading) {
        return (
            <div className="flex flex-col space-y-4 w-4/5">
                <div className="bg-cards-bg rounded-xl p-6 animate-pulse">
                    <div className="h-7 bg-sub-bg rounded w-48 mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-sub-bg rounded-xl w-full"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col space-y-4 w-4/5">
                <div className="bg-cards-bg rounded-xl p-6 text-center">
                    <AlertTriangle size={48} className="text-red-400 mx-auto mb-3" />
                    <p className="text-red-400 mb-2">{error}</p>
                    <button
                        className="bg-main-purple text-white py-2 px-6 rounded-lg mt-4"
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-4 w-4/5">
            <div className="flex justify-between items-center">
                <div className="flex items-center">
                    <Bell size={20} className="text-tertiary-text mr-2" />
                    <p className="text-white text-lg font-bold">Notifications</p>
                </div>
                <button
                    onClick={handleRequestsClick}
                    className="flex items-center justify-center space-x-2 bg-main-purple hover:bg-[#6b2bd2] transition-all duration-300 py-2 px-4 rounded-lg"
                >
                    <div className="relative">
                        <User size={18} className="text-white" />
                        {pendingCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                {pendingCount}
                            </span>
                        )}
                    </div>
                    <span className="text-white font-semibold text-sm">Property Requests</span>
                </button>

                {/* Modal for property requests */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-sub-bg rounded-xl p-6 w-3/4 max-h-[80vh]">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center">
                                    <FileText size={20} className="text-tertiary-text mr-2" />
                                    <p className="text-white text-lg font-bold">Property Requests</p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="text-white p-1 hover:bg-cards-bg rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {notifications.filter(notification => notification.ownerId._id === user_id._id).length > 0 ? (
                                <div className="flex flex-col space-y-3 overflow-y-auto h-[60vh]">
                                    {[...notifications]
                                        .filter(notification => notification.ownerId._id === user_id._id)
                                        .map((notification) => {
                                            const statusColors = getStatusColor(notification.status);
                                            return (
                                                <div
                                                    key={notification._id}
                                                    className="flex flex-col bg-cards-bg rounded-xl p-4 space-y-3 hover:bg-opacity-80 transition-colors"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex">
                                                            <div className="mr-3">
                                                                {notification.requestorId.profilePicture ? (
                                                                    <img
                                                                        src={notification.requestorId.profilePicture}
                                                                        alt={notification.requestorName}
                                                                        className="w-12 h-12 rounded-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-12 h-12 bg-main-purple rounded-full flex items-center justify-center">
                                                                        <User size={24} className="text-white" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-white text-base font-semibold">
                                                                    {notification.requestorName}
                                                                </p>
                                                                <p className="text-secondary-text text-sm">
                                                                    {formatDate(notification.createdAt)}
                                                                </p>
                                                                <div className="mt-1">
                                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                                                                        {getStatusIcon(notification.status)}
                                                                        <span className="ml-1">{notification.status}</span>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col items-end space-y-1">
                                                            <p className="text-tertiary-text text-sm font-medium">Property</p>
                                                            <p className="text-white text-sm text-right">{notification.propertyId.title}</p>
                                                        </div>
                                                    </div>

                                                    <div className="bg-sub-bg rounded-lg p-3">
                                                        <div className="flex justify-between mb-2">
                                                            <p className="text-secondary-text text-sm">Requested Price:</p>
                                                            <p className="text-white text-sm font-medium">
                                                                ₹{(notification.requestedPrice.min && notification.requestedPrice.max)
                                                                    ? `${notification.requestedPrice.min.toLocaleString('en-IN')} - ${notification.requestedPrice.max.toLocaleString('en-IN')}`
                                                                    : notification.requestedPrice?.fixed?.toLocaleString('en-IN')}
                                                            </p>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <p className="text-secondary-text text-sm">Location:</p>
                                                            <p className="text-white text-sm">{notification.propertyId.location}</p>
                                                        </div>
                                                    </div>

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
                                                                className="flex items-center space-x-1 bg-main-purple hover:bg-[#6b2bd2] transition-all duration-300 py-2 px-4 rounded-lg text-white font-semibold"
                                                            >
                                                                <Check size={16} />
                                                                <span>Accept Request</span>
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
                                                                className="flex items-center space-x-1 bg-cards-bg hover:bg-gray-700 transition-all text-secondary-text font-semibold py-2 px-4 rounded-lg"
                                                            >
                                                                <X size={16} />
                                                                <span>Decline</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                </div>
                            ) : (
                                <div className="bg-cards-bg rounded-xl p-8 flex flex-col items-center justify-center">
                                    <Home size={48} className="text-secondary-text mb-4" />
                                    <p className="text-white text-lg font-medium mb-2">
                                        No property requests found
                                    </p>
                                    <p className="text-secondary-text text-center">
                                        When someone sends a request for your property, it will appear here.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Filter tabs */}
            <div className="flex border-b border-gray-700 mb-4">
                <button
                    className={`py-2 px-4 relative ${activeFilter === 'all' ? 'text-tertiary-text border-b-2 border-tertiary-text' : 'text-secondary-text'}`}
                    onClick={() => setActiveFilter('all')}
                >
                    <span>All</span>
                    <span className="ml-1.5 bg-cards-bg px-2 py-0.5 text-xs rounded-full">
                        {notifications.length}
                    </span>
                </button>
                <button
                    className={`py-2 px-4 relative ${activeFilter === 'received' ? 'text-tertiary-text border-b-2 border-tertiary-text' : 'text-secondary-text'}`}
                    onClick={() => setActiveFilter('received')}
                >
                    <span>Received</span>
                    <span className="ml-1.5 bg-cards-bg px-2 py-0.5 text-xs rounded-full">
                        {receivedCount}
                    </span>
                    {pendingCount > 0 && (
                        <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                            {pendingCount}
                        </span>
                    )}
                </button>
                <button
                    className={`py-2 px-4 ${activeFilter === 'sent' ? 'text-tertiary-text border-b-2 border-tertiary-text' : 'text-secondary-text'}`}
                    onClick={() => setActiveFilter('sent')}
                >
                    <span>Sent</span>
                    <span className="ml-1.5 bg-cards-bg px-2 py-0.5 text-xs rounded-full">
                        {sentCount}
                    </span>
                </button>
            </div>

            {filteredNotifications.length > 0 ? (
                <div className="w-full flex flex-col space-y-3 h-[64vh] overflow-y-auto">
                    {filteredNotifications.map((notification) => {
                        const isOutgoing = notification.requestorId._id === user_id._id;
                        const statusColors = getStatusColor(notification.status);

                        return (
                            <div
                                key={notification._id}
                                className="flex flex-col bg-cards-bg rounded-xl p-4 hover:bg-opacity-80 transition-colors"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start">
                                        <div className={`p-2.5 rounded-lg mr-3 ${statusColors.bg}`}>
                                            {getNotificationIcon(notification, user_id._id)}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center mb-1">
                                                <span className={`inline-flex items-center mr-2 px-2 py-0.5 rounded-full text-xs font-medium ${isOutgoing ? 'bg-blue-400 bg-opacity-20 text-blue-400' : 'bg-green-400 bg-opacity-20 text-green-400'}`}>
                                                    {isOutgoing ? 'Sent' : 'Received'}
                                                </span>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                                                    {notification.status}
                                                </span>
                                            </div>

                                            <p className="text-white text-base font-semibold">
                                                {getNotificationMessage(notification, user_id._id)}
                                            </p>
                                            <p className="text-sm text-secondary-text mt-2 font-semibold">
                                                {notification.requestType === 'Leave Request' ? "Reason: " + notification.message : ""}
                                            </p>

                                            <div className="mt-2 text-sm text-secondary-text">
                                                <p>Property: <span className="text-tertiary-text">{notification.propertyId.title}</span></p>
                                                {!(notification.requestType === 'Leave Request') ? (<p className="mt-1">
                                                    Price: <span className="text-white">
                                                        ₹{(notification.requestedPrice.min && notification.requestedPrice.max)
                                                            ? notification.requestedPrice.min.toLocaleString('en-IN') + " - " + notification.requestedPrice.max.toLocaleString('en-IN')
                                                            : (notification.requestedPrice?.fixed?.toLocaleString('en-IN'))}
                                                    </span>
                                                </p>) : ""}
                                            </div>

                                            <p className="text-xs text-secondary-text mt-2">
                                                {formatDate(notification.createdAt || notification.updatedAt)}
                                            </p>
                                        </div>
                                    </div>

                                    {notification.status === 'Pending' && !isOutgoing && (
                                        <div className="flex space-x-2 ml-2">
                                            <button
                                                onClick={async () => {
                                                    try {

                                                        await axios.put(
                                                            `http://localhost:3000/api/request/${notification._id}`,
                                                            { status: 'Accepted' },
                                                            {
                                                                headers: {
                                                                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                                                                },
                                                            }
                                                        );
                                                        setNotifications((prev) =>
                                                            prev.map((notif) =>
                                                                notif._id === notification._id
                                                                    ? { ...notif, status: 'Accepted' }
                                                                    : notif
                                                            )
                                                        );
                                                        if (notification.requestType === 'Leave Request') {
                                                            // First update user's current rental to null
                                                            await axios.put(
                                                                `http://localhost:3000/api/user/updateUser/${notification.requestorId._id}`,
                                                                { currentRental: null },
                                                                {
                                                                    headers: {
                                                                        Authorization: `Bearer ${localStorage.getItem('token')}`
                                                                    }
                                                                }
                                                            );

                                                            // Then remove user from property members
                                                            // Fixed: Changed to match the API endpoint structure
                                                            await axios.put(
                                                                `http://localhost:3000/api/property/members/${notification.propertyId._id}`,
                                                                {
                                                                    userId: notification.requestorId._id,
                                                                    action: 'remove'
                                                                },
                                                                {
                                                                    headers: {
                                                                        Authorization: `Bearer ${localStorage.getItem('token')}`
                                                                    }
                                                                }
                                                            );
                                                        }
                                                    } catch (err) {
                                                        console.error('Error accepting request:', err);
                                                    }
                                                }}
                                                className="p-2 bg-main-purple rounded-lg hover:bg-[#6b2bd2] transition-colors"
                                                title="Accept"
                                            >
                                                <Check size={16} className="text-white" />
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
                                                className="p-2 bg-cards-bg rounded-lg hover:bg-gray-700 transition-colors"
                                                title="Reject"
                                            >
                                                <X size={16} className="text-secondary-text" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Property info for clarity - collapsed by default */}
                                {notification.propertyId && (
                                    <details className="mt-2">
                                        <summary className="text-tertiary-text text-sm cursor-pointer">
                                            View property details
                                        </summary>
                                        <div className="bg-sub-bg mt-2 p-3 rounded-lg">
                                            <div className="flex items-center">
                                                <Home size={16} className="text-secondary-text mr-2" />
                                                <p className="text-white text-sm">{notification.propertyId.title}</p>
                                            </div>
                                            <p className="text-secondary-text text-sm mt-1">{notification.propertyId.address}, {notification.propertyId.location}</p>
                                        </div>
                                    </details>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-[64vh] space-y-4">
                    <img
                        src={notification}
                        alt="No Notifications"
                        className="w-1/3 h-auto"
                    />
                    <div className="text-center">
                        <p className="text-white text-lg font-semibold mb-1">No notifications</p>
                        <p className="text-secondary-text">
                            {activeFilter === 'sent' ?
                                "You haven't sent any requests yet" :
                                activeFilter === 'received' ?
                                    "You haven't received any requests yet" :
                                    "You have no notifications at the moment"}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

const Roommates = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [currentRoommates, setCurrentRoommates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pendingInvitations, setPendingInvitations] = useState({ received: [], sent: [] });
    const [loadingInvitations, setLoadingInvitations] = useState(true);
    const [selectedRoommate, setSelectedRoommate] = useState(null);
    const [showRoommateModal, setShowRoommateModal] = useState(false);

    // New state for roommate recommendations
    const [recommendedMatches, setRecommendedMatches] = useState([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(true);
    const [recommendationError, setRecommendationError] = useState(null);

    // Get current user's information
    const { user: currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        const fetchRecommendedMatches = async () => {
            if (!currentUser?.user?._id) {
                setLoadingRecommendations(false);
                return;
            }

            setLoadingRecommendations(true);
            setRecommendationError(null);

            try {
                const response = await axios.get(
                    `http://localhost:3000/api/roommates/match/${currentUser.user._id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );

                if (response.data && response.data.matches) {
                    setRecommendedMatches(response.data.matches);
                } else {
                    setRecommendedMatches([]);
                }
                setLoadingRecommendations(false);
            } catch (error) {
                console.error('Error fetching roommate recommendations:', error);
                setRecommendationError('Failed to load roommate recommendations');
                setLoadingRecommendations(false);
            }
        };

        fetchRecommendedMatches();
    }, [currentUser?.user?._id]);

    // Fetch current roommates on component mount
    useEffect(() => {
        const fetchRoommates = async () => {
            if (!currentUser?.user?.currentRental) {
                setCurrentRoommates([]);
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get(
                    `http://localhost:3000/api/property/${currentUser.user.currentRental}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );
                const members = response.data?.property?.roomDetails?.members || [];
                setCurrentRoommates(members);
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

            const invitationResponse = await axios.post(
                'http://localhost:3000/api/invitation/create',
                invitationData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

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
        if (e.target.value.length > 2) { // Only search after 2+ characters
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
                    setSearchResults([]);
                }
            } catch (error) {
                console.error("Error searching users:", error.response || error);
                setSearchResults([]);
            }
        } else {
            setIsSearching(false);
            setSearchResults([]);
        }
    };

    const handleRoommateClick = (roommate) => {
        setSelectedRoommate(roommate);
        setShowRoommateModal(true);
    };

    const closeRoommateModal = () => {
        setShowRoommateModal(false);
        setSelectedRoommate(null);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not provided';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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
            {/* Current Roommates Section - Always shown with improved UI */}
            <div className='bg-sub-bg rounded-xl p-5 w-full mb-4'>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <div className="bg-tertiary-text bg-opacity-20 p-2 rounded-lg mr-3">
                            <FaUserFriends className="text-tertiary-text" size={20} />
                        </div>
                        <h2 className='text-white text-lg font-bold'>Your Roommates</h2>
                    </div>
                    <span className="bg-cards-bg text-tertiary-text px-3 py-1 rounded-full text-sm">
                        {currentRoommates.length} {currentRoommates.length === 1 ? 'Person' : 'People'}
                    </span>
                </div>

                {currentRoommates.length > 0 ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {currentRoommates.map((mate, index) => (
                            <div
                                key={mate._id}
                                className='bg-cards-bg rounded-xl p-4 border border-transparent hover:border-tertiary-text transition-all duration-300 cursor-pointer'
                                onClick={() => handleRoommateClick(mate)}
                            >
                                <div className='flex items-start'>
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={mate.profilePicture || 'https://placehold.co/100'}
                                            alt={mate.name}
                                            className='h-16 w-16 rounded-full object-cover border-2 border-tertiary-text'
                                        />
                                        <div className="absolute bottom-0 right-0 bg-green-500 h-3 w-3 rounded-full border-2 border-cards-bg"></div>
                                    </div>
                                    <div className='ml-4 flex-1 overflow-hidden'>
                                        <div className="flex justify-between items-start">
                                            <div className="max-w-full overflow-hidden">
                                                <p className='text-white text-lg font-semibold truncate'>{mate.name}</p>
                                                <p className='text-secondary-text text-sm truncate'>@{mate.username}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col mt-2 space-y-1">
                                            {mate.college && (
                                                <div className="flex items-start text-secondary-text text-sm">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                    </svg>
                                                    <span className="line-clamp-1">
                                                        {mate.college || 'No college info'}
                                                    </span>
                                                </div>
                                            )}
                                            {mate.course && (
                                                <div className="flex items-start text-secondary-text text-sm">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <span className="line-clamp-1">
                                                        {mate.course || 'No course info'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className='flex flex-col items-center justify-center space-y-4 py-8'>
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
            </div>

            <div className='bg-sub-bg rounded-xl p-5 w-full mb-4'>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <div className="bg-main-purple bg-opacity-20 p-2 rounded-lg mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-main-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h2 className='text-white text-lg font-bold'>Compatible Roommates</h2>
                    </div>
                    <div className="bg-cards-bg px-3 py-1 rounded-full">
                        <span className="text-tertiary-text text-sm font-medium">AI Powered</span>
                    </div>
                </div>

                {loadingRecommendations ? (
                    <div className="flex items-center justify-center py-12 bg-cards-bg rounded-xl">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-main-purple"></div>
                        <p className="ml-3 text-secondary-text">Finding your perfect matches...</p>
                    </div>
                ) : recommendationError ? (
                    <div className="bg-cards-bg rounded-xl p-6 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-secondary-text">{recommendationError}</p>
                        <button
                            className="mt-3 bg-main-purple text-white px-4 py-2 rounded-lg text-sm"
                            onClick={() => {
                                setLoadingRecommendations(true);
                                setRecommendationError(null);
                                // Retry fetching recommendations
                                fetchRecommendedMatches();
                            }}
                        >
                            Try Again
                        </button>
                    </div>
                ) : recommendedMatches.length === 0 ? (
                    <div className="bg-cards-bg rounded-xl p-8 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-secondary-text mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-white text-lg font-medium mb-2">No matches found</p>
                        <p className="text-secondary-text">Complete your profile to help us find compatible roommates for you.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {recommendedMatches.map((match) => (
                                <div
                                    key={match._id}
                                    className="bg-cards-bg rounded-xl p-4 border border-transparent hover:border-main-purple transition-all duration-300"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="relative">
                                                {match.profilePicture ? (
                                                    <img
                                                        src={match.profilePicture}
                                                        alt={match.name}
                                                        className="h-14 w-14 rounded-full object-cover border-2 border-main-purple"
                                                    />
                                                ) : (
                                                    <div className="h-14 w-14 rounded-full bg-main-purple/20 flex items-center justify-center">
                                                        <span className="text-main-purple text-xl font-bold">
                                                            {match.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="absolute -bottom-1 -right-1 flex items-center justify-center h-6 w-6 rounded-full bg-main-purple text-white text-xs font-bold border-2 border-cards-bg">
                                                    {Math.round(match.score)}%
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-white font-semibold">{match.name}</h3>
                                                <p className="text-secondary-text text-sm">
                                                    {match.course && `${match.course}, `}
                                                    {match.year && `Year ${match.year}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <button
                                                onClick={() => handleInviteRoommate({
                                                    _id: match._id,
                                                    name: match.name,
                                                    email: match.email,
                                                    username: match.username,
                                                    profilePicture: match.profilePicture
                                                })}
                                                className="bg-main-purple text-white px-4 py-2 rounded-lg hover:bg-[#6b2bd2] transition-all text-sm flex items-center space-x-1"
                                                disabled={!currentUser?.user?.currentRental}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                                </svg>
                                                <span>Invite</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-3">
                                        <p className="text-tertiary-text text-xs uppercase tracking-wider mb-2 font-semibold">Compatibility Strengths</p>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {match.compatibilityDetails?.strengths?.slice(0, 3).map((strength, idx) => (
                                                <span key={idx} className="bg-green-900 bg-opacity-20 text-green-400 text-xs px-2 py-1 rounded-full">
                                                    {strength}
                                                </span>
                                            ))}
                                            {match.compatibilityDetails?.strengths?.length > 3 && (
                                                <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
                                                    +{match.compatibilityDetails.strengths.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {match.interests && match.interests.length > 0 && (
                                        <div>
                                            <p className="text-tertiary-text text-xs uppercase tracking-wider mb-2 font-semibold">Interests</p>
                                            <div className="flex flex-wrap gap-2">
                                                {match.interests.slice(0, 4).map((interest, idx) => (
                                                    <span key={idx} className="bg-blue-900 bg-opacity-20 text-blue-400 text-xs px-2 py-1 rounded-full">
                                                        {interest}
                                                    </span>
                                                ))}
                                                {match.interests.length > 4 && (
                                                    <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
                                                        +{match.interests.length - 4} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between items-center">
                                        <div className="text-sm">
                                            <span className="text-secondary-text">Budget: </span>
                                            <span className="text-white">₹{match.budget?.toLocaleString('en-IN') || 'Not specified'}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-sm text-secondary-text mr-2">Compatibility</span>
                                            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-main-purple"
                                                    style={{ width: `${match.score}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

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
                                <div className="flex items-center">
                                    <div className="bg-tertiary-text bg-opacity-20 p-1 rounded-lg mr-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-tertiary-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <p className='text-secondary-text font-semibold text-sm'>
                                        Found {searchResults.length} {searchResults.length === 1 ? 'user' : 'users'} matching "{searchTerm}"
                                    </p>
                                </div>
                                <div className='space-y-3 max-h-60 overflow-y-auto pr-2'>
                                    {searchResults.map((user) => (
                                        <div key={user._id} className='flex items-center justify-between bg-cards-bg rounded-xl p-3 hover:bg-opacity-80 transition-colors'>
                                            <div className='flex items-center space-x-3'>
                                                <img src={user.profilePicture || 'https://placehold.co/100'} alt="Profile" className='h-12 w-12 rounded-full object-cover border border-gray-700' />
                                                <div>
                                                    <p className='text-white font-semibold'>{user.name}</p>
                                                    <p className='text-secondary-text text-sm'>@{user.username}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleInviteRoommate(user)}
                                                className='bg-main-purple text-white px-4 py-2 rounded-lg hover:bg-[#6b2bd2] transition-all text-sm flex items-center'
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
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
                        <div className="flex items-center mb-2">
                            <div className="bg-tertiary-text bg-opacity-20 p-1 rounded-lg mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-tertiary-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className='text-tertiary-text font-semibold'>Search Tips</p>
                        </div>
                        <ul className='text-gray-400 space-y-2 text-sm list-disc pl-5 font-medium'>
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
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                        <div className="bg-yellow-500 bg-opacity-20 p-2 rounded-lg mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <h2 className='text-white text-lg font-bold'>Pending Invitations</h2>
                    </div>
                </div>

                {loadingInvitations ? (
                    <div className='bg-cards-bg rounded-xl p-4 flex items-center justify-center'>
                        <p className='text-secondary-text'>Loading invitations...</p>
                    </div>
                ) : (
                    <>
                        {pendingInvitations.received.length > 0 ? (
                            <div className='space-y-3 mb-4'>
                                <div className="flex items-center">
                                    <div className="bg-green-500 bg-opacity-20 p-1 rounded-lg mr-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                        </svg>
                                    </div>
                                    <p className='text-green-400 font-semibold text-sm'>Received Invitations</p>
                                </div>
                                {pendingInvitations.received.map((invitation) => (
                                    <div key={invitation._id} className='bg-cards-bg rounded-xl p-4 hover:bg-opacity-80 transition-all'>
                                        <div className='flex items-center justify-between'>
                                            <div className='flex items-center space-x-3'>
                                                <img
                                                    src={invitation.inviterId.profilePicture || 'https://placehold.co/100'}
                                                    alt="Profile"
                                                    className='h-12 w-12 rounded-full object-cover border border-main-purple'
                                                />
                                                <div>
                                                    <p className='text-white font-semibold'>{invitation.inviterId.name}</p>
                                                    <p className='text-secondary-text text-sm'>@{invitation.inviterId.username}</p>
                                                </div>
                                            </div>
                                            <div className='flex space-x-2'>
                                                <a
                                                    href={`http://localhost:3000/api/invitation/accept/${invitation._id}`}
                                                    className='bg-main-purple text-white px-3 py-1 rounded-lg hover:bg-[#6b2bd2] transition-all text-sm flex items-center'
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Accept
                                                </a>
                                                <a
                                                    href={`http://localhost:3000/api/invitation/decline/${invitation._id}`}
                                                    className='bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition-all text-sm flex items-center'
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                    Decline
                                                </a>
                                            </div>
                                        </div>
                                        <div className="mt-3 bg-sub-bg p-3 rounded-lg">
                                            <p className='text-tertiary-text text-sm font-medium'>Property Details</p>
                                            <div className="flex items-center mt-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-secondary-text mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                </svg>
                                                <span className="text-white text-sm">{invitation.propertyId.title}</span>
                                            </div>
                                            <div className="flex items-center mt-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-secondary-text mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span className="text-secondary-text text-sm">{invitation.propertyId.location}</span>
                                            </div>
                                            <div className="flex items-center mt-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-secondary-text mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-secondary-text text-sm">Expires: {new Date(invitation.expiresAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : null}

                        {pendingInvitations.sent.length > 0 ? (
                            <div className='space-y-3'>
                                <div className="flex items-center">
                                    <div className="bg-blue-500 bg-opacity-20 p-1 rounded-lg mr-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </div>
                                    <p className='text-blue-400 font-semibold text-sm'>Sent Invitations</p>
                                </div>
                                {pendingInvitations.sent.map((invitation) => (
                                    <div key={invitation._id} className='bg-cards-bg rounded-xl p-4 hover:bg-opacity-80 transition-all'>
                                        <div className='flex items-center justify-between'>
                                            <div className='flex items-center space-x-3'>
                                                <img
                                                    src={invitation.inviteeId.profilePicture || 'https://placehold.co/100'}
                                                    alt="Profile"
                                                    className='h-12 w-12 rounded-full object-cover border border-gray-700'
                                                />
                                                <div>
                                                    <p className='text-white font-semibold'>{invitation.inviteeId.name}</p>
                                                    <p className='text-secondary-text text-sm'>@{invitation.inviteeId.username}</p>
                                                </div>
                                            </div>
                                            <span className='text-yellow-500 text-sm font-semibold flex items-center'>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Pending
                                            </span>
                                        </div>
                                        <div className="mt-3 bg-sub-bg p-3 rounded-lg">
                                            <p className='text-tertiary-text text-sm font-medium'>Property Details</p>
                                            <div className="flex items-center mt-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-secondary-text mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                </svg>
                                                <span className="text-white text-sm">{invitation.propertyId.title}</span>
                                            </div>
                                            <div className="flex items-center mt-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-secondary-text mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span className="text-secondary-text text-sm">{invitation.propertyId.location}</span>
                                            </div>
                                            <div className="flex items-center mt-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-secondary-text mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-secondary-text text-sm">Expires: {new Date(invitation.expiresAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : null}

                        {pendingInvitations.received.length === 0 && pendingInvitations.sent.length === 0 && (
                            <div className='bg-cards-bg rounded-xl p-6 flex flex-col items-center justify-center'>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-secondary-text mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <p className='text-secondary-text text-center font-medium'>No pending invitations</p>
                                <p className='text-gray-500 text-sm text-center mt-1'>When you send or receive invitations, they'll appear here</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Roommate Detail Modal */}
            {showRoommateModal && selectedRoommate && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75">
                    <div className="bg-sub-bg rounded-xl p-6 mx-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white text-xl font-bold">Roommate Details</h3>
                            <button
                                onClick={closeRoommateModal}
                                className="rounded-full bg-cards-bg p-2 text-secondary-text hover:text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex flex-col items-center mb-6">
                            <div className="relative mb-3">
                                <img
                                    src={selectedRoommate.profilePicture || 'https://placehold.co/200'}
                                    alt={selectedRoommate.name}
                                    className="w-28 h-28 rounded-full object-cover border-4 border-tertiary-text"
                                />
                                <div className="absolute bottom-1 right-1 bg-green-500 h-4 w-4 rounded-full border-2 border-sub-bg"></div>
                            </div>
                            <h4 className="text-white text-xl font-bold">{selectedRoommate.name}</h4>
                            <p className="text-secondary-text">@{selectedRoommate.username}</p>
                        </div>

                        <div className="bg-cards-bg rounded-xl p-4 mb-4">
                            <h5 className="text-tertiary-text font-semibold mb-3">Personal Information</h5>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="flex items-start">
                                    <div className="bg-tertiary-text bg-opacity-10 p-2 rounded-lg mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-tertiary-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-secondary-text text-xs">Email</p>
                                        <p className="text-white">{selectedRoommate.email}</p>
                                    </div>
                                </div>

                                {selectedRoommate.phone && (
                                    <div className="flex items-start">
                                        <div className="bg-tertiary-text bg-opacity-10 p-2 rounded-lg mr-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-tertiary-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-secondary-text text-xs">Phone</p>
                                            <p className="text-white">{selectedRoommate.phone || 'Not provided'}</p>
                                        </div>
                                    </div>
                                )}

                                {selectedRoommate.dob && (
                                    <div className="flex items-start">
                                        <div className="bg-tertiary-text bg-opacity-10 p-2 rounded-lg mr-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-tertiary-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-secondary-text text-xs">Date of Birth</p>
                                            <p className="text-white">{formatDate(selectedRoommate.dob)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-cards-bg rounded-xl p-4">
                            <h5 className="text-tertiary-text font-semibold mb-3">Academic Information</h5>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="flex items-start">
                                    <div className="bg-tertiary-text bg-opacity-10 p-2 rounded-lg mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-tertiary-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-secondary-text text-xs">College</p>
                                        <p className="text-white">{selectedRoommate.college || 'Not provided'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="bg-tertiary-text bg-opacity-10 p-2 rounded-lg mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-tertiary-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-secondary-text text-xs">Course</p>
                                        <p className="text-white">{selectedRoommate.course || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end mt-6">
                            <button
                                onClick={closeRoommateModal}
                                className="bg-main-purple text-white px-4 py-2 rounded-lg hover:bg-[#6b2bd2] transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
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