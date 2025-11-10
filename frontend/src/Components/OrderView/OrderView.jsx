import "./OrderView.css";
import { Link } from "react-router-dom";
import DefaultImage from "../../assets/placeholder-image.png";
import { FaArrowLeft} from "react-icons/fa"

// Import utils
import { vnd } from "../../utils/currencyUtils.js";
import { formatDate } from "../../utils/dateUtils.js";

function OrderView(props) {
  const { order, onCancel } = props;


  return (
    <div className="OrderView-container">
      <button
        className="OrderView-cancel"
        onClick={onCancel}>
          <FaArrowLeft fill="hsl(0, 0%, 37%)"/>
          
      </button>
      <div id="title">
        <h2 style={{color:"white"}}>Chi tiết đơn hàng</h2>
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
                <img src={item.productImageUrl || DefaultImage} alt={item.name} />
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
          <p>Phương thức thanh toán: {order.paymentMethod}</p>
        </div>
        <div id="status">
          <div id="payment" style={{ textTransform: "capitalize" }}>
            Trạng thái thanh toán: {order.paymentStatus}
          </div>
          <div id="ship" style={{ textTransform: "capitalize" }}>
            Vận chuyển: {order.status}
          </div>
          <div id="update"style={{textAlign: "center"}}>
            Cập nhật lần cuối: {formatDate(order.updatedAt)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderView;
