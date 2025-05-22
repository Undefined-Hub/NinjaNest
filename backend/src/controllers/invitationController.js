const Invitation = require("../models/Invitation");
const User = require("../models/User");
const Property = require("../models/Property");

// Create a new invitation
exports.createInvitation = async (req, res) => {
  try {
    const {
      inviterId,
      inviteeId,
      propertyId,
      inviterName,
      inviteeName,
      message,
    } = req.body;

    // Check if user is authorized to invite to this property
    const property = await Property.findOne({
      _id: propertyId,
      $or: [{ landlord_id: inviterId }, { "roomDetails.members": inviterId }],
    });

    console.log("Property found in which to be invited:", property);

    if (!property) {
      return res.status(403).json({
        message: "You don't have permission to invite people to this property",
      });
    }

    // Check if the inviter and invitee exist
    const [inviter, invitee] = await Promise.all([
      User.findById(inviterId),
      User.findById(inviteeId),
    ]);

    console.log("Inviter found:", inviter);
    console.log("Invitee found:", invitee);

    if (!inviter || !invitee) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if there's already a pending invitation
    const existingInvitation = await Invitation.findOne({
      inviterId,
      inviteeId,
      propertyId,
      status: "pending",
      expiresAt: { $gt: new Date() },
    });

    if (existingInvitation) {
      return res.status(400).json({
        message: "You have already sent an invitation to this user",
        invitation: existingInvitation,
      });
    }

    // Create new invitation
    const invitation = new Invitation({
      inviterId,
      inviteeId,
      propertyId,
      inviterName,
      inviteeName,
      message: message || `${inviterName} has invited you to be their roommate`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    });

    await invitation.save();

    console.log("Invitation created:", invitation);

    res.status(201).json({
      message: "Invitation created successfully",
      invitation,
    });
  } catch (error) {
    console.error("Error creating invitation:", error);
    res.status(500).json({ message: "Failed to create invitation" });
  }
};

// Accept an invitation
// Accept an invitation
exports.acceptInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;

    // Find the invitation
    const invitation = await Invitation.findById(invitationId)
      .populate("propertyId")
      .populate("inviterId")
      .populate("inviteeId");

    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    // Check if invitation is still pending and not expired
    if (invitation.status !== "pending") {
      return res.status(400).json({
        message: `This invitation has already been ${invitation.status}`,
      });
    }

    if (new Date() > new Date(invitation.expiresAt)) {
      invitation.status = "expired";
      await invitation.save();
      return res.status(400).json({ message: "This invitation has expired" });
    }

    // Update invitation status
    invitation.status = "accepted";
    await invitation.save();


    // Redirect to success page
    res.redirect(
      `${process.env.FRONTEND_URL}/invitation-success/${invitation._id}`
    );
  } catch (error) {
    console.error("Error accepting invitation:", error);
    res.status(500).json({ message: "Failed to process invitation" });
  }
};
// Decline an invitation
exports.declineInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;

    // Find the invitation
    const invitation = await Invitation.findById(invitationId);

    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    // Update the status to declined
    invitation.status = "declined";
    await invitation.save();

    // Redirect to declined page
    res.redirect(`${process.env.FRONTEND_URL}/invitation-declined`);
  } catch (error) {
    console.error("Error declining invitation:", error);
    res.status(500).json({ message: "Failed to process invitation" });
  }
};

// Get all invitations for a user (both sent and received)
exports.getUserInvitations = async (req, res) => {
  try {
    // Use the user object attached by the authMiddleware
    const userId = req.user.user.id;
    console.log("User ID from middleware:", userId);
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Get received invitations
    const receivedInvitations = await Invitation.find({
      inviteeId: userId,
      status: "pending",
      expiresAt: { $gt: new Date() },
    })
      .populate("inviterId", "name username profilePicture")
      .populate("propertyId", "title location propertyType mainImage images");

    // Get sent invitations
    const sentInvitations = await Invitation.find({
      inviterId: userId,
      status: "pending",
      expiresAt: { $gt: new Date() },
    })
      .populate("inviteeId", "name username profilePicture")
      .populate("propertyId", "title location propertyType mainImage images");

    res.status(200).json({
      received: receivedInvitations,
      sent: sentInvitations,
    });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    res.status(500).json({ message: "Failed to fetch invitations" });
  }
};

// Get a single invitation with populated fields
exports.getInvitationDetails = async (req, res) => {
  try {
    const { invitationId } = req.params;

    const invitation = await Invitation.findById(invitationId)
      .populate({
        path: "propertyId",
        select: "title location mainImage images propertyType",
      })
      .populate({
        path: "inviterId",
        select: "name username profilePicture",
      })
      .populate({
        path: "inviteeId",
        select: "name username profilePicture",
      });

    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    res.status(200).json({ invitation });
  } catch (error) {
    console.error("Error fetching invitation details:", error);
    res.status(500).json({ message: "Failed to fetch invitation details" });
  }
};
