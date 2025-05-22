const express = require('express');
const router = express.Router();
const { 
    createPaymentRequest, 
    updatePaymentStatus, 
    getPropertyPayments,
    getUserPayments 
} = require('../controllers/roommatePaymentController');
const authMiddleware = require('../middlewares/authMiddleware');

// All routes use auth middleware
router.use(authMiddleware());

// Create new payment request
router.post('/', createPaymentRequest);

// Update payment status
router.patch('/:id', updatePaymentStatus);

// Get all payments for a property
router.get('/property/:propertyId', getPropertyPayments);

// Get all payments for a user
router.get('/user/:userId', getUserPayments);

module.exports = router;