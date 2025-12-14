import React, { useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, Tag, Zap } from 'lucide-react';
import { CartContext } from '../Context/CartContext';
import './CSS/Cart.css';

export default function Cart() {
  const navigate = useNavigate();

  const { 
    cartItems, 
    productsLookup, 
    cartUpdateProductQuantity, 
    cartRemoveProductFromCart,
    isCartLoading 
  } = useContext(CartContext);

  const items = useMemo(() => {
    return Object.keys(cartItems).map(productId => {
      const cartItem = cartItems[productId];
      const productDetail = productsLookup[productId];
      const computed = cartItem.computedPrice || {};
      const quantity = Number(cartItem.quantity) || 1;
      
      const lineTotal = computed.totalForItemPrice !== undefined 
                        ? Number(computed.totalForItemPrice) 
                        : (Number(cartItem.price) || 0) * quantity;

      return {
        id: productId,
        name: cartItem.productName || productDetail?.name || "Sản phẩm",
        image: cartItem.productImageUrl || productDetail?.imageInfo?.url || "",
        computedPrice: computed,
        lineTotal: lineTotal,
        quantity: quantity,
        unit: productDetail?.unit || "Cái",
        originalPrice: Number(productDetail?.originalPrice) || 0,
        discount: Number(productDetail?.discount) || 0,
        displayPrice: computed.flashPrice || computed.normalPrice || cartItem.price || 0
      };
    });
  }, [cartItems, productsLookup]);

  const subtotal = items.reduce((acc, item) => acc + item.lineTotal, 0);

  const discountAmount = items.reduce((sum, item) => {
    // Nếu giá gốc > giá hiển thị (đã tính flash sale hoặc giá thường)
    if (item.originalPrice > item.displayPrice) {
      return sum + ((item.originalPrice - item.displayPrice) * item.quantity);
    }
    return sum;
  }, 0);
  
  const shippingFee = subtotal > 0 ? (subtotal >= 200000 ? 0 : 25000) : 0;
  const finalTotal = subtotal + shippingFee;

  const handleBack = () => navigate('/');
  const handleCheckout = () => navigate('/checkout');

  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    cartUpdateProductQuantity(id, newQuantity);
  };

  const handleRemove = (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa sản phẩm này?")) {
      cartRemoveProductFromCart(id);
    }
  };

  const getImage = (src) => (!src || src.trim() === "") ? "/logo192.png" : src;

  const renderPriceInfo = (item) => {
    const { computedPrice } = item;
    
    if (computedPrice && computedPrice.flashQty > 0) {
      return (
        <div className="price-breakdown" style={{ fontSize: '0.9rem' }}>
          <div style={{ color: '#eab308', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Zap size={12} fill="#eab308" />
            <span>
              {computedPrice.flashQty} x {Number(computedPrice.flashPrice).toLocaleString("vi-VN")}đ
            </span>
          </div>
          
          {computedPrice.normalQty > 0 && (
            <div style={{ color: '#666', marginTop: 2 }}>
              {computedPrice.normalQty} x {Number(computedPrice.normalPrice).toLocaleString("vi-VN")}đ
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="item-price-section">
        <span className="item-price">
          {(computedPrice.normalPrice || item.displayPrice || 0).toLocaleString("vi-VN")}đ
        </span>
        {item.originalPrice > (computedPrice.normalPrice || item.displayPrice || 0) && (
          <span className="item-original-price">
            {item.originalPrice.toLocaleString("vi-VN")}đ
          </span>
        )}
      </div>
    );
  };

  if (isCartLoading && items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container" style={{ textAlign: 'center', paddingTop: 100 }}>
          <div className="loading-spinner"></div>
          <p>Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <button onClick={handleBack} className="back-button">
          <ArrowLeft className="icon" /> Tiếp tục mua sắm
        </button>

        <div className="cart-content">
          <div className="cart-main">
            <div className="cart-header">
              <h1>Giỏ hàng của bạn</h1>
              <p className="item-count">{items.length} sản phẩm</p>
            </div>

            {items.length === 0 ? (
              <div className="empty-cart">
                <ShoppingBag className="empty-icon" />
                <h2>Giỏ hàng trống</h2>
                <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
                <button onClick={handleBack} className="shop-now-btn">
                  Mua sắm ngay
                </button>
              </div>
            ) : (
              <div className="cart-items">
                {items.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="item-image">
                      <img
                        src={getImage(item.image)}
                        alt={item.name}
                        className="image"
                        onError={(e) => (e.target.src = "/logo192.png")}
                      />
                      {item.computedPrice?.flashQty > 0 && (
                        <div className="item-discount-badge" style={{background: '#eab308'}}>
                          <Zap size={10} fill="white" style={{marginRight:2}}/> Flash Sale
                        </div>
                      )}
                    </div>

                    <div className="item-info">
                      <h3 className="item-name">{item.name}</h3>
                      <p className="item-unit">Đơn vị: {item.unit}</p>
                      {renderPriceInfo(item)}
                    </div>

                    <div className="item-actions">
                      <div className="quantity-control">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="qty-btn"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="qty-icon" />
                        </button>
                        
                        <span className="qty-value">{item.quantity}</span>
                        
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="qty-btn qty-btn-plus"
                        >
                          <Plus className="qty-icon" />
                        </button>
                      </div>
                      
                      <div className="item-total">
                        {item.lineTotal.toLocaleString("vi-VN")}đ
                      </div>
                      
                      <button onClick={() => handleRemove(item.id)} className="remove-btn">
                        <Trash2 className="remove-icon" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="cart-sidebar">
              <div className="order-summary">
                <h2>Tóm tắt đơn hàng</h2>
                <div className="summary-section">
                  <div className="summary-row">
                    <span>Tạm tính ({items.length} sản phẩm)</span>
                    <span>{subtotal.toLocaleString("vi-VN")}đ</span>
                  </div>
                  
                  {/* --- ĐÃ THÊM LẠI PHẦN HIỂN THỊ TIẾT KIỆM (SỬ DỤNG discountAmount) --- */}
                  {discountAmount > 0 && (
                    <div className="summary-row discount-row" style={{ color: '#10b981' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Tag size={14} /> Tiết kiệm
                      </span>
                      <span>-{discountAmount.toLocaleString("vi-VN")}đ</span>
                    </div>
                  )}
                  {/* ----------------------------------------------------------------- */}

                  <div className="summary-row">
                    <span>Phí vận chuyển</span>
                    <span className={shippingFee === 0 ? "free-shipping" : ""}>
                      {shippingFee === 0 ? "Miễn phí" : shippingFee.toLocaleString("vi-VN") + "đ"}
                    </span>
                  </div>
                  {subtotal < 200000 && subtotal > 0 && (
                    <div className="shipping-notice">
                      Mua thêm {(200000 - subtotal).toLocaleString("vi-VN")}đ để được miễn phí vận chuyển
                    </div>
                  )}
                </div>
                <div className="summary-total">
                  <span>Tổng cộng</span>
                  <span className="total-amount">{finalTotal.toLocaleString("vi-VN")}đ</span>
                </div>
                <button onClick={handleCheckout} className="checkout-btn">Thanh toán</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}