const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendOTPEmail = require("../utils/mailer");

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if email already exists
        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user
        const result = await pool.query(
            `INSERT INTO users (name, email, password)
             VALUES ($1, $2, $3)
             RETURNING id, name, email, role`,
            [name, email, hashedPassword]
        );

        res.status(201).json({
            message: "User registered successfully",
            user: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Registration failed"
        });
    }
};
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const user = result.rows[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            message: "Login successful",
            token
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Login failed"
        });
    }
};
// POST /auth/send-otp
const sendOTP = async (req, res) => {

    try {

        const { email } = req.body;

        const user = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const expiry = new Date(Date.now() + 5 * 60 * 1000);

        await pool.query(
            `UPDATE users
             SET otp = $1,
                 otp_expiry = $2
             WHERE email = $3`,
            [otp, expiry, email]
        );

        await sendOTPEmail(email, otp);

        res.json({
            message: "OTP sent successfully"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: "Failed to send OTP"
        });

    }

};
// POST /auth/verify-otp
const verifyOTP = async (req, res) => {
    try {

        const { email, otp } = req.body;

        const user = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const currentUser = user.rows[0];

        if (currentUser.otp !== otp) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        if (new Date(currentUser.otp_expiry) < new Date()) {
            return res.status(400).json({
                message: "OTP expired"
            });
        }

        // Clear OTP after successful verification
        await pool.query(
            `UPDATE users
             SET otp = NULL,
                 otp_expiry = NULL
             WHERE email = $1`,
            [email]
        );

        res.json({
            message: "OTP verified successfully"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: "OTP verification failed"
        });

    }
};
// POST /auth/forgot-password
const forgotPassword = async (req, res) => {
    try {

        const { email } = req.body;

        const user = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const expiry = new Date(Date.now() + 5 * 60 * 1000);

        await pool.query(
            `UPDATE users
             SET otp = $1,
                 otp_expiry = $2
             WHERE email = $3`,
            [otp, expiry, email]
        );

        await sendOTPEmail(email, otp);

        res.json({
            message: "Password reset OTP sent"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: "Failed to send reset OTP"
        });

    }
};
// POST /auth/reset-password
const resetPassword = async (req, res) => {
    try {

        const { email, otp, newPassword } = req.body;

        const user = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const currentUser = user.rows[0];

        if (currentUser.otp !== otp) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        if (new Date(currentUser.otp_expiry) < new Date()) {
            return res.status(400).json({
                message: "OTP expired"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await pool.query(
            `UPDATE users
             SET password = $1,
                 otp = NULL,
                 otp_expiry = NULL
             WHERE email = $2`,
            [hashedPassword, email]
        );

        res.json({
            message: "Password reset successfully"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: "Failed to reset password"
        });

    }
};

module.exports = {
    register,
    login,
    sendOTP,
    verifyOTP,
    forgotPassword,
    resetPassword

};