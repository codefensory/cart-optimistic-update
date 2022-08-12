import axios from "axios";

export const orderServer = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/order`,
});
