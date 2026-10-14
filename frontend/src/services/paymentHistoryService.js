import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getMyOrders = async () => {
    const response = await axios.get(
        `${API_URL}/api/payment/my-orders`
    );

    return response.data;
};