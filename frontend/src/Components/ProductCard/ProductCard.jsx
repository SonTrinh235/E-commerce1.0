import { ShoppingCart, Tag, Check } from 'lucide-react'; 
import { ImageWithFallback } from '../figma/ImageWithFallback.tsx';
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../Context/CartContext';
import './ProductCard.css';

export function ProductCard({ product }) {
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();

  const { cartAddProductToCart } = useContext(CartContext);

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
    navigate(`/product/${product._id || product.id}`);
  };

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
          src={product.imageInfo?.url || null}
          alt={product.name}
          className="product-image"
        />
      </div>

      <div className="product-info">
        <h3 className="product-name" onClick={handleViewDetail} style={{ cursor: 'pointer' }}>
          {product.name}
        </h3>

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