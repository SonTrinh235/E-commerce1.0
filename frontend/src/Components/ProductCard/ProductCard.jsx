import { ShoppingCart, Tag, Check, Star } from 'lucide-react'; 
import { ImageWithFallback } from '../figma/ImageWithFallback.tsx';
import { useState, useContext, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../Context/CartContext';
import { getReviewsByProductId } from '../../api/reviewService'; 
import './ProductCard.css';

export function ProductCard({ product }) {
  const [isAdding, setIsAdding] = useState(false);
  const [ratingStats, setRatingStats] = useState({ average: 0, count: 0 });

  const navigate = useNavigate();
  const { cartAddProductToCart } = useContext(CartContext);

  const getProductImage = () => {
    if (product.imageInfo?.url) return product.imageInfo.url;
    if (product.imageUrl) return product.imageUrl;
    if (product.image) return product.image;
    return null;
  };

  useEffect(() => {
    const fetchRating = async () => {
      if (product.averageRating !== undefined) {
          setRatingStats({ 
              average: product.averageRating, 
              count: product.reviewCount || 0 
          });
          return;
      }

      try {
        const id = product._id || product.id;
        const res = await getReviewsByProductId(id);
        const reviews = res.data || [];

        if (reviews.length > 0) {
          const totalScore = reviews.reduce((acc, curr) => acc + (curr.rating || curr.score || 0), 0);
          const avg = totalScore / reviews.length;
          setRatingStats({
            average: avg,
            count: reviews.length
          });
        }
      } catch (error) {
      }
    };

    fetchRating();
  }, [product]);

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
        console.warn("Sản phẩm thiếu slug:", product.name);
    }
  };
  // ---------------------------------------------

  return (
    <div className="product-card">
      {product.discount > 0 && (
        <div className="product-discount">
          <Tag className="discount-icon" />
          <span>-{product.discount}%</span>
        </div>
      )}

      <div className="product-image-wrapper" onClick={handleViewDetail} style={{ cursor: 'pointer' }}>
        <ImageWithFallback
          src={getProductImage()}
          alt={product.name}
          className="product-image"
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
                  fill={ratingStats.average > 0 ? "#FFD700" : "#e5e7eb"} 
                  color={ratingStats.average > 0 ? "#FFD700" : "#e5e7eb"} 
                />
            </div>
            <span className="rating-number">
                {ratingStats.average > 0 ? ratingStats.average.toFixed(1) : '0'}
            </span>
            <span className="review-count">
                ({ratingStats.count} đánh giá)
            </span>
        </div>

        <div className="product-price">
          <span className="price-current">
            {product.price?.toLocaleString('vi-VN')}đ
          </span>
          {product.originalPrice && (
            <span className="price-original">
              {product.originalPrice.toLocaleString('vi-VN')}đ
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