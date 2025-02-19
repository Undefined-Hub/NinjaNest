const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("../models/User");

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ! Route to send OTP for registration
router.post("/register", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const otp = generateOTP();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Account Registration OTP - NinjaNest",
      text: `Your OTP for account registration is ${otp}. It will expire in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent successfully", otp });
  } catch (error) {
    res.status(500).json({ message: "Error sending OTP", error: error.message });
  }
});

// ! Route to send OTP for forgot password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const otp = generateOTP();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "🔐 Password Reset OTP - NinjaNest",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #333; text-align: center;">🔒 NinjaNest Password Reset</h2>
          <p style="font-size: 16px; color: #555;">
            You recently requested to reset your password for <strong>NinjaNest</strong>. Use the OTP below to proceed:
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; color: #fff; background-color: #007bff; padding: 10px 20px; border-radius: 5px; display: inline-block;">
              ${otp}
            </span>
          </div>
          <p style="font-size: 14px; color: #777;">
            This OTP is valid for <strong>10 minutes</strong>. If you didn't request this, please ignore this email.
          </p>
          <hr style="border: 0; border-top: 1px solid #eee;">
          <p style="text-align: center; font-size: 12px; color: #aaa;">
            ⚡ Powered by <strong>NinjaNest</strong>
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent successfully", otp });
  } catch (error) {
    res.status(500).json({ message: "Error sending OTP", error: error.message });
  }
});

// router.post("/change-password", async (req, res) => {
//   const { id } = req.body;

// });

module.exports = router;
