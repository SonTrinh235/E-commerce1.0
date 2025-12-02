import React from "react";
import "./Item.css";
import { Link } from "react-router-dom";
import { vnd } from "../../utils/currencyUtils.js";

const Item = (props) => {
  const { id, name, image, new_price, old_price } = props;
  const hasOld =
    old_price != null &&
    !Number.isNaN(Number(old_price)) &&
    Number(old_price) > Number(new_price || 0);

  return (
    <div className="item">
      <Link to={`/product/${id}`} onClick={() => window.scrollTo(0, 0)}>
        <div className="product-img">
          {/* <img src={image || ""} alt={name || "Sản phẩm"} /> */}
          <img src={image || null} alt={name || "product"} />
        </div>

        <div className="product-description">
          <p>{name}</p>
          <div className="item-prices">
            <div className="item-price-new">{vnd(new_price)}</div>
            {hasOld && <div className="item-price-old">{vnd(old_price)}</div>}
          </div>
        </div>
        {/* <button className="product-buybutton">Buy now</button> */}
      </Link>
    </div>
  );
};

export default Item;
