const Property = require("../models/Property");
const { validateInput } = require("../utils/validateInput");
const z = require("zod");

// {
//     "_id": "ObjectId",   
//     "landlord_id": "ObjectId",   
//     "title": "Spacious 2BHK Near College",   .
//     "location": "Bangalore",   .
//     "rent": 10000,   .
//     "amenities": ["WiFi", "Furnished", "Parking"],   .
//     "room_type": "2BHK",   .
//     "verified": true,   
//     "avgrating": 3.2,   
//     "created_at": "timestamp"   
//     "description": "",   .
//     "address": "",   .
//     "deposit": "",   .
//     "images": [],   .
//     "isAvailable": "",   .
//     "latitude":"",    
//     "longitude":"",    
//     "avgtrustScore": 4.2, 
// }


const propertySchema = z.object({
    title: z.string().min(3).max(50),
    location: z.string().min(3).max(50),
    rent: z.number().min(1),
    amenities: z.array(z.string()).min(1),
    roomType: z.string().min(3).max(50),
    description: z.string().min(3).max(500),
    address: z.string().min(3).max(50),
    deposit:  z.number().min(1),
    images: z.array(z.string()).min(1),
    isAvailable: z.boolean(),
    latitude: z.string().min(3).max(50),
    longitude: z.string().min(3).max(50),
});

// ! Create a new property
const createProperty = async (req, res, next) => {
    try {
        const { title, location, rent, amenities, roomType, description, address, deposit, images, isAvailable, latitude, longitude }=validateInput(propertySchema, req.body);
        const  landlord_id = req.user.user.id;
        console.log(" landlord_id", landlord_id );
        
        const verified = false;
        const avgrating = 0;
        const averageTrustScore = 0;
      
        const property = await Property.create({ landlord_id, title, location, rent, amenities, roomType, verified, avgrating, description, address, deposit, images, isAvailable, latitude, longitude ,averageTrustScore});
        res.status(201).json({ msg:"Property has been successfully listed.",property });
    } catch (error) {
        next(error);
    }
};

// ! Fetch all properties
const getProperties = async (req, res,next) => {
    try {
        const properties = await Property.find();
        if (properties.length === 0) {
            return res.status(404).json({ message: 'No properties found' });
        }
        res.status(200).json({ properties });
    } catch (error) {
        next(error);
    }
};


// ! Fetch a single property
const getProperty = async (req, res) => {
    try {
        const propertyId = req.params.id;
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        res.status(200).json({ property });
    } catch (error) {
        next(error);
    }
};


// ! Update a property
const updateProperty = async (req, res, next) => {
    try {
        const landlord_id = req.user.user.id;
        const propertyId = req.params.id;
        const { title, location, rent, amenities, roomType, description, address, deposit, images, isAvailable, latitude, longitude } = validateInput(propertySchema, req.body);

        const property = await Property.findOne({ _id: propertyId});
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        if (property.landlord_id.toString() !== landlord_id) {
            return res.status(403).json({ message: 'You can only update your own properties' });
        }

        const updatedProperty = await Property.findByIdAndUpdate(propertyId, { title, location, rent, amenities, roomType, description, address, deposit, images, isAvailable, latitude, longitude }, { new: true });
        res.status(200).json({ msg: "Updated property details successfully", updatedProperty });
    } catch (error) {
        next(error);
    }
}

// ! Delete a property
const deleteProperty = async (req, res, next) => {
    try {
        const landlord_id = req.user.user.id;
        const propertyId = req.params.id;

        const property = await Property.findOne({ _id: propertyId});
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        if (property.landlord_id.toString() !== landlord_id) {
            return res.status(403).json({ message: 'You can only update your own properties' });
        }
       

        await Property.findByIdAndDelete(propertyId);
        res.status(200).json({ message: 'Property deleted successfully' });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createProperty,
    getProperties,
    getProperty,
    updateProperty,
    deleteProperty
};