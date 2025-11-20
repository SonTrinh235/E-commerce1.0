import React, { useContext, useState, useEffect } from "react";
import "./CSS/Orders.css";

import OrderRow from "../Components/OrderRow/OrderRow";
import OrderView from "../Components/OrderView/OrderView";
import { ShopContext, userId } from "../Context/ShopContext";

// Import APIs
import { getOrdersByUserId } from "../api/orderService";

function Orders() {
  const { userId } = useContext(ShopContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const [currentOrder, setCurrentOrder] = useState(null);
  const [viewOrderVisible, setViewOrderVisible] = useState(false);

  // Gọi API lấy danh sách đơn hàng
  const fetchOrders = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const res = await getOrdersByUserId(userId, page, limit);
      if (res?.success) {
        // setOrders(res.data.list || []);
        // Merge server orders with any locally saved guest orders
        const resOrders = res.data.list || [];

        // Avoid duplicate IDs (server may not have guest IDs)
        setOrders(resOrders);
        setTotalOrders(res.data.total);
        setTotalPages(res.data.totalPages);
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

  // Use effect on load
  useEffect(() => {
    if (userId) fetchOrders();
    else setOrders([]);
  }, []);

  // Use effect on page change
  useEffect(() => {
    fetchOrders(currentPage, limit);
  }, [currentPage]);

  const toggleViewOrder = () => {
    setViewOrderVisible(!viewOrderVisible);
  };

  const handleViewOrder = (order = null) => {
    console.log("[Orders] Trying to view order", order);
    setCurrentOrder(order);
    toggleViewOrder();
  };


  // Function to handle escape to close form
  const handleEscape = (event) => {
    if (event.key === 'Escape') {
      // Only close if the form is actually visible
      if (viewOrderVisible) {
        setViewOrderVisible(false);
      }
    }
  };

  // useEffect Hook for event listener
  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    // cleanup listener
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [viewOrderVisible]);



  return (
    <div className="Orders-container">
      <div className="Orders-table-container">
        {userId === null ? (
          <div>Log in to see your ongoing orders</div>
        ) : (
          <>
            <div className="title">
              <h1>Đơn Hàng Của Tôi:</h1>
              <h3>Tổng cộng {totalOrders} đơn hàng</h3>
            </div>
            <table className="Orders-table">
              <thead>
                <tr>
                  <th id="index-col">#</th>
                  <th>Đơn hàng</th>
                  <th>Nội dung</th>
                  <th>Số tiền</th>
                  <th>Thanh toán</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order, i) => {
                    return (
                      <OrderRow
                        order={order}
                        index={i+(currentPage-1)*limit}
                        onView={() => handleViewOrder(order)}
                      />
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="no-data">
                      "Không có đơn hàng nào"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="paging">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
              >
                Trước
              </button>

              <span>
                Trang {currentPage} trên {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
              >
                Sau
              </button>
            </div>
          </>
        )}
      </div>

      {viewOrderVisible && (
        <div className="OrderView-overlay">
          <OrderView order={currentOrder} onCancel={() => toggleViewOrder()} />
        </div>
      )}
    </div>
  );
}

export default Orders;
