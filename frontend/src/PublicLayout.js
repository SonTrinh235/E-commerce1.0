import "./PublicLayout.css"

import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";
import { Outlet } from "react-router-dom";

function PublicLayout() {
  return (
    <div  className="publiclayout">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}

export default PublicLayout;
