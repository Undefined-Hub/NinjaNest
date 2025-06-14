const Booking = require("../models/Booking");
const Property = require("../models/Property");
const User = require("../models/User");

// Get all bookings for a property
const getBookings = async (req, res, next) => {
    try {
        const { id } = req.params;
        const bookings = await Booking.find({ property_id: id })
            .populate("user_id", "_id name")
            .populate("landlord_id", "_id name");
        res.status(200).json(bookings);
    } catch (error) {
        next(error);
    }
};

// Get a specific booking by ID
const getBookingById = async (req, res, next) => {
    try {
        const { bid } = req.params;
        const booking = await Booking.find({ _id: bid })
            .populate("user_id", "_id name")
            .populate("landlord_id", "_id name");
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        res.status(200).json(booking);
    } catch (error) {
        next(error);
    }
};

// Add a new booking
const addBooking = async (req, res, next) => {
    try {
        const { property_id, user_id } = req.body;
        const property = await Property.findById(property_id);

        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        // For Flat type, add user to members if not already present
        if (property.propertyType === "Flat") {
            if (!property.roomDetails) property.roomDetails = { members: [] };
            if (!property.roomDetails.members.includes(user_id)) {
                property.roomDetails.members.push(user_id);
                await property.save();
            }
        }

        const newBooking = new Booking(req.body);
        await newBooking.save();
        res.status(201).json({ message: "Booking added successfully", booking: newBooking });
    } catch (error) {
        next(error);
    }
};

// Update a booking
const updateBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updatedBooking = await Booking.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedBooking) return res.status(404).json({ message: "Booking not found" });
        res.status(200).json({ message: "Booking updated successfully", booking: updatedBooking });
    } catch (error) {
        next(error);
    }
};

// Delete a booking
const deleteBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedBooking = await Booking.findByIdAndDelete(id);
        if (!deletedBooking) return res.status(404).json({ message: "Booking not found" });
        res.status(200).json({ message: "Booking deleted successfully" });
    } catch (error) {
        next(error);
    }
};
const getUserBooking = async (req, res, next) => {
    try {
        const { userId, propertyId } = req.params;
        const booking = await Booking.findOne({ 
            user_id: userId,
            property_id: propertyId
        }).populate("user_id", "_id name")
          .populate("landlord_id", "_id name");
        
        res.status(200).json({ booking });
    } catch (error) {
        next(error);
    }
};
module.exports = {
    addBooking,
    getBookings, 
    getBookingById, 
    deleteBooking, 
    updateBooking,
    getUserBooking 
};