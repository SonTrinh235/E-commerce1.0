import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Banner.css';

const mainBanners = [
  {
    id: 1,
    title: 'Trái cây tươi ngon',
    subtitle: 'Giảm giá đến 30%',
    image: 'https://images.unsplash.com/photo-1719528809959-082f7e5c2f8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncm9jZXJ5JTIwc3RvcmUlMjBwcm9tb3Rpb24lMjBiYW5uZXJ8ZW58MXx8fHwxNzY1NDI4NjkyfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 2,
    title: 'Rau củ hữu cơ',
    subtitle: 'An toàn cho gia đình',
    image: 'https://images.unsplash.com/photo-1554223745-ad862492c213?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmdhbmljJTIwdmVnZXRhYmxlcyUyMG1hcmtldHxlbnwxfHx8fDE3NjU0MjEwNDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 3,
    title: 'Thịt tươi hôm nay',
    subtitle: 'Miễn phí vận chuyển',
    image: 'https://images.unsplash.com/photo-1717224240119-42f94d383104?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXBlcm1hcmtldCUyMGZyZXNoJTIwcHJvZHVjZSUyMHNhbGV8ZW58MXx8fHwxNzY1NDI4NjkyfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

const sideBanners = [
  {
    id: 1,
    title: 'Giảm 20%',
    subtitle: 'Sản phẩm organic',
    image: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmdhbmljJTIwaGVhbHRoeSUyMGZvb2R8ZW58MXx8fHwxNzY1NDI4MjAyfDA&ixlib=rb-4.1.0&q=80&w=600',
  },
  {
    id: 2,
    title: 'Freeship 0đ',
    subtitle: 'Đơn từ 99k',
    image: 'https://images.unsplash.com/photo-1762424361024-66dc512c3872?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwZGVsaXZlcnklMjBzZXJ2aWNlJTIwYmFubmVyfGVufDF8fHx8MTc2NTQyODY5M3ww&ixlib=rb-4.1.0&q=80&w=600',
  },
];

export function Banner() {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % mainBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % mainBanners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + mainBanners.length) % mainBanners.length);
  };

  return (
    <div className="banner-container">
      <div className="container">
        <div className="banner-layout">
          {/* Main banner - 2/3 width */}
          <div className="banner-main">
            <div className="banner-content banner-with-image">
              <img 
                src={mainBanners[currentBanner].image} 
                alt={mainBanners[currentBanner].title}
                className="banner-main-image"
              />
              <div className="banner-text-overlay">
                <h2>{mainBanners[currentBanner].title}</h2>
                <p>{mainBanners[currentBanner].subtitle}</p>
                <button className="banner-cta">Mua ngay</button>
              </div>
            </div>

            <button onClick={prevBanner} className="banner-nav banner-nav-left">
              <ChevronLeft className="nav-icon" />
            </button>
            <button onClick={nextBanner} className="banner-nav banner-nav-right">
              <ChevronRight className="nav-icon" />
            </button>

            <div className="banner-indicators">
              {mainBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBanner(index)}
                  className={`banner-indicator ${index === currentBanner ? 'indicator-active' : ''}`}
                />
              ))}
            </div>
          </div>

          {/* Side banners - 1/3 width */}
          <div className="banner-side">
            {sideBanners.map((banner) => (
              <div key={banner.id} className="banner-side-item">
                <div className="banner-side-content">
                  <img src={banner.image} alt={banner.title} className="banner-side-image-full" />
                  <div className="banner-side-text-overlay">
                    <h3>{banner.title}</h3>
                    <p>{banner.subtitle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}