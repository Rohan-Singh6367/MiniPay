const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        amount: {
            type: Number,
            required: true
        },

        currency: {
            type: String,
            default: "INR"
        },

        status: {
            type: String,
            enum: ["created", "paid", "failed"],
            default: "created"
        },

        paymentId: {
            type: String,
            default: null
        },

        razorpayOrderId: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Order", orderSchema);