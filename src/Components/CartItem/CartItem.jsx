import "./CartItem.css";
import { Link } from "react-router-dom";
import DefaultImage from "../../assets/placeholder-image.png";
import { FaTrashAlt } from "react-icons/fa";
import { vnd } from "../../utils/currencyUtils.js";

function CartItem(props) {
  const { onIncrease, onDecrease, onRemove, index } = props;
  return (
    <tr className="CartItem-row">
      <td id="index">{index}</td>
      <td id="image">
        <Link to={"#"}>
          <img src={props.imageInfo?.url || DefaultImage} alt={""} />
        </Link>
      </td>

      <td id="name"><b>{props.name}</b></td>
      <td id="price">{vnd(props.price)}</td>

      <td id="quantity">
        <button onClick={onDecrease}>-</button>
        <span>{props.quantity}</span>
        <button onClick={onIncrease}>+</button>
      </td>

      <td id="total"><b>{vnd(props.price * props.quantity)}</b></td>

      <td id="remove">
        <button onClick={onRemove} >
          <FaTrashAlt fill="white"/>
        </button>
      </td>
    </tr>
  );
}

export default CartItem;
