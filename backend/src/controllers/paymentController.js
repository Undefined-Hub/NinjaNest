const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

// Initiate a new payment
const initiatePayment = async (req, res) => {
    try {
        console.log('Request Body:', req.body);
        const { user_id, price, phone, name, property_id } = req.body;
        // Step 1: Get access token
        const tokenResponse = await axios.post(
            'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token',
            new URLSearchParams({
                client_id: process.env.CLIENT_ID,
                client_version: '1',
                client_secret: process.env.CLIENT_SECRET,
                grant_type: 'client_credentials',
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );
        console.log('Token Response:', tokenResponse.data);
        const accessToken = tokenResponse.data.access_token;
        console.log('Access Token:', accessToken);
        // Step 2: Make payment request
        const txnId = `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
        const paymentData = {
            merchantOrderId: txnId ,
            amount: price * 100,
            expireAfter: 1200,
            paymentFlow: {
                type: "PG_CHECKOUT",
                message: "Payment message used for collect requests",
                merchantUrls: {
                    redirectUrl: "http://localhost:5173/currentpropertydashboard/"+property_id,
                },
            },
        };

        const paymentResponse = await axios.post(
            'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay',
            paymentData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `O-Bearer ${accessToken}`,
                },
            }
        );
        console.log('Payment Response:', paymentResponse.data);
        // Step 3: Send response to frontend
        res.status(200).json({
            orderId: paymentResponse.data.orderId,
            txnId: txnId,
            state: paymentResponse.data.state,
            expireAt: paymentResponse.data.expireAt,
            redirectUrl: paymentResponse.data.redirectUrl,
        });
    } catch (error) {
        console.error('Error initiating payment:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to initiate payment' });
    }
};

// Check payment status
const checkPayment = async (req, res) => {
    try {
        const merchantOrderId = req.params.id;

        // 1. Get access token
        const tokenResponse = await axios.post(
            'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token',
            new URLSearchParams({
                client_id: process.env.CLIENT_ID,
                client_version: '1',
                client_secret: process.env.CLIENT_SECRET,
                grant_type: 'client_credentials',
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );
        const accessToken = tokenResponse.data.access_token;
        console.log('Access Token:', accessToken);
        // 2. Call the order status API with details=false
        const url = `https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order/${merchantOrderId}/status?details=false`;

        const statusResponse = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `O-Bearer ${accessToken}`,
            },
        });

        // Log the full response for debugging
        // console.log('Status Response:', statusResponse);

        // 3. Return the correct data to the frontend
       if (statusResponse && statusResponse.data) {
    return res.status(200).json(statusResponse.data);
} else {
    return res.status(200).json({
        message: "No data property in PhonePe response"
    });
}

    } catch (error) {
        console.error("Status API Error:", error.message);
        if (error.response && error.response.data) {
            console.error("Status API Error Response:", error.response.data);
        }
        res.status(500).json({ msg: "Error checking payment status", status: "error", error: error.message });
    }
};

module.exports = {
    initiatePayment,
    checkPayment,
};