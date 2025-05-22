const RoommatePayment = require("../models/roommatePaymentSchema");
const Property = require("../models/Property");

// Create a new payment request
const createPaymentRequest = async (req, res, next) => {
    try {
        const { property_id, from_user, to_user, amount, paymentType, month } = req.body;

        // Validate if the property exists and is a Flat
        const property = await Property.findById(property_id);
        if (!property || property.propertyType !== "Flat") {
            return res.status(400).json({ message: "Invalid property or not a Flat type" });
        }

        const newPayment = new RoommatePayment({
            property_id,
            from_user,
            to_user,
            amount,
            paymentType,
            month: paymentType === 'rent_share' ? month : undefined
        });

        await newPayment.save();
        res.status(201).json({
            message: "Payment request created successfully",
            payment: newPayment
        });
    } catch (error) {
        next(error);
    }
};

// Update payment status
const updatePaymentStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, payment_method, transaction_id } = req.body;

        const payment = await RoommatePayment.findById(id);
        if (!payment) {
            return res.status(404).json({ message: "Payment request not found" });
        }

        payment.status = status;
        if (status === 'completed') {
            payment.payment_date = new Date();
            payment.payment_method = payment_method;
            payment.transaction_id = transaction_id;
        }

        await payment.save();
        res.status(200).json({
            message: "Payment status updated successfully",
            payment
        });
    } catch (error) {
        next(error);
    }
};

// Get payments by property
const getPropertyPayments = async (req, res, next) => {
    try {
        const { propertyId } = req.params;
        const payments = await RoommatePayment.find({ property_id: propertyId })
            .populate('from_user', 'name email')
            .populate('to_user', 'name email');
        res.status(200).json(payments);
    } catch (error) {
        next(error);
    }
};

// Get user's payments (sent or received)
const getUserPayments = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const payments = await RoommatePayment.find({
            $or: [{ from_user: userId }, { to_user: userId }]
        })
            .populate('from_user', 'name email')
            .populate('to_user', 'name email')
            .populate('property_id', 'name address');
        res.status(200).json(payments);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPaymentRequest,
    updatePaymentStatus,
    getPropertyPayments,
    getUserPayments
};