const Request = require("../models/Requests");

// Create a new request
exports.createRequest = async (req, res) => {
  try {
    const request = new Request(req.body);

    // Validate requestedPrice structure if provided
    if (req.body.requestedPrice) {
      const { min, max, fixed } = req.body.requestedPrice;
      if (
        (min != null && max != null && fixed == null) || // Range
        (fixed != null && min == null && max == null) || // Fixed
        (min == null && max == null && fixed == null) // None
      ) {
        // Valid structure
      } else {
        return res.status(400).json({
          error:
            "Invalid requestedPrice: Provide either a range (min and max) or a fixed price.",
        });
      }
    }

    const savedRequest = await request.save();
    res.status(201).json(savedRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all requests
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find().populate(
      "requestorId ownerId propertyId"
    );
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single request by ID
exports.getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate(
      "requestorId ownerId propertyId"
    );
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a request by ID
exports.updateRequest = async (req, res) => {
  try {
    // Validate requestedPrice structure if provided
    if (req.body.requestedPrice) {
      const { min, max, fixed } = req.body.requestedPrice;
      if (
        (min != null && max != null && fixed == null) || // Range
        (fixed != null && min == null && max == null) || // Fixed
        (min == null && max == null && fixed == null) // None
      ) {
        // Valid structure
      } else {
        return res.status(400).json({
          error:
            "Invalid requestedPrice: Provide either a range (min and max) or a fixed price.",
        });
      }
    }

    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedRequest) {
      return res.status(404).json({ error: "Request not found" });
    }
    res.status(200).json(updatedRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a request by ID
exports.deleteRequest = async (req, res) => {
  try {
    const deletedRequest = await Request.findByIdAndDelete(req.params.id);
    if (!deletedRequest) {
      return res.status(404).json({ error: "Request not found" });
    }
    res.status(200).json({ message: "Request deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add to requestController.js
exports.handleInvitationResponse = async (req, res) => {
  try {
    const { invitationId, action } = req.params;

    if (!invitationId || !action || !["accept", "decline"].includes(action)) {
      return res.status(400).json({ message: "Invalid parameters" });
    }

    // Find the invitation details (stored as a Request with a special status)
    const invitation = await Request.findById(invitationId)
      .populate("requestorId", "name email")
      .populate("ownerId", "name email")
      .populate("propertyId");

    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    // Update the status based on the action
    invitation.status = action === "accept" ? "Accepted" : "Rejected";
    invitation.updatedAt = Date.now();

    await invitation.save();

    // For accepted invitations - add additional processing here if needed
    // Such as adding the user to property residents, etc.

    // Redirect to appropriate page
    if (action === "accept") {
      return res.redirect(
        `${process.env.FRONTEND_URL}/invitation-success/${invitation.propertyId._id}`
      );
    } else {
      return res.redirect(`${process.env.FRONTEND_URL}/invitation-declined`);
    }
  } catch (error) {
    console.error("Error handling invitation:", error);
    return res
      .status(500)
      .json({ message: "Error processing invitation", error: error.message });
  }
};
