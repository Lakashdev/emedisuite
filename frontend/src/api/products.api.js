import api from "./axios.js";

export const productsApi = {
  list: (params) => api.get("/products", { params }),
  getBySlug: (slug) => api.get(`/products/slug/${slug}`),
  getById: (id) => api.get(`/products/${id}`),
};
