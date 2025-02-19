const express = require("express");
const router = express.Router();

const { addRent,getRents, getRentById, updateRent, deleteRent } = require("../controllers/rentController");

router.post("/", addRent); // Add new Booking
router.get("/:id", getRents); // Get all Rents for a Booking
router.get("/rent/:id", getRentById); // Get a specific Booking Rent
router.put("/rent/:id", updateRent); // Update Rent
router.delete("/rent/:id", deleteRent); // Delete Rent

module.exports = router;
