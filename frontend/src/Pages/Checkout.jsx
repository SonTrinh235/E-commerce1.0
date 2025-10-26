import React, { useContext, useMemo, useState } from "react";
import "./CSS/Checkout.css";
import DefaultImage from "../assets/placeholder-image.png";
import { CartContext } from "../Context/CartContext";

const currency = new Intl.NumberFormat("vi-VN"); // #,### đ

const Checkout = () => {
  const { isCartLoading, cartTotal, cartItems, productsLookup } = useContext(CartContext);

  // Danh sách item an toàn (lọc null/undefined)
  const cartArray = useMemo(
    () => Object.values(cartItems || {}).filter(Boolean),
    [cartItems]
  );

  // Tổng số lượng = sum quantity (không phải số key)
  const totalQty = useMemo(
    () => cartArray.reduce((sum, it) => sum + Number(it?.quantity || 0), 0),
    [cartArray]
  );

  // state form giao hàng
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cartArray.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }
    alert(
      `Đặt hàng thành công!\n\nHọ tên: ${formData.name}\nĐịa chỉ: ${formData.address}\nĐiện thoại: ${formData.phone}\nEmail: ${formData.email}\n\nTổng: ${currency.format(cartTotal)} đ`
    );
    // TODO: gọi createOrder(...) nếu bạn đã có API đặt hàng
  };

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>

      {isCartLoading ? (
        <div>Loading cart ...</div>
      ) : cartArray.length === 0 ? (
        <p>Giỏ hàng của bạn đang trống.</p>
      ) : (
        <div className="checkout-content">
          {/* Left: danh sách sản phẩm */}
          <div className="checkout-items">
            {cartArray.map((raw, i) => {
              const item = raw || {};
              const pid = String(item.productId || "");
              if (!pid) return null;

              const product = productsLookup?.[pid] || {};
              const name = product.name || item.name || "Unnamed";
              const imgSrc =
                product.imageInfo?.url ||
                item.imageInfo?.url ||
                product.imageUrl ||
                item.imageUrl ||
                product.image ||
                item.image ||
                DefaultImage;

              const price = Number(product.price ?? item.price ?? 0);
              const qty = Number(item.quantity ?? 0);
              const lineTotal = price * qty;

              return (
                <div className="checkout-item" key={pid || i}>
                  <img src={imgSrc} alt={name} />
                  <div>
                    <h3>{name}</h3>
                    <p>
                      {currency.format(price)} đ × {qty} ={" "}
                      <b>{currency.format(lineTotal)} đ</b>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: summary + form */}
          <div className="checkout-right">
            <div className="checkout-summary">
              <h3>Order Summary</h3>
              <p>Total Items: {totalQty}</p>
              <h3>Total: {currency.format(cartTotal)} đ</h3>
            </div>

            <div className="checkout-form">
              <h3>Shipping Information</h3>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
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
                <button type="submit">Place Order</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
