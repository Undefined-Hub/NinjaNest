import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Calendar, Check, Clock, Ban, RefreshCcw, DollarSign, Filter, Home, CreditCard, AlertTriangle, User } from 'lucide-react';
import { format } from 'date-fns';

/**
 * Reusable PaymentHistorySection component
 * @param {Object} props
 * @param {string} props.userId - Optional user_id filter
 * @param {string} props.propertyId - Optional property_id filter
 * @param {string} props.landlordId - Optional landlord_id filter
 * @param {string} props.mode - 'landlord', 'tenant', or 'user' - affects UI presentation
 * @param {string} props.title - Section title override
 */
const PaymentHistorySection = ({ 
    userId, 
    propertyId, 
    landlordId,
    mode = 'landlord',
    title = 'Payment History'
}) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterOpen, setFilterOpen] = useState(false);
    
    // Define status types
    const depositStatuses = ['completed'];
    const rentStatuses = ['Pending', 'paid', 'overdue'];
    
    // Filter states
    const [filters, setFilters] = useState({
        type: '',
        status: '',
        fromDate: '',
        toDate: '',
    });
    
    // Stats
    const [stats, setStats] = useState({
        total: 0,
        paid: 0,
        pending: 0,
        overdue: 0
    });

    // Fetch transactions based on provided filters
    const fetchTransactions = async () => {
        setLoading(true);
        try {
            // Build query parameters
            const params = new URLSearchParams();
            if (userId) params.append('user_id', userId);
            if (propertyId) params.append('property_id', propertyId);
            if (landlordId) params.append('landlord_id', landlordId);
            if (filters.type) params.append('type', filters.type);
            if (filters.status) params.append('status', filters.status);
            if (filters.fromDate) params.append('fromDate', filters.fromDate);
            if (filters.toDate) params.append('toDate', filters.toDate);
            
            const response = await axios.get(`http://localhost:3000/api/payment/history?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            
            setTransactions(response.data.data);
            
            // Calculate stats
            const newStats = {
                total: response.data.count,
                paid: response.data.data.filter(tx => 
                    tx.status === 'paid' || tx.status === 'completed'
                ).length,
                pending: response.data.data.filter(tx => 
                    tx.status === 'Pending'
                ).length,
                overdue: response.data.data.filter(tx => 
                    tx.status === 'overdue'
                ).length
            };
            
            setStats(newStats);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching payment history:', err);
            setError('Failed to load payment history');
            setLoading(false);
            toast.error('Failed to load payment history');
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [userId, propertyId, landlordId]);
    
    // Effect to refetch when filters change
    useEffect(() => {
        // Avoid initial fetch since we already do this in the other effect
        if (loading) return;
        
        const handler = setTimeout(() => {
            fetchTransactions();
        }, 500);
        
        return () => clearTimeout(handler);
    }, [filters]);
    
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const resetFilters = () => {
        setFilters({
            type: '',
            status: '',
            fromDate: '',
            toDate: '',
        });
    };
    
    // Helper to get status indicator styles
    const getStatusIndicator = (status, type) => {
        // Different status styles for different transaction types
        if (type === 'Deposit') {
            switch (status) {
                case 'completed':
                    return {
                        color: 'text-logo-blue',
                        bgColor: 'bg-logo-blue bg-opacity-20',
                        icon: <Check size={16} className="text-logo-blue" />
                    };
                case 'Pending':
                    return {
                        color: 'text-yellow-400',
                        bgColor: 'bg-yellow-400 bg-opacity-20',
                        icon: <Clock size={16} className="text-yellow-400" />
                    };
                case 'refunded':
                    return {
                        color: 'text-purple-400',
                        bgColor: 'bg-purple-400 bg-opacity-20',
                        icon: <RefreshCcw size={16} className="text-purple-400" />
                    };
                case 'failed':
                    return {
                        color: 'text-red-400',
                        bgColor: 'bg-red-400 bg-opacity-20',
                        icon: <Ban size={16} className="text-red-400" />
                    };
                default:
                    return {
                        color: 'text-secondary-text',
                        bgColor: 'bg-secondary-text bg-opacity-20',
                        icon: <Ban size={16} className="text-secondary-text" />
                    };
            }
        } else {
            // Rent transaction statuses
            switch (status) {
                case 'paid':
                    return {
                        color: 'text-green-400',
                        bgColor: 'bg-green-400 bg-opacity-20',
                        icon: <Check size={16} className="text-green-400" />
                    };
                case 'Pending':
                    return {
                        color: 'text-yellow-400',
                        bgColor: 'bg-yellow-400 bg-opacity-20',
                        icon: <Clock size={16} className="text-yellow-400" />
                    };
                case 'partial':
                    return {
                        color: 'text-orange-400',
                        bgColor: 'bg-orange-400 bg-opacity-20',
                        icon: <AlertTriangle size={16} className="text-orange-400" />
                    };
                case 'overdue':
                    return {
                        color: 'text-red-400',
                        bgColor: 'bg-red-400 bg-opacity-20',
                        icon: <AlertTriangle size={16} className="text-red-400" />
                    };
                default:
                    return {
                        color: 'text-secondary-text',
                        bgColor: 'bg-secondary-text bg-opacity-20',
                        icon: <Ban size={16} className="text-secondary-text" />
                    };
            }
        }
    };

    // Check if property info should be shown (not redundant)
    const shouldShowProperty = (transaction) => {
        // In user mode, always show property since user has multiple properties
        if (mode === 'user') return true;
        
        // In landlord or tenant mode with specific propertyId, don't show property
        // since we're already viewing a specific property page
        return !propertyId;
    };

    if (loading && transactions.length === 0) {
        return (
            <div className="bg-cards-bg rounded-xl p-6 animate-pulse">
                <div className="h-7 bg-sub-bg rounded w-48 mb-4"></div>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-sub-bg rounded w-full"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-cards-bg rounded-xl p-6 text-center">
                <p className="text-red-400 mb-2">{error}</p>
                <button 
                    className="bg-main-purple text-white py-1 px-4 rounded text-sm"
                    onClick={fetchTransactions}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="bg-sub-bg rounded-xl p-4 lg:p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <DollarSign size={20} className="text-tertiary-text mr-2" />
                    <p className="font-semibold text-lg text-tertiary-text">{title}</p>
                </div>
                <button 
                    onClick={() => setFilterOpen(!filterOpen)}
                    className="flex items-center gap-1 text-secondary-text hover:text-tertiary-text bg-cards-bg px-3 py-1 rounded-lg"
                >
                    <Filter size={16} />
                    <span>Filter</span>
                </button>
            </div>

             {/* Filters section */}
            {filterOpen && (
                <div className="bg-cards-bg p-4 rounded-xl mb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-sm text-secondary-text mb-1">Type</label>
                            <select 
                                name="type"
                                value={filters.type}
                                onChange={handleFilterChange}
                                className="w-full bg-sub-bg text-white p-2 rounded-lg border border-gray-700 focus:outline-none focus:border-tertiary-text"
                            >
                                <option value="">All Types</option>
                                <option value="rent">Rent</option>
                                <option value="deposit">Deposit</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-secondary-text mb-1">Status</label>
                            <select 
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                className="w-full bg-sub-bg text-white p-2 rounded-lg border border-gray-700 focus:outline-none focus:border-tertiary-text"
                            >
                                <option value="">All Status</option>
                                
                                {filters.type === 'Deposit' 
                                    ? depositStatuses.map(status => (
                                        <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                                    ))
                                    : filters.type === 'Rent'
                                        ? rentStatuses.map(status => (
                                            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                                        ))
                                        : [...new Set([...depositStatuses, ...rentStatuses])].map(status => (
                                            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                                        ))
                                }
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-secondary-text mb-1">From Date</label>
                            <input 
                                type="date"
                                name="fromDate"
                                value={filters.fromDate}
                                onChange={handleFilterChange}
                                className="w-full bg-sub-bg text-white p-2 rounded-lg border border-gray-700 focus:outline-none focus:border-tertiary-text"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-secondary-text mb-1">To Date</label>
                            <input 
                                type="date"
                                name="toDate"
                                value={filters.toDate}
                                onChange={handleFilterChange}
                                className="w-full bg-sub-bg text-white p-2 rounded-lg border border-gray-700 focus:outline-none focus:border-tertiary-text"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button 
                            onClick={resetFilters}
                            className="bg-cards-bg text-secondary-text py-1 px-4 rounded-lg hover:text-tertiary-text transition-colors"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            )}
                        
            {/* Payment stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-cards-bg rounded-lg p-3 flex items-center">
                    <div className="bg-tertiary-text bg-opacity-20 p-2 rounded-lg mr-3">
                        <CreditCard size={18} className="text-tertiary-text" />
                    </div>
                    <div>
                        <p className="text-secondary-text text-xs">Total</p>
                        <p className="text-tertiary-text text-lg font-semibold">{stats.total}</p>
                    </div>
                </div>
                <div className="bg-cards-bg rounded-lg p-3 flex items-center">
                    <div className="bg-green-400 bg-opacity-20 p-2 rounded-lg mr-3">
                        <Check size={18} className="text-green-400" />
                    </div>
                    <div>
                        <p className="text-secondary-text text-xs">Paid</p>
                        <p className="text-green-400 text-lg font-semibold">{stats.paid}</p>
                    </div>
                </div>
                <div className="bg-cards-bg rounded-lg p-3 flex items-center">
                    <div className="bg-yellow-400 bg-opacity-20 p-2 rounded-lg mr-3">
                        <Clock size={18} className="text-yellow-400" />
                    </div>
                    <div>
                        <p className="text-secondary-text text-xs">Pending</p>
                        <p className="text-yellow-400 text-lg font-semibold">{stats.pending}</p>
                    </div>
                </div>
                <div className="bg-cards-bg rounded-lg p-3 flex items-center">
                    <div className="bg-red-400 bg-opacity-20 p-2 rounded-lg mr-3">
                        <AlertTriangle size={18} className="text-red-400" />
                    </div>
                    <div>
                        <p className="text-secondary-text text-xs">Overdue</p>
                        <p className="text-red-400 text-lg font-semibold">{stats.overdue}</p>
                    </div>
                </div>
            </div>

            {/* Transactions list */}
            <div className="divide-y divide-gray-700 bg-cards-bg rounded-xl overflow-hidden">
                {transactions.length > 0 ? (
                    transactions.map((transaction) => {
                        const statusInfo = getStatusIndicator(transaction.status, transaction.type);
                        const formattedDate = format(new Date(transaction.date), 'MMM dd, yyyy');
                        const showPropertyInfo = shouldShowProperty(transaction);
                        
                        return (
                            <div key={transaction._id} className="p-4 hover:bg-opacity-60">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                                    <div className="flex items-start mb-2 sm:mb-0">
                                        <div className={`${statusInfo.bgColor} p-2 rounded-lg mr-3`}>
                                            {transaction.type === 'Rent' ? 
                                                <Calendar size={16} className={statusInfo.color} /> : 
                                                <DollarSign size={16} className={statusInfo.color} />
                                            }
                                        </div>
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-white font-medium">
                                                    {transaction.type === 'Rent' ? 'Monthly Rent' : 'Security Deposit'}
                                                    {transaction.month && ` - ${format(new Date(transaction.month), 'MMM yyyy')}`}
                                                </p>
                                                <span className={`text-xs ${statusInfo.color} px-2 py-0.5 rounded-full ${statusInfo.bgColor}`}>
                                                    {transaction.status}
                                                </span>
                                            </div>
                                            <div className="flex gap-2 text-secondary-text text-sm items-center">
                                                <span>#{transaction.transaction_id?.split('-')[1]}</span>
                                                <span>•</span>
                                                <span>{formattedDate}</span>
                                                {showPropertyInfo && (
                                                    <>
                                                        <span>•</span>
                                                        <Home size={12} className="text-secondary-text" />
                                                        <span>{transaction.property.title}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-tertiary-text font-semibold">₹{transaction.amount.toLocaleString('en-IN')}</p>
                                        <p className="text-secondary-text text-xs">
                                            <span className="inline-flex items-center">
                                                <CreditCard size={10} className="mr-1" />
                                                {transaction.paymentMethod}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                
                                {/* User/Landlord Info */}
                                <div className="mt-3">
                                    <div className="bg-sub-bg rounded-lg p-2 flex items-center">
                                        <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                                            {mode === 'landlord' ? (
                                                <img 
                                                    src={transaction.user.profilePicture || 'https://placehold.co/100'} 
                                                    alt={transaction.user.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <img 
                                                    src={transaction.landlord.profilePicture || 'https://placehold.co/100'} 
                                                    alt={transaction.landlord.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-white text-sm flex items-center">
                                                <User size={12} className="mr-1 text-secondary-text" />
                                                {mode === 'landlord' ? 'From: ' : 'To: '}
                                                {mode === 'landlord' ? transaction.user.name : transaction.landlord.name}
                                            </p>
                                            <p className="text-secondary-text text-xs">
                                                @{mode === 'landlord' ? transaction.user.username : transaction.landlord.username}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="py-12 text-center">
                        <DollarSign size={40} className="text-secondary-text mx-auto mb-3" />
                        <p className="text-secondary-text">No payment transactions found</p>
                        {filterOpen && (
                            <p className="text-xs text-tertiary-text mt-2">Try adjusting your filters</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentHistorySection;