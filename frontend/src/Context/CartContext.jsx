// CartContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { ShopContext } from "./ShopContext";

// APIs
import {
  getCartByUserId,
  addProductToCart,
  updateProductQuantity,
  removeProductFromCart,
} from "../api/cartService";
import { getProductById } from "../api/productService";

// Context
export const CartContext = createContext();

/* ===== Helpers: per-user local storage ===== */
const getCartKey = (uid) => (uid ? `cart:${uid}` : "cart:guest");
const getLookupKey = (uid) => (uid ? `cartLookup:${uid}` : "cartLookup:guest");

const loadLocal = (uid) => {
  try {
    const cart = JSON.parse(localStorage.getItem(getCartKey(uid)) || "{}");
    const lookup = JSON.parse(localStorage.getItem(getLookupKey(uid)) || "{}");
    return { cart, lookup };
  } catch {
    return { cart: {}, lookup: {} };
  }
};

const saveLocal = (uid, cart, lookup) => {
  localStorage.setItem(getCartKey(uid), JSON.stringify(cart || {}));
  localStorage.setItem(getLookupKey(uid), JSON.stringify(lookup || {}));
};

// Đảm bảo lấy product dù getProductById trả res.data hay object
const pickProduct = (res) => (res?.data ? res.data : res || {});

