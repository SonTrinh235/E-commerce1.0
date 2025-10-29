import React, { useEffect, useState } from "react";
import "./Popular.css";
import Item from "../Item/Item";
import data_product from "../../data/data";
import { getAllProducts } from "../../api/productService";

const Popular = ({ limit = 8, page = 1 }) => {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");

        console.log("[Popular] calling getAllProducts", { page, limit });
        const res = await getAllProducts(page, limit);
        console.log("[Popular] API response:", res);

        const ok = res && (res.success ?? true);
        const arr = ok && Array.isArray(res?.data?.list) ? res.data.list : [];

        if (!alive) return;
        if (!ok) {
          setError("API retuen error.");
        }
        if (arr.length === 0) {
          console.warn("[Popular] Empty list from backend");
        }
        setList(arr.slice(0, limit));
      } catch (e) {
        console.error("[Popular] API error:", e);
        if (!alive) return;
        setError("Khong lay duoc data tu Backend.");
        setList(
          (data_product || []).slice(0, limit).map((p) => ({
            _id: p.id ?? p._id,
            name: p.name,
            price: p.new_price ?? p.price,
            imageInfo: p.image ? { url: p.image } : undefined,
            old_price: p.old_price ?? null,
          }))
        );
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [page, limit]);

  const toItemProps = (p, idx) => ({
    id: p._id || p.id || `popular-${idx}`,
    name: p.name ?? "Sản phẩm",
    image: p.imageInfo?.url || p.image || "",
    new_price: p.price ?? p.new_price ?? 0,
    old_price: p.old_price ?? null,
  });

  return (
    <div className="popular">
      <h1>Today Popular</h1>
      <hr />
      {loading ? (
        <div className="popular-loading">Đang tải sản phẩm…</div>
      ) : list.length === 0 ? (
        <div className="popular-item empty">Không có sản phẩm.</div>
      ) : (
        <div className="popular-item">
          {list.map((p, i) => {
            const reactKey = p._id || p.id || `popular-${i}`;
            return <Item key={reactKey} {...toItemProps(p, i)} />;
          })}
        </div>
      )}
      {error && <div className="popular-error">{error}</div>}
    </div>
  );
};

export default Popular;
