const Review = require("../models/Review");
const Property = require("../models/Property");
const User = require("../models/User");
const { validateInput } = require("../utils/validateInput");
const z = require("zod");

const reviewSchema = z.object({
  user_id: z.string().min(3).max(50),
  property_id: z.string().min(3).max(50),
  landlord_id: z.string().min(3).max(50),
  comment: z.string().min(3).max(500),
  trustScore: z.number().min(1).max(5),
  rating: z.number().min(1).max(5),
});

const partialReviewSchema = reviewSchema.partial();

const getReviews = async (req, res) => {
  try {
    const property_id = req.params.id;
    const { review_id } = req.body;

    if (review_id) {
      const review = await Review.findOne({ _id: review_id, property_id })
        .select("-_id")
        .populate("user_id", "name -_id")
        .populate("landlord_id", "name -_id");

      if (!review) return res.status(404).json({ message: "Review not found" });
      return res.status(200).json({ review });
    }

    const reviews = await Review.find({ property_id })
      .select("-_id")
      .populate("user_id", "name -_id")
      .populate("landlord_id", "name -_id");

    if (!reviews.length)
      return res
        .status(404)
        .json({ message: "No reviews found for this property" });

    res.status(200).json({ reviews });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to fetch reviews", error: error.message });
  }
};

// Add a new review
// const addReview = async (req, res) => {

//     let input;
//     try {
//         input = validateInput(reviewSchema, req.body);
//     } catch (validationError) {
//         return res
//         .status(400)
//         .json({ message: "Invalid input", error: validationError.message });
//     }

//   const { user_id, property_id, landlord_id, comment, trustScore, rating } = input;

//   try {
//     const existingReview = await Review.findOne({ user_id, property_id });

//     if (trustScore !== undefined && (trustScore < 1 || trustScore > 5)) {
//       return res
//         .status(400)
//         .json({ message: "Trust score must be between 1 and 5" });
//     }

//     if (rating !== undefined && (rating < 0 || rating > 5)) {
//       return res
//         .status(400)
//         .json({ message: "Rating must be between 0 and 5" });
//     }

//     // Case: Existing full review (can't add again)
//     if (
//       existingReview &&
//       existingReview.trustScore !== undefined &&
//       existingReview.rating !== undefined &&
//       existingReview.comment
//     ) {
//       return res.status(400).json({
//         message:
//           "You've already submitted a full review. Please update it instead.",
//       });
//     }

//     // ! Case: Existing partial review (update missing fields)
//     if (existingReview) {
//       const updates = [];

//       if (trustScore !== undefined && existingReview.trustScore === undefined) {
//         const landlord = await User.findById(landlord_id);
//         if (landlord) {
//           const oldAvg = landlord.avgTrustScore || 0;
//           const count = landlord.numberOfTrustScoresReceived || 0;
//           const newAvg = (oldAvg * count + trustScore) / (count + 1);

//           landlord.avgTrustScore = newAvg;
//           landlord.numberOfTrustScoresReceived = count + 1;

//           // 🟢 Store user’s trustScore
//           if (!landlord.trustScoreHistory)
//             landlord.trustScoreHistory = new Map();
//           landlord.trustScoreHistory.set(user_id.toString(), trustScore);

//           await landlord.save();
//         }

//         existingReview.trustScore = trustScore;
//         updates.push("trustScore");
//       }

//       if (
//         rating !== undefined &&
//         existingReview.rating === undefined &&
//         comment
//       ) {
//         const property = await Property.findById(property_id);
//         if (property) {
//           const oldAvg = property.avgRating || 0;
//           const count = property.numberOfRatingsReceived || 0;
//           const newAvg = (oldAvg * count + rating) / (count + 1);

//           property.avgRating = newAvg;
//           property.numberOfRatingsReceived = count + 1;

//           // 🟢 Store user’s rating
//           if (!property.ratingHistory) property.ratingHistory = new Map();
//           property.ratingHistory.set(user_id.toString(), rating);

//           await property.save();
//         }

//         existingReview.rating = rating;
//         existingReview.comment = comment;
//         updates.push("rating + comment");
//       }

//       await existingReview.save();
//       return res.status(200).json({
//         message: `Review updated successfully (${updates.join(", ")})`,
//         review: existingReview,
//       });
//     }

//     // ! Case: New review (at least one valid part provided)
//     if (trustScore === undefined && (rating === undefined || !comment)) {
//       return res
//         .status(400)
//         .json({ message: "Insufficient review data provided." });
//     }

//     // Create new review
//     const newReview = new Review({
//       property_id,
//       user_id,
//       landlord_id,
//       trustScore,
//       rating,
//       comment,
//     });

//     await newReview.save();

//     // 🟢 Update avg trustScore and store in trustScoreHistory
//     if (trustScore !== undefined) {
//       const landlord = await User.findById(landlord_id);
//       if (landlord) {
//         const oldAvg = landlord.avgTrustScore || 0;
//         const count = landlord.numberOfTrustScoresReceived || 0;
//         const newAvg = (oldAvg * count + trustScore) / (count + 1);

//         landlord.avgTrustScore = newAvg;
//         landlord.numberOfTrustScoresReceived = count + 1;

