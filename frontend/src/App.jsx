import { useEffect, useState } from "react";
import "./index.css";
import axios from "axios";
import { createPaymentOrder } from "./services/paymentService";
import { getMyOrders } from "./services/paymentHistoryService";

function App() {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  window.location.reload();
};

  const [loading, setLoading] = useState(false);

  // Payment amount
  const [amount, setAmount] = useState(499);
  

  // Payment history
  const [orders, setOrders] = useState([]);

  const token = localStorage.getItem("token");

  // ==========================================
  // LOAD PAYMENT HISTORY
  // ==========================================

  const loadOrders = async () => {
    try {
      if (!token) {
        return;
      }

      const data = await getMyOrders(token);

      setOrders(data.orders);
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
      // Convert input to number
      const paymentAmount = Number(amount);

      // Validate amount
      if (!paymentAmount || paymentAmount <= 0) {
        alert("Please enter a valid amount");
        return;
      }

      // Optional maximum limit
      if (paymentAmount > 100000) {
        alert("Maximum payment amount is ₹100,000");
        return;
      }

      if (!token) {
        alert("Please login first");
        return;
      }

      setLoading(true);

      // ========================================
      // CREATE ORDER
      // ========================================

      const data = await createPaymentOrder(
        token,
        paymentAmount
      );

      console.log("Order created:", data);

      // ========================================
      // RAZORPAY CHECKOUT
      // ========================================

      const options = {
        key: data.razorpayKey,

        // Convert rupees to paise
        amount: data.order.amount * 100,

        currency: data.order.currency,

        name: "MiniPay",

        description: "MiniPay Payment",

        order_id: data.order.razorpayOrderId,

        // ======================================
        // PAYMENT SUCCESS
        // ======================================

        handler: async function (response) {
          try {
            console.log(
              "Payment successful:",
              response
            );

            // ====================================
            // VERIFY PAYMENT
            // ====================================

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
                },

                {
                  headers: {
                    Authorization:
                      `Bearer ${token}`
                  }
                }
              );

            console.log(
              "Verification response:",
              verifyResponse.data
            );

            alert(
              "Payment verified successfully! 🎉"
            );

            // Refresh payment history
            loadOrders();

          } catch (error) {

            console.error(
              "Verification error:",
              error
            );

            alert(
              error.response?.data?.message ||
              "Payment verification failed"
            );
          }
        },

        // ======================================
        // PREFILL USER INFORMATION
        // ======================================

        prefill: {
          name: "Rohan",
          email: "rohan@example.com"
        },

        // ======================================
        // RAZORPAY THEME
        // ======================================

        theme: {
          color: "#111827"
        }
      };

      // Create Razorpay instance
      const razorpay =
        new window.Razorpay(options);

      // Open Razorpay
      razorpay.open();

    } catch (error) {

      console.error(
        "Payment error:",
        error
      );

      alert(
        error.response?.data?.message ||
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

        {/* ==================================
            HEADER
        ================================== */}


        <div className="top-bar">

  <div>
    <strong>
      {user ? user.name : "Guest"}
    </strong>

    {user && (
      <p>
        {user.email}
      </p>
    )}
  </div>

  {token && (
    <button
      className="logout-button"
      onClick={handleLogout}
    >
      Logout
    </button>
  )}

</div>

        <h1>MiniPay</h1>

        <p className="subtitle">
          Simple & Secure Payments
        </p>


        {/* ==================================
            AMOUNT SECTION
        ================================== */}

        <div className="product">

          <div>
            <h2>Make a Payment</h2>

            <p>
              Enter the amount you want to pay
            </p>
          </div>

        </div>


        {/* ==================================
            AMOUNT INPUT
        ================================== */}

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
              setAmount(e.target.value)
            }
            placeholder="Enter amount"
          />

        </div>


        {/* ==================================
            PAYMENT BUTTON
        ================================== */}

        <button
          className="pay-button"
          onClick={handlePayment}
          disabled={loading}
        >
          {loading
            ? "Opening Payment..."
            : `Pay ₹${amount || 0}`}
        </button>

        {/* ==================================
    DASHBOARD SUMMARY
================================== */}

<div className="summary">

  <div className="summary-card">
    <p>Total Payments</p>

    <h2>
      {
        orders.filter(
          (order) => order.status === "paid"
        ).length
      }
    </h2>
  </div>


  <div className="summary-card">
    <p>Total Paid</p>

    <h2>
      ₹
      {
        orders
          .filter(
            (order) => order.status === "paid"
          )
          .reduce(
            (total, order) =>
              total + Number(order.amount),
            0
          )
      }
    </h2>
  </div>

</div>


        {/* ==================================
            TRANSACTION HISTORY
        ================================== */}

        <div className="history">

          <h2>
            Transaction History
          </h2>

          {orders.length === 0 ? (

            <p className="no-orders">
              No transactions yet.
            </p>

          ) : (

            orders.map((order) => (

              <div
                className="transaction"
                key={order._id}
              >

                <div>

                  <h3>
                    MiniPay Payment
                  </h3>

                  <p>
                    {new Date(
                      order.createdAt
                    ).toLocaleString()}
                  </p>

                </div>


                <div className="transaction-right">

                  <strong>
                    ₹{order.amount}
                  </strong>

                  <span
                    className={
                      order.status === "paid"
                        ? "status paid"
                        : "status pending"
                    }
                  >
                    {order.status}
                  </span>

                </div>

              </div>

            ))

          )}

        </div>

      </div>

    </div>
  );
}

export default App;