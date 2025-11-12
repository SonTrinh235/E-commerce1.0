// src/utils/offlineRatings.js
const KEY = 'offline_ratings_v1';

function readAll() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
  catch { return {}; }
}
function writeAll(obj) {
  localStorage.setItem(KEY, JSON.stringify(obj || {}));
}

export function getLocalRatings(productId) {
  const all = readAll();
  return all[productId] || [];
}

export function addLocalRating(productId, rating) {
  const all = readAll();
  all[productId] = [rating, ...(all[productId] || [])];
  writeAll(all);
}

export function removeLocalRating(productId, tempId) {
  const all = readAll();
  if (!all[productId]) return;
  all[productId] = all[productId].filter(r => r.id !== tempId);
  writeAll(all);
}

export function clearLocalRatings(productId) {
  const all = readAll();
  delete all[productId];
  writeAll(all);
}
