import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Minus, ShoppingCart, Star, Check, Clock, Zap } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback.tsx';
import { getProductById, getProductBySlug } from '../../api/productService.js';
import { getReviewsByProductId } from '../../api/reviewService.js';
import { CartContext } from '../../Context/CartContext';
import ProductReviews from '../Review/ProductReviews';
import './ProductDisplay.css';

// --- Component Đếm ngược giờ Flash Sale ---
const FlashSaleTimer = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTime = () => {
      if (!endDate) return "Chưa có ngày kết thúc";
      
      const end = new Date(endDate);
      const now = new Date();

      if (isNaN(end.getTime())) {
          return "Lỗi hiển thị";
      }

      const diff = end - now;

      if (diff <= 0) return "Đã kết thúc";
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      const f = (n) => n.toString().padStart(2, '0');

      if (days > 0) {
          return `${days} ngày ${f(hours)}:${f(minutes)}:${f(seconds)}`;
      }
      return `${f(hours)}:${f(minutes)}:${f(seconds)}`;
    };

    setTimeLeft(calculateTime());

    const timer = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="fs-timer">
      <Clock size={14} /> Kết thúc sau: <span>{timeLeft}</span>
    </div>
  );
};

const ProductDisplay = () => {
  const { productId, categorySlug, slug } = useParams();
  const navigate = useNavigate();
  const { cartAddProductToCart, setIsCartOpen } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  
  // State lưu trữ số sao trung bình để hiển thị ở trên cùng
  const [reviewStats, setReviewStats] = useState({ average: 0, count: 0 });

  // 1. Hàm tính toán lại số sao (được gọi khi load trang HOẶC khi submit review thành công)
  const refreshReviewStats = useCallback(async () => {
    if (!product || !product._id) return;
    try {
        const reviewRes = await getReviewsByProductId(product._id);
        if (reviewRes.success) {
            const reviews = reviewRes.data || [];
            const count = reviews.length;
            let average = 0;
            
            if (count > 0) {
                const total = reviews.reduce((acc, curr) => acc + (curr.rating || curr.score || 0), 0);
                average = total / count;
            }
            
            setReviewStats({
                average: average,
                count: count
            });
        }
    } catch (error) {
        console.warn("Lỗi cập nhật đánh giá:", error);
    }
  }, [product]);

  // 2. Effect lấy dữ liệu sản phẩm
  useEffect(() => {
    let alive = true;

    const fetchProductData = async () => {
      setLoading(true);
      setError("");
      setProduct(null);

      try {
        let res = null;

        if (categorySlug && slug) {
          res = await getProductBySlug(categorySlug, slug);
        } else if (productId) {
          res = await getProductById(productId);
        } else {
          throw new Error("URL thiếu tham số sản phẩm");
        }

        if (!alive) return;

        const data = res?.data ?? null;

        if (!data || !data._id) {
          setError("Không tìm thấy sản phẩm.");
          setProduct(null);
          return;
        }

        // Set dữ liệu sản phẩm
        setProduct({
          ...data,
          price: data.price ?? 0,
          originalPrice: data.originalPrice || null,
          flashSaleInfo: data.flashSaleInfo || {}, 
          stock: data.stock ?? 0,
          description: data.description ?? "",
          name: data.name ?? "Sản phẩm",
          imageInfo: data.imageInfo ?? { url: "" },
        });

        // Set review stats ban đầu nếu có sẵn trong product (tạm thời)
        if (data.averageRating) {
             setReviewStats({
                 average: data.averageRating,
                 count: data.reviewCount || 0
             });
        }

      } catch (e) {
        console.error(e);
        if (!alive) return;
        setError("Không tải được dữ liệu sản phẩm.");
        setProduct(null);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchProductData();
    return () => { alive = false; }
  }, [productId, categorySlug, slug]);

  // 3. Effect gọi refreshReviewStats khi product đã sẵn sàng (để lấy số liệu chính xác nhất từ DB)
  useEffect(() => {
      if (product?._id) {
          refreshReviewStats();
      }
  }, [product?._id, refreshReviewStats]);

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAdding(true);

    try {
      // Loop add cart (hoặc thay bằng API update quantity nếu backend hỗ trợ)
      for (let i = 0; i < quantity; i++) {
        await cartAddProductToCart(product._id);
      }

      if (setIsCartOpen) {
        setIsCartOpen(true);
      }
      setTimeout(() => setIsAdding(false), 1000);

    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi thêm vào giỏ hàng.");
      setIsAdding(false);
    }
  };

  const increaseQuantity = () => setQuantity(q => q + 1);
  const decreaseQuantity = () => setQuantity(q => Math.max(1, q - 1));

  const images = product ? [product.imageInfo?.url || ''] : [''];
  const nextImage = () => setSelectedImage(prev => (prev + 1) % images.length);
  const prevImage = () => setSelectedImage(prev => (prev - 1 + images.length) % images.length);

  if (loading) return <div className="product-detail-page"><h2>Đang tải sản phẩm…</h2></div>;
  
  if (error || !product) return (
    <div className="product-detail-page">
      <div className="not-found">
        <h2>{error || "Không tìm thấy sản phẩm."}</h2>
        <button onClick={() => navigate('/')} className="back-button">
          <ArrowLeft className="icon" /> Về trang chủ
        </button>
      </div>
    </div>
  );

  // --- LOGIC FLASH SALE & DISPLAY PRICE ---
  const flashInfo = product.flashSaleInfo || {};
  const isFlashSale = flashInfo.isActive;
  // Lấy endTime từ API (ưu tiên), fallback sang endDate
  const endDate = flashInfo.endTime || flashInfo.endDate;

  const displayPrice = isFlashSale ? flashInfo.discountPrice : product.price;
  const originalPrice = isFlashSale ? product.price : product.originalPrice;

  return (
    <div className="product-detail-page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-button">
          <ArrowLeft className="icon" /> Quay lại trang trước
        </button>

        <div className="product-detail-content">
          {/* CỘT TRÁI: ẢNH */}
          <div className="product-detail-left">
            <div className="product-main-image">
              <ImageWithFallback src={images[selectedImage]} alt={product.name} className="main-image" />
              {isFlashSale && <div className="detail-flash-badge">FLASH SALE</div>}
              {images.length > 1 && <>
                <button className="image-nav image-nav-left" onClick={prevImage}>‹</button>
                <button className="image-nav image-nav-right" onClick={nextImage}>›</button>
              </>}
            </div>
          </div>

          {/* CỘT PHẢI: THÔNG TIN */}
          <div className="product-detail-right">
            <h1 className="product-detail-name">{product.name}</h1>
            
            {/* RATING SECTION */}
            <div className="product-rating">
              {[...Array(5)].map((_, i) => (
                <Star 
                    key={i} 
                    className={i < Math.round(reviewStats.average) ? 'star-filled' : 'star'} 
                    size={18}
                />
              ))}
              <span className="rating-text">
                  ({reviewStats.average.toFixed(1)} / 5 - {reviewStats.count} đánh giá)
              </span>
            </div>

            {/* PRICE SECTION */}
            <div className="product-price-section">
              {isFlashSale && (
                <div className="fs-badge-row">
                    <Zap size={16} fill="white"/> ĐANG TRONG CHƯƠNG TRÌNH FLASH SALE
                </div>
              )}
              
              <div className="price-row">
                 <span className={`price-current ${isFlashSale ? 'price-flash' : ''}`}>
                    {displayPrice.toLocaleString('vi-VN')}đ
                 </span>
                 {originalPrice && (
                    <span className="price-old">
                        {originalPrice.toLocaleString('vi-VN')}đ
                    </span>
                 )}
              </div>

              {isFlashSale && <FlashSaleTimer endDate={endDate} />}
              
              <div className="stock-info">Kho: {product.stock} sản phẩm</div>
            </div>

            <div className="product-description">
              <h3>Mô tả sản phẩm</h3>
              <p>{product.description}</p>
            </div>

            <div className="product-actions">
              <div className="quantity-selector">
                <button className="quantity-btn" onClick={decreaseQuantity}><Minus className="quantity-icon" /></button>
                <span className="quantity-value">{quantity}</span>
                <button className="quantity-btn quantity-btn-plus" onClick={increaseQuantity}><Plus className="quantity-icon" /></button>
              </div>
              
              <button 
                className={`add-to-cart-large ${isAdding ? 'adding' : ''}`} 
                onClick={handleAddToCart}
                disabled={isAdding}
                style={isAdding ? { backgroundColor: '#4caf50', borderColor: '#4caf50' } : {}}
              >
                {isAdding ? <Check className="cart-icon" /> : <ShoppingCart className="cart-icon" />}
                {isAdding ? 'Đã thêm vào giỏ!' : 'Thêm vào giỏ hàng'}
              </button>
            </div>
          </div>
        </div>

        <ProductReviews 
            productId={product?._id} 
            onReviewSubmit={refreshReviewStats}
        />

      </div>
    </div>
  );
};

export default ProductDisplay;