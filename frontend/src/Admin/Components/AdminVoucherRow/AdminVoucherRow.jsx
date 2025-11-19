import "./AdminVoucherRow.css";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import DefaultImage from "../../../assets/placeholder-image.png";

// Import utils
import { formatDate } from "../../../utils/dateUtils";
import { vnd } from "../../../utils/currencyUtils";

const AdminVoucherRow = (props) => {
  const { onEdit, onDelete, index } = props;

  return (
    <tr className="AdminVoucherRow">
      <td id="index">{index}</td>
      <td id="name">{props.name}</td>
      <td id="code">
        <code style={{color: '#333333'}}>{props.code}</code>
      </td>
      <td id="type">
        {props.discountType === "percentage" ? (
          <span id="percentage">Phần trăm</span>
        ) : props.discountType === "fixed" ? (
          <span id="fixed">Cố định</span>
        ) : (
          <>Unregconized discount type</>
        )}
      </td>
      <td id="value">
        {props.discountType === "percentage" ? (
          <p id="percentage">{props.discountValue}%</p>
        ) : props.discountType === "fixed" ? (
          <p id="fixed">{vnd(props.discountValue)}</p>
        ) : (
          <>Unregconized discount type</>
        )}
      </td>
      <td id="description">{props.description}</td>
      <td id="expire">{formatDate(props.expirationDate)}</td>
      <td id="usage">
        {props.usedCount}/{props.usageLimit}
      </td>
      <td id="actions">
        <button id="edit" onClick={onEdit}>
          <FaEdit fill="white" />
          Chỉnh sửa
        </button>
        <button id="delete" onClick={onDelete}>
          <FaTrash fill="white" />
          Xóa
        </button>
      </td>
    </tr>
  );
};

export default AdminVoucherRow;
