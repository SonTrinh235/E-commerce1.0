import "./ManageVouchers.css";
import React, { useState, useEffect } from "react";
// import all_product from "../../../data/all_product";
import { FaPlusCircle } from "react-icons/fa";

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
      {loading && <LoadingOverlay/>}
      <div id="ManageVouchers-header">
        <h2 style={{ color: "white" }}>🎁Quản lí voucher</h2>
      </div>

      <div className="ManageVouchers-main">
        <header>Danh sách voucher</header>
        <div>Tổng cộng {totalVouchers} voucher</div>

        <table className="ManageVouchers-table">
          <thead>
            <tr>
              <th className="index">#</th>
              <th>Tên voucher</th>
              <th>Mã voucher</th>
              <th>Loại giảm giá</th>
              <th>Giá trị</th>
              <th>Mô tả voucher</th>
              <th>Hết hạn ngày</th>
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

        {/* Paging for vouchers */}
        <div className="ManageVouchers-paging">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
          >
            Trước
          </button>

          <span>
            Trang {currentPage} trên {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= totalPages || loading}
          >
            Sau
          </button>
        </div>
      </div>

      <button className="ManageVoucher-add" onClick={() => openForm("add")}>
        <FaPlusCircle fill="white"/>
        Thêm voucher
      </button>

      {/* Conditional Rendering of Form */}
      {isFormVisible && (
        <div id="ProductForm-overlay">
          <VoucherForm
            mode={formMode}
            currentItem={formCurrentItem}
            onCancel={() => setIsFormVisible(false)} // Pass a function to close the form
            onSuccess={() => fetchVouchersAll()}
          />
        </div>
      )}
    </div>
  );
}

export default ManageVouchers;
