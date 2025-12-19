import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';

import "./App.css";

import Shop from "./Pages/Shop";
import ShopCategory from "./Pages/ShopCategory";
import Product from "./Pages/Product";
import CartPage from "./Pages/Cart";
import Login from "./Pages/Login";
import SearchResults from "./Pages/SearchResults";
import ExclusiveOffers from "./Pages/ExclusiveOffers";
import NotFound from "./Pages/NotFound";

import Checkout from "./Pages/Checkout";
import Profile from "./Pages/Profile";
import Orders from "./Pages/Orders";
import { Notifications } from './Pages/Notifications';
import PaymentResult from './Pages/PaymentResult';

import AdminLayout from "./Admin/AdminLayout";
import AdminDashboard from "./Admin/Pages/AdminDashboard/AdminDashboard";
import ManageProducts from "./Admin/Pages/ManageProducts/ManageProducts";
import ManageOrders from "./Admin/Pages/ManageOrders/ManageOrders";
import ManageVouchers from "./Admin/Pages/ManageVouchers/ManageVouchers";
import { FlashSaleManagement } from "./Admin/Pages/FlashSaleManagement/FlashSaleManagement";

import { getFcmToken, onForegroundMessage } from "./firebase";
import { getCartByUserId, addProductToCart, updateProductQuantity } from "./api/cartService";
import PublicLayout from "./PublicLayout";

const RequireUser = ({ children }) => {
  const token = localStorage.getItem("userToken");
  return token ? children : <Navigate to="/login" Replace />;
};

const RequireAdmin = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  return token ? children : <Navigate to="/login" Replace />;
};

const RedirectIfAuthed = ({ children }) => {
  const userInfo = localStorage.getItem("userInfo");
  return userInfo ? <Navigate to="/" Replace /> : children;
};

