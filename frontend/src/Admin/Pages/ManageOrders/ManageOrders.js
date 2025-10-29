import React, { useEffect, useState } from "react";
import { getAllOrders, updateOrderStatus } from "../../../api/orderService";
import AdminOrder from '../../Components/AdminOrder/AdminOrder'
import "./ManageOrders.css";

import { FiSearch } from "react-icons/fi"

export default function ManageOrder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Gọi API lấy danh sách đơn hàng
  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const res = await getAllOrders(page, 20);
      if (res?.success) {
        // setOrders(res.data.list || []);
        // Merge server orders with any locally saved guest orders
        const serverOrders = res.data.list || [];
        let guestOrders = [];
        try {
          guestOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]');
        } catch (e) { guestOrders = []; }

        // Avoid duplicate IDs (server may not have guest IDs)
        const merged = [...guestOrders, ...serverOrders];
        setOrders(merged);
        setTotalPages(Math.ceil((res.data.total || 0) / 20));
        setCurrentPage(page);
      } else {
        setError("Không thể tải danh sách đơn hàng.");
      }
    } catch (err) {
      console.error(err);
      setError("Lỗi khi tải dữ liệu từ server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // (Admin create-order removed) Orders are created by users via Checkout; admin manages statuses only.

  // Cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async (orderId, newStatus) => {
    // If this is a guest/local order, update localStorage instead of calling server
    if (orderId && String(orderId).startsWith("guest_")) {
      try {
        const stored = JSON.parse(localStorage.getItem('guestOrders') || '[]');
        const updated = stored.map(o => o._id === orderId ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o);
        localStorage.setItem('guestOrders', JSON.stringify(updated));
        // update UI
        setOrders(prev => prev.map(order => order._id === orderId ? { ...order, status: newStatus } : order));
        alert('Cập nhật trạng thái (local) thành công!');
        return;
      } catch (e) {
        console.error('Failed to update guest order locally', e);
        alert('Lỗi khi cập nhật đơn hàng local: ' + (e.message || e));
        return;
      }
    }

    try {
      // call API and capture response
      const res = await updateOrderStatus(orderId, newStatus);
      console.log("updateOrderStatus response:", res);
      if (res?.success) {
        // Cập nhật trạng thái trong state thay vì reload toàn bộ
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
        alert("Cập nhật trạng thái thành công!");
      } else {
        // Show server-provided message if available for easier debugging
        const msg = res?.message || (res && JSON.stringify(res)) || "Không thể cập nhật trạng thái.";
        console.warn("Failed to update status:", res);
        alert("Không thể cập nhật trạng thái: " + msg);
      }
    } catch (err) {
      console.error("Error while updating order status:", err);
      // err may be an Error thrown by apiFetch containing HTTP info
      let extra = "";
      if (err.status) extra += ` Status: ${err.status}`;
      if (err.data) extra += ` - ${JSON.stringify(err.data)}`;
      alert("Lỗi khi cập nhật trạng thái: " + (err.message || String(err)) + extra);
    }
  };

  // Hủy đơn hàng (chỉ cập nhật trạng thái)
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này không?")) return;
    // If guest/local order, remove from localStorage and state
    if (orderId && String(orderId).startsWith("guest_")) {
      try {
        const stored = JSON.parse(localStorage.getItem('guestOrders') || '[]');
        const filtered = stored.filter(o => o._id !== orderId);
        localStorage.setItem('guestOrders', JSON.stringify(filtered));
        setOrders(prev => prev.filter(o => o._id !== orderId));
        alert('Đã hủy đơn hàng local.');
        return;
      } catch (e) {
        console.error('Failed to delete guest order locally', e);
        alert('Lỗi khi xóa đơn hàng local: ' + (e.message || e));
        return;
      }
    }

    handleUpdateStatus(orderId, "canceled");
  };

  // Lọc đơn hàng theo tìm kiếm và trạng thái
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.userId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Xử lý phân trang
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchOrders(newPage);
    }
  };

  return (
    <div className="manage-order-container">
      <div className="manage-order-header">
        <h2 className="manage-order-title"><span>📦</span> Quản lý đơn hàng</h2>
        <div className="order-stats">
          <span className="stat-item">
            {orders.length} đơn hàng
          </span>
        </div>
      </div>

      {/* Orders are created by users via Checkout; admin manages statuses only. */}

      {/* Bộ lọc và tìm kiếm */}
      <div className="order-filters">
        <div className="search-box">
          <span className="search-icon"><FiSearch/></span>
          <input
            type="text"
            placeholder="Tìm kiếm theo ID hoặc tên khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-box">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="processing">Đang xử lý</option>
            <option value="in_transit">Đang vận chuyển</option>
            <option value="delivered">Đã giao</option>
            <option value="returned">Đã trả hàng</option>
            <option value="canceled">Đã hủy</option>
            <option value="cancelled_due_to_insufficient_stock">Hủy do thiếu hàng</option>
            <option value="refunding">Đang hoàn tiền</option>
            <option value="refunded">Đã hoàn tiền</option>
          </select>
        </div>
      </div>

      {/* Loading và Error States */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Đang tải dữ liệu...</p>
        </div>
      )}

      {error && (
        <div className="error-container">
          <p className="error-text">{error}</p>
          <button onClick={() => fetchOrders(currentPage)} className="retry-btn">
            Thử lại
          </button>
        </div>
      )}

      {/* Bảng đơn hàng */}
      {!loading && !error && (
        <div className="table-container">
          <table className="admin-order-table">
            <thead>
              <tr>
                <th>ID Đơn hàng</th>
                <th>Khách hàng</th>
                <th>Số tiền</th>
                <th>Phương thức</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                    <AdminOrder
                      id={order._id}
                      customerName={order.userId || order.shipping?.name || 'Guest'}
                      // isGuest={String(order._id).startsWith('guest_')}
                      amount={order.amount ?? order.productsInfo?.reduce((sum, p) => sum + (p.price * p.quantity), 0)}
                      paymentMethod={order.paymentMethod}
                      paymentStatus={order.paymentStatus}
                      status={order.status}
                      createdAt={order.createdAt}
                      onEdit={(newStatus) =>
                        handleUpdateStatus(order._id, newStatus)
                      }
                      onDelete={() => handleDeleteOrder(order._id)}
                    />
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                    {searchTerm || statusFilter !== "all" 
                      ? "Không tìm thấy đơn hàng phù hợp"
                      : "Không có đơn hàng nào"
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Phân trang */}
      {!loading && !error && totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="page-btn"
          >
            ← Trước
          </button>

          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`page-number ${currentPage === page ? 'active' : ''}`}
              >
                {page}
              </button>
            ))}
          </div>

          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  );
}