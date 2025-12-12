import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ProductDisplay from "../Components/ProductDisplay/ProductDisplay";
import RelatedProducts from "../Components/RelatedProducts/RelatedProducts";

// Import CẢ 2 API: lấy theo ID và lấy theo Slug
import { getProductBySlug, getProductById, getProductsByCategoryAPI } from "../api/productService"; 

const Product = ({ onAddToCart }) => {
  // Lấy TẤT CẢ tham số có thể có từ URL
  const { productId, categorySlug, slug } = useParams();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        setProduct(null);

        let res = null;

        // --- LOGIC THÔNG MINH (HYBRID) ---
        if (categorySlug && slug) {
            // Trường hợp 1: URL có Slug -> Gọi API Slug
            // console.log("Fetching by Slug:", slug);
            res = await getProductBySlug(categorySlug, slug);
        } else if (productId) {
            // Trường hợp 2: URL có ID -> Gọi API ID
            // console.log("Fetching by ID:", productId);
            res = await getProductById(productId);
        } else {
            // Trường hợp lỗi (không có tham số nào)
            throw new Error("URL không hợp lệ");
        }
        
        if (!alive) return;

        if (res?.success && res?.data) {
           const currentProduct = res.data;
           setProduct(currentProduct);

           // --- Lấy sản phẩm liên quan ---
           // Ưu tiên lấy slug danh mục từ dữ liệu trả về
           const targetCateSlug = currentProduct.categoryInfo?.slug || categorySlug;
           
           // Chỉ gọi API liên quan nếu có slug danh mục hợp lệ
           if (targetCateSlug && targetCateSlug !== 'undefined' && targetCateSlug !== 'san-pham') {
              try {
                // Gọi API lấy list sản phẩm theo danh mục
                const relatedRes = await getProductsByCategoryAPI(targetCateSlug, 1, 5);
                if (alive && relatedRes?.success && relatedRes?.data?.list) {
                    // Lọc bỏ chính sản phẩm đang xem
                    const filteredList = relatedRes.data.list.filter(p => p._id !== currentProduct._id);
                    setRelatedProducts(filteredList);
                }
              } catch (err) {
                console.warn("Lỗi lấy sp liên quan:", err);
              }
           }
        } else {
           setError("Không tìm thấy sản phẩm.");
        }

      } catch (e) {
        if (!alive) return;
        console.error("Lỗi tải trang product:", e);
        setError("Không tải được dữ liệu sản phẩm.");
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchData();
    
    return () => { alive = false; };
  }, [categorySlug, slug, productId]); // Theo dõi sự thay đổi của cả 3 biến

  if (loading) return <div style={{padding: 50, textAlign: 'center'}}>Đang tải sản phẩm...</div>;

  if (error || !product) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h3>{error || "Không tìm thấy sản phẩm."}</h3>
        <Link to="/" style={{ color: "blue", textDecoration: "underline" }}>Quay lại trang chủ</Link>
      </div>
    );
  }

  return (
    <div>
      <ProductDisplay product={product} onAddToCart={onAddToCart} />
      <RelatedProducts products={relatedProducts} onAddToCart={onAddToCart} /> 
    </div>
  );
};

export default Product;