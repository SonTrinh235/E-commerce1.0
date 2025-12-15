// SEE API DOC FOR USAGE GUIDE

import { apiFetch } from "./apiClient";

export async function getCartByUserId(userId) {
  console.log("[Cart Service] Calling getCartByUserId");
  const data = await apiFetch(`/cart/${userId}`, {
    method: "GET",
  });
  return data;
}

// export async function addProductToCart(userId, productsInfo) {
//   console.log("[Cart Service] Calling addProductToCart");
//   const data = await apiFetch(`/cart/${userId}/add`, {
//     method: "POST",
//     body: productsInfo,
//   });
//   return data;
// }

export async function addProductToCart(userId, product, quantity) {
  console.log("[Cart Service] Calling addProductToCart");
  const payload = {
    productId: product._id || product.id,
    productName: product.name || product.productName,
    productImageUrl: product.image || product.productImageUrl || product.imageInfo?.url || "", 
    quantity: quantity
  };
  const data = await apiFetch(`/cart/${userId}/add`, {
    method: "POST",
    body: payload,
  });
  return data;
}
export async function updateProductQuantity(userId, arg2, arg3) {
  console.log("[Cart Service] Calling updateProductQuantity");
  
  let payload = {};

  if (typeof arg2 === 'object' && arg2 !== null && arg2.productId) {
      payload = {
          productId: arg2.productId,
          quantity: arg2.quantity
      };
  } else {
      payload = {
          productId: arg2,
          quantity: arg3
      };
  }
  const data = await apiFetch(`/cart/${userId}/update`, {
    method: "PUT",
    body: payload,
  });
  return data;
}

// export function updateProductQuantity(userId, singleProductInfo) {
//   console.log("[Cart Service] Calling updateProductQuantity");
//   const data = apiFetch(`/cart/${userId}/update`, {
//     method: "PUT",
//     body: singleProductInfo,
//   });
//   return data;
// }

export function removeProductFromCart(userId, productId) {
  console.log("[Cart Service] Calling removeProductFromCart");
  const data = apiFetch(`/cart/${userId}/remove`, {
    method: "DELETE",
    body: { productId: productId },
  });
  return data;
}
