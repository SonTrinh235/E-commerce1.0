// SEE API DOC FOR USAGE GUIDE

import { apiFetch } from "./apiClient";

export async function getCartByUserId(userId) {
  console.log("[Cart Service] Calling getCartByUserId");
  const data = await apiFetch(`/cart/${userId}`, {
    method: "GET",
  });
  return data;
}

export async function addProductToCart(userId, productsInfo) {
  console.log("[Cart Service] Calling addProductToCart");
  const data = await apiFetch(`/cart/${userId}/add`, {
    method: "POST",
    body: productsInfo,
  });
  return data;
}

export function updateProductQuantity(userId, singleProductInfo) {
  console.log("[Cart Service] Calling updateProductQuantity");
  const data = apiFetch(`/cart/${userId}/update`, {
    method: "PUT",
    body: singleProductInfo,
  });
  return data;
}

export function removeProductFromCart(userId, productId) {
  console.log("[Cart Service] Calling removeProductFromCart");
  const data = apiFetch(`/cart/${userId}/remove`, {
    method: "DELETE",
    body: { productId: productId },
  });
  return data;
}
