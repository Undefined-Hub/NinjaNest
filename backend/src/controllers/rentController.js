const MonthRent = require("../models/MonthRent");

// Add a new rent transaction
const addRent = async (req, res, next) => {
    try {
        const { booking_id, property_id, user_id, landlord_id, month, due_date, amount_due } = req.body;

        // Ensure all required fields are provided
        if (!booking_id || !property_id || !user_id || !landlord_id || !month || !due_date || !amount_due) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const newRent = new MonthRent({
            booking_id,
            property_id,
            user_id,
            landlord_id,
            month,
            due_date,
            amount_due,
            amount_paid: 0,
            payment_status: "pending"
        });

        await newRent.save();
        res.status(201).json({ message: "Monthly rent added successfully", rent: newRent });
    } catch (error) {
        next(error);
    }
};

// Get all rent transactions for a property
const getRents = async (req, res, next) => {
    try {
        const { id } = req.params; // Property ID

        const rents = await MonthRent.find({ booking_id: id })
            .populate("user_id", "_id name")
            .populate("landlord_id", "_id name")
            .populate("booking_id", "_id");

        res.status(200).json(rents);
    } catch (error) {
        next(error);
    }
};

// Get a specific rent transaction by ID
const getRentById = async (req, res, next) => {
    try {
        const  {id}  = req.params;
        console.log(id);
        
        const rent = await MonthRent.findById(id)
            .populate("user_id", "_id name")
            .populate("landlord_id", "_id name")
            .populate("property_id", "_id");

        if (!rent) {
            return res.status(404).json({ message: "Rent transaction not found" });
        }

        res.status(200).json(rent);
    } catch (error) {
        next(error);
    }
};

// Update rent transaction (e.g., payment status, amount paid)
const updateRent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amount_paid, payment_status, payment_method, transaction_id, late_fee, remarks } = req.body;

        const rent = await MonthRent.findById(id);
        if (!rent) {
            return res.status(404).json({ message: "Rent transaction not found" });
        }

        // Update only provided fields
        if (amount_paid !== undefined) rent.amount_paid = amount_paid;
        if (payment_status) rent.payment_status = payment_status;
        if (payment_method) rent.payment_method = payment_method;
        if (transaction_id) rent.transaction_id = transaction_id;
        if (late_fee !== undefined) rent.late_fee = late_fee;
        if (remarks) rent.remarks = remarks;

        await rent.save();
        res.status(200).json({ message: "Rent transaction updated successfully", rent });
    } catch (error) {
        next(error);
    }
};

// Delete a rent transaction
const deleteRent = async (req, res, next) => {
    try {
        const { id } = req.params;

        const rent = await MonthRent.findByIdAndDelete(id);
        if (!rent) {
            return res.status(404).json({ message: "Rent transaction not found" });
        }

        res.status(200).json({ message: "Rent transaction deleted successfully" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addRent,
    getRents,
    getRentById,
    updateRent,
    deleteRent
};
