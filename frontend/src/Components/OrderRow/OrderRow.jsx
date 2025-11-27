import "./OrderRow.css";
import DefaultImage from "../../assets/placeholder-image.png";

// Import utils
import { vnd } from "../../utils/currencyUtils.js";
import { formatDate } from "../../utils/dateUtils.js";
import { shipStatusMap, paymentStatusMap } from "../../utils/constantsMap.js"

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
        {order.productsInfo.map((item, index) => (
              <span key={index}>
                  {/* Bold the quantity and the 'x' */}
                  <b style={{color:"hsl(87, 75%, 35%)"}}>{item.quantity}</b>
                  {'x '}
                  <b>{item.productName}</b>
                  {/* Add comma and space unless it's the last item */}
                  {index < order.productsInfo.length - 1 ? ', ' : ''}
              </span>
           )
          )
        }
      </td>
      <td id="total">{vnd(order.amount)}</td>
      <td className={`payment ${order.paymentStatus}`}>
        <span>
          {paymentStatusMap[order.paymentStatus]}
        </span>
      </td>
      <td className={`status ${order.status}`}>
        <b>{shipStatusMap[order.status]}</b>
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
