import { useEffect, useState } from "react";
import "./VoucherForm.css";
import { FaArrowLeft } from "react-icons/fa";
import {
  createVoucher,
  updateVoucher,
  deleteVoucher
} from "../../../api/voucherService";

import LoadingOverlay from "../../../Components/LoadingOverlay/LoadingOverlay";

function VoucherForm({ mode, currentItem = null, onCancel, onSuccess }) {
  const [loading, setLoading] = useState(false);

  // Properties of form
  const [formData, setFormData] = useState({
    voucherName: "",
    voucherCode: "",
    voucherDiscountType: "",
    voucherDiscountValue: "",
    voucherDescription: "",
    voucherDays: "",
    voucherUsageLimit: "",
  });

  // UseEffect for initial data of form (currentItem or blank)
  useEffect(() => {
    if (currentItem) {
        const dateExpire = new Date(currentItem.expirationDate);
        const dateCreated = new Date(currentItem.createdAt);
        const durationInMs =  dateExpire.getTime() - dateCreated.getTime();
        const msInDay = 1000 * 60 * 60 * 24;
        const durationInDay = durationInMs/msInDay;

      setFormData({
        voucherName: currentItem.name || "",
        voucherCode: currentItem.code || "",
        voucherDiscountType: currentItem.discountType || "",
        voucherDiscountValue: currentItem.discountValue || "",
        voucherDescription: currentItem.description || "",
        voucherDays: Math.ceil(durationInDay) || "",
        voucherUsageLimit: currentItem.usageLimit || "",
      });
    } else {
      setFormData({
        voucherName: "",
        voucherCode: "",
        voucherDiscountType: "",
        voucherDiscountValue: "",
        voucherDescription: "",
        voucherDays: "",
        voucherUsageLimit: "",
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
          usageLimit: formData.voucherUsageLimit
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
          usageLimit: formData.voucherUsageLimit
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
    <div className="VoucherForm-container">
      {loading && <LoadingOverlay />}
      <header>
        <div id="title">{title}</div>
        <div id="subTitle">{subTitle}</div>
      </header>
      {/* Actual form */}
      <form className="voucher-form" onSubmit={handleSubmit}>
        {/* Data  */}
        <div id="section-data">
          <div>Tên voucher:</div>
          <input
            name="voucherName"
            type="text"
            placeholder="Nhập tên voucher"
            value={formData.voucherName}
            onChange={handleChange}
          />
          <div>Mã voucher:</div>
          <input
            name="voucherCode"
            type="text"
            placeholder="Nhập mã voucher"
            value={formData.voucherCode}
            onChange={handleChange}
          />
          <div>Loại giảm giá:</div>
          <select
            name="voucherDiscountType"
            value={formData.voucherDiscountType}
            onChange={handleChange}
          >
            <option value='' disabled>Chọn loại giảm giá</option>
            <option value='percentage'>Phần trăm</option>
            <option value='fixed'>Cố định</option>
        </select>
          <div>Giá trị:</div>
          <input
            name="voucherDiscountValue"
            type="number"
            placeholder="Nhập giá trị voucher"
            value={formData.voucherDiscountValue}
            onChange={handleChange}
          />
          <div>Mô tả:</div>
          <textarea
            name="voucherDescription"
            type="text"
            placeholder="Nhập mô tả voucher"
            value={formData.voucherDescription}
            onChange={handleChange}
          />
          <div>Thời lượng (ngày):</div>
          <input
            name="voucherDays"
            type="number"
            placeholder="Nhập thời lượng voucher"
            value={formData.voucherDays}
            onChange={handleChange}
          />
          <div>Lượt sử dụng:</div>
          <input
            name="voucherUsageLimit"
            type="number"
            placeholder="Nhập lượt sử dụng tối đa voucher"
            value={formData.voucherUsageLimit}
            onChange={handleChange}
          />
        </div>
        <button type="submit" id="VoucherForm-submit" className={buttonClass}>
          {submitText}
        </button>
      </form>
      <button id="VoucherForm-cancel" onClick={onCancel}>
        <FaArrowLeft style={{marginRight: '5px'}} />
        Hủy
      </button>
    </div>
  );
}

export default VoucherForm;
