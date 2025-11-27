import { apiFetch } from "./apiClient";
import { geocodeAddress } from "./geocodeService";

/* ------------------------------- EDIT ADDRESS ------------------------------- */
export async function editAddress(payload) {
  try {
    let addressString = payload.addressString || "";
    if (!addressString && payload.address && typeof payload.address === "object") {
      const a = payload.address;
      addressString = `${a.houseNumber || ""} ${a.ward?.name || ""} ${a.district?.name || ""} ${a.province?.name || ""}`.trim();
    }

    const body = {
      fullName: payload.fullName || payload.full_name || undefined,
      address: addressString || payload.address || "",
    };

    const token = localStorage.getItem("userToken");

    const res = await fetch("https://www.bachkhoaxanh.xyz/user/updateProfile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || `Status ${res.status}`);

    return json;
  } catch (err) {
    console.error("[userService] editAddress failed", err);
    throw err;
  }
}

/* --------------------------- EDIT NAME / EMAIL --------------------------- */
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

/* ------------------------------ GET USER BY TOKEN ------------------------------ */
export async function getUserById() {
  try {
    const token = localStorage.getItem("userToken");

    if (!token) {
      console.warn("[getUserById] No userToken in localStorage → skip request.");
      return null; // tránh crash
    }

    console.log("[getUserById] Using token:", token.substring(0, 15) + "...");

    return await apiFetch("/user/getById", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err) {
    console.error("[userService] getUserById failed", err);
    return null;
  }
}

export default { editAddress, editName, editEmail, getUserById };
