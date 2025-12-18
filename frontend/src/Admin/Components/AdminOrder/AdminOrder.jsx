import React, { useState, useEffect } from "react";
import "./AdminOrder.css";
import DefaultImage from "../../../assets/placeholder-image.png";

// Import utils
import {
  shipStatusMap,
  paymentStatusMap,
  paymentMethodMap,
} from "../../../utils/constantsMap";
import { vnd } from "../../../utils/currencyUtils";
import { formatDate } from "../../../utils/dateUtils";

export default function AdminOrder(props) {
  const { order, onUpdate } = props;
  const shipInfo = order.shippingAddressInfo;

  // Dtails expanded
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleDetails = () => {
    setIsExpanded(!isExpanded);
  };

  // Reset expanded state on order change
  useEffect(() => {
    setIsExpanded(false);
  },[order])

  return (
    <>
      <tr
        className={`AdminOrderRow ${isExpanded ? "expanded" : ""}`}
        onClick={toggleDetails}
      >
        <td>
          <img src={order.productsInfo[0]?.productImageUrl} />
        </td>
        <td>
          {order.productsInfo.map((item, index) => (
            <div key={index} className="order-row-content">
              {/* Bold the quantity and the 'x' */}
              <span style={{ color: "#16a34a" }}>{item.quantity}</span>
              {"x "}
              <span>{item.productName}</span>
              {/* Add comma and space unless it's the last item */}
              {index < order.productsInfo.length - 1 ? ", " : ""}
            </div>
          ))}
        </td>
        <td>{shipInfo?.displayName || order.userId}</td>
        <td>{vnd(order.grandTotal || order.amount)}</td>
        <td>
          <span className={`badge method ${order.paymentMethod}`}>
            {paymentMethodMap[order.paymentMethod]}
          </span>
        </td>
        <td>
          <span className={`badge payment ${order.paymentStatus}`}>
            {paymentStatusMap[order.paymentStatus]}
          </span>
        </td>
        <td>
          <span className={`status ${order.status}`}>
            {shipStatusMap[order.status]}
          </span>
        </td>
        <td>{formatDate(order.createdAt)}</td>
        <td
          className="admin-order-actions"
          onClick={(event) => event.stopPropagation()}
        >
          <button className="action-btn" onClick={onUpdate}>
            Cập nhật
          </button>
        </td>
      </tr>

      {/* Order details extra row */}
      {isExpanded && (
        <tr className="AdminOrder-details-row">
          <td style={{ background: "hsl(34, 60%, 95%)" }}></td>
          <td colSpan="8">
            <div className="AdminOrder-details-content">

              <div className="header">
                <h3>Đơn hàng {order._id}</h3>
                <p style={{display: 'inline', paddingRight: '20px'}}>Của khách {order.userId}</p>
                <a style={{color: 'grey'}}>Lúc {formatDate(order.createdAt)}</a>
              </div>

              <hr></hr>

              <div className="products-list">
                {order.productsInfo.map((item) => {
                  return (
                    <div key={item.productId} className="listitem">
                      <img
                        src={item.productImageUrl || DefaultImage}
                        alt={item.productName}
                      />
                      <div>
                        <h3>{item.productName}</h3>
                        <p>
                          Số lượng {item.computedPrice.flashPrice && `${item.computedPrice.flashQty} x ${vnd(item.computedPrice.flashPrice)}(sale) `}
                          {item.computedPrice.normalQty !== 0 && `+ ${item.computedPrice.normalQty} x ${vnd(item.computedPrice.normalPrice)}`} ={" "}
                          <b>{vnd(item.computedPrice.totalForItemPrice)}</b>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <hr></hr>

              <div className="amount">
                <p> Giá trị hàng: {vnd(order.amount)}</p>
                <p>Voucher: {order.voucherInfo?.code || 'Không'}</p>
                { order.voucherInfo && (
                  <p> Giảm giá: {vnd(order.voucherInfo.discountAmount)}</p>
                )}
                <p> Phí vận chuyển: {vnd(order.shippingFee || 0)}</p>
                <div><b>Tổng thu: {vnd(order.grandTotal || order.amount)}</b></div>
              </div>


              {shipInfo && (
                <div className="shipping-address-block">
                  <h3>Giao đến:</h3>
                  <b>Người nhận:</b>
                  <p>Tên gọi: {shipInfo.displayName}</p>
                  <p>Số điện thoại: {shipInfo.phoneNumber}</p>
                  <b>Địa chỉ:</b>
                  <p>{shipInfo.street}, {shipInfo.wardName}, {shipInfo.districtName}, {shipInfo.provinceName}</p>
                  <b>Ghi chú:</b>
                  <p>"{shipInfo.note}"</p>
                </div>
              )}

            </div>
          </td>
        </tr>
      )}
    </>
  );
}
