import React, { useEffect, useState } from "react";
import { ProductCard } from "../ProductCard/ProductCard";
import "./ProductGrid.css";

export default function ProductGrid({ selectedCategory = "all", searchQuery = "", onAddToCart, onProductClick }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = "";
        
        if (selectedCategory === "all" || !selectedCategory) {
          url = "https://www.bachkhoaxanh.xyz/search/products?query=a&page=1&limit=50";
        } else {
          url = `https://www.bachkhoaxanh.xyz/product/products/category/${selectedCategory}?page=1&limit=50`;
        }

        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (data.success) {
          const list = Array.isArray(data.data) ? data.data : (data.data?.list || []);
          
          const mappedList = list.map((p) => ({
            id: p._id,
            ...p,
            image: p.imageInfo?.url || "",
            discount: p.discount || 0,
            originalPrice: p.originalPrice || null,
          }));

          setProducts(mappedList);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSearch;
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