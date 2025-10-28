import React, { useContext, useState } from "react";
import "./CSS/Cart.css";
import { Link } from "react-router-dom";
import promoCodes from "../data/Promo.js";
import CartItem from "../Components/CartItem/CartItem";
import { CartContext } from "../Context/CartContext";
import { vnd } from "../utils/currencyUtils.js";

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
      <h1 className="Cart-header"> Giỏ Hàng Của Tôi </h1>

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
                <th id="image-col">Sản Phẩm</th>
                <th id="name-col">Tên Sản Phẩm</th>
                <th id="price-col">Giá Thành/1</th>
                <th id="quantity-col">Số Lượng</th>
                <th id="total-col">Tổng Cộng</th>
                <th id="remove-col">Xóa</th>
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
          <h1>Tổng cộng</h1>
          <div>
            <div className="Cart-total-item">
              <p>Tổng tiền sản phẩm</p>
              <p>{vnd(cartTotal)}</p>
            </div>
            <hr />
            {appliedPromo && (
              <>
                <div className="Cart-total-item">
                  <p>Giảm giá ({appliedPromo.discount}%)</p>
                  <p>{vnd(calculateDiscount())}</p>
                </div>
                <hr />
              </>
            )}
            <div className="Cart-total-item">
              <p>Phí vận chuyển</p>
              <p>{vnd(getShippingFee())}</p>
              {appliedPromo && appliedPromo.type === "freeshipping" && (
                <span className="free-shipping-badge">
                  Free Shipping Applied
                </span>
              )}
            </div>
            <hr />
            <div className="Cart-total-item">
              <h3>Tổng Thanh Toán</h3>
              <h3>{vnd(getFinalTotal())}</h3>
            </div>
          </div>
          <Link to="/checkout">
            <button>Mua Hàng</button>
          </Link>
        </div>
        <div className="Cart-promocode">
          <h2>Mã Khuyến Mãi</h2>
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
              placeholder="Nhập mã khuyến mãi"
              value={promoCode}
              onChange={handlePromoCodeChange}
            />
            <button onClick={applyPromoCode}>Thêm</button>
          </form>
          {error && <p className="promo-error">{error}</p>}

          {/* testing */}
          <div className="available-promos">
            <p>
              <strong>Mã khuyến mãi có sẵn:</strong>
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
            cartAddProductToCart("68f9d130c3d1a3fe39a50f28");
          }}
        >
          Add Fish 1
        </button>
        <button
          onClick={() => {
            cartAddProductToCart("68f9d0d4c3d1a3fe39a50f00");
          }}
        >
          Add Cheese 1
        </button>
        <button
          onClick={() => {
            cartAddProductToCart("68f9d018c3d1a3fe39a50eb3");
          }}
        >
          Add Vegs 1
        </button>
        <button
          onClick={() => {
            cartAddProductToCart("68f9d2d1c3d1a3fe39a50f8d");
          }}
        >
          Add Fruit 1
        </button>
      </div>
    </div>
  );
};

export default Cart;
