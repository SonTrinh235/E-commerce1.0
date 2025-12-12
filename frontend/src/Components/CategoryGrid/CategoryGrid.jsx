import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCategoriesAPI } from '../../api/productService';
import './CategoryGrid.css';

export function CategoryGrid() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllCategoriesAPI();
        if (res && res.success && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return null;
  if (categories.length === 0) return null;

  return (
    <div className="category-grid-section">
      <div className="container">
        <h2 className="section-title">Danh mục sản phẩm</h2>
        <div className="category-grid">
          {categories.map((category) => (
            <div
              key={category._id}
              className="category-card"
              onClick={() => navigate(`/category/${category.slug}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="category-image-wrapper">
                <img 
                  src={category.image || category.imageUrl || "https://placehold.co/400x400?text=No+Image"} 
                  alt={category.name} 
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = "https://placehold.co/400x400?text=Error";
                  }}
                />
              </div>
              <p className="category-name">{category.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}