//         // Store user's trustScore in history
//         if (!landlord.trustScoreHistory) landlord.trustScoreHistory = new Map();
//         landlord.trustScoreHistory.set(user_id.toString(), trustScore);

//         await landlord.save();
//       }
//     }

//     // 🟢 Update avg rating and store in ratingHistory
//     if (rating !== undefined && comment) {
//       const property = await Property.findById(property_id);
//       if (property) {
//         const oldAvg = property.avgRating || 0;
//         const count = property.numberOfRatingsReceived || 0;
//         const newAvg = (oldAvg * count + rating) / (count + 1);

//         property.avgRating = newAvg;
//         property.numberOfRatingsReceived = count + 1;

//         // Store user's rating in history
//         if (!property.ratingHistory) property.ratingHistory = new Map();
//         property.ratingHistory.set(user_id.toString(), rating);

//         await property.save();
//       }
//     }

//     return res.status(201).json({
//       message: "Review added successfully",
//       review: newReview,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Failed to add or update review",
//       error: error.message,
//     });
//   }
// };

// ✅ 1. Landlord Rating Controller
const submitLandlordRating = async (req, res) => {
  let input;
  try {
    input = validateInput(partialReviewSchema, req.body);
  } catch (err) {
    return res
      .status(400)
      .json({ message: "Invalid input", error: err.message });
  }

  const { user_id, landlord_id, trustScore } = input;
  const property_id = req.params.propertyId;

  if (trustScore === undefined || trustScore < 1 || trustScore > 5) {
    return res
      .status(400)
      .json({ message: "Trust score must be between 1 and 5" });
  }

  try {
    let existingReview = await Review.findOne({ user_id, property_id });

    const isNew = !existingReview;

    if (!existingReview) {
      existingReview = new Review({ user_id, property_id, landlord_id });
    }

    const oldScore = existingReview.trustScore || 0;
    existingReview.trustScore = trustScore;

    const landlord = await User.findById(landlord_id);
    if (landlord) {
      const count = landlord.numberOfTrustScoresReceived || 0;
      const oldAvg = landlord.trustScore || 0;

      let newAvg;
      if (isNew || oldScore === 0) {
        newAvg = (oldAvg * count + trustScore) / (count + 1);
        landlord.numberOfTrustScoresReceived = count + 1;
      } else {
        newAvg = (oldAvg * count - oldScore + trustScore) / count;
      }

      landlord.trustScore = newAvg;

      if (!landlord.trustScoreHistory) landlord.trustScoreHistory = new Map();
      landlord.trustScoreHistory.set(user_id.toString(), trustScore);

      await landlord.save();
    }

    await existingReview.save();
    return res.status(200).json({
      message: isNew
        ? "Landlord rated successfully"
        : "Landlord rating updated",
      review: existingReview,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to rate landlord",
      error: err.message,
    });
  }
};

// ✅ 2. Property Review Controller
const submitPropertyReview = async (req, res) => {
  let input;
  try {
    input = validateInput(partialReviewSchema, req.body);
  } catch (err) {
    return res
      .status(400)
      .json({ message: "Invalid input", error: err.message });
  }

  const { user_id, landlord_id, rating, comment } = input;
  const property_id = req.params.propertyId;

  if (rating === undefined || rating < 0 || rating > 5 || !comment) {
    return res
      .status(400)
      .json({ message: "Rating (0-5) and comment are required." });
  }

  try {
    let existingReview = await Review.findOne({ user_id, property_id });
    const isNew = !existingReview;

    if (!existingReview) {
      existingReview = new Review({ user_id, property_id, landlord_id });
    }

    const oldRating = existingReview.rating || 0;

    existingReview.rating = rating;
    existingReview.comment = comment;

    const property = await Property.findById(property_id);
    if (property) {
      const count = property.numberOfRatingsReceived || 0;
      const oldAvg = property.averageRating || 0;

      let newAvg;
      if (isNew || oldRating === 0) {
        newAvg = (oldAvg * count + rating) / (count + 1);
        property.numberOfRatingsReceived = count + 1;
      } else {
        newAvg = (oldAvg * count - oldRating + rating) / count;
      }

      property.averageRating = newAvg;

      if (!property.ratingHistory) property.ratingHistory = new Map();
      property.ratingHistory.set(user_id.toString(), rating);

      await property.save();
    }

    await existingReview.save();
    return res.status(200).json({
      message: isNew
        ? "Property reviewed successfully"
        : "Property review updated",
      review: existingReview,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to review property",
      error: err.message,
    });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedReview = await Review.findByIdAndDelete(id);
    if (!deletedReview)
      return res.status(404).json({ message: "Review not found" });
    res
      .status(200)
      .json({ message: "Review deleted successfully", review: deletedReview });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete review" });
  }
};

// Update a review
const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = validateInput(reviewSchema, req.body);
    const updatedReview = await Review.findByIdAndUpdate(id, validatedData, {
      new: true,
      runValidators: true,
    });
    if (!updatedReview)
      return res.status(404).json({ message: "Review not found" });
    res
      .status(200)
      .json({ message: "Review updated successfully", review: updatedReview });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReviews,
  submitPropertyReview,
  submitLandlordRating,
  // getReviewByID,
  deleteReview,
  updateReview,
};
