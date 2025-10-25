// CartContext.js
import React, { createContext, useState, useEffect } from "react";

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
  // Cart Is Loading
  const [isCartLoading, setIsCartLoading] = useState(true);
  // userId: Should be fetched from shop context or auth context
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

  // function: fetch cart and product data
  const initializeCartAndProductsLookup = async () => {
    setIsCartLoading(true);

    const newCart = await fetchCart(tempUserId);
    const productIds = newCart.map((item) => item.productId);
    await fetchProductsData(productIds);

    setIsCartLoading(false);
  };

  // function: Add product
  //  params: productId
  const cartAddProductToCart = async (productId) => {
    const productResponse = await getProductById(productId);
    const productData = productResponse.data;

    console.log("log", productData);
    addProductToCart(tempUserId, {
      productId: productId,
      quantity: 1,
      price: productData.price,
    });

    // Call fetch needed for product info (price, image)
    await initializeCartAndProductsLookup();
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
    updateProductQuantity(tempUserId, {
      productId: productId,
      quantity: quantity,
      price: productsLookup[productId].price,
    });

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
    removeProductFromCart(tempUserId, productId);
  };

  function getCartTotal() {
    let totalAmount = 0;
    Object.values(cartItems).map((item, i) => {
      totalAmount += item.price * item.quantity;
      return 0;
    });
    return totalAmount;
  }

  useEffect(() => {
    initializeCartAndProductsLookup();
  }, []);

  useEffect(() => {
    console.log("Cart: cartItems changed: ", cartItems);
    setCartTotal(getCartTotal());
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
  };

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

export default CartContextProvider;
