// src/Components/Popular/Popular.jsx
import { useEffect, useState } from "react";
import "./Popular.css";
import Item from "../Item/Item";
import { getProducts } from "../../api/productService";

// Chuẩn hoá NGAY TẠI ĐÂY (không import utils)
function toItemProps(p) {
  return {
    id: p?._id ?? p?.id ?? p?.productId ?? "",
    name: p?.name ?? p?.title ?? "Unnamed",
    image:
      p?.imageInfo?.url ||
      p?.imageUrl ||
      p?.image ||
      (Array.isArray(p?.images) ? p.images[0]?.url || p.images[0] : "") ||
      "",
    new_price: Number(
      p?.price ??
        p?.new_price ??
        (typeof p?.old_price === "number" ? p.old_price : 0)
    ),
    old_price: p?.old_price != null ? Number(p.old_price) : undefined,
  };
}

export default function Popular() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        // Nếu backend chưa hỗ trợ sort="popular", cứ bỏ tham số sort cũng được
        const { items: list } = await getProducts({ page: 1, limit: 12, sort: "popular" });
        if (!abort) setItems(list.map(toItemProps));
      } catch (e) {
        if (!abort) setErr(e?.message || "Failed to load popular products");
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => { abort = true; };
  }, []);

  return (
    <div className="popular">
      <h1>Today Popular</h1>
      <hr />
      {loading && <div>Loading popular products…</div>}
      {err && <div className="text-red-600">{String(err)}</div>}
      {!loading && !err && (
        <div className="popular-item">
          {items.map((item) => (
            <Item
              key={item.id}
              id={item.id}
              name={item.name}
              image={item.image}
              new_price={item.new_price}
              old_price={item.old_price}
            />
          ))}
          {!items.length && <div>No products.</div>}
        </div>
      )}
    </div>
  );
}
