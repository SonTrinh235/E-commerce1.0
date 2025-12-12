import { apiFetch } from "./apiClient";

export async function getTopSellingProducts() {
  console.log("[Statistic Service] Calling getTopSellingProducts");
  return await apiFetch(`/order/statistic/products/top-selling`, {
    method: "GET",
  });
}