import React, { useContext } from "react";
import "./ProductDisplay.css";
import star_icon from "../../assets/star_icon.png";
import star_dull_icon from "../../assets/star_dull_icon.png";
import { CartContext } from "../../Context/CartContext";

const currency = new Intl.NumberFormat("vi-VN");

const ProductDisplay = ({ product }) => {
  const { cartAddProductToCart } = useContext(CartContext);

  if (!product) {
    return (
      <div className="productdisplay">
        <div className="productdisplay-right"><h1>Loading…</h1></div>
      </div>
    );
  }

  const pid = product?._id ?? product?.id;
  const image =
    product?.imageInfo?.url ||
    product?.imageUrl ||
    product?.image ||
    (Array.isArray(product?.images) ? product.images[0]?.url || product.images[0] : "");
  const priceNew = product?.price ?? product?.new_price ?? product?.old_price ?? 0;
  const priceOld = product?.old_price != null ? product.old_price : undefined;
  const name = product?.name || "Unnamed";
  const category = product?.category || "-";
  const description = product?.description || "Không có mô tả.";

  return (
    <div className="productdisplay">
      <div className="productdisplay-left">
        <div className="productdisplay-img-list">
          <img src={image} alt={name} />
          <img src={image} alt={name} />
          <img src={image} alt={name} />
          <img src={image} alt={name} />
        </div>
        <div className="productdisplay-img">
          <img className="productdisplay-main-img" src={image} alt={name} />
        </div>
      </div>

      <div className="productdisplay-right">
        <h1>{name}</h1>

        <div className="productdisplay-right-star">
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_dull_icon} alt="" />
          <p>(122)</p>
        </div>

        <div className="productdisplay-right-prices">
          {priceOld != null && (
            <div className="productdisplay-right-price-old">
              {currency.format(priceOld)} đ
            </div>
          )}
          <div className="productdisplay-right-price-new">
            {currency.format(priceNew)} đ
          </div>
        </div>

        <div className="productdisplay-right-description">{description}</div>

        <button onClick={() => pid && cartAddProductToCart(String(pid))} disabled={!pid}>
          ADD TO CART
        </button>

        <p className="productdisplay-right-category">
          <span>Category: {category}</span>
        </p>
      </div>
    </div>
  );
};

export default ProductDisplay;
