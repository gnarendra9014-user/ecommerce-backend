const Razorpay = require("razorpay");
const pool = require("../db");
const crypto = require("crypto");
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// POST /payment/create-order
const createPaymentOrder = async (req, res) => {
    try {

        const userId = req.user.id;
        const { orderId } = req.body;

        // Verify the order belongs to this user
        const orderResult = await pool.query(
            `SELECT * FROM orders
             WHERE id = $1 AND user_id = $2`,
            [orderId, userId]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        const order = orderResult.rows[0];

        const options = {
            amount: Number(order.total_amount) * 100,
            currency: "INR",
            receipt: `order_${order.id}`
        };

        const razorpayOrder = await razorpay.orders.create(options);

        // Save Razorpay Order ID
        await pool.query(
            `UPDATE orders
             SET razorpay_order_id = $1
             WHERE id = $2`,
            [razorpayOrder.id, order.id]
        );

        res.json({
            message: "Payment order created",
            razorpayOrder
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Failed to create payment order"
        });
    }
};
// POST /payment/verify
const verifyPayment = async (req, res) => {
    try {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        // Create expected signature
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({
                message: "Payment verification failed"
            });
        }

        // Mark order as paid
        await pool.query(
            `UPDATE orders
             SET payment_status = 'Paid',
                 payment_id = $1
             WHERE razorpay_order_id = $2`,
            [razorpay_payment_id, razorpay_order_id]
        );

        res.json({
            message: "Payment verified successfully"
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Payment verification failed"
        });
    }
};

module.exports = {
    createPaymentOrder,
    verifyPayment
};