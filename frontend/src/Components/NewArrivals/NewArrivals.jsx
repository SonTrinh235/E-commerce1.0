import React, { useEffect, useMemo, useState } from "react";
import "./NewArrivals.css";
import Item from "../Item/Item";
import { getAllProducts } from "../../api/productService";
import new_arrivals from "../../data/new_arrivals";



const MS_PER_DAY = 24 * 60 * 60 * 1000;

const NewArrivals = ({
  limit = 8,
  page = 1,
  sinceDays = 14,
  startDate,
  endDate,
}) => {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [error, setError] = useState("");

  const { startMs, endMs } = useMemo(() => {
    const end = endDate ? new Date(endDate).getTime() : Date.now();
    const validEnd = Number.isFinite(end) ? end : Date.now();
    const start = startDate
      ? new Date(startDate).getTime()
      : validEnd - sinceDays * MS_PER_DAY;
    const validStart = Number.isFinite(start)
      ? start
      : validEnd - sinceDays * MS_PER_DAY;
    return { startMs: validStart, endMs: validEnd };
  }, [startDate, endDate, sinceDays]);

  useEffect(() => {
    let alive = true;

    const isWithinRange = (isoStr) => {
      if (!isoStr) return false;
      const t = new Date(isoStr).getTime();
      if (!Number.isFinite(t)) return false;
      return t >= startMs && t <= endMs;
    };

    (async () => {
      try {
        setLoading(true);
        setError("");

        const fetchLimit = Math.max(limit * 3, 24);
        console.log("[NewArrivals] calling getAllProducts", { page, fetchLimit });
        const res = await getAllProducts(page, fetchLimit);
        console.log("[NewArrivals] API response:", res);

        const ok = res && (res.success ?? true);
        let arr = ok && Array.isArray(res?.data?.list) ? res.data.list : [];

        // lọc theo createdAt
        arr = arr.filter((p) => isWithinRange(p?.createdAt));
        // sort mới -> cũ
        arr.sort(
          (a, b) =>
            new Date(b?.createdAt || 0).getTime() -
            new Date(a?.createdAt || 0).getTime()
        );

        if (!alive) return;
        if (!ok) setError("API trả về lỗi.");
        if (arr.length === 0) {
          console.warn("[NewArrivals] Empty list after filter/time window");
        }
        setList(arr.slice(0, limit));
      } catch (e) {
        console.error("[NewArrivals] API error:", e);
        if (!alive) return;
        setError("Không lấy được dữ liệu từ backend. Hiển thị dữ liệu mẫu.");
        setList(
          (new_arrivals || []).slice(0, limit).map((p) => ({
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
  }, [page, limit, startMs, endMs]);

  const toItemProps = (p, idx) => ({
    id: p._id || p.id || `arrival-${idx}`,
    name: p.name ?? "Sản phẩm",
    image: p.imageInfo?.url || p.image || "",
    new_price: p.price ?? p.new_price ?? 0,
    old_price: p.old_price ?? null,
  });

  // const formatDate = (ms) =>
  //   new Date(ms).toLocaleDateString("vi-VN", {
  //     year: "numeric",
  //     month: "2-digit",
  //     day: "2-digit",
  //   });

  return (
    <div className="new-arrivals">
      <h1>HÀNG MỚI VỀ</h1>
      <hr />
{/* 
      <div className="arrivals-window" style={{ opacity: 0.75, marginBottom: 8 }}>
        Lọc theo ngày thêm: {formatDate(startMs)} → {formatDate(endMs)}
      </div> */}

      {loading ? (
        <div className="arrivals loading">Đang tải sản phẩm…</div>
      ) : list.length === 0 ? (
        <div className="arrivals empty">
          Không có sản phẩm trong khoảng thời gian này.
        </div>
      ) : (
        <div className="arrivals">
          {list.map((p, i) => {
            const reactKey = p._id || p.id || `arrival-${i}`;
            return <Item key={reactKey} {...toItemProps(p, i)} />;
          })}
        </div>
      )}

      {error && <div className="popular-error">{error}</div>}
    </div>
  );
};

export default NewArrivals;
