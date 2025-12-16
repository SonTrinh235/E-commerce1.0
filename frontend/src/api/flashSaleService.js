import { apiFetch } from "./apiClient";

export async function getAllFlashSaleProductAPI() {
  console.log("[Flash sale Service] Calling getAllFlashSaleProductAPI");
  const data = await apiFetch(`/product/flash-sale/products`, {
    method: "GET",
  });
  return data;
}

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

export async function fetchNoFlashSaleProductsAPI() {
  console.log("[Flash sale Service] Calling fetchNoFlashSaleProductsAPI");
  const data = await apiFetch(`/product/flash-sale/products/no-flash-sale`, {
    method: "GET",
  });
  return data;
}

export async function addFlashSaleProductAPI(batchId, productId, discountPercentage, stock) {
  console.log("[Flash sale Service] Calling addFlashSaleProductAPI");
  const data = await apiFetch(`/product/flash-sale/products`, {
    method: "POST",
    body: {
      batchId: batchId,
      productId: productId,
      discountPercentage: discountPercentage,
      stock: stock 
    }
  });
  return data;
}

export async function addFlashSaleBatchAPI(name, startTime, endTime) {
  console.log("[Flash sale Service] Calling addFlashSaleBatchAPI");
  const data = await apiFetch(`/product/flash-sale/batches`, {
    method: "POST",
    body: {
      name: name,
      startTime: startTime,
      endTime: endTime
    }
  });
  return data;
}

export async function editFlashSaleBatchAPI(batchId, name, startTime, endTime) {
  console.log("[Flash sale Service] Calling editFlashSaleBatchAPI");
  const data = await apiFetch(`/product/flash-sale/batches/${batchId}`, {
    method: "PUT",
    body: {
      name: name,
      startTime: startTime,
      endTime: endTime
    }
  });
  return data;
}


export async function deleteFlashSaleBatchAPI(batchId) {
  console.log("[Flash sale Service] Calling deleteFlashSaleBatchAPI");
  const data = await apiFetch(`/product/flash-sale/batches/${batchId}`, {
    method: "DELETE",
  });
  return data;
}


export async function editFlashSaleProductAPI(productId, batchId, discountPercentage, stock) {
  console.log("[Flash sale Service] Calling editFlashSaleProductAPI");
  const data = await apiFetch(`/product/flash-sale/products/${productId}`, {
    method: "PUT",
    body: {
      discountPercentage: discountPercentage,
      batchId: batchId,
      stock: stock
    }
  });
  return data;
}

export async function deleteFlashSaleProductAPI(productId) {
  console.log("[Flash sale Service] Calling deleteFlashSaleProductAPI");
  const data = await apiFetch(`/product/flash-sale/products/${productId}`, {
    method: "DELETE",
  });
  return data;
}

export async function getActiveFlashSalesAPI() {
  console.log("[Flash sale Service] Calling getActiveFlashSalesAPI");
  const data = await apiFetch(`/product/flash-sale/products/active-batch-products`, {
    method: "GET",
  });
  return data;
}