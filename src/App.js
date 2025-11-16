import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { useEffect } from "react";

import { requestForToken, onMessageListener } from "./firebase";

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

// === Admin Pages ===
import AdminDashboard from "./Admin/Pages/AdminDashboard/AdminDashboard";
import ManageProducts from "./Admin/Pages/ManageProducts/ManageProducts";
import ManageOrders from "./Admin/Pages/ManageOrders/ManageOrders";

// Page not found
import NotFound from "./Pages/NotFound";

// assets
import meat_banner from "./assets/banner_meats.png";
import veg_banner from "./assets/banner_vegs.png";
import all_banner from "./assets/banner_all.png";

import PublicLayout from "./PublicLayout";
import AdminLayout from "./Admin/AdminLayout";

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
    Notification.requestPermission().then(async (permission) => {
      if (permission !== "granted") return;

      try {
        const token = await requestForToken();
        if (token) {
          localStorage.setItem("fcmToken", token);
          console.log("FCM Token:", token);
        }
      } catch (err) {
        console.error("Error getting FCM token:", err);
      }
    });

    onMessageListener().then((payload) => {
      if (!document.hidden) {
        alert(`${payload.notification.title}\n${payload.notification.body}`);
      }
    });
  }, []);

  return (
    <div>
      <BrowserRouter>
        <Routes>

          {/* PUBLIC ROUTES */}
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

          {/* ADMIN ROUTES */}
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
