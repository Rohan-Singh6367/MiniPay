import axios from "axios";

const API_URL = "http://localhost:5000";

export const createPaymentOrder = async (amount) => {
    const response = await axios.post(
        `${API_URL}/api/payment/create-order`,
        {
            amount: amount
        }
    );

    return response.data;
};