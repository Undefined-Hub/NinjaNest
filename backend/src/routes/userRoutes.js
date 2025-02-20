const express = require("express");
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

const { fetchUser, updateUser } = require("../controllers/userController");

router.get("/getUser/:username",authMiddleware(),  fetchUser);

router.put("/updateUser/:id",authMiddleware(),  updateUser);

module.exports = router;
