const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

const {
  getReviews,
  submitPropertyReview,
  submitLandlordRating,
  // getReviewByID,
  deleteReview,
  updateReview,
} = require("../controllers/reviewController");

// ✅ Get all reviews for a property
router.get("/reviews/:id", authMiddleware(), getReviews);

// ! ✅ Submit property review
router.post("/:propertyId/review", authMiddleware(), submitPropertyReview);

// ! ✅ Submit landlord rating
router.post("/:propertyId/landlord-rating", authMiddleware(), submitLandlordRating);

// ✅ Get a single review by ID
// router.get("/review/:id", authMiddleware(), getReviewByID);

// ✅ Update a review
router.put("/review/:id", authMiddleware(), updateReview);

// ✅ Delete a review
router.delete("/review/:id", authMiddleware(), deleteReview);

module.exports = router;
