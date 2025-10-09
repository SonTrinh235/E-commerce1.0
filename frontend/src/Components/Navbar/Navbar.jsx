import React, { useState, useContext, useRef, useEffect } from 'react';
import './Navbar.css';

import {FiMenu, FiSearch, FiHeart, FiShoppingCart, FiUser } from "react-icons/fi";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShopContext } from '../../Context/ShopContext';
import nav_dropdown from '../Assets/nav_dropdown.png';

const Navbar = () => {
  const [menu, setMenu] = useState('shop');
  const [searchTerm, setSearchTerm] = useState('');
  const { getTotalCartItems } = useContext(ShopContext);
  const menuRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();

  const dropdown_toggle = (e) => {
    if (menuRef.current) {
      menuRef.current.classList.toggle('nav_menu-visible');
    }
    e.currentTarget.classList.toggle('open');
  };

  
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path === '/' || path.startsWith('/product')) setMenu('shop');
    else if (path.startsWith('/meats')) setMenu('meats');
    else if (path.startsWith('/vegs')) setMenu('vegs');
    else if (path.startsWith('/others')) setMenu('others');
    else if (path.startsWith('/all-products')) setMenu('products');
  }, [location.pathname]);

  const handleItemClick = (key) => {
    setMenu(key);
    if (menuRef.current && menuRef.current.classList.contains('nav_menu-visible')) {
      menuRef.current.classList.remove('nav_menu-visible');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() !== '') {
      navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="navbar">
      
      <div className="nav_logo">
        <Link to="/" onClick={() => handleItemClick('shop')}>
          <b><span>Good</span>Eats</b>
        </Link>
      </div>

      <div className='nav-dropdown'>
      <FiMenu className='nav-icons' onClick={dropdown_toggle}></FiMenu>
      </div>

      <ul ref={menuRef} className="nav_menu">
        <li onClick={() => handleItemClick('shop')}>
          <Link style={{ textDecoration: 'none' }} to="/"><b>Shop</b></Link>
          {menu === 'shop' ? <hr /> : null}
        </li>
        <li onClick={() => handleItemClick('meats')}>
          <Link style={{ textDecoration: 'none' }} to="/meats"><b>Meats</b></Link>
          {menu === 'meats' ? <hr /> : null}
        </li>
        <li onClick={() => handleItemClick('vegs')}>
          <Link style={{ textDecoration: 'none' }} to="/vegs"><b>Vegs</b></Link>
          {menu === 'vegs' ? <hr /> : null}
        </li>
        <li onClick={() => handleItemClick('others')}>
          <Link style={{ textDecoration: 'none' }} to="/others"><b>Others</b></Link>
          {menu === 'others' ? <hr /> : null}
        </li>
        <li onClick={() => handleItemClick('products')}>
          <Link style={{ textDecoration: 'none' }} to="/all-products"><b>All products</b></Link>
          {menu === 'products' ? <hr /> : null}
        </li>
      </ul>

      <form className="nav-search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search for products"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit"><FiSearch></FiSearch></button>
      </form>

      <div className="nav-profile-container">
        <div className='nav-cart'>
          <Link to="/cart">
            <FiShoppingCart className='nav-icons'></FiShoppingCart>
          </Link>
          <b><div className="nav-cart-count">{getTotalCartItems()}</div></b>
        </div>
        
        <div className='nav-user'>
          <Link to="/login">
            <button>
              <FiUser className='nav-icons'></FiUser>
              <span>Log in</span>
            </button>
          </Link>
        </div>
      </div>

    </div>
  );
};

export default Navbar;
