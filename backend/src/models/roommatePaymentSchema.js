// New model: RoommatePayment.js

const mongoose = require("mongoose");
const { Schema } = mongoose;

const roommatePaymentSchema = new mongoose.Schema({
    property_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    from_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    to_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentType: {
        type: String,
        enum: ['deposit_share', 'rent_share'],
        required: true
    },
    month: {
        type: String,  // Format: "YYYY-MM"
        required: function() {
            return this.paymentType === 'rent_share';
        }
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    },
    payment_date: Date,
    transaction_id: {
        type: String,
        sparse: true
    },
    payment_method: {
        type: String,
        enum: ['UPI', 'CASH', 'BANK_TRANSFER', 'OTHER'],
        required: function() {
            return this.status === 'completed';
        }
    },
    remarks: String
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

const RoommatePayment = mongoose.model("RoommatePayment", roommatePaymentSchema);
module.exports = RoommatePayment;