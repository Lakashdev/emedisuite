import api from "./axios.js";

export const ordersApi = {
  list: () => api.get("/orders"),
  getById: (id) => api.get(`/orders/${id}`),
  place: (data) => api.post("/orders", data),
  cancel: (id, reason) => api.post(`/orders/${id}/cancel`, { reason }),
};
