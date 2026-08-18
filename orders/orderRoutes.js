const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
    checkout,
    getOrders,
    getOrderById
} = require("./orderController");

router.post("/checkout", verifyToken, checkout);
router.get("/", verifyToken, getOrders);
router.get("/:id", verifyToken, getOrderById);

module.exports = router;