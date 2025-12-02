import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Banner.css';

const banners = [
  {
    id: 1,
    title: 'Trái cây tươi ngon',
    subtitle: 'Giảm giá đến 30%',
    colorClass: 'banner-orange',
  },
  {
    id: 2,
    title: 'Rau củ hữu cơ',
    subtitle: 'An toàn cho gia đình',
    colorClass: 'banner-green',
  },
  {
    id: 3,
    title: 'Thịt tươi hôm nay',
    subtitle: 'Miễn phí vận chuyển',
    colorClass: 'banner-pink',
  },
];

export function Banner() {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div className="banner-container">
      {/* Đổi container thành banner-layout để chỉnh full size */}
      <div className="banner-layout">
        <div className="banner-wrapper">
          <div className={`banner-content ${banners[currentBanner].colorClass}`}>
            <div className="banner-text">
              <h2>{banners[currentBanner].title}</h2>
              <p>{banners[currentBanner].subtitle}</p>
              <button className="banner-cta">Mua ngay</button>
            </div>
            <div className="banner-decoration">
              <div className="decoration-circle"></div>
            </div>
          </div>

          <button onClick={prevBanner} className="banner-nav banner-nav-left">
            <ChevronLeft className="nav-icon" />
          </button>
          <button onClick={nextBanner} className="banner-nav banner-nav-right">
            <ChevronRight className="nav-icon" />
          </button>

          <div className="banner-indicators">
            {banners.map((_, index) => (
              <button
                key={banners[index].id} 
                onClick={() => setCurrentBanner(index)}
                className={`banner-indicator ${index === currentBanner ? 'indicator-active' : ''}`}
                aria-label={`Chuyển đến banner ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}