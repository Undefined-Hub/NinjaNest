const express = require("express");
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

const {initiatePayment, callBack, checkPayment} = require("../controllers/paymentController");


router.post("/initiate",  initiatePayment); // Create a new property
router.post("/callback",  checkPayment); // Create a new property




module.exports = router;
