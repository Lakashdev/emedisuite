import api from "./axios.js";

export const cartApi = {
  get: () => api.get("/cart"),
  addItem: (data) => api.post("/cart/items", data),
  updateItem: (itemId, data) => api.put(`/cart/items/${itemId}`, data),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`),
  clear: () => api.delete("/cart"),
};
