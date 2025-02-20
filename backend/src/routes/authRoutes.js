const express = require("express");
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();


const { registerUser, loginUser, changePassword, refreshAccessToken } = require("../controllers/authController");

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/change-password",authMiddleware(), changePassword);

router.post("/refresh", refreshAccessToken);


module.exports = router;
