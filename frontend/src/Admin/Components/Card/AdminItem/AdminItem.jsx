import React from "react";
import "./AdminItem.css";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import DefaultImage from "../../../../assets/placeholder-image.png";
import { vnd } from "../../../../utils/currencyUtils";

const AdminItem = (props) => {
  const { onEdit, onDelete, index } = props;

  const getStockClass = (stock) => {
    if (stock > 200) return "high";
    if (stock > 50) return "medium";
    return "low";
  };

  return (
    <tr className="AdminItem-row">
      <td>{index}</td>
      <td>
        <img
          onClick={() => window.scrollTo(0, 0)}
          src={props.imageUrl || props.imageInfo?.url || DefaultImage}
          alt={"Image for " + props.name}
          className="product-image"
        />
      </td>
      <td className="product-name-cell">
        <p className="product-name">{props.name}</p>
      </td>
      <td>
        <span className="category-badge">{props.categoryInfo.name}</span>
      </td>
      <td className="product-price">{vnd(props.price)}</td>
      <td className="product-description-cell">
        <p className="product-description">{props.description}</p>
      </td>
      <td>
        <span className={`stock-badge ${getStockClass(props.stock)}`}>
          {props.stock}
        </span>
      </td>
      <td>
        <div className="action-buttons">
          <button className="action-btn edit-btn" onClick={onEdit}>
            <FaEdit fill="white" />
          </button>
          <button className="action-btn delete-btn" onClick={onDelete}>
            <FaTrash fill="white" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default AdminItem;
