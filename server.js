const express = require("express");
const authRoutes = require("./auth/authRoutes");
require("dotenv").config();
const pool = require("./db");
const productRoutes = require("./routes/productRoutes");

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

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});