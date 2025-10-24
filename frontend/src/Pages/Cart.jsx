import React, { useContext, useEffect, useState } from "react";
import "./CSS/Cart.css";
import { Link } from "react-router-dom";
import promoCodes from "../data/Promo.js";
import CartItem from "../Components/CartItem/CartItem";
import { CartContext } from "../Context/CartContext"

// Import APIs
import {
  getCartByUserId,
  addProductToCart,
  updateProductQuantity,
  removeProductFromCart,
} from "../api/cartService";
import { getProductById } from "../api/productService";

const Cart = () => {
  const { tempUserId,
    cartTotal,
    setCartTotal,
    cartItems,
    setCartItems,
    productsLookup,
    setProductsLookup,
    fetchCart,
    fetchProductsData } = useContext(CartContext);

  const [isLoading, setIsLoading] = useState(true);

  // function: fetch cart and product data
  const initializeCartAndProductsLookup = async () => {
    setIsLoading(true);

    const newCart = await fetchCart(tempUserId);
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
      return(0);
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

  // ============ LEAVE BELOW UNTOUCHED =============================
  // =========== LEAVE BELOW UNTOUCHED ===========================

  const SHIPPING_FEE = 0;

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [error, setError] = useState("");

  const handlePromoCodeChange = (e) => {
    setPromoCode(e.target.value);
    setError("");
  };

  const applyPromoCode = (event) => {
    // Prevent page refresh on submit
    event.preventDefault();
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
      const subtotal = cartTotal;
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
    const subtotal = cartTotal;
    const discount = calculateDiscount();
    // const shippingFee = getShippingFee();
    return subtotal - discount + SHIPPING_FEE;
  };

  // ================ LEAVE ABOVE UNTOUCHED =======================
  // ================ LEAVE ABOVE UNTOUCHED =======================

  return (
    <div className="Cart-container">
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

      <h1 className="Cart-header"> Your Cart </h1>

      {/* LIST CART ITEM */}
      {/* LIST CART ITEM */}
      <div className="Cart-cart">
        {isLoading ? (
          <div>Loading cart ... </div>
        ) : (
          <table id="table">
            <thead>
              <tr>
                <th id="index-col">#</th>
                <th id="image-col">Product</th>
                <th id="name-col">Name</th>
                <th id="price-col">Price</th>
                <th id="quantity-col">Quantity</th>
                <th id="total-col">Total</th>
                <th id="remove-col">Remove</th>
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
                      <div className="index-bar">{i + 1}</div>
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
      <div className="Cart-checkout">
        <div className="Cart-total">
          <h1>Total</h1>
          <div>
            <div className="Cart-total-item">
              <p>Subtotal</p>
              <p>${cartTotal}</p>
            </div>
            <hr />
            {appliedPromo && (
              <>
                <div className="Cart-total-item">
                  <p>Discount ({appliedPromo.discount}%)</p>
                  <p>-${calculateDiscount().toFixed(2)}</p>
                </div>
                <hr />
              </>
            )}
            <div className="Cart-total-item">
              <p>Shipping Fee</p>
              <p>${getShippingFee().toFixed(2)}</p>
              {appliedPromo && appliedPromo.type === "freeshipping" && (
                <span className="free-shipping-badge">
                  Free Shipping Applied
                </span>
              )}
            </div>
            <hr />
            <div className="Cart-total-item">
              <h3>Total</h3>
              <h3>${getFinalTotal().toFixed(2)}</h3>
            </div>
          </div>
          <Link to="/checkout">
            <button>PROCEED TO CHECKOUT</button>
          </Link>
        </div>
        <div className="Cart-promocode">
          <p>PROMO CODE HERE</p>
          {appliedPromo && (
            <div className="applied-promo">
              <p>
                Applied: {appliedPromo.code} ({appliedPromo.description})
              </p>
              <button onClick={() => setAppliedPromo(null)}>Remove</button>
            </div>
          )}
          <form className="Cart-promobox" onSubmit={applyPromoCode}>
            <input
              type="text"
              placeholder="Enter your code"
              value={promoCode}
              onChange={handlePromoCodeChange}
            />
            <button onClick={applyPromoCode}>APPLY</button>
          </form>
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

export default Cart;
