import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from "react";

// === Public Pages ===
import Shop from "./Pages/Shop";
import ShopCategory from "./Pages/ShopCategory";
import Product from "./Pages/Product";
import Cart from "./Pages/Cart";
import Orders from "./Pages/Orders";
import LoginSignup from "./Pages/LoginSignup";
import SearchResults from "./Pages/SearchResults";
import ExclusiveOffers from "./Pages/ExclusiveOffers";
import Checkout from "./Pages/Checkout";
import Profile from "./Pages/Profile";

// === Admin Pages ===
import AdminDashboard from "./Admin/Pages/AdminDashboard/AdminDashboard";
import ManageProducts from "./Admin/Pages/ManageProducts/ManageProducts";
import ManageOrders from "./Admin/Pages/ManageOrders/ManageOrders";
import ManageVouchers from "./Admin/Pages/ManageVouchers/ManageVouchers";

// Page not found
import NotFound from "./Pages/NotFound";

// assets
import meat_banner from "./assets/banner_meats.png";
import veg_banner from "./assets/banner_vegs.png";
// import others_banner from "./assets/banner_others.png";
import all_banner from "./assets/banner_all.png";

import PublicLayout from "./PublicLayout";
import AdminLayout from "./Admin/AdminLayout";
import { useEffect } from "react";
import { getUserById } from "./api/userService";
import { geocodeAddress } from "./api/geocodeService";

/* ---------- Route Guards ---------- */
const RequireUser = ({ children }) => {
  const token = localStorage.getItem("userToken");
  return token ? children : <Navigate to="/login" replace />;
};

const RequireAdmin = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  return token !== null ? children : <Navigate to="/login" replace />;
};

const RedirectIfAuthed = ({ children }) => {
  const token = localStorage.getItem("userToken");
  return token ? <Navigate to="/" replace /> : children;
};
/* ---------------------------------- */

function App() {
  useEffect(() => {
    // On app load, if user token exists, try to refresh user info and geocode address
    (async () => {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) return;
        const res = await getUserById();
        // If API returns user data in res.data or res.user, try to normalize
        const data = res?.data || res?.user || res;
        if (data) {
          // Save to localStorage as userInfo (keep original shape if possible)
          localStorage.setItem("userInfo", JSON.stringify(data));
          window.dispatchEvent(new Event("auth-changed"));

          // Attempt to geocode address for quicker calculations
          const addr = data?.user?.address || data?.address || null;
          let addressString = data?.user?.addressString || data?.addressString || null;
          if (!addressString && addr) {
            addressString = `${addr.houseNumber || ""} ${addr.ward?.name || ""} ${addr.district?.name || ""} ${addr.province?.name || ""}`.trim();
          }
          if (addressString) {
            const coords = await geocodeAddress(addressString);
            if (coords) {
              localStorage.setItem("userAddressCoords", JSON.stringify(coords));
            }
          }
        }
      } catch (e) {
        console.warn("App: getUserById failed", e);
      }
    })();
  }, []);
  return (
    <div>
      <BrowserRouter>
        <Routes>
          {/* === PUBLIC ROUTES === */}
          <Route path="/" element={<PublicLayout />}>
            <Route path="/" element={<Shop />} />
            <Route
              path="/meats"
              element={<ShopCategory banner={meat_banner} category="Meat" />}
            />
            <Route
              path="/vegs"
              element={<ShopCategory banner={veg_banner} category="Vegetable" />}
            />
            {/* <Route
              path="/others"
              element={<ShopCategory banner={others_banner} category="Others" />}
            /> */}
            <Route
              path="/all-products"
              element={<ShopCategory banner={all_banner} category="" />}
            />

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
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<Orders />} />

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

          {/* === ADMIN ROUTES === */}
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
            <Route path="vouchers" element={<ManageVouchers />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
