const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
    createPaymentOrder,
    verifyPayment
} = require("./paymentController");

router.post("/create-order", verifyToken, createPaymentOrder);
router.post("/verify", verifyToken, verifyPayment);

module.exports = router;