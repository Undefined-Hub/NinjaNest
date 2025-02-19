const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    property_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    landlord_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bookingDate: {
        type: Date,
        default: Date.now
    },
    moveInDate: {
        type: Date,
        required: true
    },
    durationMonths: {
        type: Number,
        required: true,
        min: 1
    },
    occupants: {
        type: Number,
        required: true,
        min: 1
    },
    rentAmount: {
        type: Number,
        required: true
    },
    depositAmount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    bookingStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['UPI', 'Card', 'Net Banking', 'Wallet'],
        required: true
    },
    transaction_id: {
        type: String,
        default: null
    },
    contract_url: {
        type: String, // URL to the uploaded rental agreement
        default: null
    },
    verificationStatus: {
        type: String,
        enum: ['not_verified', 'pending', 'verified', 'rejected'],
        default: 'not_verified'
    },
    cancellationReason: {
        type: String,
        default: null
    },
    notes: {
        type: String,
        maxlength: 500
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
