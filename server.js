const express = require("express");
const authRoutes = require("./auth/authRoutes");

console.log("JWT Secret:", process.env.JWT_SECRET);
const pool = require("./db");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./cart/cartRoutes");
const orderRoutes = require("./orders/orderRoutes");
const paymentRoutes = require("./payment/paymentRoutes");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const app = express();

app.use(express.json());

pool.query("SELECT NOW()", (err, result) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Database connected!");
        console.log(result.rows);
    }
});

app.use("/products", productRoutes);
app.use("/auth", authRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

app.use("/payment", paymentRoutes);
app.use(
    "/api-docs",
    swaggerUI.serve,
    swaggerUI.setup(swaggerSpec)
);
app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
