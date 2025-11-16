// ProductDisplay.jsx
import React, { useContext, useMemo, useState } from "react";
import "./ProductDisplay.css";
import star_icon from "../../assets/star_icon.png";
import star_dull_icon from "../../assets/star_dull_icon.png";
import { CartContext } from "../../Context/CartContext";
import { vnd } from "../../utils/currencyUtils.js";

const ProductDisplay = ({ product }) => {
  const { cartAddProductToCart } = useContext(CartContext) || {};

  const p = useMemo(() => {
    if (!product) return null;
    const raw = product.raw || product;

    const id = String(raw._id ?? product._id ?? product.id ?? "");
    const name = raw.name ?? product.name ?? "Sản phẩm";
    const price = Number(raw.price ?? product.price ?? product.new_price ?? 0);

    const oldPrice =
      typeof product?.old_price === "number" ? product.old_price : null;

    const description = raw.description ?? product.description ?? "";
    const ratingCount =
      (Array.isArray(raw.ratings) && raw.ratings.length) ||
      (Array.isArray(raw.ratingIds) && raw.ratingIds.length) ||
      0;

    const catRaw = raw.category ?? product.category;
    const categoryText = Array.isArray(catRaw)
      ? catRaw.join(", ")
      : (catRaw ?? "");

    return {
      id,
      name,
      price,
      oldPrice,
      description,
      ratingCount,
      categoryText,
      raw,
    };
  }, [product]);

  const gallery = useMemo(() => {
    if (!p) return [];
    const urls = new Set();
    const add = (u) => {
      if (u && String(u).trim()) urls.add(u);
    };

    const imgs = p.raw?.images;
    if (Array.isArray(imgs)) {
      for (const it of imgs) {
        if (typeof it === "string") add(it);
        else if (it && typeof it === "object" && it.url) add(it.url);
      }
    }
    add(product?.image);
    add(p.raw?.imageInfo?.url);
    add(product?.imageUrl);

    return Array.from(urls).slice(0, 6);
  }, [p, product]);

  const [activeIdx, setActiveIdx] = useState(0);
  const mainImg = gallery[activeIdx];

  if (!p) return null;

  const handleAdd = () => {
    if (p.id && typeof cartAddProductToCart === "function") {
      cartAddProductToCart(p.id);
    }
  };

  return (
    <div className="productdisplay">
      <div className="productdisplay-left">
        <div className="productdisplay-img-list">
          {gallery.length > 0 ? (
            gallery.map((src, i) => (
              <img
                key={`${src}-${i}`}
                src={src}
                alt={`${p.name} thumbnail ${i + 1}`}
                onClick={() => setActiveIdx(i)}
                className={i === activeIdx ? "active-thumb" : ""}
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            ))
          ) : (
            <>
              <div className="thumb placeholder" />
              <div className="thumb placeholder" />
              <div className="thumb placeholder" />
              <div className="thumb placeholder" />
            </>
          )}
        </div>

        <div className="productdisplay-img">
          {mainImg ? (
            <img
              className="productdisplay-main-img"
              src={mainImg}
              alt={p.name}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : (
            <div className="productdisplay-main-img placeholder">No Image</div>
          )}
        </div>
      </div>

      <div className="productdisplay-right">
        <h1>{p.name}</h1>

        <div className="productdisplay-right-star">
          <img src={star_icon} alt="star" />
          <img src={star_icon} alt="star" />
          <img src={star_icon} alt="star" />
          <img src={star_icon} alt="star" />
          <img src={star_dull_icon} alt="star" />
          <p>({p.ratingCount})</p>
        </div>

        <div className="productdisplay-right-prices">
          {p.oldPrice != null && p.oldPrice > p.price && (
            <div className="productdisplay-right-price-old">
              {vnd(p.oldPrice)}
            </div>
          )}
          <div className="productdisplay-right-price-new">{vnd(p.price)}</div>
        </div>

        <div className="productdisplay-right-description">
          {p.description || `PRODUCT DESCRIPTION ${p.id}`}
        </div>

        <div className="productdisplay-right-size">
          <h1>OPTIONAL</h1>
          <div className="productdisplay-right-sizes">
            <div>1</div>
            <div>2</div>
            <div>3</div>
            <div>4</div>
            <div>5</div>
          </div>
        </div>

        <button onClick={handleAdd} disabled={!p.id}>
          ADD TO CART
        </button>

        <p className="productdisplay-right-category">
          <span>Category:</span> {p.categoryText || "—"}
        </p>
        <p className="productdisplay-right-category">
          <span>Tags:</span>
        </p>
      </div>
    </div>
  );
};

export default ProductDisplay;
