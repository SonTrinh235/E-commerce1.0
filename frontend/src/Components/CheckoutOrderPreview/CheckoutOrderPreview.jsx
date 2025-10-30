import "./CheckoutOrderPreview.css";
import { Link } from "react-router-dom";
import DefaultImage from "../../assets/placeholder-image.png";
import { vnd } from "../../utils/currencyUtils.js";

function CheckoutOrderPreview(props) {
  const { orderContent, productsLookup, orderTotalItems, orderTotal } = props;
  return (
    <div className="CheckoutOrderPreview-container">
      <div id="title">
        <h2>Đặt Hàng Thành Công</h2>
      </div>
      <div id="order">
        <div id="content">
          <h3>Nội dung đơn hàng</h3>
          <hr/>
          {orderContent.map((item) => {
            const currentItemData = productsLookup[item.productId];
            return (
              <div key={item.productId} className="Checkout-item">
                <img
                  src={currentItemData.imageInfo?.url || DefaultImage}
                  alt={currentItemData.name}
                />
                <div>
                  <h3>{currentItemData.name}</h3>
                  <p>
                    Số lượng {item.quantity} x {vnd(item.price)} ={" "}
                    <b>{vnd(item.price * item.quantity)}</b>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <hr/>
        <div id="summary">
          <p>Tổng số lượng: {orderTotalItems} sản phẩm</p>
          <h3>Tổng thanh toán: {vnd(orderTotal)}</h3>
        </div>
      </div>
      <div id="navigate">
        <Link to="/">
          <button id="vieworders">Xem lịch sử mua</button>
        </Link>
        <Link to="/">
          <button id="continueshopping">Tiếp tục mua sắm</button>
        </Link>
      </div>
    </div>
  );
}

export default CheckoutOrderPreview;
