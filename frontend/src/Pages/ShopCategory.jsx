import React, { useEffect, useMemo, useState } from "react";
import "./CSS/ShopCategory.css";
import Item from "../Components/Item/Item";
import { getProducts } from "../api/productService";

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

const ShopCategory = (props) => {
  const category = props.category || "";
  const [sortOption, setSortOption] = useState("default");

  // danh sách sản phẩm đã tải (tích luỹ theo trang)
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 12;
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        setPage(1);

        const { items: list, totalPages: tp } = await getProducts({
          page: 1,
          limit,
          category, 
        });

        const filtered = (list || []).filter((p) =>
          category ? (p?.category === category) : true
        );

        if (!aborted) {
          setItems(filtered.map(toItemProps));
          setTotalPages(tp || 1);
        }
      } catch (e) {
        if (!aborted) setErr(e?.message || "Failed to load products");
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, [category]); 

  const onLoadMore = async () => {
    if (page >= totalPages) return;
    setLoadingMore(true);
    setErr("");
    const nextPage = page + 1;
    try {
      const { items: list } = await getProducts({
        page: nextPage,
        limit,
        category,
      });
      const filtered = (list || []).filter((p) =>
        category ? (p?.category === category) : true
      );
      setItems((prev) => [...prev, ...filtered.map(toItemProps)]);
      setPage(nextPage);
    } catch (e) {
      setErr(e?.message || "Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  };

  const sortedProducts = useMemo(() => {
    const arr = [...items];
    if (sortOption === "price-asc") {
      arr.sort((a, b) => a.new_price - b.new_price);
    } else if (sortOption === "price-desc") {
      arr.sort((a, b) => b.new_price - a.new_price);
    }
    return arr;
  }, [items, sortOption]);

  return (
    <div className="shopcategory">
      <div className="shopcategory-banner">
        {props.banner && <img src={props.banner} alt="" />}
      </div>

      <div className="shopcategory-indexSort">
        <div className="shopcategory-index">
          <p>
            <b>Showing {sortedProducts.length}</b> results
            {category ? ` in "${category}"` : ""}
          </p>
        </div>
        <div className="shopcategory-sort">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="default">Sort</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
          </select>
        </div>
      </div>

      {loading && <div className="mt-2">Loading…</div>}
      {err && !loading && <div className="text-red-600 mt-2">{String(err)}</div>}

      {!loading && !err && (
        <>
          <div className="shopcategory-products">
            {sortedProducts.map((item) => (
              <Item
                key={item.id}
                id={item.id}
                name={item.name}
                image={item.image}
                new_price={item.new_price}
                old_price={item.old_price}
              />
            ))}
            {!sortedProducts.length && (
              <div className="mt-2">No products found.</div>
            )}
          </div>

          <div
            className={`shopcategory-loadmore ${page >= totalPages ? "disabled" : ""}`}
            onClick={page < totalPages && !loadingMore ? onLoadMore : undefined}
            role="button"
            aria-disabled={page >= totalPages}
          >
            {loadingMore
              ? "Loading..."
              : page < totalPages
              ? "Load more"
              : "No more products"}
          </div>
        </>
      )}
    </div>
  );
};

export default ShopCategory;
