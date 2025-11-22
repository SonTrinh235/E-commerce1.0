import { apiFetch } from "./apiClient";

export async function getPaymentByOrderId(orderId) {
  console.log(`[Payment Service]Calling getPaymentByOrderId(${orderId})`);
  const data = await apiFetch(`/payment/orders/${orderId}`, {
    method: "GET",
  });
  return data;
}

export async function refundOrder(orderId, payment) {
  console.log(`[Payment Service]Calling refundOrder(${orderId})`);
  const data = await apiFetch(`/payment/orders/${orderId}/refund`, {
    method: "POST",
    body: {
      userId: payment.userId,
      transDate: payment.transDate,
      amount: payment.amount,
      ipAddr: payment.ipAddr,
    },
  });
  return data;
}
