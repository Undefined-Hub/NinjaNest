const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
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
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ? Logout user
const logoutUser = (req, res) => {};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};
