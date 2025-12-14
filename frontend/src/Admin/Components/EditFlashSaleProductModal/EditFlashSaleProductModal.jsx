import { useState, useEffect } from 'react';
import { X, Package, Percent, Archive } from 'lucide-react';
import '../../Components/AddFlashSaleProductModal/AddFlashSaleProductModal';

export function EditFlashSaleProductModal({ product, batches, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    discountPercentage: '',
    batchId: '',
    stock: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        discountPercentage: product.discountPercentage?.toString() || '',
        batchId: product.batchId || '',
        stock: product.stock?.toString() || '',
      });
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate
    if (!formData.discountPercentage || !formData.batchId || !formData.stock) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const discount = parseInt(formData.discountPercentage);
    const stock = parseInt(formData.stock);

    if (discount < 1 || discount > 99) {
      setError('Giảm giá phải từ 1% đến 99%');
      return;
    }

    if (stock < 1) {
      setError('Tồn kho phải lớn hơn 0');
      return;
    }

    try {
      setLoading(true);
      const productId = typeof product.productId === 'string' 
        ? product.productId 
        : product.productId?._id;

      const response = await fetch(`/product/flash-sale/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          discountPercentage: discount,
          batchId: formData.batchId,
          stock: stock,
        }),
      });

      // Check if response is OK
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API endpoint không khả dụng. Vui lòng kiểm tra lại server.');
      }

      const result = await response.json();

      if (result.success) {
        alert('Cập nhật sản phẩm flash sale thành công!');
        onSuccess();
      } else {
        setError(result.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error updating flash sale product:', error);
      setError(error.message || 'Lỗi khi cập nhật sản phẩm flash sale. Vui lòng kiểm tra API endpoint.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const productName = typeof product.productId === 'string' 
    ? product.productId 
    : product.productId?.name || 'N/A';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content flash-product-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chỉnh sửa sản phẩm Flash Sale</h2>
          <button onClick={onClose} className="modal-close-btn">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                <Package size={16} />
                Sản phẩm
              </label>
              <input
                type="text"
                value={productName}
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
                  <option key={batch._id} value={batch._id}>
                    {batch.name}
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
                <span className="input-hint">Số lượng khả dụng cho flash sale</span>
              </div>
            </div>

            <div className="info-box">
              <strong>Lưu ý:</strong> Tồn kho Flash Sale khác với tồn kho sản phẩm gốc. 
              Đây là số lượng giới hạn dành riêng cho đợt flash sale này.
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
            <button 
              type="submit" 
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Đang cập nhật...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}