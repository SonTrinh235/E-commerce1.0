import { useState, useContext, useMemo } from 'react';
import { X, Plus, Minus, ArrowRight, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from '../figma/ImageWithFallback.tsx';
import { CartContext } from '../../Context/CartContext'; // Đảm bảo đúng đường dẫn
import './FloatingCart.css';

export function FloatingCart() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const { 
    cartTotalItems, 
    cartItems, 
    productsLookup, 
    cartTotal, 
    cartUpdateProductQuantity,
    cartRemoveProductFromCart
  } = useContext(CartContext);

  const handleToggle = () => setIsOpen(!isOpen);
  const handleClose = () => setIsOpen(false);

  const handleCheckout = () => {
    handleClose();
    navigate('/checkout');
  };

  const renderList = useMemo(() => {
    return Object.keys(cartItems).map((productId) => {
      const itemParams = cartItems[productId];
      const productInfo = productsLookup[productId];

      if (!productInfo) return null; 

      return {
        _id: productId,
        name: productInfo.name,
        image: productInfo.imageInfo?.url || null,
        price: itemParams.price,
        quantity: itemParams.quantity
      };
    }).filter(item => item !== null);
  }, [cartItems, productsLookup]);


  return (
    <>
      {!isOpen && (
        <button className="floating-cart-btn" onClick={handleToggle}>
          <ShoppingCart className="floating-cart-icon" />
          
          {cartTotalItems > 0 && (
            <span className="floating-cart-count">{cartTotalItems}</span>
          )}
        </button>
      )}

      {isOpen && (
        <>
          <div className="cart-overlay" onClick={handleClose} />
          <div className="cart-sidebar">
            <div className="cart-header">
              <div>
                <h2>Giỏ hàng của bạn</h2>
                <p>{cartTotalItems} sản phẩm</p>
              </div>
              <button onClick={handleClose} className="cart-close-btn">
                <X className="close-icon" />
              </button>
            </div>

            <div className="cart-items">
              {renderList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
                  <ShoppingCart style={{ width: 48, height: 48, marginBottom: 10, opacity: 0.5 }} />
                  <p>Giỏ hàng đang trống</p>
                </div>
              ) : (
                renderList.map((item) => (
                  <div key={item._id} className="cart-item">
                    <div className="cart-item-image">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="item-image"
                      />
                    </div>

                    <div className="cart-item-info">
                      <h3 className="line-clamp-2">{item.name}</h3>
                      <p className="item-price">
                        {item.price?.toLocaleString('vi-VN')}đ
                      </p>

                      <div className="quantity-controls">
                        <button
                          onClick={() => {
                             if(item.quantity === 1) {
                                cartRemoveProductFromCart(item._id);
                             } else {
                                cartUpdateProductQuantity(item._id, item.quantity - 1);
                             }
                          }}
                          className="quantity-btn"
                        >
                          <Minus className="quantity-icon" />
                        </button>

                        <span className="quantity-display">{item.quantity}</span>

                        <button
                          onClick={() => cartUpdateProductQuantity(item._id, item.quantity + 1)}
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
                ))
              )}
            </div>

            {/* FOOTER */}
            {renderList.length > 0 && (
              <div className="cart-footer">
                <div className="cart-summary">
                  <div className="summary-row">
                    <span>Tạm tính:</span>
                    <span>{cartTotal?.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="summary-row">
                    <span>Phí vận chuyển:</span>
                    <span className="free-shipping">Miễn phí</span>
                  </div>
                  <div className="summary-total">
                    <span>Tổng cộng:</span>
                    <span className="total-price">{cartTotal?.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>

                <button className="checkout-btn" onClick={handleCheckout}>
                  <span>Thanh toán ngay</span>
                  <ArrowRight className="checkout-icon" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}