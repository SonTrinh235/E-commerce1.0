import React from "react";
import "./AdminItem.css";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import DefaultImage from "../../../../assets/placeholder-image.png";

const AdminItem = (props) => {
  const { onEdit, onDelete } = props;

  return (
    <>
      <td className="admin-item-img">
        <Link to={`#`}>
          <img
            onClick={() => window.scrollTo(0, 0)}
            src={props.imageInfo?.url || DefaultImage}
            alt= {'Image for '+props.name}
          />
        </Link>
      </td>
      <td>{props.name}</td>
      <td>{props.category}</td>
      <td className="admin-item-price">${props.price}</td>
      <td className="admin-item-description">{props.description}</td>
      <td className="admin-item-stock">{props.stock}</td>
      <td className="admin-item-actions">
        <button id="edit" onClick={onEdit}><FaEdit/>Chỉnh sửa</button>
        <button id="delete" onClick={onDelete}><FaTrash/>Xóa SP</button>
      </td>
    </>
  );
};

export default AdminItem;
