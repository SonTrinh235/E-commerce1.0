import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Minus, ShoppingCart, Star, Check } from 'lucide-react';
import { ImageWithFallback } from '../../Components/figma/ImageWithFallback.tsx';
import { getProductById, getProductBySlug } from '../../api/productService.js';
import { CartContext } from '../../Context/CartContext';
import ProductReviews from '../../Components/Review/ProductReviews';
import './ProductDisplay.css';

const ProductDetail = () => {
  const { productId, categorySlug, slug } = useParams();
  const navigate = useNavigate();
  const { cartAddProductToCart, setIsCartOpen } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    let alive = true;

    const fetchProduct = async () => {
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
  }, [productId, categorySlug, slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAdding(true);

    try {
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