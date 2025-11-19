import React, { useContext, useState } from "react";
import { ShopContext } from "../Context/ShopContext";
import { CartContext } from "../Context/CartContext";
import CheckoutOrderPreview from "../Components/CheckoutOrderPreview/CheckoutOrderPreview.jsx";
import "./CSS/Checkout.css";
import COD_light from "../assets/COD_light.png";
import VNPAYLogo from "../assets/Logo-VNPAY-QR.png";
import DefaultImage from "../assets/placeholder-image.png";

import { vnd } from "../utils/currencyUtils.js";

// import APIs
import { createOrder } from "../api/orderService.js";
import { getPublicIp } from "../api/getPublicIp.js";

const Checkout = () => {
  const { userId } = useContext(ShopContext);

  const {
    isCartLoading,
    cartTotal,
    cartItems,
    cartTotalItems,
    productsLookup,
    appliedVoucher,
    resetCart,
  } = useContext(CartContext);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  const orderContent = Object.values(cartItems).map(cartItem => {
    // strip key "order"
    const { order, ...restOfCartItem } = cartItem;

    const productId = cartItem.productId;
    const productInfo = productsLookup[productId];

    return {
      ...restOfCartItem, // Spread all existing cart item properties
      productName: productInfo?.name || null,  // Add prod name from the lookup
      productImageUrl: productInfo?.imageInfo?.url || null // Add imageInfo from the lookup

    };
  });

  const SHIPPING_FEE = 0;

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


  // Snapshots to display order preview upon order create
  const [orderSnapshot, setOrderSnapshot] = useState(null);
  const [orderLookupSnapshot, setOrderLookupSnapshot] = useState(null);
  const [orderTotalItemSnapshot, setOrderTotalItemSnapshot] = useState(null);
  const [orderTotalSnapshot, setOrderTotalSnapshot] = useState(null);

  const captureOrderSnapshot = () => {
    setOrderSnapshot(orderContent);
    setOrderLookupSnapshot(productsLookup);
    setOrderTotalItemSnapshot(cartTotalItems);
    setOrderTotalSnapshot(getFinalTotal());
  };

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("CASH");

  const [showOrderPreview, setShowOrderPreview] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!true) {
      alert("Your cart is empty!");
      return;
    }
    alert(
      `Order placed successfully!\n\nName: ${formData.name}\nAddress: ${
        formData.address
      }\nPhone: ${formData.phone}\nEmail: ${formData.email}\n\nTotal: ${vnd(
        cartTotal
      )}`
    );
  };

  const ConfirmPlaceOrder = () => {
    if (cartTotalItems === 0) {
      alert("Giỏ hàng của bạn đang trống!");
    } else {
      if (!userId || !selectedPaymentMethod) {
        alert("Đơn hàng của bạn thiếu thông tin!");
      } else {
        if (window.confirm("Đơn hàng sẽ được đặt, hãy xác nhận:")) {
          placeOrder();
        }
      }
    }
  };

  const placeOrder = async () => {
    console.log("Checkout: New order");
    console.log("Checkout: User ID: ", userId);
    console.log("Checkout: Order content: ", orderContent);
    console.log("Checkout: Payment method: ", selectedPaymentMethod);

    let userPublicIp = null;
    // Call API

    // fetch IP
    try {
      userPublicIp = await getPublicIp();
    } catch(error) {
      console.log("IP fetch failed", error);
      return
    }

    // create order
    try {
      const res = await createOrder({
        userId: userId,
        paymentMethod: selectedPaymentMethod,
        productsInfo: orderContent,
        voucherCode: appliedVoucher?.code || null,
        ipAddr: userPublicIp,
      });
      
      // Open payment page if should
      if (selectedPaymentMethod === "VNBANK" || selectedPaymentMethod === "INTCARD") {
        const ImmediatePaymentUrl = res.data.newPayment.paymentUrl;
        if (ImmediatePaymentUrl) {
          window.open(ImmediatePaymentUrl, '_blank');
        }
      }


      // Capture snapshot for order preview
      captureOrderSnapshot();
      // Display order preview
      setShowOrderPreview(true);
      // Update cart
      resetCart();
    } catch (error) {
      console.error("createOrder failed:", error);
      alert("Create Order failed: check console");
    }
  };

  return (
    // Page Container
    <div className="Checkout-page">
      <div className="Checkout-container">
        <h1 className="Checkout-title">Thanh Toán</h1>
        <div className="Checkout-content">
          {isCartLoading ? (
            <div>Loading cart ... </div>
          ) : (
            // Cart content
            <div className="Checkout-items">
              <h3>Sản Phẩm Mua:</h3>
              {cartTotalItems === 0 ? (
                <div>Giỏ hàng của bạn đang trống</div>
              ) : (
                Object.values(cartItems).map((item) => {
                  const currentItemData = productsLookup[item.productId];
                  return (
                    <div key={item.productId} className="Checkout-item">
                      <img
                        src={currentItemData.imageInfo?.url || DefaultImage}
                        alt={currentItemData.name}
                      />
                      <div>
                        <h3>{currentItemData.name}</h3>
                        <p>
                          Số lượng {item.quantity} x {vnd(item.price)} ={" "}
                          <b>{vnd(item.price * item.quantity)}</b>
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* RIGHT SIDE CHECKOUT */}
          <div className="Checkout-right">
            {/* Ship Info */}
            <div className="Checkout-shipinfo">
              <h3>Thông Tin Giao Hàng</h3>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="name"
                  placeholder="Họ và Tên"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Địa Chỉ"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="phone"
                  placeholder="Số Điện Thoại"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </form>
            </div>

            {/* Checkout Summary */}
            <div className="Checkout-summary">
              <h3>Tổng Quan Đơn Hàng</h3>
              <p>Tổng số lượng: {cartTotalItems} sản phẩm</p>
              <b> Giá trị hàng: {vnd(cartTotal)}</b>
              <p> Giảm giá: {vnd(calculateDiscountAmount())}</p>
              <p> Phí vận chuyển: {vnd(getShippingFee())}</p>
              <h3>Tổng thanh toán: {vnd(getFinalTotal())}</h3>
            </div>

            {/* Payments */}
            <div className="Checkout-payments">
              <h3>Chọn phương thức thanh toán: </h3>
              <div className="option">
                <label>
                  <input
                    type="radio"
                    name="payment-method"
                    value="CASH"
                    checked={selectedPaymentMethod === "CASH"}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  />
                  <img src={COD_light} alt="" />
                  Thanh toán khi nhận hàng (COD)
                </label>
              </div>
              <div className="option">
                <label>
                  <input
                    type="radio"
                    name="payment-method"
                    value="VNBANK"
                    checked={selectedPaymentMethod === "VNBANK"}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  ></input>
                  <img src={VNPAYLogo} alt="" />
                  VN Pay
                </label>
              </div>
              <div className="option">
                <label>
                  <input
                    type="radio"
                    name="payment-method"
                    value="INTCARD"
                    checked={selectedPaymentMethod === "INTCARD"}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  ></input>
                  Thẻ quốc tế
                </label>
              </div>
            </div>
            {/* Place Order */}
            <button className="Checkout-placeorder" onClick={ConfirmPlaceOrder}>
              Đặt Hàng
            </button>
          </div>
        </div>
      </div>

      {showOrderPreview && (
        <div className="Checkout-OrderPreview-overlay">
          <CheckoutOrderPreview
            orderContent={orderSnapshot}
            productsLookup={orderLookupSnapshot}
            orderTotalItems={orderTotalItemSnapshot}
            orderTotal={orderTotalSnapshot}
          />
        </div>
      )}
    </div>
  );
};

export default Checkout;
