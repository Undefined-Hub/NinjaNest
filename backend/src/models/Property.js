// {
//     "_id": "ObjectId",   
//     "landlord_id": "ObjectId",   
//     "title": "Spacious 2BHK Near College",   
//     "location": "Bangalore",   
//     "rent": 10000,   
//     "amenities": ["WiFi", "Furnished", "Parking"],   
//     "room_type": "2BHK",   
//     "verified": true,   
//     "avgrating": 3.2,   
//     "created_at": "timestamp"   
//     "description": "",   
//     "address": "",   
//     "deposit": "",   
//     "images": [],   
//     "isAvailable": "",   
//     "latitude":"",    
//     "longitude":"",    
//     "avgtrustScore": 4.2,
// }


const mongoose = require("mongoose");
const { Schema } = mongoose;

const PropertySchema = new Schema(
    {
        landlord_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        title: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        rent: {
            type: Number,
            required: true,
        },
        amenities: {
            type: [String],
            required: true,
        },
        roomType: {
            type: String,
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
            default: 2.5,
            min: 0,
            max: 5,
        },
        description: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        deposit: {
            type: Number,
            required: true,
        },
        images: {
            type: [String],
            required: true,
        },
        isAvailable: {
            type: Boolean,
            required: true,
            default: true,
        },
        latitude: {
            type: String,
        },
        longitude: {
            type: String,
        },
        averageTrustScore: {
            type: Number,
            required: true,
            default: 2.5,
            min: 0,
            max: 5,
        },
    },
    { timestamps: true }
);

const Property = mongoose.model("Property", PropertySchema);
module.exports = Property;