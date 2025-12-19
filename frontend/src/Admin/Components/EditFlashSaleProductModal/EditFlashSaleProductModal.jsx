import { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { X, Package, Percent, Archive } from "lucide-react";
import "../../Components/AddFlashSaleProductModal/AddFlashSaleProductModal";

// Import API
import { editFlashSaleProductAPI } from "../../../api/flashSaleService";

export function EditFlashSaleProductModal({
  product,
  batches,
  onClose,
  onSuccess,
}) {

  const [formData, setFormData] = useState({
    discountPercentage: "",
    batchId: "",
    stock: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (product) {
      setFormData({
        discountPercentage:
          product.flashSaleInfo?.discountPercentage?.toString() ||
          "",
        batchId: product.flashSaleInfo?.batchId || "",
        stock: product.flashSaleInfo?.stock?.toString() || "",
      });
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate
    if (!formData.discountPercentage || !formData.batchId || !formData.stock) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const discount = parseInt(formData.discountPercentage);
    const stock = parseInt(formData.stock);

    if (discount < 1 || discount > 99) {
      setError("Giảm giá phải từ 1% đến 99%");
      return;
    }

    if (stock < 1) {
      setError("Tồn kho phải lớn hơn 0");
      return;
    }

    setLoading(true);
    try {
      const productId = product._id;

      const response = await editFlashSaleProductAPI(
        productId,
        formData.batchId,
        discount,
        stock
      );

      toast.success("Cập nhật sản phẩm flash sale thành công!");
      onSuccess();
    } catch (error) {
      console.error("Error updating flash sale product:", error);
      alert("Lỗi khi cập nhật sản phẩm flash sale");
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content flash-product-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Chỉnh sửa sản phẩm Flash Sale</h2>
          <button onClick={onClose} className="modal-close-btn">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label className="form-label">
                <Package size={16} />
                Sản phẩm
              </label>
              <input
                type="text"
                value={product.name}
                className="form-input"
                disabled
                readOnly
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Package size={16} />
                Chọn đợt Flash Sale <span className="required">*</span>
              </label>
              <select
                name="batchId"
                value={formData.batchId}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">-- Chọn đợt --</option>
                {batches.map((batch) => (
                  <option key={batch.batchInfo._id} value={batch.batchInfo._id}>
                    {batch.batchInfo.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <Percent size={16} />
                  Giảm giá (%) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="discountPercentage"
                  value={formData.discountPercentage}
                  onChange={handleChange}
                  placeholder="Ví dụ: 30"
                  min="1"
                  max="99"
                  className="form-input"
                  required
                />
                <span className="input-hint">Nhập từ 1 đến 99</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Archive size={16} />
                  Tồn kho Flash Sale <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="Ví dụ: 100"
                  min="1"
                  className="form-input"
                  required
                />
                <span className="input-hint">
                  Số lượng khả dụng cho flash sale
                </span>
              </div>
            </div>

            <div className="info-box">
              <strong>Lưu ý:</strong> Tồn kho Flash Sale khác với tồn kho sản
              phẩm gốc. Đây là số lượng giới hạn dành riêng cho đợt flash sale
              này.
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
              disabled={loading}
            >
              Hủy
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
