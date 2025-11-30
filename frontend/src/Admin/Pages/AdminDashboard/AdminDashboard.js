import "./AdminDashboard.css";
import { useState, useEffect } from "react";

// Import APIs
import { getAllProducts } from "../../../api/productService";
import { getAllOrders } from "../../../api/orderService";

// Import utils
import { vnd } from "../../../utils/currencyUtils";
import { shipStatusMap } from "../../../utils/constantsMap";

function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [topProducts, setTopProducts] = useState([]);
  const [topOrders, setTopOrders] = useState([]);

  function generateOrderSummaryString(order) {
    if (!order || !order.productsInfo || order.productsInfo.length === 0) {
        return "No products found in the order.";
    }
    const products = order.productsInfo;
    const firstName = products[0].productName;
    const totalCount = products.length;
    const remainingCount = totalCount - 1;
    
    if (remainingCount === 0) {
        return firstName;
    }

    return `${firstName}, + ${remainingCount} SP khác`;
}

  const fetchProductsAll = async (page = 1, limit = 4) => {
    setLoading(true);
    try {
      const response = await getAllProducts(page, limit);
      setTotalProducts(response.data.total);
      setTopProducts(response.data.list);
    } catch (error) {
      console.log(error);
      alert("Fetch products failed, see console");
    }
    setLoading(false);
  };
  const fetchOrdersAll = async (page = 1, limit = 4) => {
    setLoading(true);
    try {
      const response = await getAllOrders(page, limit);
      setTotalOrders(response.data.total);
      setTopOrders(response.data.list);
    } catch (error) {
      console.log(error);
      alert("Fetch products failed, see console");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProductsAll();
    fetchOrdersAll();
  }, []);

  const stats = [
    {
      label: "Tổng doanh thu",
      value: "x ₫",
      change: "+x%",
      positive: true,
      icon: "💰",
      type: "revenue",
    },
    {
      label: "Đơn hàng",
      value: totalOrders,
      change: "+x%",
      positive: true,
      icon: "📦",
      type: "orders",
    },
    {
      label: "Sản phẩm",
      value: totalProducts,
      change: "+x%",
      positive: true,
      icon: "📦",
      type: "products",
    },
    {
      label: "Khách hàng",
      value: "x",
      change: "-%",
      positive: false,
      icon: "👥",
      type: "customers",
    },
  ];

  const quickActions = [
    {
      icon: "➕",
      title: "Thêm sản phẩm mới",
      description: "Thêm sản phẩm vào kho",
      url: "./products"
    },
    {
      icon: "📋",
      title: "Xem đơn hàng mới",
      description: "Kiểm tra đơn hàng chờ xử lý",
      url: "./orders"
    },
    {
      icon: "🎁",
      title: "Tạo voucher",
      description: "Tạo mã giảm giá mới",
      url: "./vouchers"
    },
    // {
    //   icon: "📊",
    //   title: "Xem báo cáo",
    //   description: "Thống kê doanh thu",
    //   url: "#"
    // },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-page-header">
        <div className="dashboard-page-header-content">
          <div className="dashboard-page-header-icon">📊</div>
          <h1 className="dashboard-page-header-title">Tổng quan</h1>
        </div>
      </div>

      <div className="dashboard-stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="dashboard-stat-card">
            <div className={`dashboard-stat-icon ${stat.type}`}>
              {stat.icon}
            </div>
            <div className="dashboard-stat-info">
              <p className="dashboard-stat-label">{stat.label}</p>
              <h3 className="dashboard-stat-value">{stat.value}</h3>
              <div
                className={`dashboard-stat-change ${
                  stat.positive ? "positive" : "negative"
                }`}
              >
                {/* {stat.change} so với tháng trước */}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content-grid">
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h2 className="dashboard-card-title">Đơn hàng gần đây</h2>
            <a href="./orders" className="dashboard-card-link">
              Xem tất cả →
            </a>
          </div>
          <div className="dashboard-card-body">
            <div className="dashboard-recent-orders">
              {topOrders.map((order) => (
                <div key={order.id} className="dashboard-order-item">
                  <div className="dashboard-order-left">
                    <img
                      src={order.productsInfo[0].productImageUrl}
                      alt={order.title}
                      className="dashboard-order-image"
                    />
                    <div className="dashboard-order-info">
                      <h4>{generateOrderSummaryString(order)}</h4>
                      <p>{order.shippingAddressInfo?.displayName}</p>
                    </div>
                  </div>
                  <div className="dashboard-order-right">
                    <span className="dashboard-order-price">
                      {vnd(order.grandTotal)}
                    </span>
                    <span className={`dashboard-order-status ${order.status}`}>
                      {shipStatusMap[order.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h2 className="dashboard-card-title">Sản phẩm bán chạy</h2>
            <a href="./products" className="dashboard-card-link">
              Xem tất cả →
            </a>
          </div>
          <div className="dashboard-card-body">
            <div className="dashboard-top-products">
              {topProducts.map((product) => (
                <div key={product._id} className="dashboard-product-item">
                  <img
                    src={product.imageInfo?.url}
                    alt={product.name}
                    className="dashboard-product-image"
                  />
                  <div className="dashboard-product-info">
                    <h4>{product.name}</h4>
                    <span className="dashboard-order-price">
                      {vnd(product.price)}
                    </span>
                    <p>{product.categoryInfo.name}</p>
                  </div>
                  <div className="dashboard-product-sales">
                    <span className="dashboard-product-sold">
                      Còn lại: {product.stock}
                    </span>
                    <span className="dashboard-product-rating">
                      {product.rating}⭐
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dashboard-card full-width">
          <div className="dashboard-card-header">
            <h2 className="dashboard-card-title">Thao tác nhanh</h2>
          </div>
          <div className="dashboard-card-body">
            <div className="dashboard-quick-actions">
              {quickActions.map((action, index) => (
                <button key={index} className="dashboard-action-btn" onClick={() => {window.location.href = action.url}}>
                  <div className="dashboard-action-icon">{action.icon}</div>
                  <div className="dashboard-action-text">
                    <h4>{action.title}</h4>
                    <p>{action.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
