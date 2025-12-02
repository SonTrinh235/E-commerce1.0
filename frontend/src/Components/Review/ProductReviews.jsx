import React, { useState, useEffect, useCallback } from 'react';
import StarRating from './StarRating';
import { getReviewsByProductId, createReview } from '../../api/reviewService';
import { User, CheckCircle } from 'lucide-react'; // Thêm icon CheckCircle
import './ProductReviews.css';

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State cho form
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 1. Lấy User Info từ LocalStorage
  const getUpdateUser = () => {
    const stored = localStorage.getItem('userInfo');
    if (!stored) return null;
    try {
        const parsed = JSON.parse(stored);
        return parsed.user || parsed; // Lấy object user thực sự
    } catch {
        return null;
    }
  }

  const user = getUpdateUser();
  const userId = user?._id || user?.id; // Lấy ID để gửi API
  const isLoggedIn = !!userId; // Xác định trạng thái đăng nhập

  const fetchReviews = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const res = await getReviewsByProductId(productId);
      setReviews(res.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Kiểm tra xem user hiện tại đã có bài đánh giá nào trong list chưa
  const userReview = reviews.find(r => {
      const rUserId = r.userId?._id || r.userId; // userId có thể là object hoặc string
      return rUserId === userId;
  });
  const hasRated = !!userReview;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!isLoggedIn) {
        setError('Bạn cần đăng nhập để viết đánh giá.');
        return;
    }
    if (rating === 0) {
      setError('Vui lòng chọn số sao đánh giá!');
      return;
    }
    if (!comment.trim()) {
      setError('Vui lòng nhập nội dung đánh giá!');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // console.log("Submitting review for:", { userId, productId, rating });
      
      // 2. Gọi API
      await createReview({
        userId: userId, 
        productId: productId,
        rating: rating,
        comment: comment
      });
      
      // Reset form
      setComment('');
      setRating(0);
      alert('Cảm ơn bạn đã đánh giá!');
      
      // Reload lại danh sách
      await fetchReviews();
    } catch (err) {
      // 3. Xử lý hiển thị lỗi từ Backend
      // Log body để xem chi tiết lỗi 400 là gì
      console.error("Lỗi gửi đánh giá (Body):", err.body);
      
      const serverMsg = err.body?.message || err.body?.error || err.message;
      
      if (serverMsg) {
         // Hiển thị message từ server (Ví dụ: "User already rated")
         setError(`Lỗi: ${serverMsg}`);
      } else {
         setError('Gửi đánh giá thất bại. Vui lòng thử lại sau.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, cur) => acc + cur.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="product-reviews-container">
      <h2 className="reviews-title">Đánh giá sản phẩm ({reviews.length})</h2>

      {/* SUMMARY */}
      <div className="reviews-summary">
        <div className="average-score">
            <span className="score">{averageRating}</span>
            <span className="max-score">/ 5</span>
        </div>
        <StarRating rating={Math.round(averageRating)} />
        <p className="total-count">Dựa trên {reviews.length} nhận xét</p>
      </div>

      <hr className="divider" />

      {/* REVIEWS LIST */}
      <div className="reviews-list">
        {loading ? (
          <p>Đang tải đánh giá...</p>
        ) : reviews.length === 0 ? (
          <p className="no-reviews">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
        ) : (
          reviews.map((review, index) => (
            <div key={index} className="review-item">
              <div className="review-avatar">
                <User size={24} />
              </div>
              <div className="review-content">
                <div className="review-header">
                  <span className="reviewer-name">
                    {review.userDisplayName || review.userId?.displayName || review.userId?.name || "Khách hàng"}
                  </span>
                  <span className="review-date">
                    {new Date(review.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <StarRating rating={review.score || review.rating} size={16} />
                <p className="review-text">{review.comment}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <hr className="divider" />

      {/* FORM REVIEW */}
      <div className="write-review">
        <h3>Viết đánh giá của bạn</h3>
        {!isLoggedIn ? (
          <div className="login-prompt">
            Vui lòng <a href="/login">đăng nhập</a> để viết đánh giá.
          </div>
        ) : hasRated ? (
          // Hiển thị thông báo nếu đã đánh giá
          <div className="rated-message" style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
             <CheckCircle size={40} color="green" style={{ marginBottom: '10px' }} />
             <p style={{ fontWeight: 'bold', color: '#28a745' }}>Bạn đã đánh giá sản phẩm này.</p>
             <p>Cảm ơn bạn đã chia sẻ ý kiến!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="rating-select">
              <label>Bạn chấm sản phẩm này mấy sao?</label>
              <StarRating 
                isEditable={true} 
                rating={rating} 
                setRating={setRating} 
                hoverRating={hoverRating} 
                setHoverRating={setHoverRating} 
                size={28}
              />
            </div>
            
            <div className="comment-box">
              <textarea 
                placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </div>
            
            {error && <p className="error-msg">{error}</p>}
            
            <button type="submit" className="submit-review-btn" disabled={submitting}>
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;