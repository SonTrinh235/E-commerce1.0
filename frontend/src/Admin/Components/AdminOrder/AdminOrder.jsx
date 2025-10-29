import React from "react";
import "./AdminOrder.css";

export default function AdminOrder({ id, customerName, amount, paymentMethod, paymentStatus, status, createdAt, onEdit, onDelete, isGuest }) {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <>
      <td>#{id}</td>
      <td>
        {customerName}
        {isGuest && <span className="local-badge"> Local</span>}
      </td>
      <td>{amount?.toLocaleString()} ₫</td>
      <td>
        <span className={`badge method ${paymentMethod?.toLowerCase()}`}>{paymentMethod}</span>
      </td>
      <td>
        <span className={`badge payment ${paymentStatus?.toLowerCase()}`}>{paymentStatus}</span>
      </td>
      <td>
        <span className={`status ${status?.toLowerCase()}`}>{status}</span>
      </td>
      <td>{formatDate(createdAt)}</td>
      <td className="admin-order-actions">
        <button className="action-btn process" onClick={() => onEdit("processing")} disabled={isGuest}>
          Xử lý
        </button>
        <button className="action-btn ship" onClick={() => onEdit("delivered")} disabled={isGuest}>
          Giao xong
        </button>
        <button className="action-btn cancel" onClick={onDelete} disabled={isGuest}>
          Hủy
        </button>
      </td>
    </>
  );
}