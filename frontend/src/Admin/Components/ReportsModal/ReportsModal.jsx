import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./ReportsModal.css";

// Import components
import LoadingOverlay from "../../../Components/LoadingOverlay/LoadingOverlay"

// Import APIs
import * as dataService from "../../../api/dataService";

// Import utils
import { shipStatusMap } from "../../../utils/constantsMap";
import { vnd } from "../../../utils/currencyUtils";


function ReportsModal({ onClose }) {
  const [loading, setLoading] = useState(false);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // Mock data - Replace with actual API calls
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [dailyOrders, setDailyOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [statusPercentage, setStatusPercentage] = useState([]);
  const [averageOrderValue, setAverageOrderValue] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);


  const fetchStaticData = async () => {
        setLoading(true);
        try {

          // Stats
          const res1 = await dataService.getAverageOrderValue();
          setAverageOrderValue(res1.data);
          const res2 = await dataService.getConversionRate();
          setConversionRate(res2.data);


          // Other
          const res30 = await dataService.getOrderStatusPercentage();
          setStatusPercentage(res30.data);
          const res31 = await dataService.getTopSellingProducts();
          setTopProducts(res31.data);

    
          
        } catch (error) {
          alert("Failed to get general stats from server");
          console.log(error);
        }
    
        setLoading(false);
  }

  const fetchYearData = async () => {
        setLoading(true);
        try {

          // Charts
          const res20 = await dataService.getMonthlyRevenueInYear(selectedYear);
          setMonthlyRevenue(res20.data);
          
        } catch (error) {
          alert("Failed to get general stats from server");
          console.log(error);
        }
    
        setLoading(false);
  }

  const fetchMonthData = async () => {
        setLoading(true);
        try {

          // Charts
          const res19 = await dataService.getDailyRevenueInMonth(selectedYear, selectedMonth);
          setDailyRevenue(res19.data);

          const res21 = await dataService.getDailyOrdersCountInMonth(selectedYear, selectedMonth);
          setDailyOrders(res21.data);

          
        } catch (error) {
          alert("Failed to get general stats from server");
          console.log(error);
        }
    
        setLoading(false);
  };



  useEffect(() => {
    fetchStaticData();
  }, []);


  useEffect(() => {
    fetchYearData();
    fetchMonthData();
  }, [selectedYear]);


  useEffect(() => {
    fetchMonthData();
  }, [selectedMonth]);


  const getRankClass = (index) => {
    if (index === 0) return "gold";
    if (index === 1) return "silver";
    if (index === 2) return "bronze";
    return "";
  };

  return (
    <div className="reports-modal-overlay" onClick={onClose}>
      { loading && <LoadingOverlay/>}
      <div
        className="reports-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="reports-modal-header">
          <h2>📊 Báo cáo chi tiết</h2>
          <button onClick={onClose} className="reports-modal-close-btn">
            <FiX size={18} />
            <span>Đóng</span>
          </button>
        </div>

        <div className="reports-modal-body">
          <div className="reports-controls">
            <label>
              Năm:
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {[2023, 2024, 2025, 2026].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Tháng:
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Tháng {i + 1}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="reports-grid">
            {/* Key Metrics */}
            <div className="report-section full-width">
              <h3>Chỉ số quan trọng</h3>
              <div className="report-stats-row">
                <div className="report-stat-card">
                  <div className="report-stat-label">Giá trị TB đơn hàng</div>
                  <div className="report-stat-value positive">
                    {vnd(averageOrderValue)}
                  </div>
                </div>
                <div className="report-stat-card">
                  <div className="report-stat-label">Tỷ lệ chuyển đổi</div>
                  <div className="report-stat-value positive">
                    {conversionRate.toFixed(2)}%
                  </div>
                </div>
                <div className="report-stat-card">
                  <div className="report-stat-label">
                    Tổng đơn hàng tháng này
                  </div>
                  <div className="report-stat-value">
                    {dailyOrders.reduce((sum, item) => sum + item.count, 0)}
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Revenue Chart */}
            <div className="report-section full-width">
              <h3>
                Doanh thu hằng ngày - Tháng {selectedMonth}/{selectedYear}
              </h3>
              <div className="chart-container">
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="day"
                        label={{
                          value: "Ngày",
                          position: "insideBottom",
                          offset: -5,
                        }}
                      />
                      <YAxis
                        tickFormatter={(value) =>
                          `${(value / 1000000).toFixed(1)}M`
                        }
                      />
                      <Tooltip formatter={(value) => vnd(value)} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Doanh thu"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Monthly Revenue Chart */}
            <div className="report-section full-width">
              <h3>Doanh thu hằng tháng - Năm {selectedYear}</h3>
              <div className="chart-container">
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis
                        tickFormatter={(value) =>
                          `${(value / 1000000).toFixed(0)}M`
                        }
                      />
                      <Tooltip formatter={(value) => vnd(value)} />
                      <Legend />
                      <Bar dataKey="total" fill="#10b981" name="Doanh thu" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Daily Orders Chart */}
            <div className="report-section full-width">
              <h3>
                Số đơn hàng hằng ngày - Tháng {selectedMonth}/{selectedYear}
              </h3>
              <div className="chart-container">
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dailyOrders}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="day"
                        label={{
                          value: "Ngày",
                          position: "insideBottom",
                          offset: -5,
                        }}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#f59e0b" name="Số đơn hàng" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Order Status Percentage */}
            <div className="report-section">
              <h3>Phân bố trạng thái đơn hàng</h3>
              <div className="status-percentage-grid">
                {statusPercentage.map((item, index) => (
                  <div key={index} className="status-percentage-item">
                    <div className="status-percentage-header">
                      <span className="status-percentage-label">
                        {shipStatusMap[item.status]}
                      </span>
                      <span className="status-percentage-value">
                        {item.percentage.toFixed(2)}%
                      </span>
                    </div>
                    <div className="status-percentage-bar">
                      <div
                        className={`status-percentage-fill ${item.status}`}
                        style={{ width: `${parseInt(item.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 10 Products */}
            <div className="report-section">
              <h3>Top 10 sản phẩm bán chạy</h3>
              <div className="top-products-list">
                {topProducts.map((product, index) => (
                  <div key={product._id} className="top-product-item">
                    <div className={`top-product-rank ${getRankClass(index)}`}>
                      {index + 1}
                    </div>
                    <img
                      src={product.imageInfo?.url}
                      alt={product.name}
                      className="top-product-image"
                    />
                    <div className="top-product-info">
                      <h4 className="top-product-name">{product.name}</h4>
                      <p className="top-product-category">{product.categoryInfo?.name || 'Phân loại'}</p>
                    </div>
                    <div className="top-product-stats">
                      <span className="top-product-sold">
                        Đã bán: {product.totalQuantitySold}
                      </span>
                      <span className="top-product-revenue">
                        Tổng {vnd(product.price*product.totalQuantitySold)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsModal;
