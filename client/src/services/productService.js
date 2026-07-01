// services/productService.js
// WHY: Houses all API requests for products.

import api from "./api";

export const getProducts = async (params = {}) => {
  const { data } = await api.get("/products", { params });
  return data.data; // Returns { products, pagination }
};

export const getFeaturedProducts = async () => {
  const { data } = await api.get("/products/featured");
  return data.data.products;
};

export const getProductById = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data.data.product;
};

export const getCategories = async () => {
  const { data } = await api.get("/products/categories");
  return data.data.categories;
};

export const addReview = async (productId, reviewData) => {
  const { data } = await api.post(`/products/${productId}/reviews`, reviewData);
  return data;
};
