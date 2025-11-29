import { useEffect, useState } from "react";
import "./VoucherForm.css";
import { FiX } from "react-icons/fi";
import { FaArrowLeft } from "react-icons/fa";
import {
  createVoucher,
  updateVoucher,
  deleteVoucher,
} from "../../../api/voucherService";

import LoadingOverlay from "../../../Components/LoadingOverlay/LoadingOverlay";

function VoucherForm({ mode, currentItem = null, onCancel, onSuccess }) {
  const [loading, setLoading] = useState(false);

  // Properties of form
  const [formData, setFormData] = useState({
    voucherName: "",
    voucherCode: "",
    voucherDiscountType: "",
    voucherDiscountValue: 0,
    voucherDescription: "",
    voucherDays: 0,
    voucherUsageLimit: 0,
  });

  // UseEffect for initial data of form (currentItem or blank)
  useEffect(() => {
    if (currentItem) {
      const dateExpire = new Date(currentItem.expirationDate);
      const dateCreated = new Date(currentItem.createdAt);
      const durationInMs = dateExpire.getTime() - dateCreated.getTime();
      const msInDay = 1000 * 60 * 60 * 24;
      const durationInDay = durationInMs / msInDay;

      setFormData({
        voucherName: currentItem.name || "",
        voucherCode: currentItem.code || "",
        voucherDiscountType: currentItem.discountType || "",
        voucherDiscountValue: currentItem.discountValue || 0,
        voucherDescription: currentItem.description || "",
        voucherDays: Math.ceil(durationInDay) || 0,
        voucherUsageLimit: currentItem.usageLimit || 0,
      });
    } else {
      setFormData({
        voucherName: "",
        voucherCode: "",
        voucherDiscountType: "",
        voucherDiscountValue: 0,
        voucherDescription: "",
        voucherDays: 0,
        voucherUsageLimit: 0,
      });
    }
    console.log("currentItem: ", currentItem);
  }, [currentItem]);

  // Handle change for input fields
  const handleChange = (e) => {
    if (mode === "delete") {
      return;
    }
    const { name, value } = e.target;
    let newValue = value;

    if (
      name === "voucherDiscountValue" ||
      name === "voucherDays" ||
      name === "voucherUsageLimit"
    ) {
      // Convert to integer for number fields
      newValue = !!value ? Number(value) : 0;
    }

    setFormData((prevData) => ({ ...prevData, [name]: newValue }));
  };

  // Handle Submit based on form mode
  const handleSubmit = async (e) => {
    setLoading(true);

    e.preventDefault(); // Prevent default browser form submission

    try {
      // let response;

      if (mode === "add") {
        // 1. ADD MODE: Call the API to create a new voucher
        console.log("Submitting new voucher...");
        const createVoucherResponse = await createVoucher({
          name: formData.voucherName,
          code: formData.voucherCode,
          discountType: formData.voucherDiscountType,
          discountValue: formData.voucherDiscountValue,
          description: formData.voucherDescription,
          days: formData.voucherDays,
          usageLimit: formData.voucherUsageLimit,
        });

        alert("Voucher created successfully!");
      } else if (mode === "edit") {
        // 2. EDIT MODE: Call the API to update the existing voucher
        // voucherId required
        const voucherId = currentItem._id;
        console.log(`Updating voucher ${voucherId}...`);
        updateVoucher(voucherId, {
          name: formData.voucherName,
          code: formData.voucherCode,
          discountType: formData.voucherDiscountType,
          discountValue: formData.voucherDiscountValue,
          description: formData.voucherDescription,
          days: formData.voucherDays,
          usageLimit: formData.voucherUsageLimit,
        });

        alert("Voucher updated successfully!");
      } else if (mode === "delete") {
        // 3. DELETE MODE: Call the API to delete the existing voucher
        //  voucherId required
        const voucherId = currentItem._id;
        console.log(`Deleting voucher ${voucherId}...`);
        deleteVoucher(voucherId);
        alert("Voucher Deleted successfully!");
      }

      onSuccess();
      onCancel();

      // Optional: Redirect user, close modal, or clear form here
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Error with voucher. Check the console for details.");
    }

    setLoading(false);
  };

  // Set text based on form mode
  let title = "Voucher Form";
  let subTitle = "Voucher Form";
  let submitText = "Submit";

  if (mode === "add") {
    title = "Thêm Voucher";
    subTitle = "Nhập thông tin cho Voucher mới:";
    submitText = "Thêm voucher";
  } else if (mode === "edit") {
    title = "Chỉnh Sửa Voucher";
    subTitle = "Thông tin voucher sẽ được thay bằng thông tin mới";
    submitText = "Xác nhận chỉnh sửa";
  } else if (mode === "delete") {
    title = "Xác nhận: Xóa Voucher";
    subTitle = "Voucher này sẽ bị xóa, hãy xác nhận:";
    submitText = "Xóa voucher";
  }

  const buttonClass =
    mode === "delete" ? "btn-delete" : mode === "edit" ? "btn-edit" : "btn-add";

  // Form container
  return (
    <div className="VoucherForm-overlay">
      <div className="VoucherForm-container">
        {loading && <LoadingOverlay />}
        <div className="voucher-modal-header">
          <h2 className="voucher-modal-title">{title}</h2>
          <button onClick={onCancel} className="voucher-modal-close-btn">
            <FiX size={24} />
          </button>
        </div>
        {/* Actual form */}
        <form className="voucher-modal-form" onSubmit={handleSubmit}>
          {/* Data  */}
          <div className="voucher-form-group">
            <label className="voucher-form-label">Tên voucher *</label>
            <input
              name="voucherName"
              type="text"
              placeholder="Nhập tên voucher"
              value={formData.voucherName}
              onChange={handleChange}
              className="voucher-form-input"
            />
          </div>

          <div className="voucher-form-group">
            <label className="voucher-form-label">Mã voucher *</label>
            <input
              name="voucherCode"
              type="text"
              placeholder="Nhập mã voucher"
              value={formData.voucherCode}
              onChange={handleChange}
              className="voucher-form-input"
            />
          </div>

          <div className="voucher-form-row">
            <div className="voucher-form-group">
              <label className="voucher-form-label">Loại giảm giá *</label>
              <select
                name="voucherDiscountType"
                value={formData.voucherDiscountType}
                onChange={handleChange}
                className="voucher-form-select"
              >
                <option value="" disabled>
                  Chọn loại giảm giá
                </option>
                <option value="percentage">Phần trăm</option>
                <option value="fixed">Cố định</option>
              </select>
            </div>

            <div className="voucher-form-group">
              <label className="voucher-form-label">
                Giá trị{" "}
                {formData.voucherDiscountType === "percentage" ? "(%)" : "(đ)"}{" "}
                *
              </label>
              <input
                name="voucherDiscountValue"
                type="number"
                placeholder="Nhập giá trị voucher"
                value={formData.voucherDiscountValue}
                onChange={handleChange}
                className="voucher-form-input"
              />
            </div>
          </div>

          <div className="voucher-form-row">
            <div className="voucher-form-group">
              <label className="voucher-form-label">Thời lượng (ngày) *</label>
              <input
                name="voucherDays"
                type="number"
                placeholder="Nhập thời lượng voucher"
                value={formData.voucherDays}
                onChange={handleChange}
                className="voucher-form-input"
              />
            </div>

            <div className="voucher-form-group">
              <label className="voucher-form-label">
                Lượt sử dụng tối đa *
              </label>
              <input
                name="voucherUsageLimit"
                type="number"
                placeholder="Nhập lượt sử dụng tối đa voucher"
                value={formData.voucherUsageLimit}
                onChange={handleChange}
                className="voucher-form-input"
              />
            </div>
          </div>

          <div className="voucher-form-group">
            <label className="voucher-form-label">Mô tả voucher</label>
            <textarea
              name="voucherDescription"
              type="text"
              placeholder="Nhập mô tả voucher"
              value={formData.voucherDescription}
              onChange={handleChange}
              className="voucher-form-textarea"
            />
          </div>

          <div className="voucher-form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="voucher-form-btn voucher-cancel-btn"
            >
              Hủy
            </button>
            <button type="submit" className={`voucher-form-btn ${buttonClass}`}>
              {submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VoucherForm;
