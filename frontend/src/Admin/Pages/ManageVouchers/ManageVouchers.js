import "./ManageVouchers.css";
import React, { useState, useEffect } from "react";
// import all_product from "../../../data/all_product";
import { FaPlusCircle, FaChevronLeft, FaChevronRight } from "react-icons/fa";

// import components
import AdminVoucherRow from "../../Components/AdminVoucherRow/AdminVoucherRow";
import VoucherForm from "../../Components/VoucherForm/VoucherForm";
import LoadingOverlay from "../../../Components/LoadingOverlay/LoadingOverlay";

// import APIs
import { getAllVouchers } from "../../../api/voucherService";

// import utils
import { vnd } from "../../../utils/currencyUtils";

function ManageVouchers() {
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [vouchers, setVouchers] = useState([]);
  const [totalVouchers, setTotalVouchers] = useState(0);
  const [limit, setLimit] = useState(20);

  // Fetch products method (from all product)
  const fetchVouchersAll = async (page = 1, limit = 20) => {
    setLoading(true);
    try {
      const response = await getAllVouchers(page, limit);
      setVouchers(response.data.list);
      setTotalVouchers(response.data.total);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.log(error);
      alert("Fetch products failed, see console");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVouchersAll();
  }, [currentPage]);

  // FORM RELATED
  // State of Form
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formMode, setFormMode] = useState("");
  const [formCurrentItem, setFormCurrentItem] = useState(null);

  const openForm = (mode, currentItem = null) => {
    setFormMode(mode);
    setFormCurrentItem(currentItem);
    setIsFormVisible(true);
  };

  // Function to handle escape to close form
  const handleEscape = (event) => {
    if (event.key === "Escape") {
      // Only close if the form is actually visible
      if (isFormVisible) {
        setIsFormVisible(false);
      }
    }
  };

  // useEffect Hook for event listener
  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    // cleanup listener
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isFormVisible]);

  // RETURN
  return (
    <div className="ManageVouchers-container">
      {loading && <LoadingOverlay />}
      <div className="ManageVouchers-header">
        <div className="ManageVouchers-header-content">
          <div className="ManageVouchers-header-icon">🎁</div>
          <h1 className="ManageVouchers-header-title">Quản lí voucher</h1>
        </div>
      </div>

      <div className="voucher-table-container">
        <div className="voucher-table-header">
          <div className="voucher-table-info">
            <h2>Danh sách voucher</h2>
            <p>Tổng cộng {totalVouchers} voucher</p>
          </div>
          <button onClick={() => openForm("add")} className="add-voucher-btn">
            <FaPlusCircle fill="white" />
            Thêm voucher
          </button>
        </div>

        <div className="voucher-table-wrapper">
          <table className="voucher-table">
            <thead>
              <tr>
                <th>Tên voucher</th>
                <th>Mã voucher</th>
                <th>Loại giảm giá</th>
                <th>Giá trị</th>
                <th>Mô tả voucher</th>
                <th>Thời lượng còn</th>
                <th>Đã sử dụng</th>
                <th>Chỉnh sửa</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((voucher, i) => {
                const index = i + 1 + (currentPage - 1) * limit;
                return (
                  <AdminVoucherRow
                    key={i}
                    index={index}
                    {...voucher}
                    onEdit={() => openForm("edit", voucher)}
                    onDelete={() => openForm("delete", voucher)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="admin-table-footer">
          <div className="pagination-info">
            Trang {currentPage} trên {totalPages}
          </div>
          <div className="pagination-buttons">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
              className="pagination-btn"
            >
              <FaChevronLeft size={18} />
              Trước
            </button>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
              className="pagination-btn"
            >
              Sau
              <FaChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>


      {/* Conditional Rendering of Form */}
      {isFormVisible && (
        
          <VoucherForm
            mode={formMode}
            currentItem={formCurrentItem}
            onCancel={() => setIsFormVisible(false)} // Pass a function to close the form
            onSuccess={() => fetchVouchersAll()}
          />
      )}
    </div>
  );
}

export default ManageVouchers;
