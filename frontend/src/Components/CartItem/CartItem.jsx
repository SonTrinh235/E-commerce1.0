import "./CartItem.css";
import remove_icon from "../../assets/cart_cross_icon.png";
import DefaultImage from "../../assets/placeholder-image.png";

function CartItem(props) {
  const { onIncrease, onDecrease, onRemove } = props;
  return (
    <>
      <td className="CartItem-img">
        <img
          src={props.imageInfo?.url || DefaultImage}
          alt={""}
        />
      </td>
      <td className="CartItem-name">{props.name}</td>
      <td className="CartItem-price">${props.price}</td>

      <td className="CartItem-quantity">
        <button onClick={onDecrease}>-</button>
        <span>{props.quantity}</span>
        <button onClick={onIncrease}>+</button>
      </td>

      <td className="CartItem-total">${props.price * props.quantity}</td>

      <img
        src={remove_icon}
        onClick={onRemove}
        alt="remove"
        className="cartitems-remove-icon"
      />
    </>
  );
}

export default CartItem;
