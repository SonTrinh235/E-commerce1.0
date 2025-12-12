import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, SlidersHorizontal, Loader2 } from 'lucide-react';
import { ProductCard } from '../Components/ProductCard/ProductCard';
import { getProductsByCategoryAPI, getAllCategoriesAPI } from '../api/productService';
import './CSS/ShopCategory.css';

export default function ShopCategory({ onAddToCart }) {
  const { categorySlug } = useParams();
  const navigate = useNavigate();

  const formatNameFromSlug = (slug) => {
    if (!slug) return "Danh mục";
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState(formatNameFromSlug(categorySlug));
  
  const [sortBy, setSortBy] = useState('default');
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setCategoryName(formatNameFromSlug(categorySlug));
    setProducts([]);

    const fetchCategoryName = async () => {
      try {
        const res = await getAllCategoriesAPI();
        if (res && res.success && res.data) {
          const foundCategory = res.data.find(cat => cat.slug === categorySlug);
          if (foundCategory) {
            setCategoryName(foundCategory.name);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchCategoryName();
  }, [categorySlug]);

  useEffect(() => {
    let alive = true;
    const fetchFirstPage = async () => {
      if (!categorySlug) return;
      try {
        setLoading(true);
        setPage(1);
        
        const res = await getProductsByCategoryAPI(categorySlug, 1, limit);
        
        if (!alive) return;

        if (res && res.success && res.data) {
          const fetchedList = res.data.list || [];
          setProducts(fetchedList);
          setTotalPages(res.data.totalPages || 1);

          if (fetchedList.length > 0 && fetchedList[0].categoryInfo) {
             setCategoryName(fetchedList[0].categoryInfo.name);
          }
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchFirstPage();
    return () => { alive = false; };
  }, [categorySlug, limit]);

  const handleLoadMore = async () => {
    if (loadingMore || page >= totalPages) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const res = await getProductsByCategoryAPI(categorySlug, nextPage, limit);
      if (res && res.success && res.data) {
        setProducts(prev => {
          const newItems = res.data.list || [];
          const combined = [...prev, ...newItems];
          const unique = combined.filter((item, index, self) => 
            index === self.findIndex((t) => t._id === item._id)
          );
          return unique;
        });
        setPage(nextPage);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMore(false);
    }
  };

  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    if (sortBy === 'price-low') {
      sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price-high') {
      sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
    }
    return sorted;
  }, [products, sortBy]);

  return (
    <div className="shop-category">
      <div className="breadcrumb-section">
        <div className="container">
          <div className="breadcrumb">
            <span onClick={() => navigate('/')} className="breadcrumb-link">Trang chủ</span>
            <ChevronRight className="breadcrumb-icon" />
            <span className="breadcrumb-current">{categoryName}</span>
          </div>
        </div>
      </div>

      <div className="category-header">
        <div className="container">
          <h1 className="category-title">{categoryName}</h1>
          <p className="category-count">
            {loading ? '...' : `${sortedProducts.length} sản phẩm`}
          </p>
        </div>
      </div>

      <div className="filters-section">
        <div className="container">
          <div className="filters-toolbar">
            <div className="filters-left">
              <button className="filter-btn">
                <SlidersHorizontal className="icon" />
                <span>Bộ lọc</span>
              </button>
            </div>

            <div className="filters-right">
              <div className="sort-dropdown">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="default">Mặc định</option>
                  <option value="price-low">Giá thấp đến cao</option>
                  <option value="price-high">Giá cao đến thấp</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="products-section">
        <div className="container">
          {loading && products.length === 0 ? (
             <div className="no-products">
               <Loader2 className="animate-spin" style={{margin: '0 auto'}} />
               <p>Đang tải sản phẩm...</p>
             </div>
          ) : sortedProducts.length > 0 ? (
            <>
              <div className="products-grid">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    id={product._id}
                    product={product}
                    name={product.name}
                    image={product.imageInfo?.url || product.imageUrl || ""}
                    price={product.price}
                    old_price={product.price * 1.1} 
                    onAddToCart={onAddToCart}
                  />
                ))}
              </div>

              {page < totalPages && (
                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                  <button 
                    onClick={handleLoadMore} 
                    disabled={loadingMore}
                    className="filter-btn" 
                    style={{ margin: '0 auto', background: '#1488DB', color: 'white', border: 'none' }}
                  >
                    {loadingMore ? <Loader2 className="animate-spin icon" /> : "Xem thêm sản phẩm"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-products">
              <p>Chưa có sản phẩm nào trong danh mục "{categoryName}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}