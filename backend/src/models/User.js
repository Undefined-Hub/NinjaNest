const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true, // ✅ Ensures usernames are unique
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    dob:{
      type: Date,
    },
    password: {
      type: String,
      required: true,
    },
    college: {
      type: String,
      default: "",
    },
    course: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    preferences: {
      type: Map,
      of: String,
      default: {},
    },
    profilePicture: {
      type: String,
      default: "",
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
      },
    ],
    listedProperties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
      },
    ],
    currentRental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      default: null,
    },
    trustScore: {
      type: Number,
      default: 0,
    },
    numberOfTrustScoresReceived: {
      type: Number,
      default: 0,
    },
    trustScoreHistory: {
      type: Map,
      of: Number, // key: user_id, value: trustScore
      default: {},
    },

    refreshToken: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
