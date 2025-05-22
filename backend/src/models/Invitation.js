const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema(
  {
    inviterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    inviteeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "expired"],
      default: "pending",
    },
    inviterName: {
      type: String,
      required: true,
    },
    inviteeName: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      default: "",
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(+new Date() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model("Invitation", invitationSchema);
