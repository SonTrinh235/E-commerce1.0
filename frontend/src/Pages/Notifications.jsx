import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell,  Truck, Gift,  X,  Package, Calendar } from 'lucide-react';
import { ShopContext } from '../Context/ShopContext';
import './CSS/Notifications.css';

export function Notifications() {
  const navigate = useNavigate();
  const { userId } = useContext(ShopContext);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const fetchNotifications = async (currentPage = 1) => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await fetch(`https://www.bachkhoaxanh.xyz/notification/user/${userId}?page=${currentPage}&limit=20`);
      const data = await response.json();

      if (data.success) {
        setNotifications(data.data.list);
        setTotalPages(data.data.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(page);
  }, [userId, page]);

  const handleBack = () => {
    navigate('/');
  };

  const markAsRead = async (id) => {
    const updated = notifications.map(notif =>
      notif._id === id ? { ...notif, isRead: true } : notif
    );
    setNotifications(updated);

    try {
      await fetch(`https://www.bachkhoaxanh.xyz/notification/notifications/${id}/mark-read`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.isRead);
    const updated = notifications.map(notif => ({ ...notif, isRead: true }));
    setNotifications(updated);

    try {
        await Promise.all(unreadNotifications.map(n => 
             fetch(`https://www.bachkhoaxanh.xyz/notification/notifications/${n._id}/mark-read`, { method: 'PUT' })
        ));
    } catch (error) {
        console.error("Error marking all as read", error);
    }
  };

  const openNotificationModal = (notification) => {
    setSelectedNotification(notification);
    if (!notification.isRead) {
        markAsRead(notification._id);
    }
  };

  const closeModal = () => {
    setSelectedNotification(null);
  };

  const getNotificationIcon = (topic) => {
    switch (topic) {
      case 'order-created':
      case 'order-delivered':
        return <Truck />;
      case 'promotion':
        return <Gift />;
      default:
        return <Bell />;
    }
  };

  const getNotificationColor = (topic) => {
    switch (topic) {
      case 'order-created':
      case 'order-delivered':
        return '#3b82f6';
      case 'promotion':
        return '#f59e0b';
      default:
        return '#10b981';
    }
  };

  const getTimeAgo = (timeString) => {
    const now = new Date();
    const time = new Date(timeString);
    const diff = now - time;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return time.toLocaleDateString('vi-VN');
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications.filter(n => {
        if (filter === 'order') return n.topic?.includes('order');
        if (filter === 'promo') return n.topic === 'promotion';
        return true;
    });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="notifications-page">
      <div className="container">
        <button onClick={handleBack} className="back-button">
          <ArrowLeft className="icon" /> Về trang chủ
        </button>

        <div className="notifications-header">
          <div className="header-top">
            <h1 className="page-title">
              <Bell className="title-icon" /> Thông báo
            </h1>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="mark-all-btn">
                Đánh dấu đã đọc tất cả
              </button>
            )}
          </div>
          {unreadCount > 0 && (
            <p className="unread-count">Bạn có {unreadCount} thông báo chưa đọc</p>
          )}
        </div>

        <div className="filter-tabs">
          <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Tất cả</button>
          <button className={`filter-tab ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>Chưa đọc</button>
          <button className={`filter-tab ${filter === 'order' ? 'active' : ''}`} onClick={() => setFilter('order')}>Đơn hàng</button>
        </div>

        <div className="notifications-list">
          {loading ? (
            <div className="empty-notifications"><p>Đang tải thông báo...</p></div>
          ) : filteredNotifications.length === 0 ? (
            <div className="empty-notifications">
              <Bell className="empty-icon" />
              <h2>Không có thông báo</h2>
              <p>Chưa có thông báo nào trong mục này</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`notification-card ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => openNotificationModal(notification)}
              >
                <div
                  className="notification-icon-wrapper"
                  style={{ backgroundColor: getNotificationColor(notification.topic) + '20' }}
                >
                  <div style={{ color: getNotificationColor(notification.topic) }}>
                    {getNotificationIcon(notification.topic)}
                  </div>
                </div>

                <div className="notification-content">
                  <div className="notification-header">
                    <h3 className="notification-title">{notification.title}</h3>
                  </div>
                  <p className="notification-message">{notification.message}</p>
                  <p className="notification-time">{getTimeAgo(notification.createdAt)}</p>
                </div>

                {!notification.isRead && <div className="unread-indicator"></div>}
              </div>
            ))
          )}
        </div>
        
        {totalPages > 1 && (
            <div className="pagination-controls" style={{display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px'}}>
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Trước</button>
                <span>Trang {page} / {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Sau</button>
            </div>
        )}

        {/* --- MODAL CHI TIẾT --- */}
        {selectedNotification && (
            <div className="modal-overlay" onClick={closeModal}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <div className="modal-title-group">
                            <div className="modal-icon-large" style={{ 
                                backgroundColor: getNotificationColor(selectedNotification.topic) + '20',
                                color: getNotificationColor(selectedNotification.topic)
                            }}>
                                {getNotificationIcon(selectedNotification.topic)}
                            </div>
                            <h3 className="modal-title-text">{selectedNotification.title}</h3>
                        </div>
                        <button className="modal-close-btn" onClick={closeModal}>
                            <X size={24} />
                        </button>
                    </div>

                    <div className="modal-body">
                        <p className="modal-message">{selectedNotification.message}</p>
                        
                        {/* --- KHU VỰC SỬA LỖI --- */}
                        {/* Chỉ render nếu data tồn tại và productsInfo LÀ MỘT MẢNG */}
                        {selectedNotification.data && 
                         Array.isArray(selectedNotification.data.productsInfo) && 
                         selectedNotification.data.productsInfo.length > 0 && (
                            <div className="modal-extra-data">
                                <div className="extra-data-title">
                                    <Package size={16} /> Thông tin đơn hàng
                                </div>
                                {selectedNotification.data.productsInfo.map((prod, idx) => (
                                    <div key={idx} className="data-row">
                                        <span style={{flex: 1}}>{prod.productName}</span>
                                        <span style={{fontWeight: 'bold'}}>x{prod.quantity}</span>
                                    </div>
                                ))}
                                
                                {selectedNotification.data.amount ? (
                                    <div className="data-row" style={{marginTop: 10, borderTop: '1px solid #ddd', paddingTop: 5}}>
                                        <span>Tổng tiền:</span>
                                        <span style={{color: '#10b981', fontWeight: 'bold'}}>
                                            {selectedNotification.data.amount.toLocaleString()}đ
                                        </span>
                                    </div>
                                ) : null}
                            </div>
                        )}
                        {/* ----------------------- */}
                    </div>

                    <div className="modal-footer">
                        <div className="modal-time">
                            <Calendar size={14} style={{marginRight: 5, verticalAlign: 'middle'}}/>
                            {new Date(selectedNotification.createdAt).toLocaleString('vi-VN')}
                        </div>
                        <button className="modal-action-btn" onClick={closeModal}>
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}