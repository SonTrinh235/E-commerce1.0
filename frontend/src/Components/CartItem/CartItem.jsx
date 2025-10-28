import "./CartItem.css";
import { Link } from "react-router-dom";
import DefaultImage from "../../assets/placeholder-image.png";
import { FaTrashAlt } from "react-icons/fa";
import { vnd } from "../../utils/currencyUtils.js";

function CartItem(props) {
  const { onIncrease, onDecrease, onRemove } = props;
  return (
    <>
      <td className="CartItem-img">
        <Link to={"#"}>
          <img src={props.imageInfo?.url || DefaultImage} alt={""} />
        </Link>
      </td>

      <td className="CartItem-name">{props.name}</td>
      <td className="CartItem-price">{vnd(props.price)}</td>

      <td className="CartItem-quantity">
        <button onClick={onDecrease}>-</button>
        <span>{props.quantity}</span>
        <button onClick={onIncrease}>+</button>
      </td>

      <td className="CartItem-total">{vnd(props.price * props.quantity)}</td>

      <td className="CartItem-remove">
        <button onClick={onRemove} >
          <FaTrashAlt />
        </button>
      </td>
    </>
  );
}

export default CartItem;
