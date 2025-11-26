// locationService.js
// Fetch Vietnam provinces/districts/wards from public API and provide helpers

const API_URL = "https://provinces.open-api.vn/api/v1/?depth=3";

let _cached = null;

export async function fetchAllLocations() {
  if (_cached) return _cached;
  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const json = await res.json();
    console.log("[locationService] raw data:", json);

    // provinces.open-api.vn trả về **mảng** các tỉnh
    _cached = Array.isArray(json) ? json : [];
    return _cached;
  } catch (err) {
    console.error("[locationService] fetch failed", err);
    _cached = [];
    return [];
  }
}

export async function getProvinces() {
  const all = await fetchAllLocations();
  return all.map((p) => ({
    code: String(p.code), // ví dụ: 1, 79, ...
    name: p.name,         // ví dụ: "Thành phố Hà Nội"
    raw: p,
  }));
}

export async function getDistricts(provinceCode) {
  const all = await fetchAllLocations();
  const prov = all.find((p) => String(p.code) === String(provinceCode));
  const districts = prov?.districts || [];

  return districts.map((d) => ({
    code: String(d.code),
    name: d.name,
    raw: d,
  }));
}

export async function getWards(provinceCode, districtCode) {
  const districts = await getDistricts(provinceCode);
  const d = districts.find((x) => String(x.code) === String(districtCode));
  const wards = d?.raw?.wards || [];

  return wards.map((w) => ({
    code: String(w.code),
    name: w.name,
    raw: w,
  }));
}

export default {
  fetchAllLocations,
  getProvinces,
  getDistricts,
  getWards,
};
