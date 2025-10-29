import "./AdminSidebar.css";
import {Link} from "react-router-dom"
import {FaHome, FaBox,FaReceipt } from "react-icons/fa"

function AdminSidebar() {
  return (
    <div className="AdminSidebar-container">
      <div className="AdminSidebar-content">
        <Link to="./">
          <div id="title">Bảng điều khiển Admin</div>
        </Link>
        <Link to="./dashboard">
          <div className="tab"><FaHome className="icons"/>Thống kê</div>
        </Link>
        <Link to="./products">
          <div className="tab"><FaBox className="icons"/>Quản lí sản phẩm</div>
        </Link>
        <Link to="./orders">
          <div className="tab"><FaReceipt className="icons"/>Quản lí đơn hàng</div>
        </Link>
      </div>
    </div>
  );
}

export default AdminSidebar;
