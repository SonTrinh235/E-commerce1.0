import React, { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { ProductCard } from '../ProductCard/ProductCard';
import { getTopSellingProducts } from '../../api/statisticService'; 
import './BestSellers.css';

export function BestSellers({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopSelling = async () => {
      try {
        const res = await getTopSellingProducts();
        if (res.success && Array.isArray(res.data)) {
          
          const mappedProducts = res.data.map(item => ({
             _id: item._id || item.productId, 
             name: item.name || item.productName,
             price: item.price,
             originalPrice: item.originalPrice, 
             image: item.image || item.imageUrl || item.productImageUrl, 
             imageInfo: item.imageInfo, 
             slug: item.slug,
             categoryInfo: item.categoryInfo,
             discount: item.discount || 0,
             rating: item.score || item.rating || 0,
             reviewCount: item.reviewCount || 0,
             soldCount: item.soldCount || item.sold || 0
          }));
          
          const uniqueProducts = mappedProducts.filter((obj, index, self) =>
            index === self.findIndex((t) => (
              (t._id === obj._id)
            ))
          );

          setProducts(uniqueProducts);
        }
      } catch (error) {
        console.error("Lỗi tải Best Sellers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopSelling();
  }, []);

  if (loading) return null; 
  if (products.length === 0) return null; 

  return (
    <div className="best-sellers-section">
      <div className="container">
        <div className="best-sellers-header">
          <TrendingUp className="trending-icon" />
          <h2>SẢN PHẨM BÁN CHẠY NHẤT</h2>
        </div>
        
        <div className="best-sellers-grid">
          {products.map((product, index) => (
            <ProductCard 
              key={product._id || index}
              product={product}
              onAddToCart={() => onAddToCart(product)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}