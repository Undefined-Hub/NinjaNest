const express = require("express");
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

const { getReviews, addReview, getReviewByID, deleteReview, updateReview } = require("../controllers/reviewController");

router.get("/reviews/:id",authMiddleware(), getReviews); // Get all reviews for a property
router.post("/reviews",authMiddleware(),  addReview); // Add new review
router.delete("/reviews/:id",authMiddleware(),  deleteReview); // Delete review
router.put("/reviews/:id",authMiddleware(),  updateReview); // Update review
router.get("/reviews/landlord/:id", authMiddleware(), updateReview); // Get review by ID

module.exports = router;
