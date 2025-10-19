import { apiFetch } from "./apiClient";

export function getAllProducts(page = 1, limit = 20) {
  console.log(`Calling getAllProducts(${page},${limit})`);
  const data = apiFetch(`/product/products/all`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    params: { page: page, limit: limit },
  });
  return data;
}

export function createProduct(productData) {
  console.log("Calling createProduct");
  const data = apiFetch(`/product/create-product`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: productData,
  });
  return data;
}

export function updateProduct(productId, productData) {
  console.log(`Calling updateProduct${productId}`);
  const data = apiFetch(`/product/update-product/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: productData,
  });
  return data;
}

export function deleteProduct(productId) {
  console.log(`Calling deleteProduct(${productId})`);
  const data = apiFetch(`/product/delete-product/${productId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return data;
}

export function updateProductImageInfo(productId, imageInfo) {
  console.log(`Calling updataProductImageInfo(${productId})`);
  const data = apiFetch(`/product/update-product-image/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: imageInfo,
  });
  return data;
}
