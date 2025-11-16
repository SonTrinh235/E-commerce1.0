import "./AdminLayout.css";

import AdminSidebar from "./Components/AdminSidebar/AdminSidebar";
import AdminNavbar from "./Components/AdminNavbar/AdminNavbar";
import { Outlet } from "react-router-dom";

function AdminLayout() {
  return (
    <div className="AdminLayout-container">
      <AdminSidebar />
      <main>
        <AdminNavbar/>
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
