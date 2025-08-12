import axios from 'axios';

const API_URL = '${import.meta.env.VITE_SERVER_URL}/api/roommate-payments';

export const createPaymentRequest = async (paymentData) => {
    const response = await axios.post(API_URL, paymentData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
};

export const updatePaymentStatus = async (paymentId, updateData) => {
    const response = await axios.patch(`${API_URL}/${paymentId}`, updateData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
};

export const getPropertyPayments = async (propertyId) => {
    const response = await axios.get(`${API_URL}/property/${propertyId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
};

export const getUserPayments = async (userId) => {
    const response = await axios.get(`${API_URL}/user/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
};