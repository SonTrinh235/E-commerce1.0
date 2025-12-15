import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ShopContext } from "./ShopContext";

import {
  getCartByUserId,
  addProductToCart,
  updateProductQuantity,
  removeProductFromCart,
} from "../api/cartService";
import { getProductById } from "../api/productService";

export const CartContext = createContext();

export const CartContextProvider = ({ children }) => {
  const { userId } = useContext(ShopContext);

  const [isCartLoading, setIsCartLoading] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartItems, setCartItems] = useState({});
  const [productsLookup, setProductsLookup] = useState({});
  const [appliedVoucher, setAppliedVoucher] = useState(null);

  const cartTotalItems = Object.values(cartItems).reduce((total, item) => {
    return total + (Number(item.quantity) || 0);
  }, 0);

  // Dùng useCallback để hàm này không bị tạo lại mỗi lần render
  const fetchCart = useCallback(async (uId) => {
    try {
      const response = await getCartByUserId(uId);
      if (response && response.success && response.data) {
        setCartTotal(response.data.totalPrice);
        const newCart = response.data.productsInfo || [];
        
        const cartMap = {};
        newCart.forEach((entry) => {
          cartMap[entry.productId] = entry;
        });

        setCartItems(cartMap);
        return newCart;
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
    return [];
  }, []);

  // Dùng useCallback và functional update (prev => ...) để không phụ thuộc state productsLookup
  const fetchProductsData = useCallback(async (productIds) => {
    try {
      const uniqueIds = [...new Set(productIds)]; 
      const fetchPromises = uniqueIds.map((id) => getProductById(id));
      const results = await Promise.all(fetchPromises);

      const newProductsMap = {};
      results.forEach((response) => {
        if (response && response.success && response.data) {
           const product = response.data;
           newProductsMap[product._id] = product;
        }
      });

      setProductsLookup(prev => ({ ...prev, ...newProductsMap }));
    } catch (error) {
      console.error("Error fetching product data:", error);
    }
  }, []);

  const initializeCartAndProductsLookup = useCallback(async () => {
    setIsCartLoading(true);
    const newCart = await fetchCart(userId);
    if (newCart && newCart.length > 0) {
        const productIds = newCart.map((item) => item.productId);
        await fetchProductsData(productIds);
    }
    setIsCartLoading(false);
  }, [userId, fetchCart, fetchProductsData]);

  const resetCart = useCallback(() => {
    if (userId) {
      initializeCartAndProductsLookup();
    } else {
      setIsCartLoading(true);
      localStorage.removeItem("localCart");
      const storedCart = localStorage.getItem("localCart");
      setCartItems(storedCart ? JSON.parse(storedCart) : {});
      
      localStorage.removeItem("localCartLookup");
      const storedCartLookup = localStorage.getItem("localCartLookup");
      setProductsLookup(storedCartLookup ? JSON.parse(storedCartLookup) : {});
      setIsCartLoading(false);
    }
    setAppliedVoucher(null);
  }, [userId, initializeCartAndProductsLookup]);

  const refreshCartState = (serverCartData) => {
      if (!serverCartData || !serverCartData.productsInfo) return;

      const newCartItems = {};
      serverCartData.productsInfo.forEach(item => {
          newCartItems[item.productId] = item; 
      });

      setCartItems(newCartItems);
      
      if (serverCartData.totalPrice !== undefined) {
          setCartTotal(serverCartData.totalPrice);
      }
  };

  const cartAddProductToCart = async (productId) => {
    let productData = productsLookup[productId];
    
    if (!productData) {
        try {
            const productResponse = await getProductById(productId);
            if (productResponse && productResponse.success) {
                productData = productResponse.data;
                setProductsLookup(prev => ({
                    ...prev,
                    [productId]: productData
                }));
            }
        } catch (error) {
            console.error("Failed to fetch product for adding to cart:", error);
            return;
        }
    }

    if (!productData) return;

    if (userId) {
      try {
        const res = await addProductToCart(userId, productData, 1);
        if (res && res.success && res.data) {
             refreshCartState(res.data);
        }
      } catch (error) {
        console.error("cartAddProductToCart failed: ", error);
      }
    } else {
      // Local cart logic
      setCartItems((prevCart) => {
        const existingItem = prevCart[productId];
        if (existingItem) {
          return {
            ...prevCart,
            [productId]: {
              ...existingItem,
              quantity: existingItem.quantity + 1,
            },
          };
        } else {
          return {
            ...prevCart,
            [productId]: {
              productId: productId,
              quantity: 1,
              price: productData.price,
              productImageUrl: productData.imageInfo?.url || null,
              productName: productData.name
            },
          };
        }
      });

      setProductsLookup((prevLookup) => {
        if (prevLookup[productId]) return prevLookup;
        return {
          ...prevLookup,
          [productId]: { ...productData },
        };
      });
    }
  };

  const cartUpdateProductQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
        cartRemoveProductFromCart(productId);
        return;
    }

    if (userId) {
      try {
          const res = await updateProductQuantity(userId, productId, quantity);
          if (res && res.success && res.data) {
              refreshCartState(res.data);
          }
      } catch (error) {
          console.error("cartUpdateProductQuantity failed: ", error);
      }
    } else {
      setCartItems((prevCart) => {
        return {
          ...prevCart,
          [productId]: {
            ...prevCart[productId],
            quantity: quantity,
          },
        };
      });
    }
  };

  const cartRemoveProductFromCart = async (productId) => {
    if (userId) {
      try {
          const res = await removeProductFromCart(userId, productId);
          if (res && res.success && res.data) {
               refreshCartState(res.data);
          }
      } catch (error) {
          console.error("cartRemoveProductFromCart failed: ", error);
      }
    } else {
      setCartItems((prevCart) => {
        const { [productId]: removedItem, ...restOfCart } = prevCart;
        return restOfCart;
      });
    }
  };

  const getCartTotal = useCallback(() => {
    let totalAmount = 0;
    Object.values(cartItems).forEach((item) => {
        if (item.computedPrice && item.computedPrice.totalForItemPrice !== undefined) {
            totalAmount += Number(item.computedPrice.totalForItemPrice);
        } else {
            const price = Number(item.price) || (productsLookup[item.productId]?.price) || 0;
            totalAmount += price * (Number(item.quantity) || 0);
        }
    });
    return totalAmount;
  }, [cartItems, productsLookup]);

  useEffect(() => {
    if (userId) {
      initializeCartAndProductsLookup();
    } else {
      setIsCartLoading(true);
      const storedCart = localStorage.getItem("localCart");
      setCartItems(storedCart ? JSON.parse(storedCart) : {});
      
      const storedCartLookup = localStorage.getItem("localCartLookup");
      setProductsLookup(storedCartLookup ? JSON.parse(storedCartLookup) : {});
      setIsCartLoading(false);
    }
  }, [userId, initializeCartAndProductsLookup]);

  useEffect(() => {
    if (!userId) {
        setCartTotal(getCartTotal());
        localStorage.setItem("localCart", JSON.stringify(cartItems));
        localStorage.setItem("localCartLookup", JSON.stringify(productsLookup));
    }
  }, [cartItems, userId, productsLookup, getCartTotal]);

  const contextValue = {
    isCartLoading,
    cartTotal,
    cartTotalItems,
    cartItems,
    productsLookup,
    appliedVoucher, 
    setAppliedVoucher,
    cartAddProductToCart,
    cartUpdateProductQuantity,
    cartRemoveProductFromCart,
    resetCart
  };

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

export default CartContextProvider;