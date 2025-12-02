import {  X, Plus, Minus, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback.tsx';
import './FloatingCart.css';

export function FloatingCart({ items, onUpdateQuantity, onClose }) {
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  if (items.length === 0) return null;

  return (
    <>
      <div className="cart-overlay" onClick={onClose} />
      <div className="cart-sidebar">
        <div className="cart-header">
          <div>
            <h2>Giỏ hàng của bạn</h2>
            <p>{totalQuantity} sản phẩm</p>
          </div>
          <button onClick={onClose} className="cart-close-btn">
            <X className="close-icon" />
          </button>
        </div>

        <div className="cart-items">
          {items.map((item) => (
            <div key={item._id || item.id} className="cart-item">
              <div className="cart-item-image">
                <ImageWithFallback
                  src={item.image}
                  alt={item.name}
                  className="item-image"
                />
              </div>

              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <p className="item-price">
                  {item.price.toLocaleString('vi-VN')}đ/{item.unit}
                </p>

                <div className="quantity-controls">
                  <button
                    onClick={() => onUpdateQuantity(item._id || item.id, item.quantity - 1)}
                    className="quantity-btn"
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="quantity-icon" />
                  </button>
                  <span className="quantity-display">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item._id || item.id, item.quantity + 1)}
                    className="quantity-btn quantity-btn-plus"
                  >
                    <Plus className="quantity-icon" />
                  </button>
                </div>
              </div>

              <div className="cart-item-total">
                {(item.price * item.quantity).toLocaleString('vi-VN')}đ
              </div>
            </div>
          ))}
        </div>

        <div className="cart-footer">
          <div className="cart-summary">
            <div className="summary-row">
              <span>Tạm tính:</span>
              <span>{totalPrice.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="summary-row">
              <span>Phí vận chuyển:</span>
              <span className="free-shipping">Miễn phí</span>
            </div>
            <div className="summary-total">
              <span>Tổng cộng:</span>
              <span className="total-price">{totalPrice.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>

          <button className="checkout-btn">
            <span>Thanh toán ngay</span>
            <ArrowRight className="checkout-icon" />
          </button>
        </div>
      </div>
    </>
  );
}