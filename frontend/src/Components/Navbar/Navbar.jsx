import React, { useState, useRef, useEffect, useContext, useMemo } from "react";
import "./Navbar.css";

import { FiMenu, FiSearch, FiShoppingCart, FiUser, FiLogOut } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";

// import { ShopContext } from '../../Context/ShopContext';
import { CartContext } from "../../Context/CartContext";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebase";

const Navbar = () => {
  const [menu, setMenu] = useState("shop");
  const [searchTerm, setSearchTerm] = useState("");
  const menuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const { cartItems = {}, isCartLoading } = useContext(CartContext) || {};

  const cartCount = useMemo(() => {
    try {
      return Object.values(cartItems).reduce(
        (sum, it) => sum + (Number(it?.quantity) || 0),
        0
      );
    } catch {
      return 0;
    }
  }, [cartItems]);

  // --- Auth UI state ---
  const [isUser, setIsUser] = useState(!!localStorage.getItem("userToken"));
  const [userName, setUserName] = useState("Account");

  const [isAdmin, setIsAdmin] = useState(localStorage.getItem("adminToken") !== null);
  const [adminName, setAdminName] = useState("Admin");

  const dropdown_toggle = (e) => {
    if (menuRef.current) {
      menuRef.current.classList.toggle("nav_menu-visible");
    }
    e.currentTarget.classList.toggle("open");
  };

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path === "/" || path.startsWith("/product")) setMenu("shop");
    else if (path.startsWith("/meats")) setMenu("meats");
    else if (path.startsWith("/vegs")) setMenu("vegs");
    // else if (path.startsWith("/others")) setMenu("others");
    else if (path.startsWith("/all-products")) setMenu("products");
  }, [location.pathname]);

  const handleItemClick = (key) => {
    setMenu(key);
    if (menuRef.current && menuRef.current.classList.contains("nav_menu-visible")) {
      menuRef.current.classList.remove("nav_menu-visible");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() !== "") {
      navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
    }
  };

  const loadAuthFromStorage = () => {
    const hasUser = !!localStorage.getItem("userToken");
    const hasAdmin = localStorage.getItem("adminToken") !== null;
    setIsUser(hasUser);
    setIsAdmin(hasAdmin);

    try {
      const raw = localStorage.getItem("userInfo") || "{}";
      const info = JSON.parse(raw);
      const u = info?.user || info || {};
      const display = u.displayName || u.fullName || "";
      setUserName(display || "Account");
    } catch {
      setUserName("Account");
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

    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setIsUser(!!fbUser);
      if (fbUser) {
        setUserName((prev) =>
          prev && prev !== "Account" ? prev : fbUser.displayName || "Account"
        );
      } else {
        setUserName("Account");
      }
    });

    return () => {
      window.removeEventListener("auth-changed", updateFromStorage);
      window.removeEventListener("storage", updateFromStorage);
      unsub();
    };
  }, []);


  const handleUserLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("signOut error:", e);
    }
    localStorage.removeItem("userToken");
    localStorage.removeItem("userInfo");
    window.dispatchEvent(new Event("auth-changed"));
    navigate("/");
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    window.dispatchEvent(new Event("auth-changed"));
    navigate("/");
  };

  return (
    <div className="navbar">
      <div className="nav_logo">
        <Link to="/" onClick={() => handleItemClick("shop")}>
          <b>
            <span>Good</span>Eats
          </b>
        </Link>
      </div>

      <div className="nav-dropdown">
        <FiMenu className="nav-icons" onClick={dropdown_toggle} />
      </div>

      <ul ref={menuRef} className="nav_menu">
        <li onClick={() => handleItemClick("shop")}>
          <Link style={{ textDecoration: "none" }} to="/">
            <b>Shop</b>
          </Link>
          {menu === "shop" ? <hr /> : null}
        </li>
        <li onClick={() => handleItemClick("meats")}>
          <Link style={{ textDecoration: "none" }} to="/meats">
            <b>Category1</b>
          </Link>
          {menu === "meats" ? <hr /> : null}
        </li>
        <li onClick={() => handleItemClick("vegs")}>
          <Link style={{ textDecoration: "none" }} to="/vegs">
            <b>Category2</b>
          </Link>
          {menu === "vegs" ? <hr /> : null}
        </li>

        <li onClick={() => handleItemClick("products")}>
          <Link style={{ textDecoration: "none" }} to="/all-products">
            <b>All products</b>
          </Link>
          {menu === "products" ? <hr /> : null}
        </li>
      </ul>

      <form className="nav-search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search for products"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit">
          <FiSearch />
        </button>
      </form>

      <div className="nav-profile-container">
        {isAdmin && !isUser ? (
          <div className="nav-admin-shortcut">
            <button onClick={() => navigate("/admin/dashboard")}>Admin Panel</button>
          </div>
        ) : (
          <div className="nav-cart">
            <Link to="/cart" title={isCartLoading ? "Đang tải giỏ hàng..." : `${cartCount} sản phẩm`}>
              <FiShoppingCart className="nav-icons" />
            </Link>
            <b>
              <div className="nav-cart-count">{isCartLoading ? "…" : cartCount}</div>
            </b>
          </div>
        )}

        <div className="nav-user">
          {isUser ? (
            <button onClick={handleUserLogout}>
              <FiLogOut className="nav-icons" />
              <span>
                {userName && userName !== "Account" ? `Log out (${userName})` : "Log out"}
              </span>
            </button>
          ) : isAdmin ? (
            <div className="nav-admin-actions" style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span className="nav-admin-greeting">Hello, {adminName}</span>
              <button onClick={handleAdminLogout}>
                <FiLogOut className="nav-icons" />
                <span>Log out (Admin)</span>
              </button>
            </div>
          ) : (
            <Link to="/login">
              <button>
                <FiUser className="nav-icons" />
                <span>Log in</span>
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
