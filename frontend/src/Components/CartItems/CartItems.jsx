import React, { useContext, useEffect, useState } from "react";
import "./CartItems.css";
import { ShopContext } from "../../Context/ShopContext";
import remove_icon from "../../assets/cart_cross_icon.png";
import { Link } from "react-router-dom";
import promoCodes from "../../data/Promo.js";
import {
  getCartByUserId,
  addProductToCart,
  updateProductQuantity,
  removeProductFromCart,
} from "../../api/cartService";
import { getProductById } from "../../api/productService";
import DefaultImage from "../../assets/placeholder-image.png";
import CartItem from "../CartItem/CartItem";

const CartItems = () => {
  const { getTotalCartAmount, all_product, addToCart, removeFromCart } =
    useContext(ShopContext);

  const tempUserId = "68f4edf24a4b075ca9f1ef90";
  const [isLoading, setIsLoading] = useState(true);

  // Cart items and Products data of lookup type
  const [cartItems, setCartItems] = useState({});
  const [productsLookup, setProductsLookup] = useState({});

  // function: Fetch cart with product id and count
  const fetchCartItems = async (userId) => {
    const response = await getCartByUserId(userId);
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
    setIsLoading(true);

    const newCart = await fetchCartItems(tempUserId);
    const productIds = newCart.map((item) => item.productId);
    await fetchProductsData(productIds);

    setIsLoading(false);
  };

  // function: Add product
  //  params: productId
  const cartAddProductToCart = async (productId) => {
    const productResponse = await getProductById(productId);
    const productData = productResponse.data;

    console.log("log", productData);
    const response = await addProductToCart(tempUserId, {
      productId: productId,
      quantity: 1,
      price: productData.price,
    });

    // Call fetch needed for product info (price, image)
    await initializeCartAndProductsLookup();
  };

  // function: Update product quantity
  // params: productId, quantity
  const cartUpdateProductQuantity = async (productId, quantity) => {
    setCartItems((prevCart) => {
      return {
        ...prevCart,
        [productId]: {
          ...prevCart[productId],
          quantity: quantity,
        },
      };
    });
    const response = await updateProductQuantity(tempUserId, {
      productId: productId,
      quantity: quantity,
      price: productsLookup[productId].price,
    });

    // For local cart: remove item on quantity 0
    // Remote cart is handled already
    if (quantity == 0) {
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
  const cartRemoveProductFromCart = async (productId) => {
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
    const response = await removeProductFromCart(tempUserId, productId);
  };

  useEffect(() => {
    initializeCartAndProductsLookup();
  }, []);

  useEffect(() => {
    console.log("CartItems: cartItems changed: ", cartItems);
  }, [cartItems]);

  useEffect(() => {
    console.log("CartItems: productsLookup changed: ", productsLookup);
  }, [productsLookup]);

  // ============ LEAVE BELOW UNTOUCHED =============================
  // =========== LEAVE BELOW UNTOUCHED ===========================

  const SHIPPING_FEE = 2;

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [error, setError] = useState("");

  const clearItem = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: 0 }));
  };

  const handlePromoCodeChange = (e) => {
    setPromoCode(e.target.value);
    setError("");
  };

  const applyPromoCode = () => {
    if (!promoCode.trim()) {
      setError("Please enter a promo code");
      return;
    }

    const foundPromo = promoCodes.find(
      (promo) => promo.code.toUpperCase() === promoCode.trim().toUpperCase()
    );

    if (foundPromo) {
      setAppliedPromo(foundPromo);
      setError("");
      setPromoCode("");
    } else {
      setError("Invalid promo code");
      setAppliedPromo(null);
    }
  };

  const calculateDiscount = () => {
    if (!appliedPromo) return 0;
    if (appliedPromo.type === "percentage") {
      const subtotal = getTotalCartAmount();
      return (subtotal * appliedPromo.discount) / 100;
    }
    return 0;
  };

  const getShippingFee = () => {
    if (appliedPromo && appliedPromo.type === "freeshipping") {
      return 0;
    }
    return SHIPPING_FEE;
  };

  const getFinalTotal = () => {
    const subtotal = getTotalCartAmount();
    const discount = calculateDiscount();
    // const shippingFee = getShippingFee();
    return subtotal - discount + SHIPPING_FEE;
  };

  // ================ LEAVE ABOVE UNTOUCHED =======================
  // ================ LEAVE ABOVE UNTOUCHED =======================

  return (
    <div className="cartitems">
      {/* TEMPORARY CART CONTROL BUTTONS FOR TESTING */}
      <div>
        <button
          onClick={() => {
            cartAddProductToCart("68f9cf79c3d1a3fe39a50e90");
          }}
        >
          Add Meat 1
        </button>
        <button
          onClick={() => {
            cartUpdateProductQuantity(
              "68f9cf79c3d1a3fe39a50e90",
              cartItems[3].quantity - 1
            );
          }}
        >
          -1 Meat 1
        </button>
        <button
          onClick={() => {
            cartRemoveProductFromCart("68f9cf79c3d1a3fe39a50e90");
          }}
        >
          Remove Meat 1
        </button>
      </div>

      {/* LIST CART ITEM */}
      {/* LIST CART ITEM */}
      <div className="cartitems-cart">
        {isLoading ? (
          <div>Loading cart ... </div>
        ) : (
          <table id="table">
            <thead>
              <tr>
                <th className="index">#</th>
                <th>Product</th>
                <th>Name</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {/* Map values cartItems as item */}
              {Object.values(cartItems).map((item, i) => {
                // Get product data for current cart item
                const currentItemData = productsLookup[item.productId];
                return (
                  // Cart item card
                  <tr key={i}>
                    <td className="index-bar-cell">
                      <div className="index-bar">
                        {i + 1}
                      </div>
                    </td>
                    <CartItem
                      {...item}
                      {...currentItemData}
                      onIncrease={() =>
                        cartUpdateProductQuantity(
                          item.productId,
                          item.quantity + 1
                        )
                      }
                      onDecrease={() =>
                        cartUpdateProductQuantity(
                          item.productId,
                          item.quantity - 1
                        )
                      }
                      onRemove={() => cartRemoveProductFromCart(item.productId)}
                    />
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* CHECKOUT */}
      {/* CHECKOUT */}
      <div className="cartitems-checkout">
        <div className="cartitems-total">
          <h1>Totals</h1>
          <div>
            <div className="cartitems-total-item">
              <p>Subtotal</p>
              <p>${getTotalCartAmount()}</p>
            </div>
            <hr />
            {appliedPromo && (
              <>
                <div className="cartitems-total-item">
                  <p>Discount ({appliedPromo.discount}%)</p>
                  <p>-${calculateDiscount().toFixed(2)}</p>
                </div>
                <hr />
              </>
            )}
            <div className="cartitems-total-item">
              <p>Shipping Fee</p>
              <p>${getShippingFee().toFixed(2)}</p>
              {appliedPromo && appliedPromo.type === "freeshipping" && (
                <span className="free-shipping-badge">
                  Free Shipping Applied
                </span>
              )}
            </div>
            <hr />
            <div className="cartitems-total-item">
              <h3>Total</h3>
              <h3>${getFinalTotal().toFixed(2)}</h3>
            </div>
          </div>
          <Link to="/checkout">
            <button>PROCEED TO CHECKOUT</button>
          </Link>
        </div>
        <div className="cartitems-promocode">
          <p>PROMO CODE HERE</p>
          {appliedPromo && (
            <div className="applied-promo">
              <p>
                Applied: {appliedPromo.code} ({appliedPromo.description})
              </p>
              <button onClick={() => setAppliedPromo(null)}>Remove</button>
            </div>
          )}
          <div className="cartitems-promobox">
            <input
              type="text"
              placeholder="Enter your code"
              value={promoCode}
              onChange={handlePromoCodeChange}
            />
            <button onClick={applyPromoCode}>APPLY</button>
          </div>
          {error && <p className="promo-error">{error}</p>}

          {/* testing */}
          <div className="available-promos">
            <p>
              <strong>Available promo codes:</strong>
            </p>
            <ul>
              {promoCodes.map((promo, index) => (
                <li key={index}>
                  {promo.code} - {promo.description}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItems;
