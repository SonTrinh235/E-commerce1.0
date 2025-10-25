import React, { useContext, useState } from "react";
import "./CSS/Cart.css";
import { Link } from "react-router-dom";
import promoCodes from "../data/Promo.js";
import CartItem from "../Components/CartItem/CartItem";
import { CartContext } from "../Context/CartContext";

const Cart = () => {
  // Import cart from CartContext
  const {
    // Cart is loading
    isCartLoading,

    // cartTotal: Total cart price
    cartTotal,
    // cartItems: Items in cart with prod id and count
    cartItems,
    // productsLookup: Lookup objects of products in cart (full product data)
    productsLookup,

    // Implemented API callers
    // cartAddProductToCart(productId)
    cartAddProductToCart,
    // cartUpdateProductQuantity(productId,quantity)
    cartUpdateProductQuantity,
    // cartRemoveProductFromCart(productId)
    cartRemoveProductFromCart,
  } = useContext(CartContext);

  // ============ BELOW IGNORED =============================
  // =========== BELOW IGNORED ===========================

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

  // ================ ABOVE IGNORED =======================
  // ================ ABOVE IGNORED =======================

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
      </div>

      <h1 className="Cart-header"> Your Cart </h1>

      {/* LIST CART ITEM */}
      {/* LIST CART ITEM */}
      <div className="Cart-cart">
        {isCartLoading ? (
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
