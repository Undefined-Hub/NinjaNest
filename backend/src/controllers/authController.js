const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { generateToken, verifyToken } = require("../utils/jwtHelper");
const { sendChangePasswordMail } = require("./mailController");
const { validateInput } = require("../utils/validateInput");
const z = require("zod");

// ! Validation schema
// ! Register schema
const registerSchema = z.object({
  name: z.string().min(3).max(50),
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
});

// ! Change Password schema
const changePasswordSchema = z.object({
  email: z.string().email(),
  oldPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

// ! Login schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// ! Register a new user
const registerUser = async (req, res, next) => {
  try {
    const { name, username, email, password } = validateInput(
      registerSchema,
      req.body
    );
    // ! Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    // ! If doesn't exist, create a new user
    const newUser = new User({ name, username, email, password });
    const salt = await bcrypt.genSalt(10); // ! Salt to hash the password
    newUser.password = await bcrypt.hash(password, salt); // ! Hash the password
    await newUser.save(); // ! Save the user to the database
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    next(error);
  }
};

// ? Login user
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = validateInput(loginSchema, req.body);
    // Check if user exists
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const payload = { user: { id: user.id } };

    // Generate Access & Refresh Tokens
    const accessToken = generateToken(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    }); // Shorter lifespan
    const refreshToken = generateToken(
      payload,
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    ); // Longer lifespan

    // Store refresh token securely (e.g., in DB or cookies)
    user.refreshToken = refreshToken;
    await user.save();

    // Send tokens (access in JSON, refresh as HTTP-only cookie)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // Prevents access via JavaScript
      secure: true, // Use only in HTTPS
      sameSite: "Strict",
    });

    res.status(200).json({
      message: "Logged in successfully",
      accessToken,
      user: {
        username: user.username,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ? Refresh Access Token
const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies; // Get from HTTP-only cookie
    console.log("refreshToken", refreshToken);
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not found" });
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.user.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Generate new access token
    const newAccessToken = generateToken(
      { user: { id: user.id } },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired refresh token" });
    // next(error);
  }
};

// ? Change password
const changePassword = async (req, res, next) => {
  const { purpose } = req.body;
  if (purpose === "change") {
    const { email, oldPassword, newPassword } = validateInput(
      changePasswordSchema,
      req.body
    );
    try {
      // ! Check if user exists
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return res.status(400).json({ message: "User does not exists" });
      }
      // ! Check if old password is correct
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid password" });
      }
      const salt = await bcrypt.genSalt(10); // ! Salt to hash the password
      user.password = await bcrypt.hash(newPassword, salt); // ! Hash the new password
      await user.save(); // ! Save the user to the database
      sendChangePasswordMail(email); // ! Send email to user about password change
      res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
      next(error);
    }
  } else if (purpose === "forgot") {
    const { email, password } = req.body;
    try {
      // ! Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "User does not exists" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      res
        .status(200)
        .json({ message: "New password has been set successfully" });
    } catch (error) {
      next(error);
    }
  } else {
    res.status(400).json({ message: "Invalid purpose" });
  }
};

// ? Logout user
const logoutUser = (req, res) => {};

module.exports = {
  registerUser,
  loginUser,
  changePassword,
  logoutUser,
  refreshAccessToken,
};
