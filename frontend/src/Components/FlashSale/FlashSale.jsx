import React, { useState, useEffect } from 'react';
import { Clock, Zap, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from '../figma/ImageWithFallback.tsx';
import { getActiveFlashSalesAPI } from '../../api/flashSaleService';
import './FlashSale.css';

const calculateTimeLeft = (endTimeStr) => {
  if (!endTimeStr) return { hours: 0, minutes: 0, seconds: 0 };
  const difference = new Date(endTimeStr) - new Date();
  if (difference > 0) {
    return {
      hours: Math.floor((difference / (1000 * 60 * 60))),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }
  return { hours: 0, minutes: 0, seconds: 0 };
};

export function FlashSale({ onAddToCart }) {
  const navigate = useNavigate();
  const [activeBatch, setActiveBatch] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const fetchFlashSale = async () => {
      try {
        setLoading(true);
        const res = await getActiveFlashSalesAPI();
        
        if (res && res.success && res.data) {
          const batchIds = Object.keys(res.data);
          if (batchIds.length > 0) {
            const currentBatchData = res.data[batchIds[0]];
            setActiveBatch(currentBatchData.batchInfo);
            setProducts(currentBatchData.products || []);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashSale();
  }, []);

  useEffect(() => {
    if (!activeBatch?.endTime) return;
    
    setTimeLeft(calculateTimeLeft(activeBatch.endTime));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(activeBatch.endTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [activeBatch]);

  if (loading) return null;
  if (!activeBatch || products.length === 0) return null;

  return (
    <div className="flash-sale-section">
      <div className="container">
        <div className="flash-sale-header1">
          <div className="flash-sale-title">
            <Zap className="flash-icon" />
            <h2>{activeBatch.name ? activeBatch.name.toUpperCase() : "FLASH SALE"}</h2>
          </div>
          <div className="flash-sale-timer">
            <Clock className="clock-icon" />
            <span>Kết thúc sau:</span>
            <div className="timer-display">
              <div className="timer-box">
                <span>{String(timeLeft.hours).padStart(2, '0')}</span>
              </div>
              <span className="timer-separator">:</span>
              <div className="timer-box">
                <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
              </div>
              <span className="timer-separator">:</span>
              <div className="timer-box">
                <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flash-sale-products">
          {products.map((item) => {
            const productDetail = item.product || {};
            const flashInfo = productDetail.flashSaleInfo || {};

            const originalPrice = productDetail.price || 0;
            const discount = flashInfo.discountPercentage || 0;
            const salePrice = flashInfo.discountPrice || (originalPrice * (1 - discount / 100));
            
            const stock = flashInfo.stock || item.stock || 1;
            const sold = flashInfo.sold || 0;
            const percentSold = stock > 0 ? Math.min(100, Math.round((sold / stock) * 100)) : 0;

            const imageUrl = productDetail.imageInfo?.url || productDetail.image || "";

            return (
              <div key={item.productId} className="flash-sale-card" onClick={() => navigate(`/product/${productDetail.slug || item.productId}`)}>
                <div className="flash-sale-badge">-{discount}%</div>
                
                <div className="flash-sale-image">
                  <ImageWithFallback 
                    src={imageUrl} 
                    alt={productDetail.name} 
                    className="flash-img"
                  />
                </div>
                
                <div className="flash-sale-info">
                  <h3>{productDetail.name || "Sản phẩm Flash Sale"}</h3>
                  
                  <div className="flash-sale-price">
                    <span className="price-current">
                      {salePrice.toLocaleString('vi-VN')}đ
                    </span>
                    <span className="price-original">
                      {originalPrice.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  
                  <div className="flash-sale-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${percentSold}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">
                        {sold > 0 ? `Đã bán ${sold}` : 'Vừa mở bán'}
                    </span>
                  </div>
                  
                  <button
                    className="flash-sale-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart({
                            _id: productDetail._id || item.productId,
                            name: productDetail.name,
                            price: salePrice,
                            originalPrice: originalPrice,
                            image: imageUrl,
                            ...productDetail
                        });
                    }}
                  >
                    <ShoppingCart size={16} />
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}