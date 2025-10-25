import { apiFetch } from "./apiClient";

// SEE API DOC FOR USAGE GUIDE

export function createOrder(body) {
  console.log('[Order Service] Calling createOrder');
  const data = apiFetch(`/order/create-order`, {
    method: 'POST',
    body: body,
  });
  return data;
}
