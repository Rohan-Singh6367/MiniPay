const express = require("express");

const {
    createOrder,
    verifyPayment,
    getMyOrders
} = require("../controllers/paymentController");

const router = express.Router();

router.post("/create-order", createOrder);

router.post("/verify", verifyPayment);

router.get("/my-orders", getMyOrders);

module.exports = router;