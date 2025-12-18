import "./AdminDashboard.css";
import { useState, useEffect } from "react";
// Import components
import ReportsModal from "../../Components/ReportsModal/ReportsModal";
import LoadingOverlay from "../../../Components/LoadingOverlay/LoadingOverlay";

// Import APIs
import { getAllOrders } from "../../../api/orderService";
import * as dataService from "../../../api/dataService";

// Import utils
import { vnd } from "../../../utils/currencyUtils";
import { formatDate } from "../../../utils/dateUtils";
import { shipStatusMap } from "../../../utils/constantsMap";

function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [showReports, setShowReports] = useState(false);

  // Stats state - will be populated from API
  const [monthRevenue, setMonthRevenue] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [todayOrderCount, setTodayOrderCount] = useState(0);
  const [monthOrderCount, setMonthOrderCount] = useState(0);
  const [newOrderCount, setNewOrderCount] = useState(0);

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

  const getRankClass = (index) => {
    if (index === 0) return "gold";
    if (index === 1) return "silver";
    if (index === 2) return "bronze";
    return "";
  };

  const fetchGeneralStats = async (page = 1, limit = 4) => {
    setLoading(true);
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();

      const res1 = await dataService.getMonthlyRevenueInYear(currentYear);
      setMonthRevenue(res1.data[currentMonth - 1].total);
      const res2 = await dataService.getMonthlyOrdersCountInYear(currentYear);
      setMonthOrderCount(res2.data[currentMonth - 1].count);
      const res3 = await dataService.getTodayRevenue();
      setTodayRevenue(res3.data);
      const res4 = await dataService.getTodayOrdersCount();
      setTodayOrderCount(res4.data);
      const res5 = await dataService.getNewOrdersCount();
      setNewOrderCount(res5.data);
    } catch (error) {
      alert("Failed to get general stats from server");
      console.log(error);
    }
    setLoading(false);
  };
  const fetchTopProducts = async (page = 1, limit = 4) => {
    setLoading(true);
    try {
      const response = await dataService.getTopSellingProducts();
      setTopProducts(response.data);
    } catch (error) {
      console.log(error);
      alert("Fetch products failed, see console");
    }
    setLoading(false);
  };
  const fetchTopOrders = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await getAllOrders(page, limit);
      setTopOrders(response.data.list);
    } catch (error) {
      console.log(error);
      alert("Fetch products failed, see console");
    }
    setLoading(false);
  };

  useEffect(() => {
    const getData = async () => {
      await fetchTopProducts();
      await fetchTopOrders();
      await fetchGeneralStats();
    }
    getData();
  }, []);

  const stats = [
    {
      label: "Tổng doanh thu tháng này",
      value: vnd(todayRevenue),
      change: "+x%",
      positive: true,
      icon: "💰",
      type: "revenue",
    },

    // {
    //   label: "Đơn hàng tháng này",
    //   value: monthOrderCount,
    //   change: "+x%",
    //   positive: true,
    //   icon: "📦",
    //   type: "orders",
    // },

    {
      label: "Doanh thu hôm nay",
      value: vnd(todayRevenue),
      change: "+x%",
      positive: true,
      icon: "💰",
      type: "revenue",
    },
    {
      label: "Đơn hàng hôm nay",
      value: todayOrderCount,
      change: "+x%",
      positive: true,
      icon: "📦",
      type: "orders",
    },
    {
      label: "Đơn hàng mới",
      value: newOrderCount,
      change: "+x%",
      positive: true,
      icon: "🆕",
      type: "products",
    },
  ];

  const quickActions = [
    {
      icon: "➕",
      title: "Thêm sản phẩm mới",
      description: "Thêm sản phẩm vào kho",
      onClick: () => (window.location.href = "./products"),
    },
    {
      icon: "📋",
      title: "Xem đơn hàng mới",
      description: "Kiểm tra đơn hàng chờ xử lý",
      onClick: () => (window.location.href = "./orders"),
    },
    {
      icon: "🎁",
      title: "Tạo voucher",
      description: "Tạo mã giảm giá mới",
      onClick: () => (window.location.href = "./vouchers"),
    },
    {
      icon: "📊",
      title: "Xem báo cáo",
      description: "Thống kê doanh thu",
      onClick: () => setShowReports(true),
    },
  ];

  return (
    <div className="dashboard">
      {loading && <LoadingOverlay/>}
      <div className="dashboard-page-header">
        <div className="dashboard-page-header-content">
          <div className="dashboard-page-header-left">
            <div className="dashboard-page-header-icon">📊</div>
            <h1 className="dashboard-page-header-title">Tổng quan</h1>
          </div>

          <button
            className="dashboard-action-btn"
            onClick={() => setShowReports(true)}
          >
            <div className="dashboard-action-icon">📊</div>
            <div className="dashboard-action-text">
              <h4>Xem báo cáo</h4>
              <p>Thống kê doanh thu</p>
            </div>
          </button>
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
              {topOrders.slice(0, 6).map((order) => (
                <div key={order.id} className="dashboard-order-item">
                  <div className="dashboard-order-left">
                    <img
                      src={order.productsInfo[0].productImageUrl}
                      alt={order.title}
                      className="dashboard-order-image"
                    />
                    <div className="dashboard-order-info">
                      <h4>{generateOrderSummaryString(order)}</h4>
                      <p className="customer">
                        {order.shippingAddressInfo?.displayName}
                      </p>
                      <p>Lúc {formatDate(order.createdAt)}</p>
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
              {topProducts.slice(0, 6).map((product, index) => (
                <div key={product._id} className="dashboard-product-item">
                  <div className={`top-product-rank ${getRankClass(index)}`}>
                    {index + 1}
                  </div>
                  <img
                    src={product.imageInfo?.url || ""}
                    alt={product.name}
                    className="dashboard-product-image"
                  />
                  <div className="dashboard-product-info">
                    <h4>{product.name}</h4>
                    <span className="dashboard-order-price">
                      {vnd(product.price)}
                    </span>
                    <p>{product.categoryInfo?.name || "Phân loại"}</p>
                  </div>
                  <div className="dashboard-product-sales">
                    <span className="dashboard-product-sold">
                      Đã bán: {product.totalQuantitySold}
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
                <button
                  key={index}
                  className="dashboard-action-btn"
                  onClick={action.onClick}
                >
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
      {showReports && <ReportsModal onClose={() => setShowReports(false)} />}
    </div>
  );
}

export default AdminDashboard;
