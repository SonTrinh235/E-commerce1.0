const BASE_URL = "https://www.bachkhoaxanh.xyz";

/**
 * Generic function to handle various API requests (GET, POST, PUT, DELETE).
 * @param {string} endpoint - The specific path (e.g., "/products/all").
 * @param {object} [options={}] - An object containing METHOD, PARAMS, and BODY data.
 * @returns {Promise<object>} The parsed JSON data.
 */
export async function apiFetch(endpoint, options = {}) {
  // Set default method to GET
  const { method, headers, params = {}, body } = options;

  // 1. BUILD QUERY STRING
  const queryParams = new URLSearchParams(params).toString();

  // 2. CONSTRUCT FULL URL
  const url = `${BASE_URL}${endpoint}${queryParams ? "?" + queryParams : ""}`;

  // 3. BUILD FETCH CONFIG
  const config = {
    method: method,
    headers: headers
  };
  // Add body if has
  if (body) {
    config.body = JSON.stringify(body);
  }

  // 4. FETCH
  console.log(`[API Fetch] Starting ${method} request...`);
  console.log(`[API Fetch] URL: ${url}`);
  console.log(`[API Fetch] Headers: ${JSON.stringify(config.headers)}`);
  console.log(`[API Fetch] Body: ${config.body}`);
  try {
    const res = await fetch(url, config); // Pass the config object

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({})); // Try to parse error message
      throw new Error(
        `HTTP error! Status: ${res.status} - ${
          errorData.message || res.statusText
        }`
      );
    }

    // Ignore return data if status No Content
    if (res.status === 204 || res.status === 205) {
      console.log("[API Fetch] Success: No content (Status 204/205).");
      return null; // Return null or an empty object/status as success marker
    }

    // Return parsed JSON data
    const data = await res.json();
    console.log(`[API Fetch] Success. Parsed Data:`, data);
    return data;
  } catch (error) {
    console.error("API Fetch failed:", error);
    throw error;
  }
}
