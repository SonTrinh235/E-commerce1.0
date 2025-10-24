import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from "react";

// === Public Pages ===
import Shop from "./Pages/Shop";
import ShopCategory from "./Pages/ShopCategory";
import Product from "./Pages/Product";
import Cart from "./Pages/Cart";
import LoginSignup from "./Pages/LoginSignup";
import SearchResults from "./Pages/SearchResults";
import ExclusiveOffers from "./Pages/ExclusiveOffers";
import Checkout from "./Components/Checkout/Checkout";

// === Admin Pages ===
import AdminDashboard from "./Admin/Pages/AdminDashboard/AdminDashboard";
import ManageProducts from "./Admin/Pages/ManageProducts/ManageProducts";
import ManageOrders from "./Admin/Pages/ManageOrders/ManageOrders";

// Page not found
import NotFound from "./Pages/NotFound";

// assets
import meat_banner from "./assets/banner_meats.png";
import veg_banner from "./assets/banner_vegs.png";
import others_banner from "./assets/banner_others.png";
import all_banner from "./assets/banner_all.png";

import PublicLayout from "./PublicLayout";
import AdminLayout from "./Admin/AdminLayout";

/* ---------- Route Guards ---------- */
const RequireUser = ({ children }) => {
  const token = localStorage.getItem("userToken");
  return token ? children : <Navigate to="/login" replace />;
};

const RequireAdmin = ({ children }) => {
  // Cho qua nếu key tồn tại (tránh case token = "")
  const token = localStorage.getItem("adminToken");
  return token !== null ? children : <Navigate to="/login" replace />;
};

const RedirectIfAuthed = ({ children }) => {
  const token = localStorage.getItem("userToken");
  return token ? <Navigate to="/" replace /> : children;
};
/* ---------------------------------- */

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          {/* === PUBLIC ROUTES === */}
          <Route path="/" element={<PublicLayout />}>
            <Route path="/" element={<Shop />} />
            <Route
              path="/meats"
              element={<ShopCategory banner={meat_banner} category="Meats" />}
            />
            <Route
              path="/vegs"
              element={<ShopCategory banner={veg_banner} category="Vegetables" />}
            />
            <Route
              path="/others"
              element={<ShopCategory banner={others_banner} category="Others" />}
            />
            <Route
              path="/all-products"
              element={<ShopCategory banner={all_banner} category="Products" />}
            />

            {/* YÊU CẦU USER ĐÃ LOGIN */}
            <Route
              path="/checkout"
              element={
                <RequireUser>
                  <Checkout />
                </RequireUser>
              }
            />

            <Route path="/product/:productId" element={<Product />} />
            <Route path="/cart" element={<Cart />} />

            {/* ĐÃ LOGIN thì chặn vào /login */}
            <Route
              path="/login"
              element={
                <RedirectIfAuthed>
                  <LoginSignup />
                </RedirectIfAuthed>
              }
            />

            <Route path="/exclusive-offers" element={<ExclusiveOffers />} />
            <Route path="/search" element={<SearchResults />} />
          </Route>

          {/* === ADMIN ROUTES (bảo vệ bằng adminToken) === */}
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<ManageProducts />} />
            <Route path="orders" element={<ManageOrders />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
