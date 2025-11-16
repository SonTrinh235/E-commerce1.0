import React, { createContext, useState, useEffect, useCallback } from "react";
import all_product from "../data/all_product";

export const ShopContext = createContext(null);

const getCurrentUserId = () => {
  try {
    const raw = localStorage.getItem("userInfo") || "{}";
    const info = JSON.parse(raw);
    const u = info?.user || info || {};
    return u._id || u.firebaseUid || u.phoneNumber || null;
  } catch {
    return null;
  }
};

const userId = getCurrentUserId();

const getCartKey = () => {
  const uid = getCurrentUserId();
  return uid ? `cart:${uid}` : "cart:guest";
};

/* ===== Load/Save theo key ===== */
const loadCart = () => {
  try {
    const raw = localStorage.getItem(getCartKey());
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveCart = (cartObj) => {
  localStorage.setItem(getCartKey(), JSON.stringify(cartObj || {}));
};

const ShopContextProvider = (props) => {
  const [cartItems, setCartItems] = useState(() => loadCart());
  useEffect(() => {
    saveCart(cartItems);
  }, [cartItems]);

  /* ===== Merge guest  ===== */
  const reloadCartForCurrentIdentity = useCallback(() => {
    const uid = getCurrentUserId();
    if (uid) {

      try {
        const guestRaw = localStorage.getItem("cart:guest");
        const guest = guestRaw ? JSON.parse(guestRaw) : {};
        const userKey = `cart:${uid}`;
        const userRaw = localStorage.getItem(userKey);
        const user = userRaw ? JSON.parse(userRaw) : {};


        const merged = { ...user };
        for (const [pid, qty] of Object.entries(guest)) {
          merged[pid] = (merged[pid] || 0) + Number(qty || 0);
        }
        localStorage.setItem(userKey, JSON.stringify(merged));
        localStorage.removeItem("cart:guest");
      } catch {}
    }

    setCartItems(loadCart());
  }, []);

  useEffect(() => {
    const onAuth = () => reloadCartForCurrentIdentity();
    window.addEventListener("auth-changed", onAuth);
    window.addEventListener("storage", onAuth);
    return () => {
      window.removeEventListener("auth-changed", onAuth);
      window.removeEventListener("storage", onAuth);
    };
  }, [reloadCartForCurrentIdentity]);


  /* ===== API giỏ hàng ===== */
  const addToCart = (itemId) => {
    setCartItems((prev) => {
      const next = { ...prev, [itemId]: (prev[itemId] || 0) + 1 };
      return next;
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      const cur = prev[itemId] || 0;
      const left = Math.max(cur - 1, 0);
      const next = { ...prev };
      if (left === 0) delete next[itemId];
      else next[itemId] = left;
      return next;
    });
  };


  const setCartItemsExternal = (updaterOrObj) => {
    setCartItems((prev) =>
      typeof updaterOrObj === "function" ? updaterOrObj(prev) : updaterOrObj || {}
    );
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const [itemId, qty] of Object.entries(cartItems)) {
      if (qty > 0) {
        const itemInfo = all_product.find(
          (p) => (p.id ?? p._id) === Number(itemId) || String(p.id ?? p._id) === String(itemId)
        );
        if (itemInfo) {
          const price =
            itemInfo.new_price ??
            itemInfo.price ??
            (typeof itemInfo.old_price === "number" ? itemInfo.old_price : 0);
          totalAmount += Number(price || 0) * Number(qty || 0);
        }
      }
    }
    return totalAmount;
  };

  const getTotalCartItems = () => {
    let total = 0;
    for (const qty of Object.values(cartItems)) {
      total += Number(qty || 0);
    }
    return total;
  };

  const contextValue = {
    userId,
    all_product,
    cartItems,
    addToCart,
    removeFromCart,
    setCartItems: setCartItemsExternal,
    getTotalCartItems,
    getTotalCartAmount,
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
