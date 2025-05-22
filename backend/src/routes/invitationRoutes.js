const express = require("express");
const router = express.Router();
const invitationController = require("../controllers/invitationController");
const authMiddleware = require("../middlewares/authMiddleware");

// Create a new invitation (protected)
router.post("/create", authMiddleware(), invitationController.createInvitation);

// Get user's invitations (protected)
router.get("/user", authMiddleware(), invitationController.getUserInvitations);

// Accept invitation (public route)
router.get("/accept/:invitationId", invitationController.acceptInvitation);

// Decline invitation (public route)
router.get("/decline/:invitationId", invitationController.declineInvitation);

// Get the details of an invitation (public route)
router.get("/details/:invitationId", invitationController.getInvitationDetails);

module.exports = router;
