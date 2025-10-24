import "./AdminNavbar.css";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiLogOut } from "react-icons/fi";

function AdminNavbar() {
  const [adminName, setAdminName] = useState("Admin");
  const [isAuthed, setIsAuthed] = useState(!!localStorage.getItem("adminToken"));
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

  return (
    <div className="AdminNavbar-container">
      <Link to="/" className="AdminNavbar-store">
        <FiArrowLeft />
        Back to Store
      </Link>

      <div className="AdminNavbar-right">
        {isAuthed && <span className="AdminNavbar-name">Hello, {adminName}</span>}
        <button className="AdminNavbar-logout" onClick={handleLogout}>
          <FiLogOut />
          Log Out
        </button>
      </div>
    </div>
  );
}

export default AdminNavbar;
