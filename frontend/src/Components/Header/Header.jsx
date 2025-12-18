import { ShoppingCart, Search, User, LogOut, ChevronDown, UserCircle, Package, LayoutDashboard, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect, useContext } from 'react';
import { CartContext } from '../../Context/CartContext';
import './Header.css';
import LogoImg from '../../assets/logo.png';

export function Header() { 
  const navigate = useNavigate();
  const { cartTotalItems } = useContext(CartContext);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [isUser, setIsUser] = useState(false);
  const [userName, setUserName] = useState("Khách hàng");
  const [userEmail, setUserEmail] = useState("");

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState("Admin");

  const loadAuthFromStorage = () => {
    const hasUserToken = !!localStorage.getItem("userToken");
    const hasAdminToken = localStorage.getItem("adminToken") !== null;

    setIsUser(hasUserToken);
    setIsAdmin(hasAdminToken);

    try {
      const raw = localStorage.getItem("userInfo") || "{}";
      const info = JSON.parse(raw);
      const u = info?.user || info || {};
      
      const display = u.name || u.fullName || u.displayName || "Khách hàng";
      const email = u.email || "";
      
      setUserName(display);
      setUserEmail(email);
    } catch {
      setUserName("Khách hàng");
      setUserEmail("");
    }
    try {
      const rawAdmin = localStorage.getItem("admin") || "{}";
      const a = JSON.parse(rawAdmin);
      setAdminName(a?.username || "Admin");
    } catch {
      setAdminName("Admin");
    }
  };

  useEffect(() => {
    loadAuthFromStorage();
    const updateFromStorage = () => loadAuthFromStorage();
    window.addEventListener("auth-changed", updateFromStorage);
    window.addEventListener("storage", updateFromStorage);

    return () => {
      window.removeEventListener("auth-changed", updateFromStorage);
      window.removeEventListener("storage", updateFromStorage);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (searchTerm.trim() !== "") {
        navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
      }
    }
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);

    if (isUser) {
      localStorage.removeItem("userToken");
      localStorage.removeItem("userInfo");
    } 
    
    if (isAdmin) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("admin");
    }
    window.dispatchEvent(new Event("auth-changed"));
    
    setIsUser(false);
    setIsAdmin(false);
    setUserName("Khách hàng");
    
    navigate('/');
  };

  const handleLogoClick = () => navigate('/');
  const handleLoginClick = () => navigate('/login');
  
  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate('/profile');
  };

  const handleOrdersClick = () => {
    setIsDropdownOpen(false);
    navigate('/orders');
  };
  const handleNotificationsClick = () => {
    setIsDropdownOpen(false);
    navigate('/notifications');
  };
  const handleAdminDashboardClick = () => {
    setIsDropdownOpen(false);
    navigate('/admin/dashboard');
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const getDisplayLabel = () => {
    if (isAdmin && !isUser) return adminName;
    return userName;
  };

  return (
    <header className="header">
      <div className="header-main">
        <div className="container">
          <div className="header-main-content">
            <div 
              className="logo" 
              onClick={handleLogoClick} 
              style={{ cursor: 'pointer' }}
              title="Về trang chủ"
            >
              <div className="logo-icon">
                <img
                  src={LogoImg}
                  alt="bachkhoaxanh"
                  style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover' }}
                />
              </div>
              <div className="logo-text">
                <h1>bachkhoaxanh</h1>
                <p>Tươi ngon mỗi ngày</p>
              </div>
            </div>
            <div className="search-box">
              <Search 
                className="search-icon" 
                onClick={handleSearch} 
                style={{ cursor: 'pointer' }}
              />
              <input
                type="text"
                placeholder="Bạn tìm gì hôm nay?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch} 
                className="search-input"
              />
            </div>

            <div className="header-actions">
              {isUser && (
                <Package 
                  size={26} 
                  onClick={handleOrdersClick} 
                  style={{ 
                    cursor: 'pointer', 
                    marginRight: '15px', 
                    color: '#374151',
                    strokeWidth: 2
                  }} 
                  title="Đơn hàng của tôi"
                />
              )}

              {(isUser || isAdmin) ? (
                <div className="user-dropdown-container" ref={dropdownRef}>
                  <button 
                    type="button"
                    className={`account-btn ${isDropdownOpen ? 'active' : ''}`} 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    title="Tài khoản"
                  >
                    <User className="icon" />
                    <span className="account-text" style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {getDisplayLabel()}
                    </span>
                    <ChevronDown 
                      size={18} 
                      className="dropdown-arrow"
                      style={{ 
                        marginLeft: '4px', 
                        transition: 'transform 0.2s ease', 
                        transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        opacity: 0.7 
                      }} 
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="user-dropdown-menu">
                      <div className="dropdown-header">
                        <div className="dropdown-user-name">
                          {isAdmin && !isUser ? `${adminName} (Admin)` : userName}
                        </div>
                        {isUser && userEmail && <div className="dropdown-user-email">{userEmail}</div>}
                      </div>

                      {isAdmin && !isUser ? (
                        <div className="dropdown-item" onClick={handleAdminDashboardClick}>
                          <LayoutDashboard size={18} />
                          <span>Trang quản trị</span>
                        </div>
                      ) : (
                        <>
                          <div className="dropdown-item" onClick={handleProfileClick}>
                            <UserCircle size={18} />
                            <span>Hồ sơ cá nhân</span>
                          </div>

                          {/* <div className="dropdown-item" onClick={handleOrdersClick}>
                            <Package size={18} />
                            <span>Đơn hàng của tôi</span>
                          </div> */}

                          <div className="dropdown-item" onClick={handleNotificationsClick}>
                            <Bell size={18} />
                            <span>Thông báo</span>
                          </div>
                        </>
                      )}
                      
                      <div className="dropdown-divider"></div>
                      
                      <div className="dropdown-item" onClick={handleLogout} style={{ color: '#ef4444' }}>
                        <LogOut size={18} />
                        <span>Đăng xuất</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button type="button" className="account-btn" onClick={handleLoginClick}>
                  <User className="icon" />
                  <span className="account-text">Đăng nhập</span>
                </button>
              )}

              {isUser && (
                <button type="button" className="cart-btn" onClick={handleCartClick}>
                  <ShoppingCart className="icon" />
                  <span className="cart-text">Giỏ hàng</span>
                  {cartTotalItems > 0 && <span className="cart-badge">{cartTotalItems}</span>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}