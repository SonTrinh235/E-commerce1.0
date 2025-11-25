// geocodeService.js
// Simple helper to call photon.komoot.io for geocoding addresses
export async function geocodeAddress(q) {
  if (!q) return null;
  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}`;
    const res = await fetch(url);
    const json = await res.json();
    // photon returns GeoJSON with features[].geometry.coordinates = [lon, lat]
    const first = json?.features?.[0];
    const coords = first?.geometry?.coordinates;
    if (coords && coords.length >= 2) {
      return { lon: Number(coords[0]), lat: Number(coords[1]) };
    }
    return null;
  } catch (e) {
    console.error("geocodeAddress failed", e);
    return null;
  }
}

export default { geocodeAddress };
