const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ==========================================
// CREATE PAYMENT ORDER
// ==========================================

const createOrder = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                message: "Valid amount is required"
            });
        }

        const amountInPaise = Math.round(amount * 100);

        const options = {
            amount: amountInPaise,
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const razorpayOrder =
            await razorpay.orders.create(options);

        const order = await Order.create({
            amount: amount,
            currency: "INR",
            status: "created",
            razorpayOrderId: razorpayOrder.id
        });

        res.status(201).json({
            message: "Order created successfully",

            order: {
                id: order._id,
                amount: order.amount,
                currency: order.currency,
                status: order.status,
                razorpayOrderId:
                    razorpayOrder.id
            },

            razorpayKey:
                process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error(
            "Create order error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to create payment order",

            error: error.message
        });
    }
};


// ==========================================
// VERIFY PAYMENT
// ==========================================

const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                message:
                    "Payment details are required"
            });
        }

        const generatedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(
                    `${razorpay_order_id}|${razorpay_payment_id}`
                )
                .digest("hex");

        if (
            generatedSignature !==
            razorpay_signature
        ) {
            return res.status(400).json({
                message:
                    "Payment verification failed"
            });
        }

        const order =
            await Order.findOneAndUpdate(
                {
                    razorpayOrderId:
                        razorpay_order_id
                },
                {
                    status: "paid",
                    paymentId:
                        razorpay_payment_id
                },
                {
                    new: true
                }
            );

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.json({
            message:
                "Payment verified successfully",

            order: {
                id: order._id,
                amount: order.amount,
                currency: order.currency,
                status: order.status,
                paymentId:
                    order.paymentId,
                razorpayOrderId:
                    order.razorpayOrderId
            }
        });

    } catch (error) {
        console.error(
            "Payment verification error:",
            error
        );

        res.status(500).json({
            message:
                "Payment verification failed",

            error: error.message
        });
    }
};


// ==========================================
// PAYMENT HISTORY
// ==========================================

const getMyOrders = async (req, res) => {
    try {
        const orders =
            await Order.find({})
                .sort({
                    createdAt: -1
                });

        res.json({
            message:
                "Payment history fetched successfully",

            orders
        });

    } catch (error) {
        console.error(
            "Get payment history error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch payment history",

            error: error.message
        });
    }
};


module.exports = {
    createOrder,
    verifyPayment,
    getMyOrders
};