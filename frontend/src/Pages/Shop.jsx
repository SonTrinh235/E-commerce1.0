import React, { useState } from 'react';
import { Banner } from '../Components/Banner/Banner';
import { CategoryNav } from '../Components/CategoryNav/CategoryNav';
import ProductGrid from '../Components/ProductGrid/ProductGrid';
import { useNavigate } from 'react-router-dom';
import { BestSellers } from '../Components/BestSellers/BestSellers';
import { CategoryGrid } from '../Components/CategoryGrid/CategoryGrid';
import { FlashSale } from '../Components/FlashSale/FlashSale';

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
      <BestSellers onAddToCart={onAddToCart} />
      <CategoryGrid onSelectCategory={setSelectedCategory} />
      <FlashSale onAddToCart={onAddToCart} />      
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