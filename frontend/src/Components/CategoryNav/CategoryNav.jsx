import React, { useEffect, useState } from 'react';
import { Apple, Beef, Milk, Salad, Cookie, Package } from 'lucide-react';
import './CategoryNav.css';

export function CategoryNav({ selectedCategory, onSelectCategory }) {
  const [categories, setCategories] = useState([]);

  const getCategoryStyle = (slug, name) => {
    const s = slug?.toLowerCase() || '';
    const n = name?.toLowerCase() || '';

    if (s.includes('trai-cay') || n.includes('trái cây')) return { icon: <Apple className="category-icon" />, colorClass: 'category-fruits' };
    if (s.includes('thit') || s.includes('hai-san') || n.includes('thịt')) return { icon: <Beef className="category-icon" />, colorClass: 'category-meat' };
    if (s.includes('rau') || n.includes('rau')) return { icon: <Salad className="category-icon" />, colorClass: 'category-vegetables' };
    if (s.includes('sua') || s.includes('trung') || n.includes('sữa')) return { icon: <Milk className="category-icon" />, colorClass: 'category-dairy' };
    if (s.includes('banh') || s.includes('keo') || n.includes('snack')) return { icon: <Cookie className="category-icon" />, colorClass: 'category-snacks' };
    
    return { icon: <Package className="category-icon" />, colorClass: 'category-default' };
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('https://www.bachkhoaxanh.xyz/product/categories');
        const data = await res.json();
        
        if (data.success) {
          const limitedCategories = data.data.slice(0, 6);

          const apiCategories = limitedCategories.map(cat => {
            const style = getCategoryStyle(cat.slug, cat.name);
            return {
              id: cat.slug || cat._id,
              name: cat.name,
              icon: style.icon,
              colorClass: style.colorClass
            };
          });

          setCategories([
            { id: 'all', name: 'Tất cả', icon: <Package className="category-icon" />, colorClass: 'category-all' },
            ...apiCategories
          ]);
        }
      } catch (err) {
        setCategories([
            { id: 'all', name: 'Tất cả', icon: <Package className="category-icon" />, colorClass: 'category-all' }
        ]);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="category-nav">
      <div className="category-list">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`category-btn ${category.colorClass} ${
              selectedCategory === category.id ? 'category-active' : ''
            }`}
          >
            {category.icon}
            <span>{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}