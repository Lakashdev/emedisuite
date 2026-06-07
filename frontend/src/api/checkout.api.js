import api from "./axios.js";

export const checkoutApi = {
  createSession: (data) => api.post("/checkout-sessions", data),
  getSession: (id) => api.get(`/checkout-sessions/${id}`),
  confirmSession: (id) => api.post(`/checkout-sessions/${id}/confirm`),
};
