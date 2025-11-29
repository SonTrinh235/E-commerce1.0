import "./AdminSidebar.css";
import { Link } from "react-router-dom";
import { FaHome, FaBox, FaReceipt, FaGift } from "react-icons/fa";
import { FiX} from "react-icons/fi";

function AdminSidebar({ isOpen, onClose }) {
  const menuItems = [
    { icon: FaHome, label: "Thống kê", href: "./dashboard" },
    { icon: FaBox, label: "Quản lí sản phẩm", href: "./products" },
    { icon: FaReceipt, label: "Quản lí đơn hàng", href: "./orders" },
    { icon: FaGift, label: "Quản lí voucher", href: "./vouchers" },
  ];

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`AdminSidebar-container ${isOpen ? "open" : ""}`}>
        <div className="AdminSidebar-content">
          <div className="AdminSidebar-header">
            <h2 className="AdminSidebar-title">Bảng điều khiển Admin</h2>
            <button onClick={onClose} className="AdminSidebar-close-btn">
              <FiX size={24} stroke="white" />
            </button>
          </div>

          <nav className="AdminSidebar-nav">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <a
                  key={index}
                  href={item.href}
                  className={`AdminSidebar-link ${item.active ? "active" : ""}`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
