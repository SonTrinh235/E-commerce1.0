import { apiFetch } from "./apiClient";

const SERVICE_TAG = "[Statistic Service]";

// ==========================================
// REVENUE STATISTICS (DOANH THU)
// ==========================================

// Doanh thu hôm nay
export async function getTodayRevenue() {
  console.log(`${SERVICE_TAG} Calling getTodayRevenue`);
  return apiFetch(`/order/statistic/revenue/today`, {
    method: "GET",
  });
}

// Doanh thu hằng ngày trong tháng
export async function getDailyRevenueInMonth(year, month) {
  console.log(`${SERVICE_TAG} Calling getDailyRevenueInMonth for ${month}/${year}`);
  return apiFetch(`/order/statistic/revenue/daily/${year}/${month}`, {
    method: "GET",
  });
}

// Doanh thu hằng tháng trong năm
export async function getMonthlyRevenueInYear(year) {
  console.log(`${SERVICE_TAG} Calling getMonthlyRevenueInYear for ${year}`);
  return apiFetch(`/order/statistic/revenue/monthly/${year}`, {
    method: "GET",
  });
}

// Doanh thu hằng năm
export async function getYearlyRevenue() {
  console.log(`${SERVICE_TAG} Calling getYearlyRevenue`);
  return apiFetch(`/order/statistic/revenue/yearly`, {
    method: "GET",
  });
}

// Tổng doanh thu
export async function getTotalRevenue() {
  console.log(`${SERVICE_TAG} Calling getTotalRevenue`);
  return apiFetch(`/order/statistic/revenue/total`, {
    method: "GET",
  });
}

// ==========================================
// ORDER COUNT STATISTICS (SỐ LƯỢNG ĐƠN HÀNG)
// ==========================================

// Tổng đơn hàng đã hủy
export async function getCancelledOrdersCount() {
  console.log(`${SERVICE_TAG} Calling getCancelledOrdersCount`);
  return apiFetch(`/order/statistic/orders/cancelled/count`, {
    method: "GET",
  });
}

// Tổng đơn hàng mới
export async function getNewOrdersCount() {
  console.log(`${SERVICE_TAG} Calling getNewOrdersCount`);
  return apiFetch(`/order/statistic/orders/new/count`, {
    method: "GET",
  });
}

// Tổng đơn hàng hôm nay
export async function getTodayOrdersCount() {
  console.log(`${SERVICE_TAG} Calling getTodayOrdersCount`);
  return apiFetch(`/order/statistic/orders/today/count`, {
    method: "GET",
  });
}

// Tổng đơn hàng hằng ngày trong tháng
export async function getDailyOrdersCountInMonth(year, month) {
  console.log(`${SERVICE_TAG} Calling getDailyOrdersCountInMonth for ${month}/${year}`);
  return apiFetch(`/order/statistic/orders/daily/count/${year}/${month}`, {
    method: "GET",
  });
}

// Tổng đơn hàng hằng tháng trong năm
export async function getMonthlyOrdersCountInYear(year) {
  console.log(`${SERVICE_TAG} Calling getMonthlyOrdersCountInYear for ${year}`);
  return apiFetch(`/order/statistic/orders/monthly/count/${year}`, {
    method: "GET",
  });
}

// Tổng đơn hàng hằng năm
export async function getYearlyOrdersCount() {
  console.log(`${SERVICE_TAG} Calling getYearlyOrdersCount`);
  return apiFetch(`/order/statistic/orders/yearly/count`, {
    method: "GET",
  });
}

// Tổng đơn hàng
export async function getTotalOrdersCount() {
  console.log(`${SERVICE_TAG} Calling getTotalOrdersCount`);
  return apiFetch(`/order/statistic/orders/total/count`, {
    method: "GET",
  });
}

// ==========================================
// METRICS (CHỈ SỐ)
// ==========================================

// Phần trăm status của đơn hàng
export async function getOrderStatusPercentage() {
  console.log(`${SERVICE_TAG} Calling getOrderStatusPercentage`);
  return apiFetch(`/order/statistic/orders/status-percentage`, {
    method: "GET",
  });
}

// Giá trị trung bình 1 đơn hàng
export async function getAverageOrderValue() {
  console.log(`${SERVICE_TAG} Calling getAverageOrderValue`);
  return apiFetch(`/order/statistic/orders/average-value`, {
    method: "GET",
  });
}

// Tỉ lệ chuyển đổi
export async function getConversionRate() {
  console.log(`${SERVICE_TAG} Calling getConversionRate`);
  return apiFetch(`/order/statistic/orders/conversion-rate`, {
    method: "GET",
  });
}

// ==========================================
// PRODUCT STATISTICS (SẢN PHẨM)
// ==========================================

// Top 10 sản phẩm bán chạy
export async function getTopSellingProducts() {
  console.log(`${SERVICE_TAG} Calling getTopSellingProducts`);
  return apiFetch(`/order/statistic/products/top-selling`, {
    method: "GET",
  });
}

// Top 5 sản phẩm bán chạy hôm nay
export async function getTodayTopSellingProducts() {
  console.log(`${SERVICE_TAG} Calling getTodayTopSellingProducts`);
  return apiFetch(`/order/statistic/products/today-top-selling`, {
    method: "GET",
  });
}

// Top 5 sản phẩm bán chạy trong tháng
export async function getMonthlyTopSellingProducts(year, month) {
  console.log(`${SERVICE_TAG} Calling getMonthlyTopSellingProducts for ${month}/${year}`);
  return apiFetch(`/order/statistic/products/monthly-top-selling/${year}/${month}`, {
    method: "GET",
  });
}