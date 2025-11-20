import { apiFetch } from "./apiClient";

export async function getPaymentByOrderId(orderId) {
  console.log(`[Product Service]Calling getPaymentByOrderId(${orderId})`);
  const data = await apiFetch(`/payment/orders/${orderId}`, {
    method: "GET",
  });
  return data;
}