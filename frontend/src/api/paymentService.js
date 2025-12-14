import { apiFetch } from "./apiClient";

export async function getPaymentByOrderId(orderId) {
  console.log(`[Payment Service] Calling getPaymentByOrderId(${orderId})`);
  const data = await apiFetch(`/payment/orders/${orderId}`, {
    method: "GET",
  });
  return data;
}

export async function refundOrder(orderId, refundData) {
  console.log(`[Payment Service] Calling refundOrder(${orderId})`);
  console.log("Refund Data Body:", refundData); 
  
  const data = await apiFetch(`/payment/orders/${orderId}/refund`, {
    method: "POST",
    body: {
      userId: refundData.userId,
      transDate: refundData.transDate,
      amount: refundData.amount,
      ipAddr: refundData.ipAddr,
    },
  });
  return data;
}
