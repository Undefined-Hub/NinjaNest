const express = require("express");
const router = express.Router();

const {createProperty, getProperties, getProperty, updateProperty, deleteProperty} = require("../controllers/propertyController");


router.post("/", createProperty); // Create a new property

router.get("/", getProperties); // Fetch all properties

router.get("/:id", getProperty); // Fetch a single property

router.put("/:id", updateProperty); // Update a property

router.delete("/:id", deleteProperty); // Delete a property


module.exports = router;
