import React, { useContext, useEffect, useState } from "react";
import "./CSS/Cart.css";
import { useNavigate } from "react-router-dom";
import promoCodes from "../data/Promo.js";
import CartItem from "../Components/CartItem/CartItem";
import { CartContext } from "../Context/CartContext";

// Import APIs
import { getAllVouchers } from "../api/voucherService.js";

// Import utils
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
    cartTotalItems,

    // productsLookup: Lookup objects of products in cart (full product data)
    productsLookup,

    // Implemented API callers
    // cartAddProductToCart(productId)
    cartAddProductToCart,
    // cartUpdateProductQuantity(productId,quantity)
    cartUpdateProductQuantity,
    // cartRemoveProductFromCart(productId)
    cartRemoveProductFromCart,

    //voucher
    appliedVoucher, setAppliedVoucher
  } = useContext(CartContext);

  const [voucherList, setVoucherList] = useState([]);

  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    if (cartTotalItems === 0) {
      alert("Giỏ hàng của bạn đang trống")
    } else {
      navigate("/checkout")
    }
  }


  const fetchVouchers = async (page = 1, limit = 20) => {
    const response = await getAllVouchers(page,limit);
    setVoucherList(response.data.list);
  }

  useEffect(() => {
    fetchVouchers();
  },[])


  // ============ BELOW IGNORED =============================
  // =========== BELOW IGNORED ===========================

  const SHIPPING_FEE = 0;

  const [voucherError, setVoucherError] = useState("");
  const [inputVoucherCode, setInputVoucherCode] = useState(''); 


  const applyVoucher = (event) => {
    // Prevent page refresh on submit
    event.preventDefault();
    if (!inputVoucherCode.trim()) {
      setVoucherError("Please enter a promo code");
      return;
    }

    console.log(inputVoucherCode);
    const foundVoucher = voucherList.find(
      (voucher) => voucher.code.trim().toUpperCase() === inputVoucherCode.trim().toUpperCase()
    );

    if (foundVoucher) {
      setAppliedVoucher(foundVoucher);
    } else {
      setVoucherError("Voucher không hợp lệ!");
      setAppliedVoucher(null);
    }
  };

  const calculateDiscountAmount = () => {
    if (!appliedVoucher) return 0;

    const voucherType = appliedVoucher.discountType;
    const voucherValue = appliedVoucher.discountValue;
    const subtotal = cartTotal;

    if (voucherType === "percentage") {
      return (subtotal * voucherValue/100);
    } else if (voucherType === "fixed") {
      return Math.min(subtotal, voucherValue);
    }
    return 0;
  };

  const getShippingFee = () => {
    return SHIPPING_FEE;
  };

  const getFinalTotal = () => {
    const subtotal = cartTotal;
    const discount = calculateDiscountAmount();
    // const shippingFee = getShippingFee();
    return subtotal - discount + SHIPPING_FEE;
  };

  // ================ ABOVE IGNORED =======================
  // ================ ABOVE IGNORED =======================

  return (
    <div className="Cart-container">

      {/* LIST CART ITEM */}
      {/* LIST CART ITEM */}
      <div className="Cart-cart">
      <h1> Giỏ Hàng Của Tôi: </h1>
        {isCartLoading ? (
          <div>Loading cart ... </div>
        ) : (
          <table id="table">
            <thead>
              {cartTotalItems === 0 ? (
                <div>Giỏ hàng của bạn đang trống</div>
              ) : ( 
                <tr>
                <th id="index-col">#</th>
                <th id="image-col">Sản Phẩm</th>
                <th id="name-col">Tên Sản Phẩm</th>
                <th id="price-col">Giá Thành/1</th>
                <th id="quantity-col">Số Lượng</th>
                <th id="total-col">Tổng Cộng</th>
                <th id="remove-col">Xóa</th>
              </tr>
              )}
            </thead>
            <tbody>
              {/* Map values cartItems as item */}
              {Object.values(cartItems).map((item, i) => {
                // Get product data for current cart item
                const currentItemData = productsLookup[item.productId];
                const index = i + 1;
                return (
                  // Cart item card
                    <CartItem
                      index={index}
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


            {appliedVoucher && (
              <>
                <div className="Cart-total-item">

                  <p>
                    Giảm giá (

                      {appliedVoucher.discountType === 'percentage' ? (
                        <>{appliedVoucher.discountValue}%</>
                      ) : appliedVoucher.discountType === 'fixed' ? (
                        <>{vnd(appliedVoucher.discountValue)}</>
                      ) : (
                        <>Unexpected discountType</>
                      )}

                    )
                  </p>

                  <p>{vnd(calculateDiscountAmount())}</p>

                </div>
                <hr />
              </>
            )}


            <div className="Cart-total-item">
              <p>Phí vận chuyển</p>
              <p>{vnd(getShippingFee())}</p>
            </div>
            <hr />
            
            <div className="Cart-total-item">
              <h3>Tổng Thanh Toán</h3>
              <h3>{vnd(getFinalTotal())}</h3>
            </div>
          </div>
          
          {/* Checkout button */}
          <button onClick={handleCheckoutClick}>
            Mua Hàng
          </button>

        </div>
        
        
         {/* PROMO CODE SECTION */}
        <div className="Cart-promocode">
          <h2>Mã Khuyến Mãi</h2>
          {appliedVoucher && (
            <div className="applied-promo">
              <p>
                Applied: {appliedVoucher.code} ({appliedVoucher.description})
              </p>
              <button onClick={() => setAppliedVoucher(null)}>Remove</button>
            </div>
          )}
          <form className="Cart-promobox" onSubmit={applyVoucher}>
            <input
              type="text"
              placeholder="Nhập mã khuyến mãi"
              value={inputVoucherCode}
              onChange={(e) => setInputVoucherCode(e.target.value)}
            />
            <button onClick={applyVoucher}>Thêm</button>
          </form>
          {voucherError && <b className="promo-error" style={{color: 'rgba(184, 55, 55, 1)'}}>{voucherError}</b>}

          {/* testing */}
          <div className="available-promos">
            <p>
              <strong>Mã khuyến mãi có sẵn:</strong>
            </p>
            <ul>
              {voucherList.map((voucher, i) => (
                <li key={i}>
                  {voucher.code} - {voucher.description}
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
