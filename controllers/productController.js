const pool = require("../db");

// GET /products
const getAllProducts = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM products ORDER BY id");

        res.json(result.rows);
    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Failed to fetch products"
        });
    }
};

// GET /products/:id
const getProductById = async (req, res) => {
    try {
        const id = req.params.id;

        const result = await pool.query(
            "SELECT * FROM products WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Failed to fetch product"
        });
    }
};

// POST /products
const createProduct = async (req, res) => {
    try {
        const {
            name,
            category,
            price,
            size,
            delivery_date,
            discount,
            specifications
        } = req.body;

        const result = await pool.query(
            `INSERT INTO products
            (name, category, price, size, delivery_date, discount, specifications)
            VALUES ($1,$2,$3,$4,$5,$6,$7)
            RETURNING *`,
            [name, category, price, size, delivery_date, discount, specifications]
        );

        res.status(201).json({
            message: "Product created successfully",
            product: result.rows[0]
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Failed to create product"
        });
    }
};

// PUT /products/:id
const updateProduct = async (req, res) => {
    try {
        const id = req.params.id;

        const {
            name,
            category,
            price,
            size,
            delivery_date,
            discount,
            specifications
        } = req.body;

        const result = await pool.query(
            `UPDATE products
            SET
                name = $1,
                category = $2,
                price = $3,
                size = $4,
                delivery_date = $5,
                discount = $6,
                specifications = $7
            WHERE id = $8
            RETURNING *`,
            [name, category, price, size, delivery_date, discount, specifications, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            message: "Product updated successfully",
            product: result.rows[0]
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Failed to update product"
        });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct
};