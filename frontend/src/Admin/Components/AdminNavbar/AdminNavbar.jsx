import "./AdminNavbar.css";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiLogOut } from "react-icons/fi";
import { FaBars } from "react-icons/fa";

function AdminNavbar({ onMenuClick }) {
  const [adminName, setAdminName] = useState("Admin");
  const [isAuthed, setIsAuthed] = useState(
    !!localStorage.getItem("adminToken")
  );
  const navigate = useNavigate();

  const refresh = () => {
    setIsAuthed(!!localStorage.getItem("adminToken"));
    try {
      const info = JSON.parse(localStorage.getItem("admin") || "{}");
      setAdminName(info?.username || "Admin");
    } catch {
      setAdminName("Admin");
    }
  };

  useEffect(() => {
    refresh();
    const upd = () => refresh();
    window.addEventListener("auth-changed", upd);
    window.addEventListener("storage", upd);
    return () => {
      window.removeEventListener("auth-changed", upd);
      window.removeEventListener("storage", upd);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    window.dispatchEvent(new Event("auth-changed"));
    navigate("/login");
  };

  // RETURN
  // RETURN
  // RETURN
  return (
    <header className="AdminNavbar-container">
      <div className="AdminNavbar-content">
        <div className="AdminNavbar-left">
          <button onClick={onMenuClick} className="AdminNavbar-menu-btn">
            <FaBars />
          </button>
          <Link to="/" className="AdminNavbar-store">
            <button className="AdminNavbar-back-btn">
              <FiArrowLeft size={20} />
              Trở lại cửa hàng
            </button>
          </Link>
        </div>

        <div className="AdminNavbar-right">
          {isAuthed && (
            <span className="AdminNavbar-greeting">Xin chào, {adminName}</span>
          )}
          <button className="AdminNavbar-logout-btn" onClick={handleLogout}>
            <FiLogOut size={18} stroke="white" />
            <b style={{ color: "white" }}>Đăng xuất</b>
          </button>
        </div>
      </div>
    </header>
  );
}

export default AdminNavbar;
