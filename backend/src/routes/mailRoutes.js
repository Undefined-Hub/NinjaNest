const express = require("express");
const router = express.Router();
const {
  sendRegistrationOTP,
  sendForgotPasswordOTP,
  sendChangePasswordMail,
} = require("../controllers/mailController");

// ! Route to send OTP for registration
router.post("/register", sendRegistrationOTP);

// ! Route to send OTP for forgot password
router.post("/forgot-password", sendForgotPasswordOTP);

// ! Route to send mail for changing password
router.post("/change-password", sendChangePasswordMail);

module.exports = router;
