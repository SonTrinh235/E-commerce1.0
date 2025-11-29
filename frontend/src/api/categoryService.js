// SEE API DOC FOR USAGE GUIDE

import { apiFetch } from "./apiClient";

export function getAllCategrories() {
  console.log(`[Product Service]Calling getAllCategrories()`);
  const data = apiFetch(`/product/categories`, {
    method: "GET"
  });
  return data;
}