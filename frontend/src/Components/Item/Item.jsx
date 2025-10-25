import React, { useContext } from "react";
import "./Item.css";
import { Link } from "react-router-dom";
import { CartContext } from "../../Context/CartContext";

const currency = new Intl.NumberFormat("vi-VN");

const Item = ({ id, name, image, new_price, old_price }) => {
  const { cartAddProductToCart, isCartLoading } = useContext(CartContext);

  const onAdd = () => {
    if (!id) return;
    cartAddProductToCart(String(id));
  };
  const detailHref = `/product/${id}`;

  return (
    <div className="item">
      <Link to={detailHref}>
        <img src={image} alt={name || "product"} />
      </Link>

      <p className="item-name">
        <Link to={detailHref}>{name || "Unnamed"}</Link>
      </p>

      <div className="item-prices">
        {old_price != null && (
          <div className="item-price-old">{currency.format(old_price)} đ</div>
        )}
        <div className="item-price-new">{currency.format(new_price || 0)} đ</div>
      </div>

      <button className="item-add-btn" onClick={onAdd} disabled={isCartLoading || !id}>
        Thêm vào giỏ
      </button>
    </div>
  );
};

export default Item;
