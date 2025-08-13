import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  withCredentials: true, // use cookies
});

// Optional: response error normalization
api.interceptors.response.use(
  (r) => r,
  (error) => {
    const message = error?.response?.data?.message || error.message || "Unexpected error";
    return Promise.reject(new Error(message));
  }
);