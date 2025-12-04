import React, { useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Package, MapPin, Phone, User, 
  Calendar, ChevronDown, ChevronUp, ShoppingBag, Truck, AlertCircle 
} from 'lucide-react';
import { ShopContext } from "../Context/ShopContext"; 
import { getOrdersByUserId } from "../api/orderService"; 
import { ImageWithFallback } from '../Components/figma/ImageWithFallback.tsx';
import "./CSS/Orders.css";

function Orders() {
  const { userId } = useContext(ShopContext); 
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  
  const [totalOrders, setTotalOrders] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10; 

  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchOrders = useCallback(async (page = 1) => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await getOrdersByUserId(userId, page, limit);
      
      if (res?.success) {
        setOrders(res.data.list || []);
        setTotalOrders(res.data.total);
        setTotalPages(res.data.totalPages);
        setCurrentPage(page);
      } else {
        setError("Không thể tải danh sách đơn hàng.");
      }
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối server. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchOrders(currentPage);
  }, [fetchOrders, currentPage]);

  const handleBack = () => navigate('/');

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusInfo = (status) => {
    const s = status?.toLowerCase() || 'pending';
    
    const statusMap = {
      'pending': { text: 'Chờ xử lý', color: '#f59e0b', icon: '⏳' },
      'processing': { text: 'Đang chuẩn bị', color: '#3b82f6', icon: '📦' },
      'confirmed': { text: 'Đã xác nhận', color: '#3b82f6', icon: '✓' },
      'shipping': { text: 'Đang giao', color: '#8b5cf6', icon: '🚚' },
      'delivered': { text: 'Giao thành công', color: '#10b981', icon: '✅' },
      'cancelled': { text: 'Đã hủy', color: '#ef4444', icon: '❌' },
      'cancelled_due_to_payment_expiry': { text: 'Hủy (Hết hạn thanh toán)', color: '#ef4444', icon: 'clock-x' },
      'cancelled_due_to_insufficient_stock': { text: 'Hủy (Hết hàng)', color: '#ef4444', icon: 'package-x' },
      'unpaid': { text: 'Chưa thanh toán', color: '#9ca3af', icon: '💳' }
    };
    
    const info = statusMap[s];
    if(info) return info;

    const icon = s.includes('cancel') ? '❌' : '📦';
    return { text: s, color: '#666', icon: icon };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => {
        const s = order.status?.toLowerCase();
        if (filterStatus === 'cancelled') {
            return s && s.includes('cancel');
        }
        return s === filterStatus;
    });

  if (!userId) return <div className="orders-page-container center-msg">Vui lòng đăng nhập để xem đơn hàng.</div>;
  
  if (error) {
    return (
        <div className="orders-page-container center-msg">
            <AlertCircle size={48} color="#ef4444" style={{ marginBottom: 10 }} />
            <p style={{ color: '#ef4444', marginBottom: 15 }}>{error}</p>
            <button onClick={() => fetchOrders(currentPage)} style={{ padding: '8px 16px', cursor: 'pointer' }}>Thử lại</button>
        </div>
    );
  }

  if (loading && orders.length === 0) return <div className="orders-page-container center-msg">Đang tải dữ liệu...</div>;

  return (
    <div className="orders-page-container">
      <div className="container">
        
        <button onClick={handleBack} className="back-button">
          <ArrowLeft className="icon" /> Về trang chủ
        </button>

        <div className="orders-header">
          <h1 className="page-title">Đơn hàng của tôi</h1>
          <p className="orders-count">Tổng đơn hàng: {totalOrders}</p>
        </div>

        <div className="filter-tabs">
          {['all', 'pending', 'processing', 'shipping', 'delivered', 'cancelled'].map(status => {
             const labelMap = {
                 'all': 'Tất cả',
                 'pending': 'Chờ xử lý',
                 'processing': 'Đang chuẩn bị',
                 'shipping': 'Đang giao',
                 'delivered': 'Hoàn thành',
                 'cancelled': 'Đã hủy' 
             };
             const label = labelMap[status] || status;
             
             return (
                <button
                  key={status}
                  className={`filter-tab ${filterStatus === status ? 'active' : ''}`}
                  onClick={() => setFilterStatus(status)}
                >
                  {label}
                </button>
             );
          })}
        </div>

        <div className="orders-list">
          {filteredOrders.length === 0 ? (
             <div className="empty-state">
                <ShoppingBag size={48} color="#ccc" />
                <p>Không tìm thấy đơn hàng nào.</p>
             </div>
          ) : (
            filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const isExpanded = expandedOrder === order._id;

              const shippingInfo = order.shippingAddressInfo || {};
              const fullAddress = [
                  shippingInfo.address, 
                  shippingInfo.wardName, 
                  shippingInfo.districtName, 
                  shippingInfo.provinceName
              ].filter(Boolean).join(", ");

              const rawItems = order.productsInfo || [];
              const items = rawItems.map(item => {
                  // --- SỬA LẠI ĐÚNG KEY TỪ LOG CỦA BẠN ---
                  const imageUrl = 
                      item.productImageUrl ||       // <--- ĐÂY LÀ KEY ĐÚNG TỪ LOG
                      item.imageInfo?.url ||       
                      item.productImage ||         
                      item.image ||                
                      null;

                  return {
                      name: item.productName || item.name || "Sản phẩm",
                      image: imageUrl,
                      quantity: Number(item.quantity || 1),
                      price: Number(item.price || 0)
                  };
              });

              const total = Number(order.grandTotal || 0);
              const subtotal = Number(order.amount || 0);
              const shippingFee = Number(order.shippingFee || 0);

              return (
                <div key={order._id} className="order-card">
                  <div className="order-header-row" onClick={() => toggleOrderExpand(order._id)}>
                    <div className="order-header-left">
                      <div className="icon-box">
                        <Package size={20} color="#555" />
                      </div>
                      <div>
                        <h3 className="order-id">
                          #{order._id.slice(-6).toUpperCase()} 
                          <span className="order-date-mobile"> • {formatDate(order.createdAt)}</span>
                        </h3>
                        <p className="order-date-desktop">
                          <Calendar size={12} style={{marginRight: 4}}/> 
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="order-header-right">
                      <div className="order-status-badge" style={{ 
                          backgroundColor: `${statusInfo.color}15`,
                          color: statusInfo.color,
                          border: `1px solid ${statusInfo.color}30`
                      }}>
                        <span style={{ marginRight: 5 }}>{typeof statusInfo.icon === 'string' ? statusInfo.icon : '📦'}</span>
                        <span className="status-text">{statusInfo.text}</span>
                      </div>
                      
                      <div className="order-total-price">
                        {total.toLocaleString('vi-VN')}đ
                      </div>
                      
                      <button className="expand-btn">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="order-details-content">
                      
                      <div className="detail-section">
                        <h4><ShoppingBag size={16} /> Danh sách sản phẩm</h4>
                        <div className="item-list">
                          {items.map((item, idx) => (
                            <div key={idx} className="item-row">
                              <ImageWithFallback 
                                src={item.image} 
                                alt={item.name} 
                                className="item-thumb"
                              />
                              <div className="item-info">
                                <h5>{item.name}</h5>
                                <p>Số lượng: <b>{item.quantity}</b></p>
                              </div>
                              <div className="item-price">
                                {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="info-grid-wrapper">
                          <div className="detail-section half">
                            <h4><MapPin size={16} /> Nhận hàng</h4>
                            <div className="info-text">
                                <p className="user-name">
                                    <User size={14} /> {shippingInfo.displayName || "Khách hàng"}
                                </p>
                                <p className="user-phone">
                                    <Phone size={14} /> {shippingInfo.phoneNumber || "---"}
                                </p>
                                <p className="user-address">
                                    <MapPin size={14} /> {fullAddress || "Địa chỉ theo mã bưu điện"}
                                </p>
                            </div>
                          </div>

                          <div className="detail-section half">
                            <h4><Truck size={16} /> Vận chuyển & Thanh toán</h4>
                            <div className="info-text">
                                <p>Hình thức: <b>{order.paymentMethod === 'CASH' ? 'Tiền mặt (COD)' : order.paymentMethod}</b></p>
                                <p>Trạng thái thanh toán: 
                                    <span style={{
                                        color: order.paymentStatus === 'paid' ? 'green' : 'orange', 
                                        fontWeight: 'bold', 
                                        marginLeft: 6
                                    }}>
                                        {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                    </span>
                                </p>
                            </div>
                          </div>
                      </div>

                      <div className="summary-section">
                        <div className="summary-row">
                           <span>Tạm tính</span>
                           <span>{subtotal.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div className="summary-row">
                           <span>Phí vận chuyển</span>
                           <span>{shippingFee === 0 ? "Miễn phí" : `+${shippingFee.toLocaleString('vi-VN')}đ`}</span>
                        </div>
                        <div className="summary-row total">
                           <span>Tổng thanh toán</span>
                           <span>{total.toLocaleString('vi-VN')}đ</span>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="pagination-controls">
            <button
                className="page-btn"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage <= 1 || loading}
            >
                Trước
            </button>
            <span className="page-info">Trang {currentPage} / {totalPages}</span>
            <button
                className="page-btn"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages || loading}
            >
                Sau
            </button>
        </div>

      </div>
    </div>
  );
}

export default Orders;