import React, { useContext, useState } from 'react'
import './CartItems.css'
import { ShopContext } from '../../Context/ShopContext'
import remove_icon from '../Assets/cart_cross_icon.png'
import { Link } from "react-router-dom";
import promoCodes from '../Assets/Promo.js'

const CartItems = () => {
  const {
    getTotalCartAmount,
    all_product,
    cartItems,
    addToCart,
    removeFromCart,
    setCartItems,
  } = useContext(ShopContext)

  const SHIPPING_FEE = 2;

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [error, setError] = useState("");

  const clearItem = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: 0 }))
  }

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
    if(appliedPromo.type === "percentage") {
      const subtotal = getTotalCartAmount();
      return (subtotal * appliedPromo.discount) / 100;
    }
    return 0;
  };

  const getShippingFee = () => {
    if(appliedPromo && appliedPromo.type === "freeshipping") {
      return 0;
    }
    return SHIPPING_FEE;
  }
  
  const getFinalTotal = () => {
    const subtotal = getTotalCartAmount();
    const discount = calculateDiscount();
    const shippingFee = getShippingFee();
    return subtotal - discount + SHIPPING_FEE;
  };

  return (
    <div className="cartitems">
      <div className="cartitems-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
        <p>Remove</p>
      </div>
      <hr />

      {all_product.map((e) => {
        if (cartItems[e.id] > 0) {
          return (
            <div key={e.id}>
              <div className="cartitems-format cartitems-format-main">
                <img
                  src={e.image}
                  alt={e.name}
                  className="carticon-product-icon"
                />
                <p>{e.name}</p>
                <p>${e.new_price}</p>

                <div className="cartitems-quantity-control">
                  <button onClick={() => removeFromCart(e.id)}>-</button>
                  <span>{cartItems[e.id]}</span>
                  <button onClick={() => addToCart(e.id)}>+</button>
                </div>

                <p>${e.new_price * cartItems[e.id]}</p>

                <img
                  src={remove_icon}
                  onClick={() => clearItem(e.id)}
                  alt="remove"
                  className="cartitems-remove-icon"
                />
              </div>
              <hr />
            </div>
          )
        }
        return null
      })}

      <div className="cartitems-down">
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
                <span className="free-shipping-badge">Free Shipping Applied</span>
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
              <p>Applied: {appliedPromo.code} ({appliedPromo.description})</p>
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
            <p><strong>Available promo codes:</strong></p>
            <ul>
              {promoCodes.map((promo, index) => (
                <li key={index}>{promo.code} - {promo.description}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartItems