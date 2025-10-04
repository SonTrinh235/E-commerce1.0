import React, { useContext, useState } from "react";
import { ShopContext } from "../../Context/ShopContext";
import "./Checkout.css";

const Checkout = () => {
  const { cartItems, all_product, getTotalCartAmount } = useContext(ShopContext);

  const itemsInCart = all_product.filter((p) => cartItems[p.id] > 0);

  // state cho form
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
    if (!itemsInCart.length) {
      alert("Your cart is empty!");
      return;
    }
    alert(`Order placed successfully!\n\nName: ${formData.name}\nAddress: ${formData.address}\nPhone: ${formData.phone}\nEmail: ${formData.email}\n\nTotal: $${getTotalCartAmount().toFixed(2)}`);
  };

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>
      {itemsInCart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div className="checkout-content">
          {/* Left: items */}
          <div className="checkout-items">
            {itemsInCart.map((item) => (
              <div key={item.id} className="checkout-item">
                <img src={item.image} alt={item.name} />
                <div>
                  <h3>{item.name}</h3>
                  <p>
                    ${item.new_price} x {cartItems[item.id]} = $
                    {(item.new_price * cartItems[item.id]).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: summary + form */}
          <div className="checkout-right">
            <div className="checkout-summary">
              <h3>Order Summary</h3>
              <p>Total Items: {itemsInCart.length}</p>
              <h3>Total: ${getTotalCartAmount().toFixed(2)}</h3>
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