const getUserIdFromStorage = () => {
  const userInfo = localStorage.getItem("userInfo");
  if (!userInfo) return null;
  try {
    const parsed = JSON.parse(userInfo);
    return parsed.user?._id || parsed._id || parsed.id || parsed.user?.id || null;
  } catch (e) {
    console.error("Lỗi parse userInfo:", e);
    return null;
  }
};

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState(null);

  const fetchCart = useCallback(async (openCart = false) => {
    const userId = getUserIdFromStorage();
    if (!userId) {
      setCartItems([]);
      return;
    }

    try {
      const res = await getCartByUserId(userId);
      const serverItems = res.data?.productsInfo || [];
      
      const mappedItems = serverItems.map(item => ({
        _id: item.productId._id || item.productId,
        name: item.productName || item.productId.name,
        price: item.price || item.productId.price,
        image: item.productImageUrl || item.productId.imageInfo?.url || "",
        quantity: item.quantity,
      }));

      setCartItems(mappedItems);
      
      if (openCart) setIsCartOpen(true);
      
    } catch (error) {
      console.error("Lỗi tải giỏ hàng:", error);
    }
  }, []);

  const addToCart = async (product) => {
    const userId = getUserIdFromStorage();
    
    if (!userId) {
      toast.error("Vui lòng đăng nhập để mua hàng!");
      return;
    }

    const pId = product._id || product.id;
    if (!pId) {
      console.error("Sản phẩm không có ID hợp lệ:", product);
      toast.error("Lỗi dữ liệu sản phẩm.");
      return;
    }

    try {
      await addProductToCart(userId, { 
        productId: pId, 
        productName: product.name || "Sản phẩm",
        productImageUrl: product.image || product.imageInfo?.url || "",
        price: product.price || 0, 
        quantity: 1
      });
      
      await fetchCart(true); 
      toast.success("Đã thêm vào giỏ hàng!");
      
    } catch (error) {
      console.error("Lỗi thêm giỏ hàng:", error);
      toast.error("Không thể thêm vào giỏ hàng. Vui lòng thử lại sau.");
    }
  };

  const handleUpdateQuantity = async (id, quantity) => {
    const userId = getUserIdFromStorage();
    if (!userId) return;

    try {
      await updateProductQuantity(userId, { productId: id, quantity });
      fetchCart();
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
    }
  };

  useEffect(() => {
    const loadData = () => {
      const userInfo = localStorage.getItem("userInfo");
      if (userInfo) {
        try {
          const parsed = JSON.parse(userInfo);
          setUser(parsed.user || parsed);
          fetchCart();
        } catch {}
      } else {
        setUser(null);
        setCartItems([]);
      }
    };

    loadData();

    const handleAuthChange = () => loadData();
    const handleCartUpdate = () => fetchCart();

    window.addEventListener("auth-changed", handleAuthChange);
    window.addEventListener("cart-updated", handleCartUpdate);

    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
      window.removeEventListener("cart-updated", handleCartUpdate);
    };
  }, [fetchCart]);

  useEffect(() => {
    const initFcm = async () => {
      const userId = getUserIdFromStorage();
      console.log("[App.js] User ID:", userId); 
      if (!userId) {
        console.warn("[App.js] Chưa có User ID -> Dừng việc lấy Token.");
        return; 
      }
      
      try {
        const token = await getFcmToken();
        if (token) {
          localStorage.setItem("fcmToken", token);
        }
      } catch (err) {
        console.error("[App.js] Lỗi khi khởi tạo FCM:", err);
      }
    };
  
    console.log("[App.js] Quyền thông báo hiện tại:", Notification.permission);
  
    if (Notification.permission === "granted") {
      initFcm();
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        console.log("[App.js] Người dùng vừa chọn quyền:", permission);
        if (permission === "granted") initFcm();
      });
    } else {
      console.warn("[App.js] Người dùng đã chặn thông báo (Denied).");
    }
  
    onForegroundMessage((payload) => {
      console.log("[App.js] Có thông báo foreground:", payload);
      
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          style={{ minWidth: '300px', padding: '10px', borderLeft: '4px solid #3b82f6' }}
        >
          <div className="flex-1 w-0 p-2">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <img
                  className="h-10 w-10 rounded-full"
                  src="https://cdn-icons-png.flaticon.com/512/3602/3602145.png"
                  alt=""
                  style={{ width: 40, height: 40 }}
                />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900" style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>
                  {payload.notification?.title}
                </p>
                <p className="mt-1 text-sm text-gray-500" style={{ margin: 0, fontSize: '0.9rem' }}>
                  {payload.notification?.body}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#666', padding: '0 15px' }}
            >
              Đóng
            </button>
          </div>
        </div>
      ), { duration: 5000, position: 'top-right' });
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userInfo");
    setUser(null);
    setCartItems([]);
    window.dispatchEvent(new Event("auth-changed"));
  };

  return (
    <Router>
      <div className="app">
        <Toaster position="top-right" reverseOrder={false} />

        <Routes>
          <Route path="/" element={<PublicLayout/>}>
            <Route index element={<Shop onAddToCart={addToCart} />} />

            {/* Product Details */}
            <Route path="/product/:productId" element={<Product onAddToCart={addToCart} />} />
            <Route path="/product/:categorySlug/:slug" element={<Product onAddToCart={addToCart} />} />

            <Route path="/cart" element={<CartPage />} />

            <Route 
              path="/login" 
              element={
                <RedirectIfAuthed>
                  <Login onLogin={(u) => setUser(u)} />
                </RedirectIfAuthed>
              } 
              />

            <Route path="/search" element={<SearchResults onAddToCart={addToCart} />} />
            <Route path="/exclusive-offers" element={<ExclusiveOffers onAddToCart={addToCart} />} />

            {/* User Protected Routes */}
            <Route path="/checkout" element={<RequireUser><Checkout /></RequireUser>} />
            <Route path="/payment-result" element={<PaymentResult />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
            <Route index element={<Navigate to="dashboard" Replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<ManageProducts />} />
            <Route path="orders" element={<ManageOrders />} />
            <Route path="vouchers" element={<ManageVouchers />} />
            <Route path="flash-sale" element={<FlashSaleManagement />} />
          </Route>
          <Route 
            path="/category/:categorySlug" 
            element={<ShopCategory onAddToCart={addToCart} />} 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;