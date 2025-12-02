import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, Tag } from 'lucide-react';
import { getCartByUserId, updateProductQuantity, removeProductFromCart } from '../api/cartService';
import './CSS/Cart.css';

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // --- 1. Lấy User ID & Load Giỏ hàng từ API ---
  useEffect(() => {
    const fetchCart = async () => {
      try {
        // Lấy User ID từ localStorage (giả sử bạn lưu dạng object userInfo)
        const storedUser = localStorage.getItem('userInfo');
        if (!storedUser) {
          // Chưa đăng nhập thì chuyển về login hoặc để giỏ trống
          setLoading(false);
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        // Tùy backend của bạn trả về _id hay id, hay user._id
        const uId = parsedUser.id || parsedUser._id || (parsedUser.user && parsedUser.user._id);
        setUserId(uId);

        if (uId) {
          setLoading(true);
          const res = await getCartByUserId(uId);
          console.log("[Cart Page] API Response:", res); 

          // --- SỬA LỖI Ở ĐÂY: Lấy productsInfo theo đúng tài liệu API ---
          let cartProducts = [];
          
          if (res?.data && res.data.productsInfo && Array.isArray(res.data.productsInfo)) {
             cartProducts = res.data.productsInfo;
          } else if (Array.isArray(res?.data)) {
             // Fallback nếu API trả về mảng trực tiếp (trường hợp hiếm)
             cartProducts = res.data;
          }
          
          // Map lại dữ liệu dựa trên "Thuộc tính của Object" trong doc
          const mappedItems = cartProducts.map(item => ({
            id: item.productId, // productId: string
            name: item.productName, // productName: string
            image: item.productImageUrl || "", // productImageUrl: string
            quantity: item.quantity, // quantity: int
            price: item.price, // price: int
            // Các trường này có thể không có trong productsInfo theo doc, cần check lại hoặc để default
            originalPrice: item.originalPrice || null, 
            unit: item.unit || "Cái",
            discount: item.discount || 0
          }));

          setItems(mappedItems);
        }
      } catch (error) {
        console.error("Lỗi tải giỏ hàng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  // --- 2. Xử lý Cập nhật số lượng (Gọi API PUT) ---
  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    // Optimistic Update: Cập nhật UI trước cho mượt
    const oldItems = [...items];
    setItems(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ));

    try {
      // Theo doc: updateProductQuantity (PUT) /order/:userId/update
      // Body: productId, quantity, price (có thể cần truyền lại price hiện tại)
      const currentItem = items.find(i => i.id === productId);
      await updateProductQuantity(userId, { 
        productId, 
        quantity: newQuantity,
        price: currentItem ? currentItem.price : 0 
      });
    } catch (error) {
      console.error("Lỗi cập nhật số lượng:", error);
      // Nếu lỗi thì revert lại UI cũ
      setItems(oldItems);
      alert("Không thể cập nhật số lượng. Vui lòng thử lại.");
    }
  };

  // --- 3. Xử lý Xóa sản phẩm (Gọi API DELETE) ---
  const handleRemove = async (productId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa sản phẩm này?")) return;

    const oldItems = [...items];
    setItems(prev => prev.filter(item => item.id !== productId));

    try {
      // Theo doc: removeProductFromCart (DELETE) /order/:userId/remove
      await removeProductFromCart(userId, productId);
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);
      setItems(oldItems);
      alert("Xóa thất bại.");
    }
  };

  // --- Tính toán tổng tiền ---
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = items.reduce(
    (sum, item) => {
        // Nếu có originalPrice thì mới tính discount, nếu không thì 0
        if (item.originalPrice && item.originalPrice > item.price) {
            return sum + ((item.originalPrice - item.price) * item.quantity);
        }
        return sum;
    },
    0
  );
  const shippingFee = subtotal > 0 ? (subtotal >= 200000 ? 0 : 25000) : 0;
  const total = subtotal + shippingFee;

  const handleBack = () => navigate('/');
  const handleCheckout = () => navigate('/checkout');

  const getImage = (src) => (!src || src.trim() === "") ? "/logo192.png" : src;

  if (loading) return <div className="cart-page"><div className="container" style={{textAlign:'center', paddingTop: 100}}>Đang tải giỏ hàng...</div></div>;

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
                      {item.discount > 0 && <div className="item-discount-badge">-{item.discount}%</div>}
                    </div>

                    <div className="item-info">
                      <h3 className="item-name">{item.name}</h3>
                      <p className="item-unit">Đơn vị: {item.unit}</p>
                      <div className="item-price-section">
                        <span className="item-price">{item.price?.toLocaleString("vi-VN")}đ</span>
                        {item.originalPrice > item.price && (
                          <span className="item-original-price">{item.originalPrice?.toLocaleString("vi-VN")}đ</span>
                        )}
                      </div>
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
                      <div className="item-total">{(item.price * item.quantity).toLocaleString("vi-VN")}đ</div>
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
                  {discountAmount > 0 && (
                    <div className="summary-row discount-row">
                      <span><Tag className="discount-icon" /> Tiết kiệm</span>
                      <span className="discount-amount">-{discountAmount.toLocaleString("vi-VN")}đ</span>
                    </div>
                  )}
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
                  <span className="total-amount">{total.toLocaleString("vi-VN")}đ</span>
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