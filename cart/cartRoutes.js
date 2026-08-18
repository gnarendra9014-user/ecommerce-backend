const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart
} = require("./cartController");

router.post("/add", verifyToken, addToCart);
router.get("/", verifyToken, getCart);
router.put("/update", verifyToken, updateCartItem);
router.delete("/remove/:product_id", verifyToken, removeFromCart);

module.exports = router;