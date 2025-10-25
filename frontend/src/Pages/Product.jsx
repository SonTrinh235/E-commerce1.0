// src/Pages/Product.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Breadcrums from "../Components/Breadcrums/Breadcrums";
import ProductDisplay from "../Components/ProductDisplay/ProductDisplay";
import DescriptionBox from "../Components/DescriptionBox/DescriptionBox";
import RelatedProducts from "../Components/RelatedProducts/RelatedProducts";

import { getProductById } from "../api/productService";

const Product = () => {
  // Tên param phải khớp route. Nếu route là /product/:id thì lấy { id }
  const { productId, id } = useParams();
  const pid = productId ?? id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await getProductById(pid);
        if (!aborted) setProduct(data);
      } catch (e) {
        if (!aborted) setErr(e?.message || "Failed to load product");
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, [pid]);

  return (
    <div>
      <Breadcrums product={product} />

      {loading && <div>Loading product…</div>}
      {!loading && err && <div className="text-red-600">{String(err)}</div>}
      {!loading && !err && product && <ProductDisplay product={product} />}
      {!loading && !err && !product && <div>Product not found.</div>}

      <DescriptionBox />
      <RelatedProducts />
    </div>
  );
};

export default Product;
