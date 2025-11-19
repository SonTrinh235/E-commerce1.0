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

export function getProductsByCategoryAPI(category= '', page = 1, limit = 20) {
  console.log(`[Product Service]Calling getProductsByCategoryAPI(${category}${page},${limit})`);
  const data = apiFetch(`/product/products/category/${category}`, {
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


export function createProduct(productData) {
  console.log("[Product Service]Calling createProduct");
  const data = apiFetch(`/product/create-product`, {
    method: "POST",
    body: productData,
  });
  return data;
}

export function updateProduct(productId, productData) {
  console.log(`[Product Service]Calling updateProduct${productId}`);
  const data = apiFetch(`/product/update-product/${productId}`, {
    method: "PUT",
    body: productData,
  });
  return data;
}

export function deleteProduct(productId) {
  console.log(`[Product Service]Calling deleteProduct(${productId})`);
  const data = apiFetch(`/product/delete-product/${productId}`, {
    method: "DELETE",
  });
  return data;
}

export function updateProductImageInfo(productId, imageInfo) {
  console.log(`[Product Service]Calling updataProductImageInfo(${productId})`);
  const data = apiFetch(`/product/update-product-image/${productId}`, {
    method: "PUT",
    body: imageInfo,
  });
  return data;
}
