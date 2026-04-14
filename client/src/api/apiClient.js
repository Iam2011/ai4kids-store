import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://ai4kids-api.onrender.com/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
