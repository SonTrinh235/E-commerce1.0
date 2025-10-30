// CartContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { ShopContext } from "./ShopContext";

// Import APIs
import {
  getCartByUserId,
  addProductToCart,
  updateProductQuantity,
  removeProductFromCart,
} from "../api/cartService";
import { getProductById } from "../api/productService";

// 1. Create the Context object
export const CartContext = createContext();

export const CartContextProvider = ({ children }) => {
  // userId: Should be fetched from shop context or auth context
  // userId could be null
  const { userId } = useContext(ShopContext);

  // Cart Is Loading
  const [isCartLoading, setIsCartLoading] = useState(false);

  // cartTotal: Total price of cart
  const [cartTotal, setCartTotal] = useState();
  // cartItems: Lookup objects of items in cart (productId and count)
  const [cartItems, setCartItems] = useState({});
  // productsLookup: Lookup objects of products in cart (full product data)
  const [productsLookup, setProductsLookup] = useState({});
  
  // cartTotalItem: Total item count of cart
  const cartTotalItems = Object.values(cartItems).reduce((total, item) => {
    return total + item.quantity;
  }, 0);
  
  // function: Fetch cart with product id and count
  const fetchCart = async (userId) => {
    const response = await getCartByUserId(userId);

    setCartTotal(response.data.totalPrice);

    const newCart = response.data.productsInfo;
    const cartMap = {};
    newCart.forEach((entry) => {
      cartMap[entry.productId] = entry;
    });

    setCartItems(cartMap);
    return newCart;
  };

  // function: Fetch product data for each product in cart
  const fetchProductsData = async (productIds) => {
    // Fetch product data for each and await all
    const fetchPromises = productIds.map((id) => getProductById(id));
    const results = await Promise.all(fetchPromises);

    // Set lookup map
    const productsMap = {};
    results.forEach((response) => {
      const product = response.data;
      productsMap[product._id] = product;
    });

    setProductsLookup(productsMap);
  };

  // function: fetch cart and product data
  const initializeCartAndProductsLookup = async () => {
    setIsCartLoading(true);

    const newCart = await fetchCart(userId);
    const productIds = newCart.map((item) => item.productId);
    await fetchProductsData(productIds);

    setIsCartLoading(false);
  };

  const resetCart = () => {
    if (userId) {
      initializeCartAndProductsLookup();
    } else {
      setIsCartLoading(true);
      // Local cart for not logged in
      // Clear localStorage then grab
      localStorage.removeItem("localCart");
      const storedCart = localStorage.getItem("localCart");
      setCartItems(storedCart ? JSON.parse(storedCart) : {});
      // Local lookup for not logged in
      // Clear localStorage then grab
      localStorage.removeItem("localCartLookup");
      const storedCartLookup = localStorage.getItem("localCartLookup");
      setProductsLookup(storedCartLookup ? JSON.parse(storedCartLookup) : {});
      setIsCartLoading(false);
    }
  }

  // function: Add product
  //  params: productId
  const cartAddProductToCart = async (productId) => {
    const productResponse = await getProductById(productId);
    const productData = productResponse.data;

    // Only call API if logged in
    if (userId) {
      await addProductToCart(userId, {
        productId: productId,
        quantity: 1,
        price: productData.price,
      });
      // Call fetch needed for product info (price, image)
      await initializeCartAndProductsLookup();
    }
    

    // Else not logged in: manually touch local cart
    else {
      // Set local cart
      setCartItems((prevCart) => {
        const existingItem = prevCart[productId];

        if (existingItem) {
          // Case A: EXISTS Item
          return {
            ...prevCart, // Copy other items
            [productId]: {
              ...existingItem, // Copy existing item details
              quantity: existingItem.quantity + 1, // +1 quantity
            },
          };
        } else {
          // Case B: Item NEW
          return {
            ...prevCart, // Copy all existing items
            [productId]: {
              // Add new item
              productId: productId,
              quantity: 1,
              price: productData.price,
            },
          };
        }
      });

      setProductsLookup((prevLookup) => {
        const existingItem = prevLookup[productId];

        if (existingItem) {
          // Case A: EXISTS Item
          return {
            ...prevLookup, // Copy other items
          };
        } else {
          // Case B: Item NEW
          return {
            ...prevLookup, // Copy all existing items
            [productId]: {
              // Add new item
              ...productData,
            },
          };
        }
      });
    }
  };

  // function: Update product quantity
  // params: productId, quantity
  const cartUpdateProductQuantity = (productId, quantity) => {
    setCartItems((prevCart) => {
      return {
        ...prevCart,
        [productId]: {
          ...prevCart[productId],
          quantity: quantity,
        },
      };
    });

    // Only call API if logged in
    if (userId) {
      updateProductQuantity(userId, {
        productId: productId,
        quantity: quantity,
        price: productsLookup[productId].price,
      });
    }

    // For local cart: remove item on quantity 0
    // Remote cart is handled already
    if (quantity === 0) {
      setCartItems((prevCart) => {
        const { [productId]: removedItem, ...restOfCart } = prevCart;
        return restOfCart;
      });
      setProductsLookup((prevProductsLookup) => {
        const { [productId]: removedItem, ...restOfProductsLookup } =
          prevProductsLookup;
        return restOfProductsLookup;
      });
    }
  };

  // function: Update product quantity
  // params: productId, quantity
  const cartRemoveProductFromCart = (productId) => {
    // For local cart: remove item
    setCartItems((prevCart) => {
      const { [productId]: removedItem, ...restOfCart } = prevCart;
      return restOfCart;
    });
    setProductsLookup((prevProductsLookup) => {
      const { [productId]: removedItem, ...restOfProductsLookup } =
        prevProductsLookup;
      return restOfProductsLookup;
    });

    // Only call API if logged in
    if (userId) {
      removeProductFromCart(userId, productId);
    }
  };

  function getCartTotal() {
    let totalAmount = 0;
    Object.values(cartItems).map((item, i) => {
      totalAmount += item.price * item.quantity;
      return 0;
    });
    return totalAmount;
  }

  // useEffect: init cart
  // Currently bugged: userId is not changing
  useEffect(() => {
    console.log("USER ID CHANGE: ", userId);
    if (userId) {
      initializeCartAndProductsLookup();
    } else {
      // Local cart for not logged in
      setIsCartLoading(true);
      const storedCart = localStorage.getItem("localCart");
      setCartItems(storedCart ? JSON.parse(storedCart) : {});
      // Local lookup for not logged in
      const storedCartLookup = localStorage.getItem("localCartLookup");
      setProductsLookup(storedCartLookup ? JSON.parse(storedCartLookup) : {});
      setIsCartLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    console.log("Cart: cartItems changed: ", cartItems);
    setCartTotal(getCartTotal());
    if (!userId) {
      localStorage.setItem("localCart", JSON.stringify(cartItems));
      localStorage.setItem("localCartLookup", JSON.stringify(productsLookup));
    }
  }, [cartItems]);

  useEffect(() => {
    console.log("Cart: productsLookup changed: ", productsLookup);
  }, [productsLookup]);

  // SEE CONTEXT VALUE
  const contextValue = {
    // Cart is loading
    isCartLoading,

    // cartTotal: Total cart price in int
    cartTotal,
    cartTotalItems,
    // cartItems: Lookup obj of items in cart with prod id and count (productsInfo of API return)
    // Use: cartItems[productId]
    cartItems,
    // productsLookup: Lookup objects of products in cart (full product data)
    // Use: productsLookup[productId]
    productsLookup,

    // Implemented API callers
    // cartAddProductToCart(productId)
    // Cart is fully  re-fetched from API when done
    cartAddProductToCart,
    // cartUpdateProductQuantity(productId,quantity)
    // Update local cart and call API
    cartUpdateProductQuantity,
    // cartRemoveProductFromCart(productId)
    // Update local cart and call API
    cartRemoveProductFromCart,

    // Clear localStorage cart or match backend cart if logged in
    resetCart
  };

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

export default CartContextProvider;
