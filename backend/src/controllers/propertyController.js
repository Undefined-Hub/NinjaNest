const Property = require("../models/Property");
const { validateInput } = require("../utils/validateInput");
const z = require("zod");

// Updated propertySchema (without `roomType`)
const propertySchema = z.object({
  title: z.string().min(3).max(50),
  landlord_name: z.string().min(3).max(50), // new
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
  propertyType: z.string().optional(), // new
  flatType: z.string().optional(), // new
  area: z.string().optional(), // new
  mainImage: z.string().optional(), // new
  roomDetails: z
    .object({
      // new
      beds: z.number().nullable().optional(),
      occupiedBeds: z.number().nullable().optional(),
    })
    .optional(),
  isVerified: z.boolean().optional(), // new
  averageRating: z.number().optional(), // new
  averageTrustScore: z.number().optional(), // new
});

// ! Create a new property
const createProperty = async (req, res, next) => {
  try {
    const validatedData = validateInput(propertySchema, req.body);
    const landlord_id = req.user.user.id;
    const property = await Property.create({
      landlord_name: validatedData.landlord_name, // new
      landlord_id,
      ...validatedData,
      isVerified: false,
      averageRating: 0,
      averageTrustScore: 0,
    });

    res
      .status(201)
      .json({ msg: "Property has been successfully listed.", property });
  } catch (error) {
    next(error);
  }
};

// ! Fetch all properties
const getProperties = async (req, res, next) => {
  try {
    const properties = await Property.find()
      .populate("landlord_id", "name -_id profilePicture trustScore");
    if (properties.length === 0) {
      return res.status(404).json({ message: "No properties found" });
    }
    res.status(200).json({ properties });
  } catch (error) {
    next(error);
  }
};

// ! Fetch a single property
const Review = require("../models/Review"); // Add this import at the top with other imports

// ! Fetch a single property
const getProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate("landlord_id", "name email profilePicture trustScore") // populate with desired fields only
      .select("-__v"); // optional: remove __v if not needed

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Fetch reviews for this property
    const reviews = await Review.find({ property_id: req.params.id })
      .populate("user_id", "name -_id profilePicture")
      .populate("landlord_id", "name -_id ")
      .select("-__v");
    // Optional: remove redundant `landlord_name` from response if using populated data
    const propertyObj = property.toObject();

    // Optional cleanup
    delete propertyObj.landlord_name; // you don't need both landlord_id.name and landlord_name

    // Add reviews to the property object
    propertyObj.reviews = reviews;

    res.status(200).json({ property: propertyObj });
  } catch (error) {
    next(error);
  }
};

// ! Fetch properties by landlord ID
const getPropertiesByLandlordId = async (req, res, next) => {
  try {
    const landlord_id = req.user.user.id;
    const properties = await Property.find({ landlord_id });
    if (properties.length === 0) {
      return res
        .status(404)
        .json({ message: "No properties found for this landlord" });
    }
    res.status(200).json({ properties });
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
      return res.status(404).json({ message: "Property not found" });
    }
    if (property.landlord_id.toString() !== landlord_id) {
      return res
        .status(403)
        .json({ message: "You can only update your own properties" });
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      propertyId,
      validatedData,
      { new: true }
    );
    res
      .status(200)
      .json({ msg: "Updated property details successfully", updatedProperty });
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
      return res.status(404).json({ message: "Property not found" });
    }
    if (property.landlord_id.toString() !== landlord_id) {
      return res
        .status(403)
        .json({ message: "You can only delete your own properties" });
    }

    await Property.findByIdAndDelete(propertyId);
    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  getPropertiesByLandlordId,
};
