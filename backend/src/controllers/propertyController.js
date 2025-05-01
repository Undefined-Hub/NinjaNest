const Property = require("../models/Property");
const { validateInput } = require("../utils/validateInput");
const z = require("zod");

// Updated propertySchema (without `roomType`)
const propertySchema = z.object({
    title: z.string().min(3).max(50),
    location: z.string().min(3).max(50),
    rent: z.number().min(1),
    amenities: z.array(z.string()).min(1),
    description: z.string().min(3).max(500),
    address: z.string().min(3).max(100),
    deposit: z.number().min(1),
    images: z.array(z.string()).min(1),
    isAvailable: z.boolean(),
    latitude: z.string().min(1),
    longitude: z.string().min(1),
    propertyType: z.string().optional(),       // new
    flatType: z.string().optional(),           // new
    area: z.string().optional(),               // new
    mainImage: z.string().optional(),          // new
    roomDetails: z.object({                    // new
        beds: z.number().nullable().optional(),
        occupiedBeds: z.number().nullable().optional()
    }).optional(),
    isVerified: z.boolean().optional(),            // new
    averageRating: z.number().optional(),         // new
    averageTrustScore: z.number().optional(), // new
});

// ! Create a new property
const createProperty = async (req, res, next) => {
    try {
        const validatedData = validateInput(propertySchema, req.body);
        const landlord_id = req.user.user.id;

        const property = await Property.create({
            landlord_id,
            ...validatedData,
            isVerified: false,
            averageRating: 0,
            averageTrustScore: 0
        });

        res.status(201).json({ msg: "Property has been successfully listed.", property });
    } catch (error) {
        next(error);
    }
};

// ! Fetch all properties
const getProperties = async (req, res, next) => {
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
const getProperty = async (req, res, next) => {
    try {
        const property = await Property.findById(req.params.id);
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

        const validatedData = validateInput(propertySchema, req.body);

        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        if (property.landlord_id.toString() !== landlord_id) {
            return res.status(403).json({ message: 'You can only update your own properties' });
        }

        const updatedProperty = await Property.findByIdAndUpdate(propertyId, validatedData, { new: true });
        res.status(200).json({ msg: "Updated property details successfully", updatedProperty });
    } catch (error) {
        next(error);
    }
};

// ! Delete a property
const deleteProperty = async (req, res, next) => {
    try {
        const landlord_id = req.user.user.id;
        const propertyId = req.params.id;

        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        if (property.landlord_id.toString() !== landlord_id) {
            return res.status(403).json({ message: 'You can only delete your own properties' });
        }

        await Property.findByIdAndDelete(propertyId);
        res.status(200).json({ message: 'Property deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createProperty,
    getProperties,
    getProperty,
    updateProperty,
    deleteProperty
};
