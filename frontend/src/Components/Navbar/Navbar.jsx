import React, { useState, useContext, useRef, useEffect } from 'react';
import './Navbar.css';

import logo from '../Assets/logo.png';
import cart_icon from '../Assets/cart_icon.png';
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

  // Đồng bộ trạng thái "menu" theo URL hiện tại
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
        <Link to="/" className="nav_logo-link" onClick={() => handleItemClick('shop')}>
          <img src={logo} alt="logo" />
          <p>Black Market</p>
        </Link>
      </div>

      <img className="nav-dropdown" onClick={dropdown_toggle} src={nav_dropdown} alt="menu" />

      <ul ref={menuRef} className="nav_menu">
        <li onClick={() => handleItemClick('shop')}>
          <Link style={{ textDecoration: 'none' }} to="/">Shop</Link>
          {menu === 'shop' ? <hr /> : null}
        </li>
        <li onClick={() => handleItemClick('meats')}>
          <Link style={{ textDecoration: 'none' }} to="/meats">Meats</Link>
          {menu === 'meats' ? <hr /> : null}
        </li>
        <li onClick={() => handleItemClick('vegs')}>
          <Link style={{ textDecoration: 'none' }} to="/vegs">Vegs</Link>
          {menu === 'vegs' ? <hr /> : null}
        </li>
        <li onClick={() => handleItemClick('others')}>
          <Link style={{ textDecoration: 'none' }} to="/others">Others</Link>
          {menu === 'others' ? <hr /> : null}
        </li>
        <li onClick={() => handleItemClick('products')}>
          <Link style={{ textDecoration: 'none' }} to="/all-products">All products</Link>
          {menu === 'products' ? <hr /> : null}
        </li>
      </ul>

      {/* Thanh tìm kiếm */}
      <form className="nav-search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit">🔍</button>
      </form>

      <div className="nav-login-cart">
        <Link to="/login">
          <button>Login</button>
        </Link>
        <Link to="/cart">
          <img src={cart_icon} alt="cart" />
        </Link>
        <div className="nav-cart-count">{getTotalCartItems()}</div>
      </div>
    </div>
  );
};

export default Navbar;
