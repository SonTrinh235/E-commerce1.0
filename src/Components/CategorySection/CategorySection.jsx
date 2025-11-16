// src/Components/CategorySection/CategorySection.jsx
import React from "react";
import { Link } from "react-router-dom";
import ProductCard from "../ProductDisplay/ProductDisplay";

import "./CategorySection.css";

const CategorySection = ({ title, products = [], linkTo }) => {
  const limitedProducts = products.slice(0, 20);

  return (
    <div className="category-section">
      <div className="category-header">
        <h2>{title}</h2>
        {linkTo && <Link to={linkTo}>Xem tất cả →</Link>}
      </div>
      <div className="category-grid">
        {limitedProducts.length > 0 ? (
          limitedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <p>Chưa có sản phẩm</p>
        )}
      </div>
    </div>
  );
};

export default CategorySection;
