import React, { useState, useEffect  } from "react";
import "./ManageOrders.css";
import initialOrders from '../../Components/initialOrders/initialOrders'

const ManageOrders = () => {
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const updateStatus = (id, newStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );
  };

  const toggleDetails = (id) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, showDetails: !o.showDetails } : o
      )
    );
  };

  return (
    <div className="manage-container">
      <h1>Quản lý đơn hàng</h1>
      <table className="orders-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Khách hàng</th>
            <th>Ngày đặt</th>
            <th>Tổng tiền (₫)</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <React.Fragment key={order.id}>
              <tr>
                <td>#{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.date}</td>
                <td>{order.total.toLocaleString()}</td>
                <td>
                  <span className={`status ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <button className="confirm-btn" onClick={() => updateStatus(order.id, "Confirmed")}>Xác nhận</button>
                  <button className="pending-btn" onClick={() => updateStatus(order.id, "Pending")}>Đang chờ xử lý</button>
                  <button className="cancel-btn" onClick={() => updateStatus(order.id, "Cancelled")}>Hủy</button>
                  <button className="details-btn" onClick={() => toggleDetails(order.id)}>Chi tiết</button>
                </td>
              </tr>

              {order.showDetails && (
                <tr className="order-details">
                  <td colSpan="6">
                    <ul>
                      {order.products.map((p) => (
                        <li key={p.id}>
                          <img
                            src={p.image}
                            alt={p.name}
                            style={{
                              width: "50px",
                              verticalAlign: "middle",
                              marginRight: "10px",
                            }}
                          />
                          {p.name} — {p.new_price.toLocaleString()}₫
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageOrders;
