import React, { useEffect, useState } from 'react'
import { FaStar } from 'react-icons/fa'
import './Reviews.css'
import { getRatingsByProduct, createProductRating } from '../../api/productService'


function getCurrentUser() {
  try {
    const raw = localStorage.getItem('userInfo')
    if (!raw) return { id: null, name: 'Người dùng' }

    const parsed = JSON.parse(raw)
    const user = parsed?.user || parsed

    const id =
      user?._id ||
      user?.data?._id ||
      user?.userId ||
      null

    const name =
      user?.displayName ||
      user?.name ||
      user?.data?.displayName ||
      'Người dùng'

    return { id, name }
  } catch (e) {
    console.error('Lỗi đọc userInfo:', e)
    return { id: null, name: 'Người dùng' }
  }
}


const Reviews = ({ productId, onCountChange }) => {
  const [reviews, setReviews] = useState([])
  const [avgRating, setAvgRating] = useState(0)
  const [score, setScore] = useState(0)
  const [hover, setHover] = useState(null)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasRated, setHasRated] = useState(false)

  const { id: userId } = getCurrentUser()
  const ratedKey = userId ? `rated_${userId}_${productId}` : null

  // 🔹 Kiểm tra khi load trang
  useEffect(() => {
    const checkRated = ratedKey && localStorage.getItem(ratedKey)
    if (checkRated === 'true') setHasRated(true)

    const loadRatings = async () => {
      if (!productId) return
      try {
        const res = await getRatingsByProduct(productId, { sort: 'new' })
        if (res.success) {
          setReviews(res.data.items || [])
          setAvgRating(res.data.average || 0)
          onCountChange?.(res.data.total || 0)

          // nếu backend có userId khớp → cũng đánh dấu
          if (userId && res.data.items?.some(r => r.userId === userId)) {
            setHasRated(true)
            localStorage.setItem(ratedKey, 'true')
          }
        }
      } catch (err) {
        console.error('Lỗi tải đánh giá:', err)
      }
    }
    loadRatings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  // 🔹 Gửi đánh giá mới
  const handleSubmit = async (e) => {
    e.preventDefault()

    // ❌ Nếu chưa đăng nhập
    if (!userId) {
      alert('Vui lòng đăng nhập để đánh giá sản phẩm 💬')
      return
    }

    if (hasRated) return alert('Bạn đã đánh giá sản phẩm này rồi 💬')
    if (!score) return alert('Vui lòng chọn số sao!')
    if (!comment.trim()) return alert('Vui lòng nhập nhận xét!')

    setLoading(true)
    try {
      const res = await createProductRating(productId, {
        userId,
        score,
        content: comment
      })

      if (res.success && res.data) {
        alert('Cảm ơn bạn đã gửi đánh giá 💛')
        setComment('')
        setScore(0)
        setHasRated(true)
        localStorage.setItem(ratedKey, 'true')

        const updated = await getRatingsByProduct(productId)
        setReviews(updated.data.items || [])
        setAvgRating(updated.data.average || 0)
        onCountChange?.(updated.data.total || 0)
      } else {
        alert(res.message || 'Không thể gửi đánh giá!')
      }
    } catch (err) {
      const msg = err?.message || ''
      if (msg.includes('already rated')) {
        alert('Bạn đã đánh giá sản phẩm này rồi 💬')
        setHasRated(true)
        localStorage.setItem(ratedKey, 'true')
      } else {
        alert('Không thể kết nối đến máy chủ!')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="reviews-container">
      <h3>Đánh giá sản phẩm</h3>

      {/* ⭐ Tổng điểm trung bình */}
      <div className="avg-rating">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            size={22}
            style={{
              fill: i < Math.round(avgRating) ? '#FFD700' : '#E0E0E0'
            }}
          />
        ))}
        <span className="avg-text">
          {avgRating ? `${avgRating.toFixed(1)} / 5 sao` : 'Chưa có đánh giá'}
        </span>
      </div>

      {/* ✍️ Form gửi đánh giá */}
      <form onSubmit={handleSubmit} className="review-form">
        <label>Chọn số sao của bạn:</label>
        <div className="star-selector">
          {[...Array(5)].map((_, i) => {
            const ratingValue = i + 1
            return (
              <FaStar
                key={ratingValue}
                size={30}
                onMouseEnter={() => setHover(ratingValue)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setScore(ratingValue)}
                style={{
                  cursor: 'pointer',
                  transition: 'transform 0.15s',
                  fill:
                    ratingValue <= (hover || score)
                      ? '#FFD700'
                      : '#E0E0E0'
                }}
              />
            )
          })}
        </div>

        <textarea
          placeholder="Hãy chia sẻ trải nghiệm của bạn..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
        </button>
      </form>

      {/* 💬 Danh sách đánh giá */}
      <h4 className="review-list-title">
        {reviews.length
          ? `Tất cả đánh giá (${reviews.length})`
          : 'Chưa có đánh giá nào'}
      </h4>

      <ul className="review-list">
        {reviews.map((r) => (
          <li key={r._id} className="review-item">
            <div className="review-header">
              <strong>{r.userDisplayName}</strong>
              <div className="review-stars">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    size={20}
                    style={{
                      fill: i < r.score ? '#FFD700' : '#E0E0E0'
                    }}
                  />
                ))}
              </div>
            </div>
            <p className="review-comment">{r.comment}</p>
            <small className="review-date">
              {new Date(r.createdAt).toLocaleString('vi-VN')}
            </small>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Reviews
