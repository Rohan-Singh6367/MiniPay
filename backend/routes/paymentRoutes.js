const express = require("express");

const {
    createOrder,
    verifyPayment,
    getMyOrders
} = require("../controllers/paymentController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// Create Razorpay order
router.post(
    "/create-order",
    authMiddleware,
    createOrder
);


// Verify Razorpay payment
router.post(
    "/verify",
    authMiddleware,
    verifyPayment
);
router.get(
    "/my-orders",
    authMiddleware,
    getMyOrders
);


module.exports = router;