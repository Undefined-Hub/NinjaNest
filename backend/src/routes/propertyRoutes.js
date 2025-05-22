const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

const {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  getPropertiesByLandlordId,
  addRoomMember,
  removeRoomMember,
  updateRoomDetails,
  saveDocuments
} = require("../controllers/propertyController");

router.post("/", authMiddleware(), createProperty); // Create a new property

router.get("/", getProperties); // Fetch all properties

router.get("/:id", authMiddleware(), getProperty); // Fetch a single property

router.put("/:id", authMiddleware(), updateProperty); // Update a property

router.delete("/:id", authMiddleware(), deleteProperty); // Delete a property

router.get(
  "/landlord/allproperty",
  authMiddleware(),
  getPropertiesByLandlordId
); // Fetch all properties of a landlord

router.post("/members/:id", authMiddleware(), addRoomMember);

router.put("/members/:id", removeRoomMember);

router.put("/roomdetails/:id", authMiddleware(), updateRoomDetails);

// Route to fetch documents for a specific property
router.post("/:id/documents",  saveDocuments); // Save documents for a property
// Fetch a single property
module.exports = router;
