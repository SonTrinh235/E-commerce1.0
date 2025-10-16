import "./AdminSidebar.css";
import {Link} from "react-router-dom"

function AdminSidebar() {
  return (
    <div className="AdminSidebar-container">
      <div className="nav-content">
        <Link to="./">
          <div>Logged in as Admin</div>
        </Link>
        <Link to="./dashboard">
          <div>Dashboard</div>
        </Link>
        <Link to="./products">
          <div>Manage Products</div>
        </Link>
        <Link to="./orders">
          <div>Manage Orders</div>
        </Link>
      </div>
    </div>
  );
}

export default AdminSidebar;
