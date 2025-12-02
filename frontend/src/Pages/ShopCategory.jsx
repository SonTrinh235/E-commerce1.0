import React, { useEffect, useMemo, useState } from "react";
import "./CSS/ShopCategory.css";
import Item from "../Components/Item/Item";
import { getAllProducts } from "../api/productService"; 

function matchesCategory(prodCategory, wanted) {
  if (!wanted) return true;
  const w = String(wanted).trim().toLowerCase();
  if (!prodCategory) return false;

  if (Array.isArray(prodCategory)) {
    return prodCategory.some((c) => String(c).trim().toLowerCase() === w);
  }
  const s = String(prodCategory).trim().toLowerCase();
  return s === w || s.includes(w);
}

function toItemProps(p, idx) {
  return {
    id: p._id || p.id || `prod-${idx}`,
    name: p.name ?? "Sản phẩm",
    image: p.imageInfo?.url || p.image || null,
    new_price: p.price ?? p.new_price ?? 0,
    old_price: p.old_price ?? null,
  };
}

const ShopCategory = (props) => {
  // SỬA 1: Nhận thêm onAddToCart từ props
  const { category, banner, onAddToCart } = props;

  const [list, setList] = useState([]);
  const [page, setPage] = useState(1); 
  const [limit] = useState(20);  
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [sortOption, setSortOption] = useState("default");


  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");

        const res = await getAllProducts(1, limit);
        const arr = Array.isArray(res?.data?.list) ? res.data.list : [];
        const pages = Number(res?.data?.totalPages || 1);

        if (!alive) return;

        setList(arr);
        setPage(1);
        setTotalPages(pages);
      } catch (e) {
        if (!alive) return;
        setError("Không lấy được dữ liệu từ backend.");
        setList([]);
        setTotalPages(1);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };

  }, [category, limit]);

  const handleLoadMore = async () => {
    if (loadingMore) return;
    if (page >= totalPages) return;

    let nextPage = page + 1;
    try {
      setLoadingMore(true);
      const res = await getAllProducts(nextPage, limit);
      const arr = Array.isArray(res?.data?.list) ? res.data.list : [];
      const pages = Number(res?.data?.totalPages || totalPages);

      setList((prev) => {
        const byId = new Map();
        [...prev, ...arr].forEach((p) => {
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
      setLoadingMore(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return (list || []).filter((p) => matchesCategory(p?.category, category));
  }, [list, category]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    if (sortOption === "price-asc") {
      sorted.sort(
        (a, b) => (a.price ?? a.new_price ?? 0) - (b.price ?? b.new_price ?? 0)
      );
    } else if (sortOption === "price-desc") {
      sorted.sort(
        (a, b) => (b.price ?? b.new_price ?? 0) - (a.price ?? a.new_price ?? 0)
      );
    }
    return sorted;
  }, [filteredProducts, sortOption]);

  const hasMore = page < totalPages;

  return (
    <div className="shopcategory">
      <div className="shopcategory-banner">
        <img src={banner} alt="" />
      </div>

      <div className="shopcategory-indexSort">
        <div className="shopcategory-index">
          <p>
            <b>Showing {sortedProducts.length}</b> results
            {loading && " (đang tải...)"}
          </p>
        </div>
        <div className="shopcategory-sort">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="default">Sort</option>
            <option value="price-asc">Increase</option>
            <option value="price-desc">Decrease</option>
          </select>
        </div>
      </div>

      {error && <div className="error" style={{ marginBottom: 8 }}>{error}</div>}

      <div className="shopcategory-products">
        {loading && list.length === 0 ? (
          <div className="loading">Đang tải sản phẩm…</div>
        ) : sortedProducts.length === 0 ? (
          <div className="empty">Không có sản phẩm trong danh mục này.</div>
        ) : (
          sortedProducts.map((p, i) => {
            const reactKey = p._id || p.id || `prod-${i}`;
            // SỬA 2: Truyền onAddToCart xuống cho Item
            return (
              <Item 
                key={reactKey} 
                {...toItemProps(p, i)} 
                onAddToCart={onAddToCart} 
              />
            );
          })
        )}
      </div>

      {/* Load more */}
      <div className="shopcategory-loadmore">
        {hasMore ? (
          <button onClick={handleLoadMore} disabled={loadingMore}>
            {loadingMore ? "Đang tải..." : "Load more"}
          </button>
        ) : (
          <span>Hết sản phẩm rồi bạn!</span>
        )}
      </div>
    </div>
  );
};

export default ShopCategory;