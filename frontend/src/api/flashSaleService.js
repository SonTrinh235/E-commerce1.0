import { apiFetch } from "./apiClient";

export async function fetchBatchesAPI() {
  console.log("[Flash sale Service] Calling fetchBatchesAPI");
  const data = await apiFetch(`/product/flash-sale/batches`, {
    method: "GET",
  });
  return data;
}

export async function fetchFlashSaleProductsAPI() {
  console.log("[Flash sale Service] Calling fetchFlashSaleProductsAPI");
  const data = await apiFetch(`/product/flash-sale/products`, {
    method: "GET",
  });
  return data;
}

