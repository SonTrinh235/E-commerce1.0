import { apiFetch } from "./apiClient";
import { geocodeAddress } from "./geocodeService";

/**
 * Edit user's profile/address on server.
 * Payload example:
 * { fullName: '...', address: { province:{code,name}, district:{}, ward:{}, houseNumber: '...' }, addressString: '...'}
 */
export async function editAddress(payload) {
  try {
    // Some backends expect `address` as a readable string (older API).
    // Build addressString if an address object is provided.
    let addressString = payload.addressString || "";
    if (!addressString && payload.address && typeof payload.address === "object") {
      const a = payload.address;
      addressString = `${a.houseNumber || ""} ${a.ward?.name || ""} ${a.district?.name || ""} ${a.province?.name || ""}`.trim();
    }

    const body = {
      fullName: payload.fullName || payload.full_name || undefined,
      address: addressString || payload.address || "",
    };

    // Use the same absolute URL + Authorization header as the original working code
    const token = typeof window !== "undefined" ? localStorage.getItem("userToken") : null;
    const res = await fetch("https://www.bachkhoaxanh.xyz/user/updateProfile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.message || `Status ${res.status}`);
    }
    return json;
  } catch (err) {
    console.error("[userService] editAddress failed", err);
    throw err;
  }
}

/**
 * Edit user's name/email (server endpoints might differ — adjust as needed)
 */
export async function editName(payload) {
  try {
    return await apiFetch("/user/updateProfile", { method: "POST", body: payload });
  } catch (err) {
    console.error("[userService] editName failed", err);
    throw err;
  }
}

export async function editEmail(payload) {
  try {
    return await apiFetch("/user/updateProfile", { method: "POST", body: payload });
  } catch (err) {
    console.error("[userService] editEmail failed", err);
    throw err;
  }
}

/**
 * Fetch latest user info from server using token (endpoint may need adjustment)
 */
export async function getUserById() {
  try {
    // server should infer user from token
    return await apiFetch("/user/getById", { method: "GET" });
  } catch (err) {
    console.error("[userService] getUserById failed", err);
    throw err;
  }
}

export default { editAddress, editName, editEmail, getUserById };
