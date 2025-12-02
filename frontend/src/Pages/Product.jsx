import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
// import Breadcrums from "../Components/Breadcrums/Breadcrums";
import ProductDisplay from "../Components/ProductDisplay/ProductDisplay";
// import DescriptionBox from "../Components/DescriptionBox/DescriptionBox";
import RelatedProducts from "../Components/RelatedProducts/RelatedProducts";
import { getProductById } from "../api/productService"; 

const Product = ({ onAddToCart }) => {
  const { productId } = useParams();
  const pid = productId;

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getProductById(pid);
        const p = res?.data;
        if (!alive) return;

        if (!p || !p._id) {
          setError("Không tìm thấy sản phẩm.");
          setProduct(null);
          return;
        }
        setProduct(p);
      } catch (e) {
        if (!alive) return;
        setError("Không tải được dữ liệu sản phẩm.");
        setProduct(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [pid]);

  if (loading) return <div style={{ padding: 16 }}>Đang tải sản phẩm…</div>;

  if (error || !product) {
    return (
      <div style={{ padding: 16 }}>
        <p>{error || "Không tìm thấy sản phẩm."}</p>
        <Link to="/shop">Quay lại Shop</Link>
      </div>
    );
  }

  return (
    <div>
      <ProductDisplay product={product} onAddToCart={onAddToCart} />      
      {/* <DescriptionBox /> */}
      <RelatedProducts onAddToCart={onAddToCart} /> 
    </div>
  );
};

export default Product;