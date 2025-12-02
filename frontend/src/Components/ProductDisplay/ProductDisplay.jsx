import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Minus, ShoppingCart, Star, Check } from 'lucide-react';
import { ImageWithFallback } from '../../Components/figma/ImageWithFallback.tsx';
import { getProductById } from '../../api/productService.js';
import { CartContext } from '../../Context/CartContext'; 
import ProductReviews from '../../Components/Review/ProductReviews';
import './ProductDisplay.css';

const isLikelyObjectId = (s) => {
  if (!s || typeof s !== 'string') return false;
  const hex24 = /^[0-9a-fA-F]{24}$/;
  return hex24.test(s);
};

const extractIdFromPath = (pathname) => {
  try {
    const path = pathname.split('?')[0].split('#')[0];
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return null;
    for (let i = parts.length - 1; i >= 0; i--) {
      if (isLikelyObjectId(parts[i])) return parts[i];
    }
    return null;
  } catch (e) {
    return null;
  }
};

const ProductDetail = () => {
  const params = useParams();
  const paramId = params?.id || params?.productId;
  const navigate = useNavigate();
  
  // 1. Lấy Context
  const { cartAddProductToCart, setIsCartOpen } = useContext(CartContext);

  const [idFromUrl] = useState(() => {
    if (isLikelyObjectId(paramId)) return paramId;
    const extracted = extractIdFromPath(window.location.pathname);
    return extracted || null;
  });

  const idToUse = isLikelyObjectId(paramId) ? paramId : idFromUrl;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  
  // 2. State cho hiệu ứng nút thêm giỏ hàng
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!idToUse) {
      setError("ID sản phẩm không hợp lệ.");
      setLoading(false);
      return;
    }

    let alive = true;

    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getProductById(idToUse);
        const data = res?.data ?? null;

        if (!alive) return;

        if (!data || !data._id) {
          setError("Không tìm thấy sản phẩm.");
          setProduct(null);
          return;
        }

        setProduct({
          ...data,
          price: data.price ?? 0,
          stock: data.stock ?? 0,
          rating: data.rating ?? 0,
          description: data.description ?? "",
          name: data.name ?? "Sản phẩm",
          imageInfo: data.imageInfo ?? { url: "" },
          ratings: Array.isArray(data.ratings) ? data.ratings : []
        });
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setError("Không tải được dữ liệu sản phẩm.");
        setProduct(null);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchProduct();
    return () => { alive = false; }
  }, [idToUse]);

  // 3. Hàm xử lý thêm vào giỏ với hiệu ứng
  const handleAddToCart = async () => {
    if (!product) return;
    
    setIsAdding(true); // Bắt đầu hiệu ứng

    try {
        // Loop để thêm đúng số lượng
        for (let i = 0; i < quantity; i++) {
            await cartAddProductToCart(product._id);
        }
        
        // Mở giỏ hàng (Check null để tránh lỗi nếu chưa update Context)
        if (setIsCartOpen) {
            setIsCartOpen(true);
        }
        
        // Tắt hiệu ứng sau 1 giây
        setTimeout(() => setIsAdding(false), 1000);

    } catch (err) {
        console.error("Lỗi thêm vào giỏ:", err);
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
        <button onClick={() => navigate(-1)} className="back-button">
          <ArrowLeft className="icon" /> Quay lại
        </button>
      </div>
    </div>
  );

  return (
    <div className="product-detail-page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-button">
          <ArrowLeft className="icon" /> Quay lại trang trước
        </button>

        <div className="product-detail-content">
          <div className="product-detail-left">
            <div className="product-main-image">
              <ImageWithFallback src={images[selectedImage]} alt={product.name} className="main-image" />
              {images.length > 1 && <>
                <button className="image-nav image-nav-left" onClick={prevImage}>‹</button>
                <button className="image-nav image-nav-right" onClick={nextImage}>›</button>
              </>}
            </div>
          </div>

          <div className="product-detail-right">
            <h1 className="product-detail-name">{product.name}</h1>
            <div className="product-rating">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={i < Math.round(product.rating) ? 'star-filled' : 'star'} />
              ))}
              <span className="rating-text">({product.ratings.length} đánh giá)</span>
            </div>

            <div className="product-price-section">
              <div className="price-main">
                <span className="price-current">{product.price.toLocaleString('vi-VN')}đ</span>
              </div>
              <div>Kho: {product.stock} sản phẩm</div>
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
              
              {/* Nút thêm giỏ hàng với hiệu ứng loading */}
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

        <ProductReviews productId={product._id} />

      </div>
    </div>
  );
};

export default ProductDetail;