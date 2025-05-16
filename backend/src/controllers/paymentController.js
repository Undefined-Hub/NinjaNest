const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

// Initiate a new payment
const initiatePayment = async (req, res) => {
    try {
        console.log('Request Body:', req.body);
        const { user_id, price, phone, name } = req.body;
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
        const paymentData = {
            merchantOrderId: "TX123456",
            amount: price * 100,
            expireAfter: 1200,
            metaInfo: {
                udf1: "additional-information-1",
                udf2: "additional-information-2",
                udf3: "additional-information-3",
                udf4: "additional-information-4",
                udf5: "additional-information-5",
            },
            paymentFlow: {
                type: "PG_CHECKOUT",
                message: "Payment message used for collect requests",
                merchantUrls: {
                    redirectUrl: "http://localhost:5173/dashboard",
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

        // Step 3: Send response to frontend
        res.status(200).json({
            orderId: paymentResponse.data.orderId,
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
    
};

module.exports = {
    initiatePayment,
    checkPayment,
};