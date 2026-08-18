const pool = require("../db");

// POST /orders/checkout
const checkout = async (req, res) => {

    const client = await pool.connect();

    try {

        const userId = req.user.id;

        await client.query("BEGIN");

        // Find user's cart
        const cartResult = await client.query(
            "SELECT * FROM carts WHERE user_id = $1",
            [userId]
        );

        if (cartResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Cart not found"
            });
        }

        const cartId = cartResult.rows[0].id;

        // Get cart items with product prices
        const itemsResult = await client.query(
            `
            SELECT
                ci.product_id,
                ci.quantity,
                p.price
            FROM cart_items ci
            JOIN products p
                ON ci.product_id = p.id
            WHERE ci.cart_id = $1
            `,
            [cartId]
        );

        if (itemsResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "Cart is empty"
            });
        }

        // Calculate total
        const totalAmount = itemsResult.rows.reduce((sum, item) => {
            return sum + Number(item.price) * item.quantity;
        }, 0);

        // Create order
        const orderResult = await client.query(
            `
            INSERT INTO orders (user_id, total_amount)
            VALUES ($1, $2)
            RETURNING *
            `,
            [userId, totalAmount]
        );

        const orderId = orderResult.rows[0].id;

        // Copy every cart item into order_items
        for (const item of itemsResult.rows) {

            await client.query(
                `
                INSERT INTO order_items
                (order_id, product_id, quantity, price)
                VALUES ($1, $2, $3, $4)
                `,
                [orderId, item.product_id, item.quantity, item.price]
            );

        }

        // Empty the cart
        await client.query(
            "DELETE FROM cart_items WHERE cart_id = $1",
            [cartId]
        );

        await client.query("COMMIT");

        res.status(201).json({
            message: "Order placed successfully",
            order: orderResult.rows[0]
        });

    } catch (err) {

        await client.query("ROLLBACK");

        console.error(err);

        res.status(500).json({
            error: "Checkout failed"
        });

    } finally {

        client.release();

    }

};
// GET /orders
const getOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT id, total_amount, status, created_at
             FROM orders
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [userId]
        );

        res.json({
            orders: result.rows
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Failed to fetch orders"
        });
    }
};
// GET /orders/:id
const getOrderById = async (req, res) => {
    try {
        const userId = req.user.id;
        const orderId = req.params.id;

        // Find the order
        const orderResult = await pool.query(
            `SELECT id, total_amount, status, created_at
             FROM orders
             WHERE id = $1 AND user_id = $2`,
            [orderId, userId]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        // Get products inside the order
        const itemsResult = await pool.query(
            `SELECT
                p.name,
                p.category,
                oi.quantity,
                oi.price
             FROM order_items oi
             JOIN products p
                ON oi.product_id = p.id
             WHERE oi.order_id = $1`,
            [orderId]
        );

        res.json({
            order: orderResult.rows[0],
            items: itemsResult.rows
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Failed to fetch order"
        });
    }
};

module.exports = {
    checkout,
    getOrders,
    getOrderById
};