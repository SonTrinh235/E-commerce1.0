import React from 'react'
import './Footer.css'
import { FaFacebookF, FaInstagram, FaYoutube, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className="footer">
        <div className="footer-container">
            <div className="footer-col">
                <div className="footer-logo">
                    <b>BachKhoa<span>Xanh</span></b>
                </div>
                <p className="footer-desc">
                    Hệ thống cung cấp thực phẩm và tiện ích dành riêng cho sinh viên Bách Khoa. Tiện lợi - Giá rẻ - An toàn.
                </p>
                <div className="footer-contact">
                    <p><FaMapMarkerAlt className="icon" /> Đại học Bách Khoa, ĐHQG-HCM</p>
                    <p><FaPhoneAlt className="icon" /> 1900 111 111 </p>
                    <p><FaEnvelope className="icon" /> cskh@bachkhoaxanh.vn</p>
                </div>
            </div>

            <div className="footer-col">
                <h3>Về chúng tôi</h3>
                <ul className="footer-links">
                    <li><a href="/gioi-thieu">Giới thiệu</a></li>
                    <li><a href="/tuyen-dung">Tuyển dụng</a></li>
                    <li><a href="/dieu-khoan">Điều khoản sử dụng</a></li>
                    <li><a href="/bao-mat">Chính sách bảo mật</a></li>
                </ul>
            </div>

            <div className="footer-col">
                <h3>Hỗ trợ khách hàng</h3>
                <ul className="footer-links">
                    <li><a href="/huong-dan">Hướng dẫn mua hàng</a></li>
                    <li><a href="/thanh-toan">Phương thức thanh toán</a></li>
                    <li><a href="/van-chuyen">Chính sách vận chuyển</a></li>
                    <li><a href="/doi-tra">Chính sách đổi trả</a></li>
                </ul>
            </div>

            <div className="footer-col">
                <h3>Kết nối với chúng tôi</h3>
                <div className="footer-socials">
                    <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon facebook"><FaFacebookF /></a>
                    <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon instagram"><FaInstagram /></a>
                    <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon youtube"><FaYoutube /></a>
                </div>
                <div className="footer-cert">
                    <span className="cert-box">Chưa đăng ký BCT :D</span>
                </div>
            </div>
        </div>

        <div className="footer-bottom">
            <p>&copy; 2025 bachkhoaxanh. Personal project for learning purpose.</p>
        </div>
    </footer>
  )
}

export default Footer