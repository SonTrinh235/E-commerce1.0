import React, { useEffect, useMemo, useState } from "react";
import "./RelatedProducts.css";
import Item from "../Item/Item";
import { useParams } from "react-router-dom";
import { getAllProducts, getProductById } from "../../api/productService";

const normalizeCats = (cat) => {
  if (!cat) return [];
  if (Array.isArray(cat)) return cat.map((c) => String(c).trim().toLowerCase()).filter(Boolean);
  return [String(cat).trim().toLowerCase()].filter(Boolean);
};

const intersects = (a, b) => {
  if (!a.length || !b.length) return false;
  const setB = new Set(b);
  return a.some((x) => setB.has(x));
};

const RelatedProducts = ({ limit = 5 }) => {
  const { productId, id } = useParams();
  const pid = productId || id;

  const [baseProduct, setBaseProduct] = useState(null);
  const [pool, setPool] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        
        let current = null;
        if (pid) {
          const resBase = await getProductById(pid);
          current = resBase?.data || null;
        }

        const res = await getAllProducts(1, 100);
        const list = Array.isArray(res?.data?.list) ? res.data.list : [];

        if (!alive) return;
        setBaseProduct(current);
        setPool(list);
      } catch {
        if (!alive) return;
        setError("Không lấy được dữ liệu sản phẩm liên quan.");
        setBaseProduct(null);
        setPool([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [pid]);

  const related = useMemo(() => {
    if (!pool.length || !baseProduct) return [];

    const baseCats = normalizeCats(baseProduct?.category);
    if (baseCats.length === 0) return [];

    let arr = pool
      .filter((p) => (p._id || p.id) !== pid)
      .filter((p) => intersects(normalizeCats(p?.category), baseCats))
      .sort(
        (a, b) =>
          new Date(b?.createdAt || 0).getTime() -
          new Date(a?.createdAt || 0).getTime()
      );

    return arr.slice(0, Math.min(limit, 5));
  }, [pool, baseProduct, pid, limit]);

  const toItemProps = (p, idx) => ({
    id: p._id || p.id || `rel-${idx}`,
    name: p.name ?? "Sản phẩm",
    image: p.imageInfo?.url || p.image || null,
    new_price: p.price ?? p.new_price ?? 0,
    old_price: p.old_price ?? null,
  });

  return (
    <div className="relatedproducts">
      <h1>Sản phẩm tương tự</h1>
      <hr />
      {loading ? (
        <div className="relatedproducts-item loading">Đang tải…</div>
      ) : related.length === 0 ? (
        <div className="relatedproducts-item empty">Không có sản phẩm cùng danh mục.</div>
      ) : (
        <div className="relatedproducts-item">
          {related.map((p, i) => (
            <Item key={p._id || p.id || i} {...toItemProps(p, i)} />
          ))}
        </div>
      )}
      {error && <div className="relatedproducts-error">{error}</div>}
    </div>
  );
};

export default RelatedProducts;