export const CartContextProvider = ({ children }) => {
  const { userId } = useContext(ShopContext); // có thể null

  const [isCartLoading, setIsCartLoading] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);
  // cartItems: { [productId: string]: { productId, quantity, price } }
  const [cartItems, setCartItems] = useState({});
  // productsLookup: { [productId: string]: product }
  const [productsLookup, setProductsLookup] = useState({});

  /* =============== Fetchers =============== */

  // Lấy cart cho user từ backend
  const fetchCart = async (uid) => {
    const response = await getCartByUserId(uid);
    const newCart = response?.data?.productsInfo ?? [];
    const cartMap = {};
    newCart.forEach((entry) => {
      if (entry?.productId) {
        const key = String(entry.productId);
        cartMap[key] = {
          ...entry,
          productId: key,
          price: Number(entry.price ?? 0),
          quantity: Number(entry.quantity ?? 0),
        };
      }
    });
    setCartItems(cartMap);
    return newCart;
  };

  // Lấy full product cho từng id
  const fetchProductsData = async (productIds) => {
    const ids = [...new Set(productIds.filter(Boolean))].map(String);
    if (!ids.length) {
      setProductsLookup({});
      return;
    }

    const results = await Promise.allSettled(ids.map((id) => getProductById(id)));

    const productsMap = {};
    results.forEach((r, i) => {
      if (r.status === "fulfilled") {
        const product = pickProduct(r.value);
        const pid = String(product?._id ?? ids[i]);
        productsMap[pid] = product;
      }
    });

    setProductsLookup(productsMap);
  };

  // Init cả cart và productsLookup (memoized, không capture userId)
  const initializeCartAndProductsLookup = useCallback(async (uid) => {
    if (!uid) return;
    setIsCartLoading(true);
    try {
      const newCart = await fetchCart(uid);
      const productIds = newCart.map((item) => String(item.productId));
      await fetchProductsData(productIds);
    } catch (err) {
      console.error("[Cart] initialize failed:", err);
      setCartItems({});
      setProductsLookup({});
      setCartTotal(0);
    } finally {
      setIsCartLoading(false);
    }
  }, []);

  /* =============== Actions =============== */

  // Thêm 1 sản phẩm
  const cartAddProductToCart = async (productId) => {
    const key = String(productId);

    // Lấy product để có price/name/ảnh
    let productData = {};
    try {
      productData = pickProduct(await getProductById(key));
    } catch (e) {
      console.warn("[Cart] getProductById failed, still add local with price 0", e);
    }

    // Optimistic local
    setCartItems((prev) => {
      const existing = prev[key];
      if (existing) {
        return {
          ...prev,
          [key]: { ...existing, quantity: Number(existing.quantity ?? 0) + 1 },
        };
      }
      return {
        ...prev,
        [key]: {
          productId: key,
          quantity: 1,
          price: Number(productData.price ?? 0),
        },
      };
    });

    setProductsLookup((prev) => {
      if (prev[key]) return prev;
      return {
        ...prev,
        [key]: { ...productData, _id: String(productData?._id ?? key) },
      };
    });

    // Call API nếu đã đăng nhập
    if (userId) {
      try {
        await addProductToCart(userId, {
          productId: key,
          quantity: 1,
          price: Number(productData.price ?? 0),
        });
        await initializeCartAndProductsLookup(userId);
      } catch (e) {
        console.error("[Cart] addProduct failed:", e);
      }
    }
  };

  // Cập nhật số lượng
  const cartUpdateProductQuantity = (productId, quantity) => {
    const key = String(productId);
    let priceSafeLocal = 0;

    setCartItems((prev) => {
      const prevItem = prev[key] ?? {
        productId: key,
        quantity: 0,
        price: Number(productsLookup[key]?.price ?? 0),
      };
      priceSafeLocal = Number(productsLookup[key]?.price ?? prevItem.price ?? 0);

      const next = { ...prev };
      if (Number(quantity) === 0) {
        const { [key]: _removed, ...rest } = next;
        return rest;
      }
      next[key] = { ...prevItem, quantity: Number(quantity) };
      return next;
    });

    if (userId) {
      updateProductQuantity(userId, {
        productId: key,
        quantity: Number(quantity),
        price: Number(priceSafeLocal),
      }).catch((e) => {
        console.error("[Cart] updateQuantity failed:", e);
        initializeCartAndProductsLookup(userId);
      });
    }
  };

  // Xoá 1 sản phẩm khỏi giỏ
  const cartRemoveProductFromCart = (productId) => {
    const key = String(productId);

    setCartItems((prev) => {
      const { [key]: _removed, ...rest } = prev;
      return rest;
    });
    setProductsLookup((prev) => {
      const { [key]: _removed, ...rest } = prev;
      return rest;
    });

    if (userId) {
      removeProductFromCart(userId, key).catch((e) => {
        console.error("[Cart] removeProduct failed:", e);
        initializeCartAndProductsLookup(userId);
      });
    }
  };

  /* =============== Effects =============== */

  // Init theo userId (backend) / guest (local)
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (userId) {
        // 1) Load cart từ backend
        await initializeCartAndProductsLookup(userId);

        // 2) Merge guest -> user (backend) nếu có
        try {
          const guest = loadLocal(null);
          const guestItems = Object.values(guest.cart || {});
          if (guestItems.length) {
            for (const it of guestItems) {
              const pid = String(it.productId);
              const price = Number(guest.lookup?.[pid]?.price ?? it.price ?? 0);
              if (pid && it.quantity > 0) {
                await addProductToCart(userId, {
                  productId: pid,
                  quantity: Number(it.quantity),
                  price,
                });
              }
            }
            // clear guest local
            localStorage.removeItem(getCartKey(null));
            localStorage.removeItem(getLookupKey(null));
            // reload backend sau merge
            await initializeCartAndProductsLookup(userId);
          }
        } catch (e) {
          console.warn("[Cart] merge guest→user failed:", e);
        }
      } else {
        setIsCartLoading(true);
        try {
          const { cart, lookup } = loadLocal(null); // guest
          if (!cancelled) {
            setCartItems(cart);
            setProductsLookup(lookup);
          }
        } finally {
          if (!cancelled) setIsCartLoading(false);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [userId, initializeCartAndProductsLookup]);

  // Tính tổng & sync local (cho cả guest và user – mỗi người một key)
  useEffect(() => {
    const total = Object.values(cartItems).reduce((sum, item) => {
      const price = Number(item?.price ?? 0);
      const qty = Number(item?.quantity ?? 0);
      return sum + price * qty;
    }, 0);
    setCartTotal(total);

    // luôn lưu theo user hiện tại (guest hoặc user)
    saveLocal(userId, cartItems, productsLookup);
  }, [cartItems, productsLookup, userId]);

  /* =============== Context Value =============== */
  const contextValue = {
    isCartLoading,
    cartTotal,
    cartItems,
    productsLookup,
    cartAddProductToCart,
    cartUpdateProductQuantity,
    cartRemoveProductFromCart,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContextProvider;
