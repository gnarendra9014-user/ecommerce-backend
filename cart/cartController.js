const pool = require("../db");

// POST /cart/add
const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { product_id, quantity } = req.body;

        // Check if the user already has a cart
        let cart = await pool.query(
            "SELECT * FROM carts WHERE user_id = $1",
            [userId]
        );

        // Create a cart if it doesn't exist
        if (cart.rows.length === 0) {
            cart = await pool.query(
                "INSERT INTO carts (user_id) VALUES ($1) RETURNING *",
                [userId]
            );
        }

        const cartId = cart.rows[0].id;

        // Add product to cart
        const result = await pool.query(
            `INSERT INTO cart_items (cart_id, product_id, quantity)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [cartId, product_id, quantity]
        );

        res.status(201).json({
            message: "Product added to cart",
            cartItem: result.rows[0]
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Failed to add product"
        });
    }
};

// GET /cart
const getCart = async (req, res) => {
    try {

        const userId = req.user.id;

        const result = await pool.query(
            `
            SELECT
                p.id AS product_id,
                p.name,
                p.category,
                p.price,
                ci.quantity
            FROM carts c
            JOIN cart_items ci
                ON c.id = ci.cart_id
            JOIN products p
                ON ci.product_id = p.id
            WHERE c.user_id = $1
            `,
            [userId]
        );

        res.json({
            cart: result.rows
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: "Failed to fetch cart"
        });

    }
};

// PUT /cart/update
const updateCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { product_id, quantity } = req.body;

        // Find user's cart
        const cart = await pool.query(
            "SELECT * FROM carts WHERE user_id = $1",
            [userId]
        );

        if (cart.rows.length === 0) {
            return res.status(404).json({
                message: "Cart not found"
            });
        }

        const cartId = cart.rows[0].id;

        // Update quantity
        const result = await pool.query(
            `UPDATE cart_items
             SET quantity = $1
             WHERE cart_id = $2 AND product_id = $3
             RETURNING *`,
            [quantity, cartId, product_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Product not found in cart"
            });
        }

        res.json({
            message: "Cart updated successfully",
            cartItem: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Failed to update cart"
        });
    }
};

// DELETE /cart/remove/:product_id
const removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.product_id;

        // Find user's cart
        const cart = await pool.query(
            "SELECT * FROM carts WHERE user_id = $1",
            [userId]
        );

        if (cart.rows.length === 0) {
            return res.status(404).json({
                message: "Cart not found"
            });
        }

        const cartId = cart.rows[0].id;

        // Remove product
        const result = await pool.query(
            `DELETE FROM cart_items
             WHERE cart_id = $1 AND product_id = $2
             RETURNING *`,
            [cartId, productId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Product not found in cart"
            });
        }

        res.json({
            message: "Product removed from cart",
            removedItem: result.rows[0]
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Failed to remove product"
        });
    }
};

module.exports = {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart
    
};