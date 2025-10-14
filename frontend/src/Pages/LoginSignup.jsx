import React, { useState } from "react";
import "./CSS/LoginSignup.css";

const LoginSignup = () => {
  const [step, setStep] = useState("phone"); // "phone" | "otp"
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const handleContinue = () => {
    if (step === "phone") {
      if (phone.trim().length < 9) {
        alert("Vui lòng nhập số điện thoại hợp lệ!");
        return;
      }
      // Giả lập gửi OTP
      setStep("otp");
    } else if (step === "otp") {
      if (otp.trim().length !== 6) {
        alert("Vui lòng nhập mã OTP gồm 6 chữ số!");
        return;
      }
      // Xử lý xác thực OTP
      alert(`Đăng nhập thành công: ${phone}`);
    }
  };

  const handleBack = () => {
    if (step === "otp") {
      setOtp("");
      setStep("phone");
    }
  };

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>Đăng nhập</h1>

        {step === "phone" ? (
          <>
            <div className="loginsignup-fields">
              <input
                type="text"
                placeholder="Nhập số điện thoại"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <button onClick={handleContinue}>Tiếp tục</button>
          </>
        ) : (
          <>
            <p className="otp-info">
              Mã OTP đã được gửi tới số điện thoại <b>{phone}</b>
            </p>
            <div className="loginsignup-fields">
              <input
                type="text"
                placeholder="Nhập mã OTP (6 chữ số)"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />
            </div>
            <button onClick={handleContinue}>Xác nhận</button>
          </>
        )}

        {/* Nút Quay lại (luôn hiển thị) */}
        <button
          className={`back-btn ${step === "phone" ? "disabled" : ""}`}
          onClick={handleBack}
          disabled={step === "phone"}
        >
          ← Quay lại
        </button>

        <div className="loginsignup-agree">
          <p>
            Bằng việc tiếp tục, bạn đồng ý với{" "}
            <span>Điều khoản dịch vụ</span> và <span>Chính sách bảo mật</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
