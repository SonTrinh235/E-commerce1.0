import React, { useContext } from 'react'
import './CartItems.css'
import { ShopContext } from '../../Context/ShopContext'
import remove_icon from '../Assets/cart_cross_icon.png'
import { Link } from "react-router-dom";


const CartItems = () => {
  const {
    getTotalCartAmount,
    all_product,
    cartItems,
    addToCart,
    removeFromCart,
    setCartItems, // cần lấy setCartItems từ context để xóa hẳn
  } = useContext(ShopContext)

  // Hàm xóa hẳn 1 sản phẩm
  const clearItem = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: 0 }))
  }

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

                {/* Quantity control */}
                <div className="cartitems-quantity-control">
                  <button onClick={() => removeFromCart(e.id)}>-</button>
                  <span>{cartItems[e.id]}</span>
                  <button onClick={() => addToCart(e.id)}>+</button>
                </div>

                <p>${e.new_price * cartItems[e.id]}</p>

                {/* Xóa hẳn sản phẩm */}
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
            <div className="cartitems-total-item">
              <p>Shipping Fee</p>
              <p>Free</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <h3>Total</h3>
              <h3>${getTotalCartAmount()}</h3>
            </div>
          </div>
            <Link to="/checkout">
                <button>PROCEED TO CHECKOUT</button>
            </Link>
        </div>
        <div className="cartitems-promocode">
          <p>PROMO CODE HERE</p>
          <div className="cartitems-promobox">
            <input type="text" placeholder="Enter your code" />
            <button>APPLY</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartItems
