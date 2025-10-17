import "./AdminSidebar.css";
import {Link} from "react-router-dom"
import {FaHome, FaBox,FaReceipt } from "react-icons/fa"

function AdminSidebar() {
  return (
    <div className="AdminSidebar-container">
      <div className="AdminSidebar-content">
        <Link to="./">
          <div id="title">Logged in as Admin</div>
        </Link>
        <Link to="./dashboard">
          <div className="tab"><FaHome className="icons"/>Dashboard</div>
        </Link>
        <Link to="./products">
          <div className="tab"><FaBox className="icons"/>Manage Products</div>
        </Link>
        <Link to="./orders">
          <div className="tab"><FaReceipt className="icons"/>Manage Orders</div>
        </Link>
      </div>
    </div>
  );
}

export default AdminSidebar;
