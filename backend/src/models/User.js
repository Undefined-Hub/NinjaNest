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
    dob: {
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

    // Fields required to implement roommate matacher
    smoking: { type: String, enum: ["yes", "no"], default: "no" },
    sleepSchedule: { type: String, enum: ["early", "late"], default: "early" },
    cleanliness: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    guests: {
      type: String,
      enum: ["never", "rarely", "often"],
      default: "rarely",
    },
    noiseTolerance: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    budget: { type: Number, default: 5000 },
    studyHabits: {
      type: String,
      enum: ["regular", "occasional", "cramming"],
      default: "regular",
    },
    interests: { type: String, default: "" }, // Stored as pipe-separated values like "coding|gaming|reading"
    dietaryPreference: {
      type: String,
      enum: ["vegetarian", "non-vegetarian"],
      default: "non-vegetarian",
    },
    personalityType: {
      type: String,
      enum: ["introvert", "ambivert", "extrovert"],
      default: "ambivert",
    },
    musicPreference: { type: String, default: "" }, // Stored as pipe-separated values
    gymFrequency: {
      type: String,
      enum: ["never", "rarely", "weekly", "daily"],
      default: "rarely",
    },
    sharedItems: { type: String, default: "kitchen" }, // What they're willing to share, pipe-separated
    alcoholConsumption: {
      type: String,
      enum: ["never", "rarely", "often"],
      default: "rarely",
    },
    partying: {
      type: String,
      enum: ["never", "rarely", "monthly", "weekly"],
      default: "rarely",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
