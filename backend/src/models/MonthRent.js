const mongoose = require("mongoose");
const { Schema } = mongoose;

const MonthRentSchema = new Schema(
  {
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    property_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    landlord_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    month: {
      type: String, // e.g., "2025-03"
      required: true,
    },
    due_date: {
      type: Date,
      required: true,
    },
    amount_due: {
      type: Number,
      required: true,
    },
    amount_paid: {
      type: Number,
      default: 0,
    },
    payment_status: {
      type: String,
      enum: ["pending", "paid", "overdue", "partial"],
      default: "pending",
    },
    payment_method: {
      type: String,
      enum: ["UPI", "Card", "Net Banking", "Wallet"],
      default: null,
    },
    transaction_id: {
      type: String,
      default: null,
    },
    late_fee: {
      type: Number,
      default: 0,
    },
    remarks: {
      type: String,
      maxlength: 300,
    },
  },
  { timestamps: true }
);

const MonthRent = mongoose.model("MonthRent", MonthRentSchema);
module.exports = MonthRent;
