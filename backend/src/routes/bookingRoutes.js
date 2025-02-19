const express = require("express");
const router = express.Router();

const { addBooking,getBookings, getBookingById, deleteBooking, updateBooking } = require("../controllers/bookingController");

router.post("/bookings", addBooking); // Add new Booking
router.get("/bookings/property/:id", getBookings); // Get all Bookings for a property
router.get("/bookings/:bid", getBookingById); // Get a specific Booking
router.put("/bookings/:id", updateBooking); // Update Booking
router.delete("/bookings/:id", deleteBooking); // Delete Booking

module.exports = router;
