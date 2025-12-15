import { apiFetch } from "./apiClient";

export function getAllOrders(page = 1, limit = 20) {
  console.log(`Calling getAllOrders(${page}, ${limit})`);
  return apiFetch(`/order/orders?page=${page}&limit=${limit}`, {
    method: "GET",
  });
}

export function searchOrders(query, page = 1, limit = 20) {
  console.log(`Calling searchOrders(${query}, ${page}, ${limit})`);
  return apiFetch(`/order/orders/search`, {
    params: {
      query: query,
      page: page,
      limit: limit
    },
    method: "GET",
  });
}

export async function getOrderById(orderId) {
  console.log(`🧾 Calling getOrderById(${orderId})`);
  try {
    const response = await apiFetch(`/order/orders/${orderId}`, {
      method: "GET",
    });
    console.log("✅ getOrderById success:", response);
    return response;
  } catch (error) {
    console.error("❌ getOrderById error:", error);
    throw error;
  }
}

export async function getOrdersByUserId(userId, page = 1, limit = 20) {
  console.log(`📦 Calling getOrdersByUserId(${userId}), page=${page}, limit=${limit}`);
  try {
    const response = await apiFetch(
      `/order/orders/user/${userId}?page=${page}&limit=${limit}`,
      { method: "GET" }
    );
    console.log("✅ getOrdersByUserId success:", response);
    return response;
  } catch (error) {
    console.error("❌ getOrdersByUserId error:", error);
    throw error;
  }
}

export function createOrder(orderData) {
  console.log("Calling createOrder", orderData);
  const new_ProductsInfo = orderData.productsInfo.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      productName: item.productName || item.name,
      productImageUrl: item.productImageUrl || item.image
  }));

  return apiFetch(`/order/create-order`, {
    method: "POST",
    body: {
      userId: orderData.userId,
      paymentMethod: orderData.paymentMethod,
      productsInfo: new_ProductsInfo,
      voucherCode: orderData.voucherCode,
      ipAddr: orderData.ipAddr,
      
      shippingFee: orderData.shippingFee || null,
      shippingAddressInfo: orderData.shippingAddressInfo || null,
      
      shippingAddress: orderData.shippingAddress || null,
      shippingAddressString: orderData.shippingAddressString || null,
      contactName: orderData.contactName || null,
      contactPhone: orderData.contactPhone || null,
      contactEmail: orderData.contactEmail || null,
    },
  });
}

export function updateOrderStatus(orderId, status) {
  console.log(`Calling updateOrderStatus(${orderId})`);
  return apiFetch(`/order/orders/${orderId}/status`, {
    method: "PUT",
    body: { status },
  });
}

export function deleteOrder(orderId) {
  console.log(`Calling deleteOrder(${orderId})`);
  return apiFetch(`/order/orders/${orderId}`, {
    method: "DELETE",
  });
}