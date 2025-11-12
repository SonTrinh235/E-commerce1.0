// SEE API DOC FOR USAGE GUIDE

import { apiFetch } from "./apiClient";

export function getAllProducts(page = 1, limit = 20) {
  console.log(`[Product Service]Calling getAllProducts(${page},${limit})`);
  const data = apiFetch(`/product/products/all`, {
    method: "GET",
    params: { page: page, limit: limit },
  });
  return data;
}

export async function getProductById(productId) {
  console.log(`[Product Service]Calling getProductById(${productId})`);
  const data = await apiFetch(`/product/products/${productId}`, {
    method: "GET",
  });
  return data;
}


export function createProduct(productData) {
  console.log("[Product Service]Calling createProduct");
  const data = apiFetch(`/product/create-product`, {
    method: "POST",
    body: productData,
  });
  return data;
}

export function updateProduct(productId, productData) {
  console.log(`[Product Service]Calling updateProduct${productId}`);
  const data = apiFetch(`/product/update-product/${productId}`, {
    method: "PUT",
    body: productData,
  });
  return data;
}

export function deleteProduct(productId) {
  console.log(`[Product Service]Calling deleteProduct(${productId})`);
  const data = apiFetch(`/product/delete-product/${productId}`, {
    method: "DELETE",
  });
  return data;
}

export function updateProductImageInfo(productId, imageInfo) {
  console.log(`[Product Service]Calling updataProductImageInfo(${productId})`);
  const data = apiFetch(`/product/update-product-image/${productId}`, {
    method: "PUT",
    body: imageInfo,
  });
  return data;
}



export async function getRatingsByProduct(productId,{ page = 1, limit = 50, sort = 'new' } = {}) {
  if (!productId) throw new Error('productId is required');

  const res = await getProductById(productId);
  const p = res?.data?.data || res?.data || {};

  let items = Array.isArray(p.ratings) ? [...p.ratings] : [];

  const byDateDesc = (a, b) =>
    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  const byDateAsc = (a, b) =>
    new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
  const byScoreDesc = (a, b) =>
    (b.score || 0) - (a.score || 0) || byDateDesc(a, b);

  if (sort === 'old') items.sort(byDateAsc);
  else if (sort === 'top') items.sort(byScoreDesc);
  else items.sort(byDateDesc); 

  const total = items.length;
  const start = Math.max(0, (page - 1) * limit);
  const paged = items.slice(start, start + limit);

  const average =
    typeof p.rating === 'number'
      ? p.rating
      : total
      ? Math.round(
          (items.reduce((s, i) => s + (i.score || 0), 0) / total) * 10
        ) / 10
      : 0;

  return { success: true, data: { items: paged, average, total, page, limit } };
}

export async function getRatingsByIds(ids = []) {
  return [];
}

function isObjectId(str) { return typeof str === 'string' && /^[a-fA-F0-9]{24}$/.test(str); }

function genObjectId24() {
  const ts = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  let rand = '';
  for (let i = 0; i < 16; i++) rand += Math.floor(Math.random() * 16).toString(16);
  return (ts + rand).slice(0, 24);
}

function getAuthUser() {
  try {
    const raw = localStorage.getItem('authUser');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function getAuthUserId() {
  const u = getAuthUser();
  const id =
    u?.data?._id ||
    u?._id ||
    u?.user?._id ||
    u?.userId ||
    u?.id ||
    null;
  return isObjectId(id) ? id : null;
}

function getAuthDisplayName() {
  const u = getAuthUser();
  const name =
    u?.data?.displayName || u?.data?.name ||
    u?.displayName || u?.name || u?.fullName ||
    (typeof u?.email === 'string' ? u.email.split('@')[0] : null);
  return name || 'Guest';
}

function getOrCreateAnonObjectId() {
  const KEY = 'anon_oid_v1';
  try {
    const real = getAuthUserId();
    if (real) {
      try { localStorage.removeItem(KEY); } catch {}
      return real;
    }
    let id = localStorage.getItem(KEY);
    if (!isObjectId(id)) {
      id = genObjectId24();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return '000000000000000000000000';
  }
}

export async function createProductRating(productId, { userId, score, content }) {
  if (!productId) throw new Error('productId is required');
  if (score == null) throw new Error('score is required');
  const authId = getAuthUserId();
  const isGuest = !authId && !isObjectId(userId);
  const uidBase = isObjectId(userId) ? userId : (authId || getOrCreateAnonObjectId());
  const userDisplayName = getAuthDisplayName();
  const s = Math.max(1, Math.min(5, Number(score)));
  const comment = (content || '').trim();

  const endpoint = `/product/${productId}/rate`;
  try {
    return await apiFetch(endpoint, {
      method: "POST",
      body: { userId: uidBase, score: s, comment, userDisplayName }
    });
  } catch (e) {
    const msg = String(e?.message || '');
    if (isGuest && /already rated/i.test(msg)) {
      const freshUid = genObjectId24();
      return await apiFetch(endpoint, {
        method: "POST",
        body: { userId: freshUid, score: s, comment, userDisplayName }
      });
    }
    throw e;
  }
}
