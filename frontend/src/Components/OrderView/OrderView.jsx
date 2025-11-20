import "./OrderView.css";
import { Link } from "react-router-dom";
import DefaultImage from "../../assets/placeholder-image.png";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

// Import APIs
import { getPaymentByOrderId } from "../../api/paymentService.js";

// Import utils
import { paymentMethodMap, paymentStatusMap, shipStatusMap } from "../../utils/constantsMap.js";
import { vnd } from "../../utils/currencyUtils.js";
import { formatDate } from "../../utils/dateUtils.js";

function OrderView(props) {
  const { order, onCancel } = props;



  const goToPay = async () => {
    const response = await getPaymentByOrderId(order._id);
    const payUrl = response.data.paymentUrl;
    window.open(payUrl, '_blank');
  };

  return (
    <div className="OrderView-container">
      <button className="OrderView-cancel" onClick={onCancel}>
        <FaArrowLeft fill="hsl(0, 0%, 37%)" />
      </button>
      <div id="title">
        <h2 style={{ color: "white" }}>Chi tiết đơn hàng</h2>
      </div>
      <div id="order">
        <div id="info">
          <b>Đặt hàng lúc: {formatDate(order.createdAt)}</b>
          <p>Mã đơn hàng: {order._id}</p>
        </div>
        <h3>Nội dung đơn hàng</h3>
        <hr />
        <div id="content">
          {order.productsInfo.map((item) => {
            return (
              <div key={item.productId} className="Checkout-item">
                <img
                  src={item.productImageUrl || DefaultImage}
                  alt={item.name}
                />
                <div>
                  <h3>{item.productName}</h3>
                  <p>
                    Số lượng {item.quantity} x {vnd(item.price)} ={" "}
                    <b>{vnd(item.price * item.quantity)}</b>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <hr />
        <div id="summary">
          <p>Tổng số lượng: {order.productsInfo.length} sản phẩm</p>
          <h3>Tổng thanh toán: {vnd(order.amount)}</h3>
          <p>Phương thức thanh toán: {paymentMethodMap[order.paymentMethod]}</p>
        </div>
        <div id="status">
            {/* Pay button if not paid */}
            {order.paymentMethod !== "CASH" &&
              order.status !== "cancelled_due_to_payment_expiry" && 
              (
                <div className="payment">

            <div className={`payment-status ${order.paymentStatus}`}>
              {paymentStatusMap[order.paymentStatus]}
            </div>
            
            {order.paymentStatus === "unpaid" && (
                <button className="pay" onClick={() => goToPay()}>
                  Đi đến thanh toán
                  <FaArrowRight fill="white"/>
                </button>
              )}
            
          </div>
              )
            }
          <div className={`ship ${order.status.toLowerCase()}`}>
            {shipStatusMap[order.status]}
          </div>
          <div id="update" style={{ textAlign: "center" }}>
            Cập nhật lần cuối: {formatDate(order.updatedAt)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderView;
