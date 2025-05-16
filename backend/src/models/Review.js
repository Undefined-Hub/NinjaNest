const mongoose = require("mongoose");
const { Schema } = mongoose;

const ReviewSchema = new Schema(
  {
    property_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Property",
    },
    user_id: {
      type: Schema.Types.ObjectId,
      // type: String,
      required: true,
      ref: "User",
    },
    landlord_id: {
      type: Schema.Types.ObjectId,
      // type: String,
      required: true,
      ref: "User",
    },
    comment: {
      type: String,
      required: true,
    },
    trustScore: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 5,
    },
    rating: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 5,
    }
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", ReviewSchema);
module.exports = Review;
