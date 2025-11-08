import "./OrderRow.css";
// Import utils
import { vnd } from "../../utils/currencyUtils.js";
import { formatDate } from "../../utils/dateUtils.js";
import DefaultImage from "../../assets/placeholder-image.png";

function OrderRow(props) {
  const { order, index, onView } = props;
  return (
    <tr className="Order-row">
      <td id="index">{index + 1}</td>
      <td id="image">
        {/* Grab image of first prod to show */}
        <img
          src={
            order.productsInfo[0]?.productImageUrl ||
            DefaultImage
          }
        />
      </td>
      <td id="content">
        {order.productsInfo
          .map((item) => `${item.quantity} x ${item.productName}`)
          .join(", ")}
      </td>
      <td id="totalItems">
        <b>
          {order.productsInfo.reduce((total, item) => {
            return total + item.quantity;
          }, 0)}
        </b>
      </td>
      <td id="total">{vnd(order.amount)}</td>
      <td id="status" style={{ textTransform: "capitalize" }}>
        <b>{order.status}</b>
      </td>
      <td id="date">{formatDate(order.createdAt)}</td>
      <td id="action">
        {/* Problem: too many re-renders here */}
        {/* Solution: put this tr into a seperate jsx component */}
        <button onClick={onView}>Xem chi tiết</button>
      </td>
    </tr>
  );
}

export default OrderRow;
