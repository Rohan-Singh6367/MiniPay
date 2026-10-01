import axios from "axios";

const API_URL = "http://localhost:5000";

export const getMyOrders = async (token) => {
  const response = await axios.get(
    `${API_URL}/api/payment/my-orders`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};