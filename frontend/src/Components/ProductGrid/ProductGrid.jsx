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
        
        // SỬA: Dùng API lấy tất cả sản phẩm để có đủ ratings và flashSaleInfo
        if (selectedCategory === "all" || !selectedCategory) {
          url = "https://www.bachkhoaxanh.xyz/product/products/all?page=1&limit=50";
        } else {
          url = `https://www.bachkhoaxanh.xyz/product/products/category/${selectedCategory}?page=1&limit=50`;
        }

        console.log("ProductGrid: Calling API:", url);

        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (data.success) {
          const list = Array.isArray(data.data) ? data.data : (data.data?.list || []);
          
          const mappedList = list.map((p) => {
             // Logic chuẩn hóa dữ liệu
             const finalRating = p.rating || p.averageRating || p.score || 0;
             // API /products/all trả về mảng ratings hoặc ratingIds, ta ưu tiên đếm nó
             const finalReviewCount = p.ratings?.length || p.ratingIds?.length || p.reviewCount || 0;

             return {
                ...p, // Copy toàn bộ dữ liệu gốc (bao gồm flashSaleInfo)
                id: p._id,
                
                // Ghi đè các trường đã tính toán cho ProductCard dùng
                rating: finalRating,       
                reviewCount: finalReviewCount, 
                
                image: p.imageInfo?.url || p.imageUrl || "",
                // Lưu ý: Không gán discount mặc định = 0 để tránh mất Flash Sale
                originalPrice: p.originalPrice || null,
             };
          });

          console.log("ProductGrid: Mapped Data Sample:", mappedList[0]);
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
    if (!searchQuery) return true;
    return product.name.toLowerCase().includes(searchQuery.toLowerCase());
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