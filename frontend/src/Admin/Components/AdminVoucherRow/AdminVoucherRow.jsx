import "./AdminVoucherRow.css";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import DefaultImage from "../../../assets/placeholder-image.png";

// Import utils
import { formatDate } from "../../../utils/dateUtils";
import { vnd } from "../../../utils/currencyUtils";

const AdminVoucherRow = (props) => {
  const { onEdit, onDelete, index } = props;

  function daysUntil(target) {
    const dateExpire = new Date(target);
    const now = new Date();
    const durationInMs =  dateExpire.getTime() - now.getTime();
    const msInDay = 1000 * 60 * 60 * 24;
    const durationInDay = durationInMs/msInDay;
    return Math.ceil(durationInDay);
  }

  const daysRemaining = daysUntil(props.expirationDate);

  return (
    <tr className="AdminVoucherRow">
      <td>
        <p className="voucher-name">{props.name}</p>
      </td>
      <td id="code">
        <span className="voucher-code">
          <code style={{ color: "#333333" }}>{props.code}</code>
        </span>
      </td>
      <td>
        <span className={`discount-badge ${props.discountType}`}>
          {props.discountType === "percentage" ? "Phần trăm" : "Cố định"}
        </span>
      </td>
      <td>
        <span className={`discount-value ${props.discountType}`}>
          {props.discountType === "percentage" ? (
            <>{props.discountValue}%</>
          ) : (
            <>{vnd(props.discountValue)}</>
          )}
        </span>
      </td>
      <td>
        <p className="voucher-description">{props.description}</p>
      </td>
      <td>
        <span className="expiry-date">{daysRemaining > 0 ? (`Còn ${daysRemaining} ngày`) : (`Đã hết hạn (${-daysRemaining} ngày trước)`)}</span>
      </td>
      <td id="usage">
        <span className="usage-count">
          {props.usedCount}/{props.usageLimit}
        </span>
      </td>
      <td>
        <div className="voucher-action-buttons">
          <button className="voucher-edit-btn" onClick={onEdit}>
            <FaEdit fill="white" />
          </button>
          <button className="voucher-delete-btn" onClick={onDelete}>
            <FaTrash fill="white" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default AdminVoucherRow;
