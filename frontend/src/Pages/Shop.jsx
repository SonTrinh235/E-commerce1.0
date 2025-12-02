import React, { useState } from 'react';
import { Banner } from '../Components/Banner/Banner';
import { CategoryNav } from '../Components/CategoryNav/CategoryNav';
import ProductGrid from '../Components/ProductGrid/ProductGrid';
import { useNavigate } from 'react-router-dom';

// Nhận prop onAddToCart từ App.js truyền xuống
export default function Shop({ onAddToCart }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery] = useState('');
  const navigate = useNavigate();
  const handleProductClick = (product) => {
    navigate(`/product/${product.id || product._id}`);
  };

  return (
    <div className="shop-page">
      <Banner />
      
      <CategoryNav 
        selectedCategory={selectedCategory} 
        onSelectCategory={setSelectedCategory} 
      />

      <ProductGrid 
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        onAddToCart={onAddToCart} 
        onProductClick={handleProductClick}
      />
    </div>
  );
}