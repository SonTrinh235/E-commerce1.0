import React, { useContext } from "react";
import { useLocation, Link } from "react-router-dom";
import { ShopContext } from "../Context/ShopContext";
import "./CSS/SearchResults.css";

const SearchResults = () => {
  const { all_product = [] } = useContext(ShopContext) || {};
  const location = useLocation();

  // Lấy query từ URL
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("query")?.trim().toLowerCase() || "";

  // Lọc sản phẩm theo tên hoặc category
  const filteredProducts = all_product.filter((product) => {
    const nameMatch = product.name.toLowerCase().includes(query);
    const categoryMatch = Array.isArray(product.category)
      ? product.category.some((cat) => cat.toLowerCase().includes(query))
      : product.category?.toLowerCase().includes(query);

    return nameMatch || categoryMatch;
  });

  return (
    <div className="searchresults">
      {/* Banner */}
      <div className="searchresults-banner">
        <h2>
          {query
            ? `Result for: "${query}"`
            : "Vui lòng nhập từ khóa tìm kiếm"}
        </h2>
      </div>

      {/* Sort & Count */}
      {query && filteredProducts.length > 0 && (
        <div className="searchresults-indexSort">
          <p>
            <span>{filteredProducts.length}</span> Item
          </p>
          <select className="searchresults-sort">
            <option value="default">Sort</option>
            <option value="price-asc">Increase</option>
            <option value="price-desc">Decrease</option>
          </select>
        </div>
      )}

      {/* Products */}
      {query && filteredProducts.length > 0 ? (
        <div className="searchresults-products">
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`} // Link đến chi tiết
              className="item"
            >
              <img src={product.image} alt={product.name} />
              <h3>{product.name}</h3>
              <p className="category">
                {Array.isArray(product.category)
                  ? product.category.join(", ")
                  : product.category}
              </p>
              <div className="item-prices">
                <span className="item-price-new">
                  ${product.new_price.toFixed(2)}
                </span>
                {product.old_price && product.old_price > product.new_price && (
                  <span className="item-price-old">
                    ${product.old_price.toFixed(2)}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : query ? (
        <p style={{ margin: "20px 170px" }}>
          Not Found :/ "{query}".
        </p>
      ) : null}

      {/* Load More */}
      {query && filteredProducts.length > 0 && (
        <div className="searchresults-loadmore">Xem thêm</div>
      )}
    </div>
  );
};

export default SearchResults;
