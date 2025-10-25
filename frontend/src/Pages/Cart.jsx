import React, { useContext, useState } from "react";
import "./CSS/Cart.css";
import { Link } from "react-router-dom";
import promoCodes from "../data/Promo.js";
import CartItem from "../Components/CartItem/CartItem";
import { CartContext } from "../Context/CartContext";

const currency = new Intl.NumberFormat("vi-VN");

const Cart = () => {
  const {
    isCartLoading,
    cartTotal,
    cartItems,
    productsLookup,
    // cartAddProductToCart,
    cartUpdateProductQuantity,
    cartRemoveProductFromCart,
  } = useContext(CartContext);

  const SHIPPING_FEE = 0;

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [error, setError] = useState("");

  const handlePromoCodeChange = (e) => {
    setPromoCode(e.target.value);
    setError("");
  };

  const applyPromoCode = (event) => {
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
    if (appliedPromo && appliedPromo.type === "freeshipping") return 0;
    return SHIPPING_FEE;
  };

  const getFinalTotal = () => {
    const subtotal = cartTotal;
    const discount = calculateDiscount();
    const shippingFee = getShippingFee();
    return subtotal - discount + shippingFee;
  };

  const cartArray = Object.values(cartItems);

  return (
    <div className="Cart-container">
      {/* Nút test tạm thời */}
      {/* <div style={{ marginBottom: 12 }}>
        <button
          onClick={() => cartAddProductToCart("68f9cf79c3d1a3fe39a50e90")}
          disabled={isCartLoading}
        >
          Add Meat 1
        </button>
      </div> */}

      <h1 className="Cart-header">Your Cart</h1>

      <div className="Cart-cart">
        {isCartLoading ? (
          <div>Loading cart ...</div>
        ) : cartArray.length === 0 ? (
          <div className="Cart-empty">
            <p>Giỏ hàng của bạn đang trống.</p>
            <Link to="/" className="Cart-empty-link">
              Tiếp tục mua sắm
            </Link>
          </div>
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
              {cartArray.map((item, i) => {
                const pid = String(item.productId);
                const current = productsLookup[pid] || {};
                const safePrice = Number(current.price ?? item.price ?? 0);
                const qty = Number(item.quantity ?? 0);

                return (
                  <tr key={pid || i}>
                    <td className="index-bar-cell">
                      <div className="index-bar">{i + 1}</div>
                    </td>

                    <CartItem
                      productId={pid}
                      imageInfo={current.imageInfo}
                      name={current.name || item.name || "Unnamed"}
                      price={safePrice}
                      quantity={qty}
                      onIncrease={() =>
                        cartUpdateProductQuantity(pid, qty + 1) 
                      }
                      onDecrease={() =>
                        cartUpdateProductQuantity(pid, Math.max(0, qty - 1))
                      }
                      onRemove={() => cartRemoveProductFromCart(pid)}
                    />
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="Cart-checkout">
        <div className="Cart-total">
          <h1>Total</h1>
          <div>
            <div className="Cart-total-item">
              <p>Subtotal</p>
              <p>{currency.format(cartTotal)} đ</p>
            </div>

            <hr />

            {appliedPromo && (
              <>
                <div className="Cart-total-item">
                  <p>Discount ({appliedPromo.discount}%)</p>
                  <p>-{currency.format(calculateDiscount())} đ</p>
                </div>
                <hr />
              </>
            )}

            <div className="Cart-total-item">
              <p>Shipping Fee</p>
              <p>{currency.format(getShippingFee())} đ</p>
              {appliedPromo && appliedPromo.type === "freeshipping" && (
                <span className="free-shipping-badge">Free Shipping Applied</span>
              )}
            </div>

            <hr />

            <div className="Cart-total-item">
              <h3>Total</h3>
              <h3>{currency.format(getFinalTotal())} đ</h3>
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
            <button type="submit">APPLY</button>
          </form>

          {error && <p className="promo-error">{error}</p>}

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
