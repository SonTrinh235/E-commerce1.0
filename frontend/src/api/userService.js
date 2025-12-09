import { apiFetch } from "./apiClient";

export async function editAddress(userId, payload) {
  try {
    if (!userId) throw new Error("Missing userId");
    const body = {
      provinceCode: payload.provinceCode,
      districtCode: payload.districtCode,
      wardCode: payload.wardCode,
      provinceName: payload.provinceName,
      districtName: payload.districtName,
      wardName: payload.wardName,
      street: payload.street || payload.addressString
    };

    return await apiFetch(`/user/${userId}/address`, { 
      method: "PUT", 
      body: body 
    });
  } catch (err) {
    console.error("[userService] editAddress failed", err);
    throw err;
  }
}

export async function editName(userId, displayName) {
  try {
    if (!userId) throw new Error("Missing userId");

    return await apiFetch(`/user/${userId}/displayName`, { 
      method: "PUT", 
      body: { displayName } 
    });
  } catch (err) {
    console.error("[userService] editName failed", err);
    throw err;
  }
}

export async function editEmail(userId, email) {
  try {
    if (!userId) throw new Error("Missing userId");

    return await apiFetch(`/user/${userId}/email`, { 
      method: "PUT", 
      body: { email } 
    });
  } catch (err) {
    console.error("[userService] editEmail failed", err);
    throw err;
  }
}

export async function getUserById(userId) {
  try {
    if (!userId) {
       const stored = JSON.parse(localStorage.getItem("userInfo") || "{}");
       userId = stored.id || stored._id || stored.user?._id;
    }
    if (!userId) {
      console.warn("[getUserById] No userId found.");
      return null;
    }

    return await apiFetch(`/user/${userId}`, {
      method: "GET"
    });
  } catch (err) {
    console.error("[userService] getUserById failed", err);
    return null;
  }
}

export default { editAddress, editName, editEmail, getUserById };