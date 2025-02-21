const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

const {
  addBooking,
  getBookings,
  getBookingById,
  deleteBooking,
  updateBooking,
} = require("../controllers/bookingController");

router.post("/bookings", authMiddleware(), addBooking); // Add new Booking

router.get("/bookings/property/:id", authMiddleware(), getBookings); // Get all Bookings for a property

router.get("/bookings/:bid", authMiddleware(), getBookingById); // Get a specific Booking

router.put("/bookings/:id", authMiddleware(), updateBooking); // Update Booking

router.delete("/bookings/:id", authMiddleware(), deleteBooking); // Delete Booking

module.exports = router;
