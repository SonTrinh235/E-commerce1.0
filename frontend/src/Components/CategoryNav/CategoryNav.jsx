import { Apple, Beef, Milk, Salad, Cookie, Sparkles, Package, Flame } from 'lucide-react';
import './CategoryNav.css';

const categories = [
  { id: 'all', name: 'Tất cả', icon: <Package className="category-icon" />, colorClass: 'category-all' },
  { id: 'fruits', name: 'Trái cây', icon: <Apple className="category-icon" />, colorClass: 'category-fruits' },
  { id: 'meat', name: 'Thịt, cá', icon: <Beef className="category-icon" />, colorClass: 'category-meat' },
  { id: 'vegetables', name: 'Rau củ', icon: <Salad className="category-icon" />, colorClass: 'category-vegetables' },
  { id: 'dairy', name: 'Sữa, trứng', icon: <Milk className="category-icon" />, colorClass: 'category-dairy' },
  { id: 'snacks', name: 'Bánh kẹo', icon: <Cookie className="category-icon" />, colorClass: 'category-snacks' },
  { id: 'hot', name: 'Siêu hot', icon: <Flame className="category-icon" />, colorClass: 'category-hot' },
  { id: 'new', name: 'Hàng mới', icon: <Sparkles className="category-icon" />, colorClass: 'category-new' },
];

export function CategoryNav({ selectedCategory, onSelectCategory }) {
  return (
    <div className="category-nav">
      {/* <div className="container"> */}
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
    // </div>
  );
}