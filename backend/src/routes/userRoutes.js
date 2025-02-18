const express = require("express");
const router = express.Router();

const { fetchUser, updateUser } = require("../controllers/userController");

router.get("/getUser/:username", fetchUser);

router.put("/updateUser/:id", updateUser);

module.exports = router;
