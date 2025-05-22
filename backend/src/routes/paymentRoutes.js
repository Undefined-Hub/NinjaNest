const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

const {
  initiatePayment,
  checkPayment,
  getPaymentHistory
} = require("../controllers/paymentController");

router.post("/initiate",  initiatePayment); // Create a new property
router.get("/status/:id",  checkPayment); // Create a new property
router.get("/history", authMiddleware(), getPaymentHistory);




module.exports = router;
