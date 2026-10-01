// DNS configuration
const dns = require("dns");

dns.setServers([
    "8.8.8.8",
    "8.8.4.4"
]);

// Packages
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// Routes
const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "MiniPay API is running"
    });
});

// Port
const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");

        // Start server only after MongoDB connection
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });