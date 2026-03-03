import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: false, // keep true if your backend uses cookies/session
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // optional: normalize error
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err.message ||
      "Something went wrong";
    return Promise.reject(new Error(msg));
  }
);
