import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import "./CSS/SearchResults.css";
import Item from "../Components/Item/Item";
import { getAllProducts } from "../api/productService";

const normalize = (v) => (v == null ? "" : String(v).toLowerCase());

function matches(product, q) {
  if (!q) return false;
  const name = normalize(product?.name);
  const cat = product?.category;
  const catText = Array.isArray(cat) ? cat.map(normalize).join(" ") : normalize(cat);
  return name.includes(q) || catText.includes(q);
}

const SearchResults = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("query")?.trim().toLowerCase() || "";

  const [loading, setLoading] = useState(false);
  const [pool, setPool] = useState([]);
  const [error, setError] = useState("");
  const [sortOption, setSortOption] = useState("default");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limitPerPage = 40;
  const hasMore = page < totalPages;

  // Fetch trang đầu mỗi khi query đổi
  useEffect(() => {
    let alive = true;
    setPage(1);

    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getAllProducts(1, limitPerPage);
        const list = Array.isArray(res?.data?.list) ? res.data.list : [];
        const pages = Number(res?.data?.totalPages || 1);
        if (!alive) return;

        setPool(list);
        setTotalPages(pages);
      } catch (e) {
        if (!alive) return;
        setError("Không lấy được dữ liệu từ backend.");
        setPool([]);
        setTotalPages(1);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [query]);

  // Load thêm trang tiếp theo cho pool (lọc client side)
  const handleLoadMore = async () => {
    if (!hasMore) return;
    try {
      setLoading(true);
      const nextPage = page + 1;
      const res = await getAllProducts(nextPage, limitPerPage);
      const list = Array.isArray(res?.data?.list) ? res.data.list : [];
      const pages = Number(res?.data?.totalPages || totalPages);

      setPool((prev) => {
        const byId = new Map();
        [...prev, ...list].forEach((p) => {
          const key = p?._id || p?.id;
          if (key) byId.set(key, p);
        });
        return Array.from(byId.values());
      });
      setPage(nextPage);
      setTotalPages(pages);
    } catch (e) {
      setError("Tải thêm sản phẩm thất bại.");
    } finally {
      setLoading(false);
    }
  };

  // Lọc theo từ khoá
  const filtered = useMemo(() => {
    if (!query) return [];
    return pool.filter((p) => matches(p, query));
  }, [pool, query]);

  // Sắp xếp theo giá từ backend
  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sortOption === "price-asc") {
      arr.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    } else if (sortOption === "price-desc") {
      arr.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    }
    return arr;
  }, [filtered, sortOption]);

  const toItemProps = (p, idx) => ({
    id: p._id || p.id || `search-${idx}`,
    name: p.name ?? "Sản phẩm",
    image: p.imageInfo?.url || p.image || null, // tránh src=""
    new_price: p.price ?? p.new_price ?? 0,
    old_price: p.old_price ?? null,
  });

  return (
    <div className="searchresults">
      {/* Banner */}
      <div className="searchresults-banner">
        <h2>
          {query ? `Result for: "${query}"` : "Vui lòng nhập từ khóa tìm kiếm"}
        </h2>
      </div>

      {/* Sort & Count */}
      {query && sorted.length > 0 && (
        <div className="searchresults-indexSort">
          <p>
            <span>{sorted.length}</span> Item
          </p>
          <select
            className="searchresults-sort"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="default">Sorting by</option>
            <option value="price-asc">Increase</option>
            <option value="price-desc">Decrease</option>
          </select>
        </div>
      )}

      {/* Products */}
      {query ? (
        loading && pool.length === 0 ? (
          <div className="searchresults-products loading">Đang tải…</div>
        ) : sorted.length > 0 ? (
          <div className="searchresults-products">
            {sorted.map((p, i) => (
              <Item key={p._id || p.id || i} {...toItemProps(p, i)} />
            ))}
          </div>
        ) : (
          <p style={{ margin: "20px 170px" }}>Not Found :/ "{query}".</p>
        )
      ) : null}

      {/* Load more */}
      {query && sorted.length > 0 && hasMore && (
        <div className="searchresults-loadmore">
          <button onClick={handleLoadMore} disabled={loading}>
            {loading ? "Đang tải..." : "Xem thêm"}
          </button>
        </div>
      )}

      {error && <div className="searchresults-error">{error}</div>}
    </div>
  );
};

export default SearchResults;
