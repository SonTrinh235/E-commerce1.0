import "./AdminLayout.css";

import Navigation from "./Components/Navigation/Navigation";
import { Outlet } from "react-router-dom";

function AdminLayout() {
  return (
    <div className="adminlayout">
      <Navigation />
      <Outlet />
    </div>
  );
}

export default AdminLayout;
