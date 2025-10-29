import React, { useContext, useState } from "react";
import { ShopContext } from "../Context/ShopContext";
import { CartContext } from "../Context/CartContext";
import "./CSS/Checkout.css";
import COD_light from "../assets/COD_light.png";
import VNPAYLogo from "../assets/Logo-VNPAY-QR.png";
import DefaultImage from "../assets/placeholder-image.png";

import { vnd } from "../utils/currencyUtils.js"

// import APIs
import { createOrder } from "../api/orderService.js";

const Checkout = () => {
  const { userId } = useContext(ShopContext);

  const { isCartLoading, cartTotal, cartItems, productsLookup } =
    useContext(CartContext);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  const orderContent = Object.values(cartItems);

  const checkoutTotalItems = Object.values(cartItems).reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cash");

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
      }\nPhone: ${formData.phone}\nEmail: ${
        formData.email
      }\n\nTotal: ${vnd(cartTotal)}`
    );
  };

  const placeOrder = async() => {
    if (!orderContent || !userId || !selectedPaymentMethod) {
      alert('Order detail missing content');
      return;
    }
    console.log("Checkout: New order");
    console.log("Checkout: User ID: ", userId);
    console.log("Checkout: Order content: ", orderContent);
    console.log("Checkout: Payment method: ", selectedPaymentMethod);
    alert(`Order plaed: Info logged into console`);

    // Call API
    try {
      await createOrder({
        userId: userId,
        paymentMethod: selectedPaymentMethod,
        productsInfo: orderContent,
      })
    } catch (error) {
      console.error("createOrder failed:", error);
      throw error;
    }

  };

  return (
    // Page Container
    <div className="Checkout-page">
      <h1>Thanh Toán</h1>
      {true === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        // Page Content
        <div className="Checkout-content">
          {isCartLoading ? (
            <div>Loading cart ... </div>
          ) : (
            // Cart content

            <div className="Checkout-items">
              <h3>Sản Phẩm Mua:</h3>
              {Object.values(cartItems).map((item) => {
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
                        Số lượng {item.quantity} x {vnd(item.price)} = <b>{vnd(item.price * item.quantity)}</b>
                      </p>
                    </div>
                  </div>
                );
              })}
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
              <p>Tổng số lượng: {checkoutTotalItems} sản phẩm</p>
              <h3>Tổng thanh toán: {vnd(cartTotal)}</h3>
            </div>


            {/* Payments */}
            <div className="Checkout-payments">
              <h3>Chọn phương thức thanh toán: </h3>
              <div className="option">
                <label>
                  <input
                    type="radio"
                    name="payment-method"
                    value="cash"
                    checked={selectedPaymentMethod === "cash"}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  />
                  <img src={COD_light} alt=""/>
                  Thanh toán khi nhận hàng (COD)
                </label>
              </div>
              <div className="option">
                <label>
                  <input
                    type="radio"
                    name="payment-method"
                    value="vnpay"
                    checked={selectedPaymentMethod === "vnpay"}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  ></input>
                  <img src={VNPAYLogo} alt=""/>
                  VN Pay
                </label>
              </div>
            </div>
            {/* Place Order */}
            <button className="Checkout-placeorder" onClick={placeOrder}>
              Đặt Hàng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
