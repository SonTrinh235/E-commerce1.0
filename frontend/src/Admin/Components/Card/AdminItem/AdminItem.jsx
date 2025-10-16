import React from "react";
import "./AdminItem.css";
import { Link } from "react-router-dom";
import { FiEdit, FiTrash } from "react-icons/fi";

const AdminItem = (props) => {
  const { onEdit, onDelete } = props;

  return (
    <>
      <td className="admin-item-id">{props.id}</td>
      <td className="admin-item-img">
        <Link to={`/product/${props.id}`}>
          <img
            onClick={() => window.scrollTo(0, 0)}
            src={props.image}
            alt={props.name}
          />
        </Link>
      </td>
      <td>{props.name}</td>
      <td>{props.category}</td>
      <td className="admin-item-price-new">${props.new_price}</td>
      <td className="admin-item-price-old">${props.old_price}</td>
      <td className="admin-item-actions">
        <button id="edit" onClick={onEdit}><FiEdit/>Edit</button>
        <button id="delete" onClick={onDelete}><FiTrash/>Delete</button>
      </td>
    </>
  );
};

export default AdminItem;
