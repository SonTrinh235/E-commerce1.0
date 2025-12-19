import { ShoppingCart, Tag, Check, Star, Zap } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback.tsx';
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../Context/CartContext';
import './ProductCard.css';

const BASE_URL = 'https://www.bachkhoaxanh.xyz';

export function ProductCard({ product }) {
  // console.log(`Card [${product.name}]: Rating=${product.rating}, Count=${product.reviewCount}, FlashSale=${product.flashSaleInfo?.isActive}`);
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();
  const { cartAddProductToCart } = useContext(CartContext);

  const flashInfo = product.flashSaleInfo || {};
  const isFlashSale = flashInfo.isActive === true; 

  let displayPrice = product.price;
  let oldPrice = product.originalPrice;
  let displayDiscount = product.discount;

  if (isFlashSale) {
      displayPrice = flashInfo.discountPrice;
      oldPrice = product.price;
      displayDiscount = flashInfo.discountPercentage;
  }

  const ratingScore = product.rating || 0;
  const reviewCount = product.reviewCount || 0;

  const getProductImage = () => {
    let url = product.imageInfo?.url || product.imageUrl || product.image;
    if (!url || typeof url !== 'string' || url.trim() === "") {
        return "https://placehold.co/400x400?text=No+Image";
    }
    if (url.startsWith('http') || url.startsWith('https')) {
        return url;
    }
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    return `${BASE_URL}/${cleanUrl}`;
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (isAdding) return;
    setIsAdding(true);

    try {
        await cartAddProductToCart(product._id || product.id);
        setTimeout(() => setIsAdding(false), 1000);
    } catch (error) {
        console.error("Lỗi thêm vào giỏ:", error);
        setIsAdding(false);
    }
  };

  const handleViewDetail = () => {
    const categorySlug = product.categoryInfo?.slug || 'san-pham';
    const productSlug = product.slug;

    if (productSlug) {
        navigate(`/product/${categorySlug}/${productSlug}`);
    } else {
        navigate(`/product/${product._id || product.id}`);
    }
  };

  return (
    <div className={`product-card ${isFlashSale ? 'is-flash-sale' : ''}`}>
      {displayDiscount > 0 && (
        <div className="product-discount" style={isFlashSale ? { backgroundColor: '#ef4444' } : {}}>
          {isFlashSale ? <Zap size={12} fill="white" style={{marginRight: 2}}/> : <Tag className="discount-icon" />}
          <span>-{displayDiscount}%</span>
        </div>
      )}

      <div className="product-image-wrapper" onClick={handleViewDetail} style={{ cursor: 'pointer' }}>
        <ImageWithFallback
          src={getProductImage()}
          alt={product.name}
          className="product-image"
          fallbackSrc="https://placehold.co/400x400?text=Error"
        />
      </div>

      <div className="product-info">
        <h3 className="product-name" onClick={handleViewDetail} style={{ cursor: 'pointer' }}>
          {product.name}
        </h3>

        <div className="product-rating-summary">
            <div className="stars">
                <Star
                  size={14}
                  fill={ratingScore > 0 ? "#FFD700" : "none"}
                  color={ratingScore > 0 ? "#FFD700" : "#e5e7eb"}
                />
            </div>
            <span className="rating-number">
                {ratingScore > 0 ? ratingScore.toFixed(1) : '0'}
            </span>
            <span className="review-count">
                ({reviewCount} đánh giá)
            </span>
        </div>

        <div className="product-price">
          <span className="price-current">
            {displayPrice?.toLocaleString('vi-VN')}đ
          </span>
          {oldPrice && oldPrice > displayPrice && (
            <span className="price-original">
              {oldPrice.toLocaleString('vi-VN')}đ
            </span>
          )}
        </div>

        <div className="product-buttons">
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`add-to-cart-btn ${isAdding ? 'adding' : ''}`}
            style={isAdding ? { backgroundColor: '#4caf50', borderColor: '#4caf50', color: 'white' } : {}}
          >
            {isAdding ? <Check className="cart-icon" /> : <ShoppingCart className="cart-icon" />}
            <span>{isAdding ? 'Đã thêm' : 'Thêm vào giỏ'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}