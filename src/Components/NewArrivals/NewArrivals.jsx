import React, { useEffect, useState } from "react";
import "./NewArrivals.css";
import Item from "../Item/Item";
import { getAllProducts } from "../../api/productService";

const NewArrivals = ({ limit = 8 }) => {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        console.log("[NewArrivals] Fetching newest products...");
        const res = await getAllProducts(1, 100);
        console.log("[NewArrivals] API response:", res);

        const ok = res && (res.success ?? true);
        const arr = ok && Array.isArray(res?.data?.list)
          ? res.data.list
          : [];

        // 🕐 Sắp xếp theo createdAt giảm dần
        const sorted = [...arr].sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );

        if (!alive) return;

        if (!ok) {
          setError("Không thể tải danh sách sản phẩm mới.");
        }

        setList(sorted.slice(0, limit));
      } catch (err) {
        console.error("[NewArrivals] API error:", err);
        if (!alive) return;
        setError("Không thể kết nối đến backend.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [limit]);

  const toItemProps = (p, idx) => ({
    id: p._id || p.id || `arrival-${idx}`,
    name: p.name ?? "Sản phẩm",
    image: p.imageInfo?.url || p.image || "",
    new_price: p.price ?? p.new_price ?? 0,
    old_price: p.old_price ?? null,
  });

  return (
    <div className="new-arrivals">
      <h1>HÀNG MỚI VỀ</h1>
      <hr />

      {loading ? (
        <div className="arrivals loading">Đang tải sản phẩm…</div>
      ) : error ? (
        <div className="arrivals error">{error}</div>
      ) : list.length === 0 ? (
        <div className="arrivals empty">Chưa có sản phẩm mới.</div>
      ) : (
        <div className="arrivals">
          {list.map((p, i) => (
            <Item key={p._id || p.id || `arrival-${i}`} {...toItemProps(p, i)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default NewArrivals;
