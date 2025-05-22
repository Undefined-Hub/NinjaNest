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

const partialPropertySchema = propertySchema.partial();

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

// ! Fetch all properties with pagination
// ! Fetch all properties with pagination and filters
const getProperties = async (req, res, next) => {
  try {
    // Get pagination parameters from query string
    const page = parseInt(req.query.page) || 1; // Current page (default: 1)
    const limit = parseInt(req.query.limit) || 10; // Items per page (default: 10)

    // Calculate skip value (how many documents to skip)
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};

    // Location filter (case-insensitive partial match)
    if (req.query.location && req.query.location.trim() !== "") {
      filter.location = { $regex: new RegExp(req.query.location, "i") };
    }

    // Amenities filter (matches if property has ALL selected amenities)
    if (req.query.amenities) {
      const amenitiesArray = Array.isArray(req.query.amenities)
        ? req.query.amenities
        : req.query.amenities.split(",").map((item) => item.trim());

      if (amenitiesArray.length > 0) {
        filter.amenities = { $all: amenitiesArray };
      }
    }

    // Rent range filter
    if (req.query.minRent || req.query.maxRent) {
      filter.rent = {};
      if (req.query.minRent) filter.rent.$gte = parseInt(req.query.minRent);
      if (req.query.maxRent) filter.rent.$lte = parseInt(req.query.maxRent);
    }

    // Property type filter
    if (req.query.propertyType && req.query.propertyType.trim() !== "") {
      filter.propertyType = req.query.propertyType;
    }

    // Flat type filter
    if (req.query.flatType) {
      const flatTypeArray = Array.isArray(req.query.flatType)
        ? req.query.flatType
        : req.query.flatType.split(",").map((item) => item.trim());

      if (flatTypeArray.length > 0) {
        filter.flatType = { $in: flatTypeArray };
      }
    }

    // Verification status filter
    if (req.query.isVerified !== undefined && req.query.isVerified !== null) {
      filter.isVerified = req.query.isVerified === "true";
    }

    // Availability status filter
    if (req.query.isAvailable !== undefined && req.query.isAvailable !== null) {
      filter.isAvailable = req.query.isAvailable === "true";
    }

    // Minimum rating filter
    if (req.query.minRating && req.query.minRating.trim() !== "") {
      filter.averageRating = { $gte: parseFloat(req.query.minRating) };
    }

    // Minimum trust score filter
    if (req.query.minTrustScore && req.query.minTrustScore.trim() !== "") {
      filter.averageTrustScore = { $gte: parseFloat(req.query.minTrustScore) };
    }

    // Beds filters
    if (req.query.totalBeds && req.query.totalBeds.trim() !== "") {
      filter["roomDetails.beds"] = parseInt(req.query.totalBeds);
    }

    if (req.query.occupiedBeds && req.query.occupiedBeds.trim() !== "") {
      filter["roomDetails.occupiedBeds"] = parseInt(req.query.occupiedBeds);
    }

    // Get total count based on filters for pagination metadata
    const totalCount = await Property.countDocuments(filter);

    if (totalCount === 0) {
      return res.status(404).json({
        message: "No properties found matching the specified filters",
        filters: req.query,
      });
    }

    // Fetch properties with filters and pagination
    const properties = await Property.find(filter)
      .populate("landlord_id", "name -_id profilePicture trustScore")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Sort by newest first

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      properties,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      appliedFilters:
        Object.keys(filter).length > 0 ? filter : "No filters applied",
    });
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
      .populate("landlord_id", "name email profilePicture trustScore")
      .populate("roomDetails.members", "name course profilePicture -_id")
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

    const validatedData = validateInput(partialPropertySchema, req.body);

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

/**
 * Add a member to roomDetails.members array
 * Expects: req.params.id (propertyId), req.body.userId (user to add)
 */
const addRoomMember = async (req, res, next) => {
  try {
    const propertyId = req.params.id;
    const { userId } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    // if (property.propertyType !== "Room") {
    //   return res
    //     .status(400)
    //     .json({ message: "Members can only be added to Room type properties" });
    // }
    if (!property.roomDetails) {
      property.roomDetails = { members: [] };
    }
    if (!property.roomDetails.members) {
      property.roomDetails.members = [];
    }
    if (property.roomDetails.members.includes(userId)) {
      return res.status(400).json({ message: "User already a member" });
    }

    property.roomDetails.members.push(userId);
    property.roomDetails.occupiedBeds =
      (property.roomDetails.occupiedBeds || 0) + 1;
    await property.save();
    res.status(200).json({ message: "Member added", property });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a member from roomDetails.members array
 * Expects: req.params.id (propertyId), req.body.userId (user to remove)
 */
const removeRoomMember = async (req, res, next) => {
  try {
    const propertyId = req.params.id;
    const { userId } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    if (property.propertyType !== "Room") {
      return res.status(400).json({
        message: "Members can only be removed from Room type properties",
      });
    }
    if (!property.roomDetails || !property.roomDetails.members) {
      return res.status(400).json({ message: "No members to remove" });
    }
    const idx = property.roomDetails.members.indexOf(userId);
    if (idx === -1) {
      return res.status(404).json({ message: "User not a member" });
    }
    property.roomDetails.members.splice(idx, 1);
    property.roomDetails.occupiedBeds = Math.max(
      (property.roomDetails.occupiedBeds || 1) - 1,
      0
    );
    await property.save();
    res.status(200).json({ message: "Member removed", property });
  } catch (error) {
    next(error);
  }
};

/**
 * Update roomDetails (beds, occupiedBeds) for a property
 * Expects: req.params.id (propertyId), req.body.roomDetails (object)
 */
const updateRoomDetails = async (req, res, next) => {
  try {
    const propertyId = req.params.id;
    const { roomDetails } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    if (property.propertyType !== "Room") {
      return res.status(400).json({
        message: "Room details can only be updated for Room type properties",
      });
    }
    if (!roomDetails) {
      return res.status(400).json({ message: "roomDetails required" });
    }
    // Only update allowed fields
    if (roomDetails.beds !== undefined)
      property.roomDetails.beds = roomDetails.beds;
    if (roomDetails.occupiedBeds !== undefined)
      property.roomDetails.occupiedBeds = roomDetails.occupiedBeds;
    await property.save();
    res.status(200).json({ message: "Room details updated", property });
  } catch (error) {
    next(error);
  }
};

const getPropertyById = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate("roomDetails.members", "name profilePicture course");
    if (!property)
      return res.status(404).json({ message: "Property not found" });
    res.status(200).json({ property });
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
  addRoomMember,
  removeRoomMember,
  updateRoomDetails,
  getPropertyById,
};
