import React, { useEffect, useState } from "react";
import { getAllProducts } from "../../api/productService";
import { ProductCard } from "../ProductCard/ProductCard";
import "./ProductGrid.css";

export default function ProductGrid({ selectedCategory = "all", searchQuery = "", onAddToCart, onProductClick }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await getAllProducts(1, 50);
        const list = res?.data?.list || [];
        const mappedList = list.map((p) => ({
          id: p._id,
          ...p,
          image: p.imageInfo?.url || "",
          discount: p.discount,
          originalPrice: p.originalPrice || null,
        }));

        setProducts(mappedList);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product.categoryId === selectedCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="product-grid-container">
      <div className="product-grid-header">
        <h2>{selectedCategory === "all" ? "Tất cả sản phẩm" : "Danh mục đã chọn"}</h2>
        <p>{filteredProducts.length} sản phẩm</p>
      </div>

      {loading ? (
        <div className="no-products">
          <p>Đang tải sản phẩm...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="no-products">
          <p>Không tìm thấy sản phẩm nào</p>
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onClick={() => onProductClick(product)}
            />
          ))}
        </div>
      )}
    </div>
  );
}