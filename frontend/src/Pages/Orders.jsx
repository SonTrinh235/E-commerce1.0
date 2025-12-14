import React, { useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Package, MapPin, Phone, User, 
  Calendar, ChevronDown, ChevronUp, ShoppingBag, Truck, AlertCircle,
  Loader2, CreditCard, Clock, XCircle, CheckCircle, Timer
} from 'lucide-react';
import { ShopContext } from "../Context/ShopContext"; 
import { getOrdersByUserId } from "../api/orderService"; 
import { getPaymentByOrderId, refundOrder } from "../api/paymentService"; 
import { ImageWithFallback } from '../Components/figma/ImageWithFallback.tsx';
import "./CSS/Orders.css";

// Import hàm lấy IP
import { getPublicIp } from "../api/getPublicIp";

// Component đếm ngược 15 phút
const PaymentCountdown = ({ createdAt, onExpire }) => {
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const createdTime = new Date(createdAt).getTime();
            const expireTime = createdTime + 15 * 60 * 1000;
            const now = new Date().getTime();
            const diff = expireTime - now;
            return diff > 0 ? diff : 0;
        };

        const initialDiff = calculateTimeLeft();
        setTimeLeft(initialDiff);
        
        if (initialDiff <= 0) {
            if (onExpire) onExpire();
            return;
        }

        const timer = setInterval(() => {
            const diff = calculateTimeLeft();
            setTimeLeft(diff);

            if (diff <= 0) {
                clearInterval(timer);
                if (onExpire) onExpire();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [createdAt, onExpire]);

    if (timeLeft === null) return null;
    if (timeLeft <= 0) return <span style={{color: '#ef4444', fontWeight: 'bold'}}>Hết hạn</span>;

    const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
    const seconds = Math.floor((timeLeft / 1000) % 60);

    return (
        <span style={{color: '#f59e0b', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.1em'}}>
            {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </span>
    );
};

function Orders() {
  const { userId } = useContext(ShopContext); 
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);

  const [expiredOrders, setExpiredOrders] = useState({}); 

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

  const handleOrderExpire = (orderId) => {
      setExpiredOrders(prev => ({...prev, [orderId]: true}));
  };

  const handleRepay = async (orderId) => {
    try {
      setActionLoading(orderId);
      
      const res = await getPaymentByOrderId(orderId);
      
      if (res && res.success && res.data) {
          if (res.data.paymentUrl) {
              window.location.href = res.data.paymentUrl;
          } else {
              alert("Không tìm thấy đường dẫn thanh toán. Vui lòng liên hệ hỗ trợ.");
          }
      } else {
        alert("Không tìm thấy thông tin giao dịch (Transaction not found). Vui lòng liên hệ Admin.");
      }
    } catch (error) {
      console.error("Lỗi hệ thống:", error);
      alert("Lỗi kết nối khi lấy link thanh toán.");
    } finally {
      setActionLoading(null);
    }
  };

// --- LOGIC HOÀN TIỀN (REFUND) - ĐÃ SỬA ---
  const handleRefund = async (order) => {
    // 1. Kiểm tra ID đơn hàng trước
    console.log("DEBUG - Order Info:", order);
    if (!order?._id) {
        alert("Lỗi: Không lấy được ID đơn hàng.");
        return;
    }

    if (!window.confirm(`Bạn có chắc muốn yêu cầu hoàn tiền số tiền ${order.grandTotal?.toLocaleString('vi-VN')}đ cho đơn này?`)) return;

    try {
      setActionLoading(order._id);
      console.log(`DEBUG - Calling getPaymentByOrderId(${order._id})...`);
      const paymentRes = await getPaymentByOrderId(order._id);
      
      console.log("DEBUG - Payment Response:", paymentRes);

      if (!paymentRes?.success || !paymentRes?.data) {
        console.error("Refund Error: Transaction not found", paymentRes);
        alert(`Lỗi: Không tìm thấy lịch sử thanh toán. (API Success: ${paymentRes?.success})`);
        return;
      }
      const userIp = await getPublicIp();
      console.log("DEBUG - Refund IP:", userIp);
      const transactionDate = paymentRes.data.vnpPayDate || paymentRes.data.transDate || paymentRes.data.createdAt;
      
      if (!transactionDate) {
          alert("Lỗi: Không tìm thấy ngày giao dịch (vnpPayDate) để hoàn tiền.");
          return;
      }

      const refundData = {
        userId: userId,
        transDate: transactionDate,
        amount: order.grandTotal || order.amount || 0,
        ipAddr: userIp || "127.0.0.1" 
      };

      console.log("DEBUG - Sending Refund Data:", refundData);

      const res = await refundOrder(order._id, refundData);
      console.log("DEBUG - Refund Result:", res);
      
      if (res && res.success) {
        alert("Yêu cầu hoàn tiền thành công! Hệ thống đang xử lý.");
        fetchOrders(currentPage); 
      } else {
        alert(res?.message || "Yêu cầu hoàn tiền thất bại. Vui lòng thử lại sau.");
      }
    } catch (error) {
      console.error("Lỗi hoàn tiền (Exception):", error);
      alert("Có lỗi xảy ra khi kết nối đến server hoàn tiền.");
    } finally {
      setActionLoading(null);
    }
  };

  const renderActionButtons = (order) => {
    const method = (order.paymentMethod || '').toUpperCase().trim();
    const pStatus = (order.paymentStatus || '').toLowerCase().trim();
    const oStatus = (order.status || '').toLowerCase().trim();

    const isOnlinePayment = ['VNBANK', 'INTCARD'].includes(method);
    if (!isOnlinePayment) return null;

    const isLoading = actionLoading === order._id;

    // --- BUTTON THANH TOÁN LẠI ---
    const isUnpaid = ['unpaid', 'failed'].includes(pStatus);
    const isNotCancelled = !oStatus.includes('cancel');
    
    const createdTime = new Date(order.createdAt).getTime();
    const now = new Date().getTime();
    const isOverTime = (now - createdTime) > 15 * 60 * 1000;
    const isExpiredLocal = isOverTime || expiredOrders[order._id];

    if (isUnpaid && isNotCancelled) {
      if (isExpiredLocal) {
          return (
             <div style={{ marginTop: 15, width: '100%', textAlign: 'center', color: '#ef4444', fontStyle: 'italic', fontSize: '0.9rem' }}>
                 <AlertCircle size={14} style={{display: 'inline', marginRight: 4}}/>
                 Hết thời gian thanh toán. Đơn hàng sẽ bị hủy.
             </div>
          );
      }

      return (
        <div style={{ marginTop: 15, width: '100%' }}>
            <button 
            onClick={(e) => { e.stopPropagation(); handleRepay(order._id); }}
            disabled={!!actionLoading}
            style={{
                width: '100%', 
                padding: '10px', 
                backgroundColor: '#1488DB', 
                color: 'white', 
                border: 'none', 
                borderRadius: 4, 
                cursor: 'pointer', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: 8, 
                fontWeight: '600', 
                fontSize: '1rem',
                boxShadow: '0 2px 4px rgba(20, 136, 219, 0.2)'
            }}
            >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <CreditCard size={18}/>}
            Thanh toán ngay ({order.grandTotal?.toLocaleString('vi-VN')}đ)
            </button>
            
            <div style={{textAlign: 'center', fontSize: '0.85rem', color: '#666', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5}}>
                <Clock size={14}/> Còn lại: 
                <PaymentCountdown createdAt={order.createdAt} onExpire={() => handleOrderExpire(order._id)} />
            </div>
        </div>
      );
    }

    // --- BUTTON HOÀN TIỀN (REFUND) ---
    const refundableStatuses = ['processing', 'canceled', 'cancelled_due_to_insufficient_stock', 'delivered'];
    
    if (pStatus === 'paid' && refundableStatuses.includes(oStatus)) {
      return (
        <button 
          onClick={(e) => { e.stopPropagation(); handleRefund(order); }}
          disabled={!!actionLoading}
          style={{
            marginTop: 15, width: '100%', padding: '10px', 
            backgroundColor: '#fff', color: '#ef4444', 
            border: '1px solid #ef4444', borderRadius: 4, 
            cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, 
            fontWeight: '600', fontSize: '1rem'
          }}
        >
          {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Yêu cầu hoàn tiền"}
        </button>
      );
    }

    return null;
  };

  const getStatusInfo = (status) => {
    const s = (status || 'pending').toLowerCase().trim();
    const iconSize = 16;
    const statusMap = {
      'pending': { text: 'Chờ xử lý', color: '#f59e0b', icon: <Timer size={iconSize} /> },
      'processing': { text: 'Đang chuẩn bị', color: '#3b82f6', icon: <Package size={iconSize} /> },
      'confirmed': { text: 'Đã xác nhận', color: '#3b82f6', icon: <CheckCircle size={iconSize} /> },
      'shipping': { text: 'Đang giao', color: '#8b5cf6', icon: <Truck size={iconSize} /> },
      'delivered': { text: 'Giao thành công', color: '#10b981', icon: <CheckCircle size={iconSize} /> },
      'cancelled': { text: 'Đã hủy', color: '#ef4444', icon: <XCircle size={iconSize} /> },
      'cancelled_due_to_payment_expiry': { text: 'Hủy (Hết hạn thanh toán)', color: '#ef4444', icon: <Clock size={iconSize} /> },
      'cancelled_due_to_insufficient_stock': { text: 'Hủy (Hết hàng)', color: '#ef4444', icon: <Package size={iconSize} /> },
      'unpaid': { text: 'Chưa thanh toán', color: '#9ca3af', icon: <CreditCard size={iconSize} /> },
      'failed': { text: 'Thanh toán lỗi', color: '#ef4444', icon: <AlertCircle size={iconSize} /> }
    };
    
    const info = statusMap[s];
    if(info) return info;
    const DefaultIcon = s.includes('cancel') ? <XCircle size={iconSize} /> : <Package size={iconSize} />;
    return { text: s, color: '#666', icon: DefaultIcon };
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
        const s = (order.status || '').toLowerCase();
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
                  const imageUrl = 
                      item.productImageUrl ||      
                      item.imageInfo?.url ||      
                      item.productImage ||        
                      item.image ||                
                      null;
                  
                  const computed = item.computedPrice || {};
                  const lineTotal = computed.totalForItemPrice !== undefined 
                                    ? Number(computed.totalForItemPrice) 
                                    : (Number(item.price) || 0) * Number(item.quantity || 1);

                  return {
                      name: item.productName || item.name || "Sản phẩm",
                      image: imageUrl,
                      quantity: Number(item.quantity || 1),
                      price: 0,
                      computedPrice: computed,
                      lineTotal: lineTotal
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
                        <span style={{ marginRight: 5, display: 'flex', alignItems: 'center' }}>{statusInfo.icon}</span>
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
                                {item.lineTotal.toLocaleString('vi-VN')}đ
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

                        {renderActionButtons(order)}
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