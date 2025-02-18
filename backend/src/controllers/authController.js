const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { generateToken } = require("../utils/jwtHelper");
// ! Register a new user
const registerUser = async (req, res) => {
  const { name, username, email, password } = req.body;
  try {
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
  } 
  catch (error) {
    next(error);
  }
};

// ? Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    // ! Check if user exists
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    // ! Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const payload = {
      user: {
        id: user.id,
      },
    };
    // ! Generate a token & send with the user id
    const token = generateToken(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: "Logged in successfully", token });
  } 
  catch (error) {
    next(error);
  }
};

// ? Logout user
const logoutUser = (req, res) => {};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};
