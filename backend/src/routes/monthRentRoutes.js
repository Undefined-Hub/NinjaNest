const express = require("express");
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

const { addRent,getRents, getRentById, updateRent, deleteRent } = require("../controllers/rentController");

router.post("/",authMiddleware(),  addRent); // Add new Booking
router.get("/:id",authMiddleware(),  getRents); // Get all Rents for a Booking
router.get("/rent/:id",authMiddleware(),  getRentById); // Get a specific Booking Rent
router.put("/rent/:id",authMiddleware(),  updateRent); // Update Rent
router.delete("/rent/:id",authMiddleware(),  deleteRent); // Delete Rent

module.exports = router;
