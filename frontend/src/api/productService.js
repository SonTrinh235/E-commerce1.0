// SEE API DOC FOR USAGE GUIDE

import { apiFetch } from "./apiClient";

export function getAllProducts(page = 1, limit = 20) {
  console.log(`[Product Service]Calling getAllProducts(${page},${limit})`);
  const data = apiFetch(`/product/products/all`, {
    method: "GET",
    params: { page: page, limit: limit },
  });
  return data;
}

export function getProductsByCategoryAPI(categorySlug= '', page = 1, limit = 20) {
  console.log(`[Product Service]Calling getProductsByCategoryAPI(${categorySlug},${page},${limit})`);
  const data = apiFetch(`/product/products/category/${categorySlug}`, {
    method: "GET",
    params: { page: page, limit: limit },
  });
  return data;
}

export function searchProductsAPI(query='', page = 1, limit = 20) {
  console.log(`[Product Service]Calling searchProductsAPI(${query},${page},${limit})`);
  const data = apiFetch(`/search/products`, {
    method: "GET",
    params: { query: query, page: page, limit: limit },
  });
  return data;
}

export async function getProductById(productId) {
  console.log(`[Product Service]Calling getProductById(${productId})`);
  const data = await apiFetch(`/product/products/${productId}`, {
    method: "GET",
  });
  return data;
}

export async function getProductBySlug(categorySlug, slug) {
  console.log(`[Product Service]Calling getProductBySlug(${categorySlug}, ${slug})`);
  return await apiFetch(`/product/${categorySlug}/${slug}`, {
    method: "GET",
  });
}

export async function rateProduct(productId, userId, score, comment) {
  console.log(`[Product Service]Calling rateProduct(${productId})`);
  return await apiFetch(`/product/${productId}/rate`, {
    method: "POST",
    body: { userId, score, comment }
  });
}

// Đã sửa hàm này: Dùng apiFetch thay vì axios, đổi tên cho khớp với ShopCategory.jsx
export async function getAllCategoriesAPI() {
  console.log("[Product Service] Calling getAllCategoriesAPI");
  return await apiFetch(`/product/categories`, {
    method: "GET",
  });
}

export function createProduct(productData) {
  console.log("[Product Service]Calling createProduct");
  const data = apiFetch(`/product/`, {
    method: "POST",
    body: productData,
  });
  return data;
}

export function updateProduct(productId, productData) {
  console.log(`[Product Service]Calling updateProduct${productId}`);
  const data = apiFetch(`/product/${productId}`, {
    method: "PUT",
    body: productData,
  });
  return data;
}

export function deleteProduct(productId) {
  console.log(`[Product Service]Calling deleteProduct(${productId})`);
  const data = apiFetch(`/product/${productId}`, {
    method: "DELETE",
  });
  return data;
}

export function updateProductImageInfo(productId, imageInfo) {
  console.log(`[Product Service]Calling updataProductImageInfo(${productId})`);
  const data = apiFetch(`/product/${productId}/image`, {
    method: "PUT",
    body: imageInfo,
  });
  return data;
}