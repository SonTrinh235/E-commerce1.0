import React, { useEffect, useState, useRef } from 'react';
import { 
  Apple, Beef, Milk, Salad, Cookie, Package, 
  ChevronLeft, ChevronRight, Fish, Snowflake, 
  Wheat, Soup, Egg, Coffee, Heart, Utensils, 
  ShoppingBag, Layers 
} from 'lucide-react';
import './CategoryNav.css';

const COLOR_CLASSES = [
  'category-fruits', 'category-meat', 'category-vegetables', 
  'category-dairy', 'category-snacks', 'category-seafood', 
  'category-eggs', 'category-frozen', 'category-processed', 
  'category-grains', 'category-spices', 'category-drinks', 
  'category-healthy'
];

const getHashIndex = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

const getCategoryStyle = (slug, name) => {
  const s = slug?.toLowerCase() || '';
  const n = name?.toLowerCase() || '';

  if (s === 'all' || n === 'tất cả') return { icon: <Package className="category-icon" />, colorClass: 'category-all' };
  if (s.includes('rau')) return { icon: <Salad className="category-icon" />, colorClass: 'category-vegetables' };
  if (s.includes('trai-cay') || n.includes('trái cây')) return { icon: <Apple className="category-icon" />, colorClass: 'category-fruits' };
  if (s.includes('thit') || n.includes('thịt')) return { icon: <Beef className="category-icon" />, colorClass: 'category-meat' };
  if (s.includes('hai-san') || n.includes('hải sản')) return { icon: <Fish className="category-icon" />, colorClass: 'category-seafood' };
  if (s.includes('trung') || n.includes('trứng')) return { icon: <Egg className="category-icon" />, colorClass: 'category-eggs' };
  if (s.includes('sua') || n.includes('sữa')) return { icon: <Milk className="category-icon" />, colorClass: 'category-dairy' };
  if (s.includes('gao') || s.includes('ngu-coc') || s.includes('mi') || s.includes('bun') || s.includes('pho')) return { icon: <Wheat className="category-icon" />, colorClass: 'category-grains' };
  if (s.includes('gia-vi') || s.includes('dau-an') || s.includes('nuoc-mam')) return { icon: <Utensils className="category-icon" />, colorClass: 'category-spices' };
  if (s.includes('do-uong') || s.includes('nuoc-giai-khat')) return { icon: <Coffee className="category-icon" />, colorClass: 'category-drinks' };
  if (s.includes('banh') || s.includes('keo') || s.includes('snack') || s.includes('an-vat') || s.includes('thuc-an-nhanh')) return { icon: <Cookie className="category-icon" />, colorClass: 'category-snacks' };
  if (s.includes('organic') || s.includes('healthy')) return { icon: <Heart className="category-icon" />, colorClass: 'category-healthy' };
  if (s.includes('dong-lanh')) return { icon: <Snowflake className="category-icon" />, colorClass: 'category-frozen' };
  if (s.includes('che-bien') || s.includes('do-hop') || s.includes('do-kho')) return { icon: <Soup className="category-icon" />, colorClass: 'category-processed' };
  
  const index = getHashIndex(s) % COLOR_CLASSES.length;
  const autoColorClass = COLOR_CLASSES[index];

  const DefaultIcon = index % 2 === 0 ? <ShoppingBag className="category-icon" /> : <Layers className="category-icon" />;

  return { icon: DefaultIcon, colorClass: autoColorClass };
};

export function CategoryNav({ selectedCategory, onSelectCategory }) {
  const [categories, setCategories] = useState([]);
  const listRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('https://www.bachkhoaxanh.xyz/product/categories');
        const data = await res.json();
        
        if (data.success) {
          const apiCategories = data.data.map(cat => {
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

  const handleScroll = (direction) => {
    if (listRef.current) {
      const { current } = listRef;
      const scrollAmount = 500;
      const newScrollLeft = direction === 'left' 
        ? current.scrollLeft - scrollAmount 
        : current.scrollLeft + scrollAmount;
      
      current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const checkScrollPosition = () => {
    if (listRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = listRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    const list = listRef.current;
    if (list) {
      list.addEventListener('scroll', checkScrollPosition);
      checkScrollPosition();
      return () => list.removeEventListener('scroll', checkScrollPosition);
    }
  }, [categories]);

  return (
    <div className="category-nav">
      {showLeftArrow && (
        <button 
          className="nav-arrow nav-arrow-left" 
          onClick={() => handleScroll('left')}
        >
          <ChevronLeft size={20} />
        </button>
      )}

      <div className="category-list" ref={listRef}>
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
      {showRightArrow && (
        <button 
          className="nav-arrow nav-arrow-right" 
          onClick={() => handleScroll('right')}
        >
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
}