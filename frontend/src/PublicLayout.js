import "./PublicLayout.css";

// import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";
import { Header } from "./Components/Header/Header";
import { FloatingCart } from "./Components/FloatingCart/FloatingCart";

import { Outlet } from "react-router-dom";

const RequireUser = ({ children }) => {
  const token = localStorage.getItem("userToken");
  return token ? children : <replace />;
};

function PublicLayout() {
  return (
    <div className="publiclayout">
      {/* <Navbar /> */}
      <Header />
      <Outlet />
      <RequireUser><FloatingCart /></RequireUser>
      <Footer />
    </div>
  );
}

export default PublicLayout;
