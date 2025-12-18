import { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, ShoppingBag, User, Lock, Shield, Eye, EyeOff } from 'lucide-react';
import { auth, getFcmToken, registerFcmToken } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { getCartByUserId } from "../api/cartService";
import toast from 'react-hot-toast';
import './CSS/Login.css';

const BASE_URL = "https://www.bachkhoaxanh.xyz";

export function Login({ onBack, onLogin }) {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState('user'); 
  const [step, setStep] = useState('phone'); 
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);

  const otpRefs = useRef([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleToggleLoginType = (type) => {
    setLoginType(type);
    setStep('phone');
    setPhoneNumber('');
    setOtp(['', '', '', '', '', '']);
    setAdminUsername('');
    setAdminPassword('');
    setCountdown(0);
  };

  const setupRecaptcha = () => {
    if (!recaptchaVerifier) {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => console.log('reCAPTCHA passed'),
        'expired-callback': () => console.warn('reCAPTCHA expired'),
      });
      setRecaptchaVerifier(verifier);
      return verifier;
    }
    return recaptchaVerifier;
  };

  const handlePhoneSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const phoneTrim = phoneNumber.trim();
    if (!/^(\+84|0)\d{8,9}$/.test(phoneTrim)) {
      toast.error('Số điện thoại không hợp lệ!');
      return;
    }

    try {
      const verifier = setupRecaptcha();
      const formattedPhone = phoneTrim.startsWith('+') ? phoneTrim : '+84' + phoneTrim.replace(/^0/, '');
      const result = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      window.confirmationResult = result;

      setStep('otp');
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      
      // Fix lỗi ESLint: Kiểm tra tồn tại trước khi focus
      setTimeout(() => {
          const firstInput = otpRefs.current[0];
          if (firstInput) firstInput.focus();
      }, 100);
      
      toast.success('Mã OTP đã được gửi đến số điện thoại của bạn');
    } catch (err) {
      console.error('❌ Lỗi gửi OTP:', err);
      toast.error('Không gửi được OTP: ' + (err.message || ''));
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
        const nextInput = otpRefs.current[index + 1];
        if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = otpRefs.current[index - 1];
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('');
    while (newOtp.length < 6) newOtp.push('');
    setOtp(newOtp);
    
    const focusIndex = Math.min(pastedData.length, 5);
    const targetInput = otpRefs.current[focusIndex];
    if (targetInput) targetInput.focus();
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Vui lòng nhập đủ 6 số OTP!');
      return;
    }
  
    try {
      if (!window.confirmationResult) {
        toast.error('Phiên OTP không hợp lệ, vui lòng thử lại!');
        return;
      }
  
      const userCredential = await window.confirmationResult.confirm(otpCode);
      const user = userCredential.user;
      const idToken = await user.getIdToken();
  
      const payload = { phoneNumber: user.phoneNumber, idToken };
      const res = await fetch(`${BASE_URL}/user/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      const json = await res.json();
      if (json.success) {
        localStorage.setItem('userToken', json.data?.token || idToken);
        localStorage.setItem('userInfo', JSON.stringify(json.data || { phone: user.phoneNumber }));
        window.dispatchEvent(new Event('auth-changed'));
  
        // Lấy giỏ hàng
        try {
          const cartData = await getCartByUserId(user.uid); 
          localStorage.setItem('userCart', JSON.stringify(cartData || []));
          window.dispatchEvent(new Event('cart-updated'));
          console.log('✅ Giỏ hàng đã load xong');
        } catch (cartErr) {
          console.error('❌ Lỗi lấy giỏ hàng:', cartErr);
        }
  
        // Đăng ký FCM
        const fcmToken = await getFcmToken();
        if (fcmToken) {
          await registerFcmToken(user.uid, fcmToken);
          console.log('✅ FCM token đã được đăng ký cho user');
        }
  
        toast.success('Đăng nhập thành công!');
        window.location.href = '/';
      } else {
        toast.error('Đăng nhập thất bại: ' + (json.message || 'Không rõ lỗi'));
      }
    } catch (err) {
      console.error('❌ Lỗi xác nhận OTP:', err);
      toast.error('OTP không hợp lệ hoặc hết hạn! ' + (err.message || ''));
    }
  };


  const handleResendOtp = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);

    try {
      // Fix lỗi ESLint: Tạo mock event thay vì new Event('submit')
      const mockEvent = { preventDefault: () => {} };
      await handlePhoneSubmit(mockEvent);
    } finally {
      setIsResending(false);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    if (!adminUsername || !adminPassword) {
      toast.error('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/user/admin/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUsername, password: adminPassword }),
      });

      const json = await res.json();
      if (json.success) {
        localStorage.setItem('adminToken', json.data?.token ?? 'admin-session');
        localStorage.setItem('admin', JSON.stringify({ role: 'admin', username: adminUsername }));

        const fcmToken = await getFcmToken();
        if (fcmToken) {
            await registerFcmToken(adminUsername, fcmToken);
            console.log('✅ FCM token đã được đăng ký cho admin');
        }

        window.dispatchEvent(new Event('auth-changed'));
        
        toast.success('Đăng nhập quản trị viên thành công!');
        navigate('/admin/dashboard'); 
        
        if (onLogin) onLogin({ username: adminUsername, type: 'admin' });
      } else {
        toast.error('Đăng nhập thất bại: ' + (json.message || 'Sai username hoặc mật khẩu'));
      }
    } catch (err) {
      console.error('❌ Lỗi khi gọi API admin:', err);
      toast.error('Lỗi kết nối đến máy chủ');
    }
  };

  const handleBack2 = () => {
    navigate("/"); 
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <button onClick={handleBack2} className="back-button-login">
          <ArrowLeft className="icon" /> Quay lại
        </button>

        <div className="login-content">
          <div className="login-left">
            <div className="login-hero">
              <div className="hero-icon">
                <ShoppingBag className="bag-icon" />
              </div>
              <h1>Chào mừng đến với</h1>
              <h2>bachkhoaxanh</h2>
              <p>Mua sắm thực phẩm tươi ngon mỗi ngày</p>
            </div>
          </div>

          <div className="login-right">
            <div className="login-form-container">
              <div className="login-type-tabs">
                <button className={`tab-btn ${loginType === 'user' ? 'tab-active' : ''}`} onClick={() => handleToggleLoginType('user')}>
                  <Phone className="tab-icon" /> Khách hàng
                </button>
                <button className={`tab-btn ${loginType === 'admin' ? 'tab-active' : ''}`} onClick={() => handleToggleLoginType('admin')}>
                  <Shield className="tab-icon" /> Quản trị viên
                </button>
              </div>

              {loginType === 'user' && (
                <>
                  {step === 'phone' ? (
                    <form onSubmit={handlePhoneSubmit} className="login-form">
                      <div className="form-group">
                        <label htmlFor="phone">Số điện thoại</label>
                        <div className="input-wrapper">
                          <Phone className="input-icon" />
                          <input
                            type="tel"
                            id="phone"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="0912345678"
                            required
                            autoFocus
                          />
                        </div>
                      </div>
                      <button type="submit" className="submit-btn">Nhận mã OTP</button>
                      <div id="recaptcha-container"></div>
                    </form>
                  ) : (
                    <form onSubmit={handleOtpSubmit} className="login-form">
                      <div className="form-group">
                        <label>Nhập mã OTP</label>
                        <div className="otp-inputs" onPaste={handleOtpPaste}>
                          {otp.map((digit, index) => (
                            <input
                              key={index}
                              ref={el => otpRefs.current[index] = el}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(index, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(index, e)}
                              className="otp-input"
                            />
                          ))}
                        </div>
                      </div>
                      <button type="submit" className="submit-btn">Xác nhận</button>
                      <div className="resend-section">
                        {countdown > 0 ? (
                          <p className="countdown-text">Gửi lại mã sau <strong>{countdown}s</strong></p>
                        ) : (
                          <button type="button" onClick={handleResendOtp} disabled={isResending} className="resend-btn">
                            {isResending ? 'Đang gửi...' : 'Gửi lại mã OTP'}
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </>
              )}

              {loginType === 'admin' && (
                <form onSubmit={handleAdminSubmit} className="login-form">
                  <div className="form-group">
                    <label htmlFor="username">Tên đăng nhập</label>
                    <div className="input-wrapper">
                      <User className="input-icon" />
                      <input
                        type="text"
                        id="username"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        placeholder="admin"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Mật khẩu</label>
                    <div className="input-wrapper">
                      <Lock className="input-icon" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="eye-icon" /> : <Eye className="eye-icon" />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="submit-btn admin-btn">Đăng nhập</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;