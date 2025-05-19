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

module.exports = router;
