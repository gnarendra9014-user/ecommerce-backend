const express = require("express");
const authRoutes = require("./auth/authRoutes");
require("dotenv").config();
console.log("JWT Secret:", process.env.JWT_SECRET);
const pool = require("./db");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./cart/cartRoutes");

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

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
