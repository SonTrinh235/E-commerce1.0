// CartContext.js
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";

// import APIs
import { getCartByUserId } from "../api/cartService";
import { getProductById } from "../api/productService";

// 1. Create the Context object
export const CartContext = createContext();

export const CartContextProvider = ({ children }) => {
  // userId
  const tempUserId = "68f4edf24a4b075ca9f1ef90";
  // cartTotal: Total price of cart
  const [cartTotal, setCartTotal] = useState();
  // cartItems: Lookup objects of items in cart (productId and count)
  const [cartItems, setCartItems] = useState({});
  // productsLookup: Lookup objects of products in cart (full product data)
  const [productsLookup, setProductsLookup] = useState({});

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

  // Define the context value
  const contextValue = {
    tempUserId,
    cartTotal,
    setCartTotal,
    cartItems,
    setCartItems,
    productsLookup,
    setProductsLookup,
    fetchCart,
    fetchProductsData,
  };

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};


export default CartContextProvider;