// src/api/productService.js
import { apiFetch } from "./apiClient";

function parseList(res) {
  const data = res?.data ?? {};
  const list = Array.isArray(data?.list) ? data.list : [];
  return {
    items: list,
    page: Number(data?.page ?? 1),
    limit: Number(data?.limit ?? list.length ?? 0),
    total: Number(data?.total ?? list.length ?? 0),
    totalPages: Number(data?.totalPages ?? 1),
  };
}

export async function getProducts(params = {}) {
  const res = await apiFetch("/product/products/all", {
    method: "GET",
    params,
  });
  return parseList(res);
}

export function getAllProducts(page = 1, limit = 20) {
  return getProducts({ page, limit });
}

export async function getProductById(productId) {
  if (!productId) throw new Error("getProductById: missing productId");
  const res = await apiFetch(`/product/products/${productId}`, { method: "GET" });

  const d = res?.data ?? res ?? {};
  const product = d?.product ?? d;

  if (!product || (!product._id && !product.id)) {
    console.warn("[getProductById] Unexpected response shape:", res);
  }
  return product;
}

export function createProduct(productData) {
  return apiFetch(`/product/create-product`, {
    method: "POST",
    body: productData,
  });
}

export function updateProduct(productId, productData) {
  return apiFetch(`/product/update-product/${productId}`, {
    method: "PUT",
    body: productData,
  });
}

export function deleteProduct(productId) {
  return apiFetch(`/product/delete-product/${productId}`, {
    method: "DELETE",
  });
}

export function updateProductImageInfo(productId, imageInfo) {
  return apiFetch(`/product/update-product-image/${productId}`, {
    method: "PUT",
    body: imageInfo,
  });
}

export async function getProductsByIds(ids = []) {
  const uniq = Array.from(new Set(ids.filter(Boolean)));
  const results = await Promise.allSettled(uniq.map((id) => getProductById(id)));
  const map = {};
  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      const p = r.value;
      const pid = p?._id ?? uniq[i];
      if (pid) map[pid] = p;
    }
  });
  return map;
}
