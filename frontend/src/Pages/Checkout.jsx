import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../Context/ShopContext";
import { CartContext } from "../Context/CartContext";
import "./CSS/Checkout.css";
import DefaultImage from "../assets/placeholder-image.png";

// Import APIs
import { getCartByUserId } from "../api/cartService";
import { getProductById } from "../api/productService";
import { createOrder } from "../api/orderService";

const Checkout = () => {
  const [isLoading, setIsLoading] = useState(true);

  const {
    tempUserId,
    cartTotal,
    setCartTotal,
    cartItems,
    setCartItems,
    productsLookup,
    setProductsLookup,
    fetchCart,
    fetchProductsData,
  } = useContext(CartContext);

  const initializeCartAndProductsLookup = async () => {
    setIsLoading(true);

    const newCart = await fetchCart(tempUserId);
    const productIds = newCart.map((item) => item.productId);
    await fetchProductsData(productIds);

    setIsLoading(false);
  };

  useEffect(() => {
    initializeCartAndProductsLookup();
  }, []);

  // const { cartItems, all_product, getTotalCartAmount } =
  //   useContext(ShopContext);

  // cartItems
  // const itemsInCart = all_product.filter((p) => cartItems[p.id] > 0);

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
    if (!true) {
      alert("Your cart is empty!");
      return;
    }
    alert(
      `Order placed successfully!\n\nName: ${formData.name}\nAddress: ${
        formData.address
      }\nPhone: ${formData.phone}\nEmail: ${
        formData.email
      }\n\nTotal: $${cartTotal.toFixed(2)}`
    );
  };

  return (
    
    <div className="checkout-page">
      <h2>Checkout</h2>
      {true === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div className="checkout-content">
          {isLoading ? (
          <div>Loading cart ... </div>
        ) : (
          // Cart content
          <div className="checkout-items">
            {Object.values(cartItems).map((item) => {
              const currentItemData = productsLookup[item.productId];
              return (
                <div className="checkout-item">
                  <img
                    src={currentItemData.imageInfo?.url || DefaultImage}
                    alt={currentItemData.name}
                  />
                  <div>
                    <h3>{currentItemData.name}</h3>
                    <p>
                      ${item.price} x {item.quantity} = $
                      {item.price * item.quantity}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

          {/* Right: summary + form */}
          <div className="checkout-right">
            <div className="checkout-summary">
              <h3>Order Summary</h3>
              <p>Total Items: {Object.keys(cartItems).length}</p>
              <h3>Total: ${cartTotal}</h3>
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
