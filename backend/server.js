
const dns = require("dns");

dns.setServers([
    "8.8.8.8",
    "8.8.4.4"
]);

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "MiniPay API is running"
    });
});

const PORT = process.env.PORT || 5000;

// Connect MongoDB and start server
mongoose
    .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000
    })
    .then(() => {
        console.log("MongoDB connected successfully");

        app.listen(PORT, () => {
            console.log(
                `Server running on http://localhost:${PORT}`
            );
        });
    })
    .catch((error) => {
        console.error(
            "MongoDB connection failed:",
            error.message
        );
    });
