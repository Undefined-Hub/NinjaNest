const Review = require("../models/Review");

const getReviews = async (req, res) => {
    try {
        const property_id = req.params.id;
        const { review_id } = req.body;

        if (review_id) {
            const review = await Review.findOne({ _id: review_id, property_id })
                .populate('user_id', 'name')
                .populate('landlord_id', 'name');

            if (!review) return res.status(404).json({ message: "Review not found" });
            return res.status(200).json({ review });
        }

        const reviews = await Review.find({ property_id })
            .populate('user_id', 'name')
            .populate('landlord_id', 'name');

        if (!reviews.length) return res.status(404).json({ message: "No reviews found for this property" });

        res.status(200).json({ reviews });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch reviews", error: error.message });
    }
};

// Add a new review
const addReview = async (req, res) => {
    const  user_id = req.user.user.id;
    const { property_id,landlord_id, comment, trustScore, rating } = req.body;
    try {
        const newReview = new Review({ property_id, user_id, landlord_id, comment, trustScore, rating });
        if(trustScore > 5 || trustScore < 1) return res.status(400).json({ message: "Trust score must be between 1 and 5" });
        await newReview.save();
        res.status(201).json({ message: "Review added successfully", review: newReview });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to add review", error: error.message });
    }
};

// Delete a review
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedReview = await Review.findByIdAndDelete(id);
        if (!deletedReview) return res.status(404).json({ message: "Review not found" });
        res.status(200).json({ message: "Review deleted successfully", review: deletedReview });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to delete review" });
    }
};

// Update a review
const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedReview = await Review.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!updatedReview) return res.status(404).json({ message: "Review not found" });
        res.status(200).json({ message: "Review updated successfully", review: updatedReview });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update review", error: error.message });
    }
};

module.exports = {
    getReviews,
    addReview,
    deleteReview,
    updateReview,
};
