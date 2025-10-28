

// Use vnd(number) return formatted string
// vnd(3350000) turns into 3.350.000 ₫
export function vnd(number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(number);
}
