import "./AdminLayout.css";

import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./Components/AdminSidebar/AdminSidebar";
import AdminNavbar from "./Components/AdminNavbar/AdminNavbar";

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="AdminLayout-container">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="AdminLayout-main-content">
        <AdminNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="AdminLayout-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
