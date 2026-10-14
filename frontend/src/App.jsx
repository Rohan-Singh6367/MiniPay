import { useEffect, useState } from "react";
import "./index.css";
import axios from "axios";

import { createPaymentOrder } from "./services/paymentService";
import { getMyOrders } from "./services/paymentHistoryService";

function App() {
    const [amount, setAmount] = useState(499);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    // ==========================================
    // LOAD TRANSACTION HISTORY
    // ==========================================

    const loadOrders = async () => {
        try {
            const data = await getMyOrders();

            setOrders(data.orders || []);
        } catch (error) {
            console.error(
                "Failed to load payment history:",
                error
            );
        }
    };

    useEffect(() => {
       loadOrders();
    }, []);

    // ==========================================
    // PAYMENT
    // ==========================================

    const handlePayment = async () => {
        try {
            const paymentAmount = Number(amount);

            if (!paymentAmount || paymentAmount <= 0) {
                alert("Please enter a valid amount");
                return;
            }

            if (paymentAmount > 100000) {
                alert(
                    "Maximum payment amount is ₹100,000"
                );
                return;
            }

            setLoading(true);

            // Create Razorpay order
            const data =
                await createPaymentOrder(
                    paymentAmount
                );

            console.log(
                "Order created:",
                data
            );

            // Razorpay Checkout
            const options = {
                key: data.razorpayKey,

                amount:
                    data.order.amount * 100,

                currency:
                    data.order.currency,

                name: "MiniPay",

                description:
                    "MiniPay Payment",

                order_id:
                    data.order.razorpayOrderId,

                handler: async function (
                    response
                ) {
                    try {
                        console.log(
                            "Payment successful:",
                            response
                        );

                        // Verify payment
                        const verifyResponse =
                            await axios.post(
                                "http://localhost:5000/api/payment/verify",
                                {
                                    razorpay_order_id:
                                        response.razorpay_order_id,

                                    razorpay_payment_id:
                                        response.razorpay_payment_id,

                                    razorpay_signature:
                                        response.razorpay_signature
                                }
                            );

                        console.log(
                            "Verification response:",
                            verifyResponse.data
                        );

                        alert(
                            "Payment successful and verified! 🎉"
                        );

                        // Refresh history
                        loadOrders();

                    } catch (error) {
                        console.error(
                            "Verification error:",
                            error
                        );

                        alert(
                            error.response
                                ?.data?.message ||
                            "Payment verification failed"
                        );
                    }
                },

                prefill: {
                    name: "MiniPay Customer",
                    email: "customer@example.com"
                },

                theme: {
                    color: "#111827"
                }
            };

            const razorpay =
                new window.Razorpay(
                    options
                );

            razorpay.open();

        } catch (error) {
            console.error(
                "Payment error:",
                error
            );

            alert(
                error.response
                    ?.data?.message ||
                "Failed to create payment order"
            );

        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // UI
    // ==========================================

    return (
        <div className="app">

            <div className="payment-card">

                <h1>MiniPay</h1>

                <p className="subtitle">
                    Simple & Secure Payments
                </p>

                <div className="product">

                    <div>
                        <h2>
                            Make a Payment
                        </h2>

                        <p>
                            No login required
                        </p>
                    </div>

                </div>

                <div className="amount-section">

                    <label htmlFor="amount">
                        Amount (₹)
                    </label>

                    <input
                        id="amount"
                        type="number"
                        min="1"
                        max="100000"
                        value={amount}
                        onChange={(e) =>
                            setAmount(
                                e.target.value
                            )
                        }
                        placeholder="Enter amount"
                    />

                </div>

                <button
                    className="pay-button"
                    onClick={handlePayment}
                    disabled={loading}
                >
                    {loading
                        ? "Opening Payment..."
                        : `Pay ₹${amount || 0}`}
                </button>

                {/* SUMMARY */}

                <div className="summary">

                    <div className="summary-card">

                        <p>
                            Total Payments
                        </p>

                        <h2>
                            {
                                orders.filter(
                                    (order) =>
                                        order.status ===
                                        "paid"
                                ).length
                            }
                        </h2>

                    </div>

                    <div className="summary-card">

                        <p>
                            Total Paid
                        </p>

                        <h2>
                            ₹
                            {
                                orders
                                    .filter(
                                        (order) =>
                                            order.status ===
                                            "paid"
                                    )
                                    .reduce(
                                        (
                                            total,
                                            order
                                        ) =>
                                            total +
                                            Number(
                                                order.amount
                                            ),
                                        0
                                    )
                            }
                        </h2>

                    </div>

                </div>

                {/* TRANSACTION HISTORY */}

                <div className="history">

                    <h2>
                        Transaction History
                    </h2>

                    {orders.length === 0 ? (

                        <p className="no-orders">
                            No transactions yet.
                        </p>

                    ) : (

                        orders.map(
                            (order) => (

                                <div
                                    className="transaction"
                                    key={
                                        order._id
                                    }
                                >

                                    <div>

                                        <h3>
                                            MiniPay Payment
                                        </h3>

                                        <p>
                                            {
                                                new Date(
                                                    order.createdAt
                                                ).toLocaleString()
                                            }
                                        </p>

                                    </div>

                                    <div className="transaction-right">

                                        <strong>
                                            ₹
                                            {
                                                order.amount
                                            }
                                        </strong>

                                        <span
                                            className={
                                                order.status ===
                                                "paid"
                                                    ? "status paid"
                                                    : "status pending"
                                            }
                                        >
                                            {
                                                order.status
                                            }
                                        </span>

                                    </div>

                                </div>

                            )
                        )

                    )}

                </div>

            </div>

        </div>
    );
}

export default App;