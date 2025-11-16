import React, { useMemo } from "react";
import "./Breadcrums.css";
import arrow_icon from "../../assets/breadcrum_arrow.png";
import { Link } from "react-router-dom";

const slugify = (s) =>
  encodeURIComponent(String(s).trim().toLowerCase().replace(/\s+/g, "-"));

const Breadcrums = ({ product = {} }) => {
  const categoryText = useMemo(() => {
    if (!product?.category) return "";
    return Array.isArray(product.category)
      ? product.category[0] || ""
      : product.category;
  }, [product]);

  const categorySlug = categoryText ? slugify(categoryText) : "";
  const name = product?.name || "…";

  const crumbs = [
    { label: "HOME", to: "/" },
    { label: "SHOP", to: "/shop" },
    ...(categoryText
      ? [{ label: categoryText.toUpperCase(), to: `/shop/c/${categorySlug}` }]
      : []),
    { label: name, to: null },
  ];

  return (
    <nav className="breadcrum" aria-label="Breadcrumb">
      {crumbs.map((c, i) => (
        <span className="breadcrum-part" key={`${c.label}-${i}`}>
          {c.to ? (
            <Link to={c.to}>{c.label}</Link>
          ) : (
            <span className="current">{c.label}</span>
          )}
          {i < crumbs.length - 1 && (
            <img src={arrow_icon} alt="" aria-hidden="true" />
          )}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrums;
