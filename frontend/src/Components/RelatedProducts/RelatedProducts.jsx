import React, { useEffect, useState } from "react";
import "./RelatedProducts.css"; 
// Import ProductCard từ đúng đường dẫn (đi ra 1 cấp thư mục cha)
import { ProductCard } from "../ProductCard/ProductCard"; 
import { useParams } from "react-router-dom";
import { getProductById, getProductsByCategoryAPI, getProductBySlug } from "../../api/productService";

const RelatedProducts = ({ limit = 4 }) => {
  const { productId, id, slug, categorySlug } = useParams();
  const pid = productId || id;

  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    // Nếu không có tham số nào thì dừng
    if (!pid && (!slug || !categorySlug)) {
        setLoading(false);
        return;
    }

    const fetchRelated = async () => {
      try {
        setLoading(true);
        setError("");

        let currentProduct = null;

        // 1. Lấy sản phẩm hiện tại để biết Category
        if (pid) {
            const resBase = await getProductById(pid);
            currentProduct = resBase?.data;
        } else if (slug && categorySlug) {
            const resBase = await getProductBySlug(categorySlug, slug);
            currentProduct = resBase?.data;
        }

        if (!currentProduct) {
             if (alive) {
                 setRelated([]); 
                 setLoading(false);
             }
             return;
        }

        // 2. Lấy sản phẩm liên quan theo danh mục
        const productCatSlug = currentProduct.categoryInfo?.slug;
        const currentId = currentProduct._id || currentProduct.id;

        if (productCatSlug) {
            const resRelated = await getProductsByCategoryAPI(productCatSlug, 1, limit + 5);
            
            if (resRelated?.success && Array.isArray(resRelated.data.list)) {
                // Lọc bỏ sản phẩm hiện tại
                const filteredList = resRelated.data.list
                    .filter((p) => (p._id || p.id) !== currentId)
                    .slice(0, limit);

                if (alive) setRelated(filteredList);
            } else {
                if (alive) setRelated([]);
            }
        } else {
            if (alive) setRelated([]);
        }

      } catch (err) {
        console.error("Lỗi lấy sản phẩm tương tự:", err);
        if (alive) setError("Không thể tải sản phẩm liên quan.");
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchRelated();

    return () => { alive = false; };
  }, [pid, slug, categorySlug, limit]);

  if (!loading && related.length === 0) return null;

  return (
    <div className="relatedproducts">
      <h1>Sản phẩm tương tự</h1>
      <hr />
      
      {loading ? (
        <div className="relatedproducts-item loading">
             <p>Đang tải gợi ý...</p>
        </div>
      ) : (
        <div className="relatedproducts-item">
          {related.map((p) => (
            <ProductCard key={p._id || p.id} product={p} />
          ))}
        </div>
      )}
      
      {error && <div className="relatedproducts-error">{error}</div>}
    </div>
  );
};

export default RelatedProducts;