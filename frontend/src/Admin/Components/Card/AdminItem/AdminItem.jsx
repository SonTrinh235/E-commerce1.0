import React from "react";
import "./AdminItem.css";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import DefaultImage from "../../../../assets/placeholder-image.png";
import { vnd } from "../../../../utils/currencyUtils"

const AdminItem = (props) => {
  const { onEdit, onDelete, index } = props;

  return (
    <tr className="AdminItem-row">
      <td id="index">{index}</td>
      <td id="image">
        <Link to={`#`}>
          <img
            onClick={() => window.scrollTo(0, 0)}
            src={props.imageInfo?.url || DefaultImage}
            alt= {'Image for '+props.name}
          />
        </Link>
      </td>
      <td id="name">{props.name}</td>
      <td id="category">
        <span>
          {props.category}
        </span>
      </td>
      <td id="price">{vnd(props.price)}</td>
      <td id="description">{props.description}</td>
      <td id="stock">{props.stock}</td>
      <td id="actions">
        <button id="edit" onClick={onEdit}><FaEdit/>Chỉnh sửa</button>
        <button id="delete" onClick={onDelete}><FaTrash/>Xóa SP</button>
      </td>
    </tr>
  );
};

export default AdminItem;
