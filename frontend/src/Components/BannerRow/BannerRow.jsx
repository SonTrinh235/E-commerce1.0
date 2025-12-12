import './BannerRow.css';

const banners = [
  {
    id: 1,
    title: 'Khuyến mãi tuần',
    subtitle: 'Giảm đến 40%',
    image: 'https://images.unsplash.com/photo-1719528809959-082f7e5c2f8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncm9jZXJ5JTIwc3RvcmUlMjBwcm9tb3Rpb24lMjBiYW5uZXJ8ZW58MXx8fHwxNzY1NDI4NjkyfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 2,
    title: 'Giao hàng nhanh',
    subtitle: 'Chỉ 30 phút',
    image: 'https://images.unsplash.com/photo-1762424361024-66dc512c3872?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwZGVsaXZlcnklMjBzZXJ2aWNlJTIwYmFubmVyfGVufDF8fHx8MTc2NTQyODY5M3ww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 3,
    title: 'Thực phẩm organic',
    subtitle: 'Tươi sạch, an toàn',
    image: 'https://images.unsplash.com/photo-1554223745-ad862492c213?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmdhbmljJTIwdmVnZXRhYmxlcyUyMG1hcmtldHxlbnwxfHx8fDE3NjU0MjEwNDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

export function BannerRow() {
  return (
    <div className="banner-row-section">
      <div className="container">
        <div className="banner-row-grid">
          {banners.map((banner) => (
            <div key={banner.id} className="banner-row-item">
              <div className="banner-row-content">
                <img src={banner.image} alt={banner.title} className="banner-row-bg-image" />
                <div className="banner-row-text">
                  <h3>{banner.title}</h3>
                  <p>{banner.subtitle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}