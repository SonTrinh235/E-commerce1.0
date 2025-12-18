import { useState } from 'react';
import toast from 'react-hot-toast';
import { X, Calendar, Clock } from 'lucide-react';
import './AddBatchModal.css';

// Import API
import { addFlashSaleBatchAPI } from '../../../api/flashSaleService';

export function AddBatchModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate
    if (!formData.name || !formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Create ISO 8601 UTC strings
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}:00`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}:00`);

    // Validate dates
    if (endDateTime <= startDateTime) {
      setError('Thời gian kết thúc phải sau thời gian bắt đầu');
      return;
    }

    setLoading(true);
    try {
      const response = await addFlashSaleBatchAPI(formData.name, startDateTime.toISOString(), endDateTime.toISOString());

        toast.success('Thêm đợt flash sale thành công!');
        onSuccess();
    } catch (error) {
      console.error('Error adding batch:', error);
      setError(error.message || 'Lỗi khi thêm đợt flash sale. Vui lòng kiểm tra API endpoint.');
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content batch-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Thêm đợt Flash Sale mới</h2>
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
                Tên đợt Flash Sale <span className="required">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ví dụ: Flash Sale Tết 2025"
                className="form-input"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={16} />
                  Ngày bắt đầu <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  min={today}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Clock size={16} />
                  Giờ bắt đầu <span className="required">*</span>
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={16} />
                  Ngày kết thúc <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate || today}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Clock size={16} />
                  Giờ kết thúc <span className="required">*</span>
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
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
              {loading ? 'Đang thêm...' : 'Thêm đợt Flash Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}