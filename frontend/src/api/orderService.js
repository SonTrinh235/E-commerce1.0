import { apiFetch } from "./apiClient";

// Lấy tất cả đơn hàng (phân trang)
export function getAllOrders(page = 1, limit = 20) {
  console.log(`Calling getAllOrders(${page}, ${limit})`);
  return apiFetch(`/order/orders?page=${page}&limit=${limit}`, {
    method: "GET",
  });
}

// Search order
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

// Lấy chi tiết 1 đơn hàng theo id
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

// Lấy đơn hàng theo userId
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


// Tạo mới đơn hàng (thanh toán bằng cash)
export function createOrder(orderData) {
  console.log("Calling createOrder", orderData);
  return apiFetch(`/order/create-order`, {
    method: "POST",
    body: {
      userId: orderData.userId,
      paymentMethod: orderData.paymentMethod,
      productsInfo: orderData.productsInfo,
      voucherCode: orderData.voucherCode,
      ipAddr: orderData.ipAddr,
    },
  });
}

// Cập nhật trạng thái đơn hàng
export function updateOrderStatus(orderId, status) {
  console.log(`Calling updateOrderStatus(${orderId})`);
  return apiFetch(`/order/orders/${orderId}/status`, {
    method: "PUT",
    body: { status },
  });
}

// (Tùy backend) Xoá đơn hàng — nếu backend chưa có, có thể bỏ
export function deleteOrder(orderId) {
  console.log(`Calling deleteOrder(${orderId})`);
  return apiFetch(`/order/orders/${orderId}`, {
    method: "DELETE",
  });
}