import "./OrderForm.css";
import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { LoadingOverlay } from "../../../Components/LoadingOverlay/LoadingOverlay";

// Import utils
import { shipStatusMap } from "../../../utils/constantsMap";

function OrderForm(props) {
  const { order, onEdit, onRefund, onCancel } = props;

  return (
    <div className="OrderForm-overlay">
      <div className="OrderForm-container">
        <div className="OrderForm-header">
          <button id="OrderForm-cancel" onClick={onCancel}>
            Quay lại
          </button>
        </div>

        <div className="OrderForm-body">
          <h2>Cập nhật đơn hàng:</h2>
          <p>Người dùng ID: {order.userId || "no user"}</p>
          <p>Mã đơn: {order._id || "no id"}</p>
          <div className={`status ${order.status}`}>
            {shipStatusMap[order.status]}
          </div>
        </div>
        <div className="OrderForm-panel">
          <p>Trạng thái mới:</p>
          <div className="OrderForm-options">
            <button
              className={`status ${"pending"}`}
              onClick={() => onEdit("pending")}
              disabled={true}
            >
              Chờ xác nhận
            </button>
            <button
              className={`status ${"processing"}`}
              onClick={() => onEdit("processing")}
              disabled={order.status !== "pending"}
            >
              Đang xử lý
            </button>
            <button
              className={`status ${"in_transit"}`}
              onClick={() => onEdit("in_transit")}
              disabled={
                order.status !== "processing" ||
                (order.paymentMethod !== "CASH" &&
                  order.paymentStatus === "unpaid")
              }
            >
              Đang vận chuyển
            </button>
            <button
              className={`status ${"delivered"}`}
              onClick={() => onEdit("delivered")}
              disabled={order.status !== "in_transit"}
            >
              Giao thành công
            </button>
            <button
              className={`status ${"returned"}`}
              onClick={() => onEdit("returned")}
              disabled={order.status !== "delivered"}
            >
              Trả hàng
            </button>
            <button
              className={`status ${"cancelled"}`}
              onClick={() => onEdit("cancelled")}
              disabled={!["pending", "processing"].includes(order.status)}
            >
              Hủy đơn
            </button>

            <button
              className={`status ${"refunding"}`}
              onClick={() => {
                onRefund(order._id);
              }}
              disabled={
                order.paymentMethod === "CASH" || order.paymentStatus !== "paid"
              }
            >
              Hoàn tiền
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderForm;
