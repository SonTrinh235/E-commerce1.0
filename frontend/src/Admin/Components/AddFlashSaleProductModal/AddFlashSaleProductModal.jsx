import { useState } from 'react';
import { X, Package, Percent, Archive } from 'lucide-react';
import './AddFlashSaleProductModal.css';

export function AddFlashSaleProductModal({ batch, allProducts, existingProducts, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    productId: '',
    discountPercentage: '',
    stock: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filter out products already in this batch
  const existingProductIds = existingProducts.map(p => 
    typeof p.productId === 'string' ? p.productId : p.productId?._id
  );
  const availableProducts = allProducts.filter(
    product => !existingProductIds.includes(product._id)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate
    if (!formData.productId || !formData.discountPercentage || !formData.stock) {
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
      const response = await fetch('/product/flash-sale/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: formData.productId,
          discountPercentage: discount,
          batchId: batch._id,
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
        alert('Thêm sản phẩm vào flash sale thành công!');
        onSuccess();
      } else {
        setError(result.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error adding flash sale product:', error);
      setError(error.message || 'Lỗi khi thêm sản phẩm vào flash sale. Vui lòng kiểm tra API endpoint.');
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content flash-product-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Thêm sản phẩm vào: {batch.name}</h2>
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

            {availableProducts.length === 0 ? (
              <div className="no-products-available">
                <Package size={48} className="empty-icon" />
                <p>Tất cả sản phẩm đã được thêm vào đợt này hoặc không có sản phẩm khả dụng</p>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">
                    <Package size={16} />
                    Chọn sản phẩm <span className="required">*</span>
                  </label>
                  <select
                    name="productId"
                    value={formData.productId}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">-- Chọn sản phẩm --</option>
                    {availableProducts.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name} (Tồn kho: {product.stock})
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
              </>
            )}
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
            {availableProducts.length > 0 && (
              <button 
                type="submit" 
                className="btn-submit"
                disabled={loading}
              >
                {loading ? 'Đang thêm...' : 'Thêm sản phẩm'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}