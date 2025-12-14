import { useState, useContext, useMemo } from 'react';
import { X, Plus, Minus, ArrowRight, ShoppingCart, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from '../figma/ImageWithFallback.tsx';
import { CartContext } from '../../Context/CartContext';
import './FloatingCart.css';

export function FloatingCart() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const { 
    cartTotalItems, 
    cartItems, 
    productsLookup, 
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

      const computed = itemParams.computedPrice || {};
      const quantity = Number(itemParams.quantity) || 1;

      const lineTotal = computed.totalForItemPrice !== undefined 
                        ? Number(computed.totalForItemPrice) 
                        : (Number(itemParams.price) || 0) * quantity;

      return {
        _id: productId,
        name: productInfo.name,
        image: itemParams.productImageUrl || productInfo.imageInfo?.url || null,
        price: Number(itemParams.price) || 0,
        computedPrice: computed,
        lineTotal: lineTotal,
        quantity: quantity
      };
    }).filter(item => item !== null);
  }, [cartItems, productsLookup]);

  const currentCartTotal = renderList.reduce((acc, item) => acc + item.lineTotal, 0);

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
                      {item.computedPrice?.flashQty > 0 && (
                        <div style={{
                            position: 'absolute', bottom: 0, right: 0, 
                            background: '#eab308', color: 'white', 
                            fontSize: '9px', padding: '2px 4px', 
                            borderRadius: '4px 0 0 0'
                        }}>
                           <Zap size={8} style={{display: 'inline'}}/> FS
                        </div>
                      )}
                    </div>

                    <div className="cart-item-info">
                      <h3 className="line-clamp-2">{item.name}</h3>
                      
                      <div className="item-price">
                        {item.computedPrice?.flashQty > 0 ? (
                           <div style={{display: 'flex', flexDirection: 'column', fontSize: '0.85rem'}}>
                              <span style={{color: '#eab308', display: 'flex', alignItems: 'center', gap: 4}}>
                                 <Zap size={10} fill="#eab308"/> 
                                 {item.computedPrice.flashQty}x{Number(item.computedPrice.flashPrice).toLocaleString('vi-VN')}đ
                              </span>
                              {item.computedPrice.normalQty > 0 && (
                                 <span style={{color: '#666', fontSize: '0.8rem'}}>
                                    {item.computedPrice.normalQty}x{Number(item.computedPrice.normalPrice).toLocaleString('vi-VN')}đ
                                 </span>
                              )}
                           </div>
                        ) : (
                           <span>{item.price.toLocaleString('vi-VN')}đ</span>
                        )}
                      </div>

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
                      {item.lineTotal.toLocaleString('vi-VN')}đ
                    </div>
                  </div>
                ))
              )}
            </div>

            {renderList.length > 0 && (
              <div className="cart-footer">
                <div className="cart-summary">
                  <div className="summary-row">
                    <span>Tạm tính:</span>
                    <span>{currentCartTotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="summary-row">
                    <span>Phí vận chuyển:</span>
                    <span className="free-shipping">Miễn phí</span>
                  </div>
                  <div className="summary-total">
                    <span>Tổng cộng:</span>
                    <span className="total-price">{currentCartTotal.toLocaleString('vi-VN')}đ</span>
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