import "./App.css";
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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
import Profile from "./Pages/Profile"; // Giữ lại trang Profile từ file gốc của bạn

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

// Import Firebase services
import { getFcmToken, registerFcmToken, onForegroundMessage } from "./firebase";

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
  // Logic FCM Token (Thay thế cho logic getUserById/geocode cũ)
  useEffect(() => {
    console.log("App mounted. Initializing FCM logic..."); // DEBUG LOG

    const saveToken = async () => {
      console.log("Starting saveToken function..."); // DEBUG LOG
      
      const userInfo = localStorage.getItem("userInfo");
      console.log("Raw userInfo from localStorage:", userInfo); // DEBUG LOG

      let userId = null;
      try {
        if (userInfo) {
           const parsedUser = JSON.parse(userInfo);
           // Kiểm tra kỹ cấu trúc object để tránh lỗi undefined
           userId = parsedUser.user ? parsedUser.user._id : parsedUser._id;
        }
      } catch (e) {
        console.error("Error parsing userInfo JSON:", e);
      }

      console.log("Resolved userId:", userId); // DEBUG LOG

      if (!userId) {
        console.warn("No userId found. Skipping FCM token registration.");
        return;
      }

      try {
        console.log("Calling getFcmToken()..."); // DEBUG LOG
        const token = await getFcmToken();
        
        if (token) {
          console.log("FCM Token received:", token); // DEBUG LOG
          localStorage.setItem("fcmToken", token);
          
          console.log(`Registering FCM token for userId: ${userId}...`); // DEBUG LOG
          await registerFcmToken(userId, token);
          console.log("Success: FCM token registered with backend.");
        } else {
          console.warn("Warning: No FCM token generated from Firebase.");
        }
      } catch (err) {
        console.error("Error during FCM registration process:", err);
      }
    };

    console.log("Checking Notification permission:", Notification.permission); // DEBUG LOG

    if (Notification.permission === "granted") {
      saveToken();
    } else if (Notification.permission !== "denied") {
      console.log("Requesting Notification permission..."); // DEBUG LOG
      Notification.requestPermission().then((permission) => {
        console.log("Notification permission result:", permission);
        if (permission === "granted") {
          saveToken();
        } else {
          console.warn("Notification permission denied by user.");
        }
      });
    } else {
      console.warn("Notification permission is currently denied.");
    }

    onForegroundMessage((payload) => {
      console.log("Foreground message received:", payload); // DEBUG LOG
      alert(`${payload.notification?.title}\n${payload.notification?.body}`);
    });
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