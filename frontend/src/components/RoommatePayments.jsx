import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import axios from 'axios';

const RoommatePayments = ({ property, isPrimaryTenant }) => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useSelector((state) => state.user);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);

    useEffect(() => {
        loadPayments();
    }, [property._id]);

    const loadPayments = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_SERVER_URL}/roommate-payments/property/${property._id}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setPayments(response.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to load payments');
            setLoading(false);
        }
    };

    const initiatePayment = async (payment) => {
        try {
            const response = await axios.post(
                '${import.meta.env.VITE_SERVER_URL}/payment/initiate',
                {
                    user_id: user.user._id,
                    price: payment.amount,
                    phone: user.user.phone,
                    name: `Payment to ${payment.to_user.name}`,
                    property_id: property._id,
                },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            if (response.data.redirectUrl) {
                localStorage.setItem('roommatePaymentId', payment._id);
                window.location.href = response.data.redirectUrl;
            }
        } catch (error) {
            toast.error('Failed to initiate payment');
        }
    };

    const handlePaymentComplete = async (payment) => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_SERVER_URL}/roommate-payments/${payment._id}`,
                {
                    status: 'completed',
                    payment_method: 'UPI',
                    transaction_id: localStorage.getItem('lastTxnId')
                },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            toast.success('Payment marked as completed');
            loadPayments();
            setShowPaymentModal(false);
        } catch (error) {
            toast.error('Failed to update payment status');
        }
    };

    if (loading) return <div className="text-white">Loading payments...</div>;

    return (
        <div className="bg-sub-bg p-4 rounded-xl">
            <h2 className="text-xl font-semibold text-tertiary-text mb-4">
                {isPrimaryTenant ? "Roommate Payments to You" : "Your Payments to Primary Tenant"}
            </h2>
            
            {payments.length === 0 ? (
                <div className="bg-cards-bg p-4 rounded-lg text-center">
                    <p className="text-secondary-text">No pending payments</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {payments.map(payment => (
                        <div 
                            key={payment._id} 
                            className="bg-cards-bg p-4 rounded-lg"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-white">
                                        {payment.from_user._id === user.user._id ? 
                                            `Payment to ${payment.to_user.name}` : 
                                            `Payment from ${payment.from_user.name}`}
                                    </p>
                                    <p className="text-secondary-text">
                                        Amount: ₹{payment.amount.toLocaleString('en-IN')}
                                    </p>
                                    <p className="text-secondary-text">
                                        Type: {payment.paymentType === 'deposit_share' ? 'Security Deposit' : 'Rent'}
                                        {payment.month && ` - ${payment.month}`}
                                    </p>
                                </div>
                                <div>
                                    {payment.status === 'pending' && 
                                     payment.from_user._id === user.user._id && (
                                        <button
                                            onClick={() => {
                                                setSelectedPayment(payment);
                                                initiatePayment(payment);
                                            }}
                                            className="bg-main-purple text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors"
                                        >
                                            Pay Now
                                        </button>
                                    )}
                                    {payment.status === 'completed' && (
                                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                                            Paid
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RoommatePayments;