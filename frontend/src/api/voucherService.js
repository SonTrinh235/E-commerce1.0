import { apiFetch } from "./apiClient";

// Get all vouchers
export async function getAllVouchers(page = 1, limit = 20) {
  console.log(`Calling getAllVouchers(${page}, ${limit})`);
  return apiFetch(`/order/vouchers?page=${page}&limit=${limit}`, {
    method: "GET",
  });
}


export async function createVoucher(voucherData) {
  console.log(`[Product Service]Calling createVoucher`);
  const data = apiFetch(`/order/voucher/create`, {
    method: "POST",
    body: voucherData,
  });
  return data;
}

export async function updateVoucher(voucherId, voucherData) {
  console.log(`[Product Service]Calling updateVoucher${voucherId}`);
  const data = apiFetch(`/order/vouchers/${voucherId}`, {
    method: "PUT",
    body: voucherData,
  });
  return data;
}


export async function deleteVoucher(voucherId) {
  console.log(`[Product Service]Calling deleteVoucher(${voucherId})`);
  const data = apiFetch(`/order/vouchers/${voucherId}`, {
    method: "DELETE",
  });
  return data;
}
