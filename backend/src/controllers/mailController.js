const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ! Route to send OTP for registration
const sendRegistrationOTP = async (req, res) => {
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
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 30px; border-radius: 15px; background-color: #111827; color: #fff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #a98cfc; margin: 0; font-size: 28px;">NinjaNest</h1>
            <p style="color: #9ca3af; margin-top: 5px; font-size: 16px;">Your Campus Housing Solution</p>
          </div>
          
          <div style="background-color: #1f2937; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
            <h2 style="color: #fff; margin-top: 0; text-align: center;">Verify Your Account</h2>
            <p style="color: #d1d5db; font-size: 16px; line-height: 1.6;">
              Thanks for signing up with <strong>NinjaNest</strong>! Please use the verification code below to complete your registration:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background-color: #2d3748; padding: 15px; border-radius: 8px; display: inline-block; color: #a98cfc;">
                ${otp}
              </div>
            </div>
            
            <p style="color: #d1d5db; font-size: 14px; margin-bottom: 0;">
              This code will expire in <strong>10 minutes</strong>. If you didn't request this code, you can safely ignore this email.
            </p>
          </div>
          
          <div style="background-color: #1f2937; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
            <h3 style="color: #a98cfc; margin-top: 0; font-size: 18px;">What's Next?</h3>
            <p style="color: #d1d5db; font-size: 15px; line-height: 1.5;">
              After verification, you'll be able to:
            </p>
            <ul style="color: #d1d5db; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Browse student accommodations near your campus</li>
              <li style="margin-bottom: 8px;">Connect with potential roommates</li>
              <li style="margin-bottom: 8px;">Manage your housing preferences</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #374151;">
            <p style="color: #9ca3af; font-size: 14px; margin-bottom: 5px;">
              Need help? <a href="mailto:official.team.undefined@gmail.com" style="color: #a98cfc; text-decoration: none;">Contact our support team</a>
            </p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 15px;">
              © 2025 NinjaNest | All rights reserved
            </p>
          </div>
        </div>
            `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent successfully", otp });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sending OTP", error: error.message });
  }
};

// ! Route to send OTP for forgot password
const sendForgotPasswordOTP = async (req, res) => {
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
    res
      .status(500)
      .json({ message: "Error sending OTP", error: error.message });
  }
};

const sendChangePasswordMail = async (email) => {
  if (!email) {
    return;
  }
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "🔐 Password Reset OTP - NinjaNest",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
            <h2 style="color: #333; text-align: center;">✅ Password Changed Successfully</h2>
            <p style="font-size: 16px; color: #555;">
                Hello,  
                Your password for <strong>NinjaNest</strong> has been successfully updated. If this was you, no further action is needed.
            </p>
            <div style="text-align: center; margin: 20px 0;">
                <span style="font-size: 18px; font-weight: bold; color: #fff; background-color: #28a745; padding: 10px 20px; border-radius: 5px; display: inline-block;">
                ✔ Password Updated
                </span>
            </div>
            <p style="font-size: 14px; color: #777;">
                If you did not make this change, please <a href="[RESET LINK]" style="color: #007bff; text-decoration: none;">reset your password</a> immediately or contact support.
            </p>
            <hr style="border: 0; border-top: 1px solid #eee;">
            <p style="text-align: center; font-size: 12px; color: #aaa;">
                ⚡ Powered by <strong>NinjaNest</strong> | Need help? <a href="mailto:official.team.undefined@gmail.com" style="color: #007bff; text-decoration: none;">Contact Support</a>
            </p>
        </div>
        `,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending password change mail:", error.message);
  }
};

