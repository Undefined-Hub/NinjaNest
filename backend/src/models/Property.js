// {
//     "_id": "ObjectId",
//     "landlord_id": "ObjectId",
//     "title": "Spacious 2BHK Near College",
//     "location": "Bangalore",
//     "address": "123 MG Road, Bangalore",
//     "rent": 10000,
//     "deposit": "30000",
//     "isAvailable": true,
//     "description": "A well-maintained 2BHK flat located close to major colleges and public transport.",
//     "amenities": ["WiFi", "Furnished", "Parking"],
//     "images": ["img1.jpg", "img2.jpg", "img3.jpg"],
//     "mainImage": "img1.jpg",                        // ✅ New: Main display image for cards
//     "latitude": "12.9716",
//     "longitude": "77.5946",

//     "propertyType": "Flat",                         // ✅ New: Either 'Flat' or 'Room'
//     "flatType": "2BHK",                             // ✅ New: Type of flat
//     "roomDetails": {                                // ✅ Still included for Room type (optional for Flat)
//       "beds": null,
//       "occupiedBeds": null
//     },
//     "area": "1250 sq. ft",                          // ✅ New: Area of the property

//     "isVerified": true,
//     "averageRating": 3.2,
//     "averageTrustScore": 4.2,
//     "created_at": "timestamp"
//   }

const mongoose = require("mongoose");
const { Schema } = mongoose;

const PropertySchema = new Schema(
  {
    landlord_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    landlord_name: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    rent: {
      type: Number,
      required: true,
    },
    deposit: {
      type: Number,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      required: true,
      default: true,
    },
    description: {
      type: String,
      required: true,
    },
    amenities: {
      type: [String],
      required: true,
    },
    images: {
      type: [String],
      required: true,
    },
    mainImage: {
      type: String, // ✅ New: Image to show on cards
      required: true,
    },
    latitude: {
      type: String,
    },
    longitude: {
      type: String,
    },

    propertyType: {
      type: String,
      enum: ["Room", "Flat"],
      required: true,
    },

    roomDetails: {
      beds: { type: Number },
      occupiedBeds: { type: Number, default: 0 },
      members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    },

    flatType: {
      type: String, // e.g., "1BHK"
    },

    area: {
      type: String, // e.g., "1250 sq. ft"
      required: true,
    },

    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },

    averageRating: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 5,
    },

    numberOfRatingsReceived: {
      type: Number,
      default: 0,
    },

    ratingHistory: {
      type: Map,
      of: Number, // key: user_id, value: rating
      default: {},
    },

    averageTrustScore: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  { timestamps: true }
);

const Property = mongoose.model("Property", PropertySchema);
module.exports = Property;
