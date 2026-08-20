const express = require("express");
const router = express.Router();

const {
    register,
    login,
    sendOTP,
    verifyOTP,
    forgotPassword,
    resetPassword
} = require("./authController");

const {
    registerValidation,
    loginValidation,
    checkValidation
} = require("../middleware/validation");

router.post("/register", registerValidation, checkValidation, register);
router.post("/login", loginValidation, checkValidation, login);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */



module.exports = router;