// Add to mailController.js
const sendRoommateInvitation = async (req, res) => {
  const {
    inviteeEmail,
    inviterName,
    inviterUsername,
    inviteeFirstName,
    propertyName,
    propertyLocation,
    propertyType,
    propertyImage,
    invitationId,
    invitationExpiry,
  } = req.body;

  console.log("Received email data:", req.body);

  if (!inviteeEmail || !inviterName || !propertyName || !invitationId) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  try {
    const acceptUrl = `http://localhost:3000/api/invitation/accept/${invitationId}`;
    const declineUrl = `http://localhost:3000/api/invitation/decline/${invitationId}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: inviteeEmail,
      subject: `🏠 Roommate Invitation from ${inviterName} - NinjaNest`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 25px; border-radius: 12px; background-color: #111827; color: #fff;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #1f2937;">
            <h1 style="color: #a98cfc; margin: 0; font-size: 26px; letter-spacing: 0.5px;">NinjaNest</h1>
            <p style="color: #9ca3af; margin-top: 4px; font-size: 14px;">Your Campus Housing Solution</p>
          </div>
          
          <!-- Main Content -->
          <div style="background-color: #1f2937; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center">
                  <h2 style="color: #fff; margin-top: 0; margin-bottom: 15px; font-size: 22px;">Roommate Invitation 🤝</h2>
                </td>
              </tr>
              <tr>
                <td>
                  <p style="color: #d1d5db; font-size: 15px; line-height: 1.5; margin-bottom: 12px;">
                    Hi ${inviteeFirstName || "there"},
                  </p>
                  <p style="color: #d1d5db; font-size: 15px; line-height: 1.5; margin-bottom: 15px;">
                    <strong style="color: #a98cfc">${inviterName}</strong> (@${inviterUsername}) has invited you to be their roommate at:
                  </p>
                </td>
              </tr>
            </table>
            
            <!-- Property Card -->
            <div style="background-color: #2d3748; border-radius: 8px; overflow: hidden; margin: 15px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                ${
                  propertyImage
                    ? `
                <tr>
                  <td>
                    <div style="height: 160px; overflow: hidden;">
                      <img src="${propertyImage}" alt="${propertyName}" style="width: 100%; object-fit: cover;">
                    </div>
                  </td>
                </tr>
                `
                    : ""
                }
                <tr>
                  <td style="padding: 15px;">
                    <h3 style="color: #a98cfc; margin-top: 0; margin-bottom: 8px; font-size: 18px;">${propertyName}</h3>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="50%" style="vertical-align: top; padding-right: 10px;">
                          <p style="color: #d1d5db; margin: 4px 0; font-size: 14px;">📍 ${propertyLocation}</p>
                        </td>
                        <td width="50%" style="vertical-align: top;">
                          <p style="color: #d1d5db; margin: 4px 0; font-size: 14px;">🏠 ${propertyType}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </div>
            
            <!-- Expiry and CTA -->
            <p style="color: #d1d5db; font-size: 14px; line-height: 1.5; margin-bottom: 20px; text-align: center;">
              This invitation will expire on <strong>${new Date(
                invitationExpiry
              ).toLocaleString()}</strong>
            </p>
            
            <!-- Buttons -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="48%" align="center" style="padding-right: 4%;">
                  <a href="${acceptUrl}" style="background-color: #a98cfc; color: #fff; text-decoration: none; padding: 10px 0; border-radius: 6px; font-weight: bold; display: block; font-size: 15px;">Accept Invitation</a>
                </td>
                <td width="48%" align="center">
                  <a href="${declineUrl}" style="background-color: #4b5563; color: #fff; text-decoration: none; padding: 10px 0; border-radius: 6px; font-weight: bold; display: block; font-size: 15px;">Decline</a>
                </td>
              </tr>
            </table>
          </div>
          
          <!-- Benefits Section -->
          <div style="background-color: #1f2937; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h3 style="color: #a98cfc; margin-top: 0; margin-bottom: 12px; font-size: 17px;">Benefits of Accepting ✨</h3>
            
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="50%" style="vertical-align: top; padding-right: 10px;">
                  <ul style="color: #d1d5db; padding-left: 20px; margin-top: 0;">
                    <li style="margin-bottom: 6px; font-size: 14px;">Split rent and utilities costs</li>
                    <li style="margin-bottom: 6px; font-size: 14px;">Build connections with fellow students</li>
                  </ul>
                </td>
                <td width="50%" style="vertical-align: top;">
                  <ul style="color: #d1d5db; padding-left: 20px; margin-top: 0;">
                    <li style="margin-bottom: 6px; font-size: 14px;">Access to shared amenities</li>
                    <li style="margin-bottom: 6px; font-size: 14px;">Create memorable experiences</li>
                  </ul>
                </td>
              </tr>
            </table>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #1f2937;">
            <p style="color: #9ca3af; font-size: 13px; margin-bottom: 5px;">
              Need help? <a href="mailto:official.team.undefined@gmail.com" style="color: #a98cfc; text-decoration: none;">Contact our support team</a>
            </p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 12px;">
              © 2025 NinjaNest | All rights reserved
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "Roommate invitation sent successfully",
      invitationId,
    });
  } catch (error) {
    console.error("Error sending roommate invitation:", error);
    res.status(500).json({
      message: "Error sending invitation",
      error: error.message,
    });
  }
};

// Update the module.exports to include this new function
module.exports = {
  sendRegistrationOTP,
  sendForgotPasswordOTP,
  sendChangePasswordMail,
  sendRoommateInvitation, // Add this new controller
};
