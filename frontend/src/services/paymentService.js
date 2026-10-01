import axios from "axios";

const API_URL = "http://localhost:5000";

export const createPaymentOrder = async (
  token,
  amount
) => {
  const response = await axios.post(
    `${API_URL}/api/payment/create-order`,
    {
      amount: amount
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};