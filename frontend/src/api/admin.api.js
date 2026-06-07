import api from "./axios.js";

export const adminApi = {
  getStats: () => api.get("/admin/stats"),
  getOrders: (params) => api.get("/admin/orders", { params }),
  updateOrderStatus: (id, status) => api.patch(`/admin/orders/${id}/status`, { status }),
};
