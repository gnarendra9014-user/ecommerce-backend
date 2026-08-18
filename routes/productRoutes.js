const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct
} = require("../controllers/productController");

// GET all products
router.get("/", getAllProducts);

// GET single product
router.get("/:id", getProductById);

// CREATE product
router.post("/", verifyToken, isAdmin, createProduct);

// UPDATE product
router.put("/:id", updateProduct);

module.exports = router;