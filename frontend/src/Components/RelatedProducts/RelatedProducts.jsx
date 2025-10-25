// src/Components/RelatedProducts/RelatedProducts.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./RelatedProducts.css";
import Item from "../Item/Item";
import { getProductById, getProducts } from "../../api/productService";

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
    category: p?.category ?? "",
  };
}

export default function RelatedProducts() {
  const { productId, id } = useParams();
  const pid = productId ?? id;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let abort = false;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        const current = await getProductById(pid);
        const cat = current?.category || "";

        const { items: list } = await getProducts({ page: 1, limit: 12, category: cat });

        const normalized = list.map(toItemProps);
        const filtered = normalized
          .filter((p) => String(p.id) !== String(pid))
          .filter((p) => (cat ? p.category === cat : true))
          .slice(0, 8);

        if (!abort) setItems(filtered);
      } catch (e) {
        if (!abort) setErr(e?.message || "Failed to load related products");
      } finally {
        if (!abort) setLoading(false);
      }
    })();

    return () => {
      abort = true;
    };
  }, [pid]);

  return (
    <div className="relatedproducts">
      <h1>Sản phẩm tương tự</h1>
      <hr />
      {loading && <div>Đang tải…</div>}
      {err && <div className="text-red-600">{String(err)}</div>}
      {!loading && !err && (
        <div className="relatedproducts-item">
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
          {!items.length && <div>Chưa có sản phẩm gợi ý.</div>}
        </div>
      )}
    </div>
  );
}
