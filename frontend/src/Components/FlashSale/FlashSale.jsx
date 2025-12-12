import { Clock, Zap, ShoppingCart } from 'lucide-react'; // Thêm ShoppingCart
import { useState, useEffect } from 'react';
import './FlashSale.css';

const flashSaleProducts = [
  {
    id: 'fs1',
    name: 'Táo Envy Mỹ',
    price: 35000,
    originalPrice: 55000,
    image: 'https://images.unsplash.com/photo-1556011284-54aa6466d402?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGZydWl0cyUyMG1hcmtldHxlbnwxfHx8fDE3NjQwMzgyOTV8MA&ixlib=rb-4.1.0&q=80&w=400',
    unit: 'kg',
    discount: 36,
    sold: 45,
    stock: 100,
  },
  {
    id: 'fs2',
    name: 'Thịt heo nạc vai',
    price: 95000,
    originalPrice: 130000,
    image: 'https://images.unsplash.com/photo-1649974139791-b981d106278b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3JrJTIwbWVhdCUyMGJ1dGNoZXJ8ZW58MXx8fHwxNzY1NDI4MTk1fDA&ixlib=rb-4.1.0&q=80&w=400',
    unit: 'kg',
    discount: 27,
    sold: 72,
    stock: 100,
  },
  {
    id: 'fs3',
    name: 'Sữa tươi TH true MILK',
    price: 38000,
    originalPrice: 48000,
    image: 'https://images.unsplash.com/photo-1621458472871-d8b6a409aba1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWxrJTIwZGFpcnklMjBwcm9kdWN0c3xlbnwxfHx8fDE3NjU0MjgxOTl8MA&ixlib=rb-4.1.0&q=80&w=400',
    unit: 'hộp',
    discount: 21,
    sold: 88,
    stock: 100,
  },
  {
    id: 'fs4',
    name: 'Tôm sú tươi',
    price: 280000,
    originalPrice: 350000,
    image: 'https://images.unsplash.com/photo-1609559376851-9a995930702a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWFmb29kJTIwZnJlc2glMjBmaXNofGVufDF8fHx8MTc2NTQyODE5N3ww&ixlib=rb-4.1.0&q=80&w=400',
    unit: 'kg',
    discount: 20,
    sold: 56,
    stock: 100,
  },
  {
    id: 'fs5',
    name: 'Gạo Jasmine hữu cơ',
    price: 99000,
    originalPrice: 135000,
    image: 'https://images.unsplash.com/photo-1743674452796-ad8d0cf38005?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaWNlJTIwZ3JhaW5zJTIwYm93bHxlbnwxfHx8fDE3NjUzODU4MTJ8MA&ixlib=rb-4.1.0&q=80&w=400',
    unit: '5kg',
    discount: 27,
    sold: 63,
    stock: 100,
  },
];

export function FlashSale({ onAddToCart }) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 45,
    seconds: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flash-sale-section">
      <div className="container">
        <div className="flash-sale-header">
          <div className="flash-sale-title">
            <Zap className="flash-icon" />
            <h2>FLASH SALE</h2>
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
          {flashSaleProducts.map((product) => (
            <div key={product.id} className="flash-sale-card">
              <div className="flash-sale-badge">-{product.discount}%</div>
              <div className="flash-sale-image">
                <img src={product.image} alt={product.name} />
              </div>
              <div className="flash-sale-info">
                <h3>{product.name}</h3>
                <div className="flash-sale-price">
                  <span className="price-current">
                    {product.price.toLocaleString('vi-VN')}đ
                  </span>
                  <span className="price-original">
                    {product.originalPrice.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div className="flash-sale-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${product.sold}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">Đã bán {product.sold}/{product.stock}</span>
                </div>
                
                <button
                  className="flash-sale-btn"
                  onClick={() => onAddToCart(product)}
                >
                  <ShoppingCart size={16} />
                  Thêm vào giỏ
                </button>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}