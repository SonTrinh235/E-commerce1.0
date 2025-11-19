import { apiFetch } from "./apiClient";

export function getAllVouchers(page = 1, limit = 20) {
  console.log(`Calling getAllVouchers(${page}, ${limit})`);
  return apiFetch(`/order/vouchers?page=${page}&limit=${limit}`, {
    method: "GET",
  });
}