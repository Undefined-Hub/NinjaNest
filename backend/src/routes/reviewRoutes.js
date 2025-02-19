const express = require("express");
const router = express.Router();

const { getReviews, addReview, getReviewByID, deleteReview, updateReview } = require("../controllers/reviewController");

router.get("/reviews/:id", getReviews); // Get all reviews for a property
router.post("/reviews", addReview); // Add new review
router.delete("/reviews/:id", deleteReview); // Delete review
router.put("/reviews/:id", updateReview); // Update review
router.get("/reviews/landlord/:id", updateReview); // Get review by ID

module.exports = router;
