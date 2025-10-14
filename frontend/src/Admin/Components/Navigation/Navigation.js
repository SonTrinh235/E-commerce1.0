import "./Navigation.css";
import {Link} from "react-router-dom"

function Navigation() {
  return (
    <nav>
      <Link to="./">
          <div>Admin</div>
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
    </nav>
  );
}

export default Navigation;
