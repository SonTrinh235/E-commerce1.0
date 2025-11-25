const BASE_URL = "https://www.bachkhoaxanh.xyz";

/**
 * Generic function to handle various API requests (GET, POST, PUT, DELETE).
 * @param {string} endpoint - The specific path (e.g., "/products/all").
 * @param {object} [options={}] - An object containing METHOD, PARAMS, and BODY data.
 * @returns {Promise<object>} The parsed JSON data.
 */
export async function apiFetch(endpoint, options = {}) {
  // Set default method to GET
  const { method = "GET", params = {}, body, headers: userHeaders = {} } = options;

  // 1. BUILD QUERY STRING
  const queryParams = new URLSearchParams(params).toString();

  // 2. CONSTRUCT FULL URL
  const url = `${BASE_URL}${endpoint}${queryParams ? "?" + queryParams : ""}`;

  // 3. BUILD FETCH CONFIG
  // attach Authorization header automatically when token exists in localStorage
  const token = typeof window !== "undefined" ? localStorage.getItem("userToken") : null;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const config = {
    method,
    headers: {
      // Default headers if body not FormData
      ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...authHeader,
      ...userHeaders,
    },
  };
  // Add body if has
if (body) {
    // Check if the body is FormData; if so, pass it directly.
    // Otherwise, stringify it for JSON requests.
    if (body instanceof FormData) {
        config.body = body;
    } else {
        config.body = JSON.stringify(body);
    }
}

  // 4. FETCH
  console.log(`[API Fetch] Starting ${method} request...`);
  console.log(`[API Fetch] URL: ${url}`);
  console.log(`[API Fetch] config Headers: ${JSON.stringify(config.headers)}`);
  console.log(`[API Fetch] config Body: ${config.body}`);
  try {
    const res = await fetch(url, config); // Pass the config object

    if (!res.ok) {
      // Try to parse error body as JSON, fallback to text
      let errorData;
      try {
        errorData = await res.json();
      } catch (err) {
        try {
          errorData = await res.text();
        } catch (err2) {
          errorData = null;
        }
      }
      console.error("[API Fetch] HTTP error response:", {
        url,
        status: res.status,
        statusText: res.statusText,
        body: errorData,
      });
      const apiError = new Error(`HTTP error! Status: ${res.status} - ${res.statusText}`);
      apiError.status = res.status;
      apiError.body = errorData;
      throw apiError;
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
