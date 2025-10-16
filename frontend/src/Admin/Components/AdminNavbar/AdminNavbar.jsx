import "./AdminNavbar.css";
import { Link } from "react-router-dom"
import { FiArrowLeft, FiLogOut } from "react-icons/fi";

function AdminNavbar() {
  return (
    <div className="AdminNavbar-container">
      <Link to="/" className="AdminNavbar-store">
          <FiArrowLeft />
          Back to Store
      </Link>
      <Link to="/" className="AdminNavbar-logout">
        <FiLogOut />
        Log Out
      </Link>
    </div>
  );
}

export default AdminNavbar;
