import React, { useEffect, useState, useRef } from "react";
import Swal from 'sweetalert2';
import toast from "react-hot-toast";

import {
  getAllOrders,
  searchOrders,
  updateOrderStatus,
} from "../../../api/orderService";
import AdminOrder from "../../Components/AdminOrder/AdminOrder";
import OrderForm from "../../Components/OrderForm/OrderForm";
import LoadingOverlay from "../../../Components/LoadingOverlay/LoadingOverlay";
import "./ManageOrders.css";

import { FiSearch } from "react-icons/fi";

// Import APIs
import { getPaymentByOrderId, refundOrder } from "../../../api/paymentService";

// Import utils
import { shipStatusMap } from "../../../utils/constantsMap";
import useDebounce from "../../../utils/useDebounce";
import { vnd } from "../../../utils/currencyUtils";

export default function ManageOrder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // searchTerm with a 500ms update delay
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(1);

  const [limit, setLimit] = useState(20);

  const prevSearchRef = useRef(debouncedSearchTerm);
  const prevPageRef = useRef(currentPage);

  const fetchOrders = () => {
    const searchChanged = debouncedSearchTerm !== prevSearchRef.current;
    const pageChanged = currentPage !== prevPageRef.current;
    // if search change
    if (searchChanged) {
      if (debouncedSearchTerm.trim() === "") {
        fetchOrdersAll(currentPage, limit);
      } else {
        fetchSearchOrders(debouncedSearchTerm, 1, limit);
      }
    } else if (pageChanged) {
      if (debouncedSearchTerm.trim() === "") {
        fetchOrdersAll(currentPage, limit);
      } else {
        fetchSearchOrders(debouncedSearchTerm, currentPage, limit);
      }
    }
    prevPageRef.current = currentPage;
    prevSearchRef.current = debouncedSearchTerm;
  };

  // Gọi API lấy danh sách đơn hàng
  const fetchOrdersAll = async (page = 1) => {
    try {
      setLoading(true);
      const res = await getAllOrders(page, limit);
      if (res?.success) {
        setOrders(res.data.list || []);
        setTotalPages(Math.ceil((res.data.total || 0) / limit));
        setCurrentPage(page);
        setTotalCount(res.data.total);
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
    fetchOrdersAll();
  }, []);

  const fetchSearchOrders = async (query, page = 1, limit = 20) => {
    setLoading(true);
    try {
      const res = await searchOrders(query, page, limit);
      if (res?.success) {
        setOrders(res.data.list || []);
        setTotalPages(Math.ceil((res.data.total || 0) / limit));
        setCurrentPage(page);
        setTotalCount(res.data.total);
      } else {
        setError("Không thể tải danh sách đơn hàng.");
      }
    } catch (error) {
      console.log(error);
      alert("Search order failed");
    }
    setLoading(false);
  };

  // (Admin create-order removed) Orders are created by users via Checkout; admin manages statuses only.

  // Cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async (orderId, newStatus) => {

    const result = await Swal.fire({
      title: `Xác nhận trạng thái mới:`,
      text: `Trạng thái đổi qua: ${shipStatusMap[newStatus]}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'rgba(51, 96, 221, 1)',
      confirmButtonText: 'Xác nhận cập nhật',
      cancelButtonText: 'Hủy'
    });
    if (!result.isConfirmed)
      return;
    setLoading(true);

    try {
      // call API and capture response
      const res = await updateOrderStatus(orderId, newStatus);

      if (
        [
          "cancelled",
          "cancelled_due_to_insufficient_stock",
          "returned",
        ].includes(newStatus)
      ) {
        await handleRefundOrder(orderId);
      }

      if (res?.success) {
        // Cập nhật trạng thái trong state thay vì reload toàn bộ
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
        toast.success("Cập nhật trạng thái thành công!");
      } else {
        // Show server-provided message if available for easier debugging
        const msg =
          res?.message ||
          (res && JSON.stringify(res)) ||
          "Không thể cập nhật trạng thái.";
        console.warn("Failed to update status:", res);
        alert("Không thể cập nhật trạng thái: " + msg);
      }
    } catch (err) {
      console.error("Error while updating order status:", err);
      // err may be an Error thrown by apiFetch containing HTTP info
      let extra = "";
      if (err.status) extra += ` Status: ${err.status}`;
      if (err.data) extra += ` - ${JSON.stringify(err.data)}`;
      alert(
        "Lỗi khi cập nhật trạng thái: " + (err.message || String(err)) + extra
      );
    }
    setIsFormVisible(false);
    setLoading(false);
  };

  const handleRefundOrder = async (orderId) => {
    setLoading(true);
    let paymentResponse = null;
    try {
      paymentResponse = await getPaymentByOrderId(orderId);
    } catch (error) {
      console.log(error);
      alert("Get payment info failed during refund");
    }
    const paymentInfo = paymentResponse.data;

    // Let pass if COD order
    if (paymentInfo.method === "CASH") {
      return;
    }

    try {
      const res = await refundOrder(orderId, {
        userId: paymentInfo.userId,
        transDate: paymentInfo.vnpPayDate,
        amount: paymentInfo.amount,
        ipAddr: paymentInfo.ipAddr,
      });

      if (res?.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId
              ? { ...order, paymentStatus: "refunding" }
              : order
          )
        );
        toast.success("Hoàn tiền thành công!");
      } else {
        // Show server-provided message if available for easier debugging
        const msg =
          res?.message ||
          (res && JSON.stringify(res)) ||
          "Hoàn tiền không thành công.";
        console.warn("Failed to refund:", res);
        alert("Hoàn tiền không thành công: " + msg);
      }
    } catch (error) {
      console.log(error);
      alert("Refund failed");
    }
    setIsFormVisible(false);
    setLoading(false);
  };

  // Form related
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formCurrentItem, setFormCurrentItem] = useState(null);

  const openForm = (currentItem = null) => {
    console.log(currentItem);
    setFormCurrentItem(currentItem);
    setIsFormVisible(true);
  };

  // Function to handle escape to close form
  const handleEscape = (event) => {
    if (event.key === "Escape") {
      // Only close if the form is actually visible
      if (isFormVisible) {
        setIsFormVisible(false);
      }
    }
  };

  // useEffect Hook for event listener
  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    // cleanup listener
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isFormVisible]);

  // Lọc đơn hàng theo tìm kiếm và trạng thái
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesStatus;
  });

  // Fetch new page upon page change
  useEffect(() => {
    fetchOrders();
  }, [currentPage, debouncedSearchTerm]);

  return (
    <div className="manage-order-container">
      <div className="manage-order-header">
        <div className="manage-order-header-content">
          <div className="manage-order-header-left">
            <div className="manage-order-header-icon">📦</div>
            <h1 className="manage-order-header-title">Quản lý đơn hàng</h1>
          </div>
          <div className="order-stats">
            <span className="stat-item">{totalCount} đơn hàng</span>
          </div>
        </div>
      </div>

      {/* Orders are created by users via Checkout; admin manages statuses only. */}

      {/* Bộ lọc và tìm kiếm */}
      <div className="order-filters-container">
        <div className="order-filters-grid">
          <div className="search-box">
            <span className="search-icon">
              <FiSearch stroke="grey" />
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm đơn hàng"
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
              <option value="cancelled">Đã hủy</option>
              <option value="cancelled_due_to_insufficient_stock">
                Hủy do thiếu hàng
              </option>
              <option value="refunding">Đang hoàn tiền</option>
              <option value="refunded">Đã hoàn tiền</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading và Error States */}
      {loading && (
        // <div className="loading-container">
        //   <div className="loading-spinner"></div>
        //   <p className="loading-text">Đang tải dữ liệu...</p>
        // </div>
        <LoadingOverlay />
      )}

      {error && (
        <div className="error-container">
          <p className="error-text">{error}</p>
          <button
            onClick={() => fetchOrdersAll(currentPage)}
            className="retry-btn"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Bảng đơn hàng */}
      {!error && (
        <div className="table-container">
          <table className="admin-order-table">
            <thead>
              <tr>
                <th>Đơn hàng</th>
                <th>Nội dung</th>
                <th>Khách hàng</th>
                <th>Thu tiền</th>
                <th>Phương thức</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  return (
                    <AdminOrder
                      order={order}
                      onUpdate={() => openForm(order)}
                    />
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">
                    {searchTerm || statusFilter !== "all"
                      ? "Không tìm thấy đơn hàng phù hợp"
                      : "Không có đơn hàng nào"}
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
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="page-btn"
          >
            ← Trước
          </button>

          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`page-number ${
                  currentPage === page ? "active" : ""
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            Sau →
          </button>
        </div>
      )}

      {isFormVisible && (
        <OrderForm
          order={formCurrentItem}
          onEdit={(newStatus) =>
            handleUpdateStatus(formCurrentItem._id, newStatus)
          }
          onRefund={async (orderId) => {
            const result = await Swal.fire({
              title: `Xác nhận hoàn tiền cho đơn hàng:`,
              text: `Khách nhận lại số tiền bằng giá trị đơn hàng: ${vnd(formCurrentItem.grandTotal)}`,
              icon: 'question',
              showCancelButton: true,
              confirmButtonColor: 'rgba(88, 51, 221, 1)',
              confirmButtonText: 'Hoàn tiền',
              cancelButtonText: 'Hủy'
            });
            if (result.isConfirmed)
            handleRefundOrder(orderId);
          }}
          onCancel={() => setIsFormVisible(false)}
        />
      )}
    </div>
  );
}
