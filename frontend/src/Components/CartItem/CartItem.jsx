import "./CartItem.css";
import { Link } from "react-router-dom";
import DefaultImage from "../../assets/placeholder-image.png";
import { FaTrashAlt } from "react-icons/fa";

const currency = new Intl.NumberFormat("vi-VN");

function CartItem(props) {
  const { onIncrease, onDecrease, onRemove } = props;

  const productId = String(props.productId || "");
  const name = props.name || "Unnamed";
  const price = Number(props.price || 0);
  const quantity = Math.max(0, Number(props.quantity || 0));
  const total = price * quantity;

  const imgSrc =
    props.imageInfo?.url || props.imageUrl || props.image || DefaultImage;

  const detailHref = productId ? `/product/${productId}` : "#";

  return (
    <>
      <td className="CartItem-img">
        <Link to={detailHref} title={name}>
          <img src={imgSrc} alt={name} />
        </Link>
      </td>

      <td className="CartItem-name">
        {productId ? <Link to={detailHref}>{name}</Link> : name}
      </td>

      <td className="CartItem-price">{currency.format(price)} đ</td>

      <td className="CartItem-quantity">
        <button
          type="button"
          onClick={onDecrease}
          aria-label="Decrease quantity"
          title="Giảm số lượng"
          disabled={quantity <= 0}
        >
          −
        </button>
        <span>{quantity}</span>
        <button
          type="button"
          onClick={onIncrease}
          aria-label="Increase quantity"
          title="Tăng số lượng"
        >
          +
        </button>
      </td>

      <td className="CartItem-total">{currency.format(total)} đ</td>

      <td className="CartItem-remove">
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove from cart"
          title="Xoá khỏi giỏ"
          className="CartItem-removeBtn"
        >
          <FaTrashAlt />
        </button>
      </td>
    </>
  );
}

export default CartItem;
