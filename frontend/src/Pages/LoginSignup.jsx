import React, { useState } from "react";
import "./CSS/LoginSignup.css";

const LoginSignup = () => {
  const [role, setRole] = useState(null); // "user" | "admin" | null
  const [step, setStep] = useState("phone"); // cho user: "phone" | "otp"
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [adminPass, setAdminPass] = useState("");

  const handleSelectRole = (selectedRole) => {
    setRole(selectedRole);
    setStep("phone");
  };

  // --- User flow (OTP) ---
  const handleUserContinue = () => {
    if (step === "phone") {
      if (phone.trim().length < 9) {
        alert("Vui lòng nhập số điện thoại hợp lệ!");
        return;
      }
      setStep("otp");
    } else if (step === "otp") {
      if (otp.trim().length !== 6) {
        alert("Vui lòng nhập mã OTP gồm 6 chữ số!");
        return;
      }
      alert(`Đăng nhập thành công (User) với số: ${phone}`);
    }
  };

  // --- Admin flow ---
  const handleAdminLogin = () => {
    if (!adminCode.trim() || !adminPass.trim()) {
      alert("Vui lòng nhập đầy đủ mã admin và mật khẩu!");
      return;
    }
    // Bạn có thể thay thế logic này bằng API check thật:
    if (adminCode === "admin123" && adminPass === "123456") {
      alert("Đăng nhập thành công (Admin)");
    } else {
      alert("Sai mã admin hoặc mật khẩu!");
    }
  };

  const handleBack = () => {
    if (role === "user" && step === "otp") {
      setOtp("");
      setStep("phone");
    } else {
      setRole(null);
      setPhone("");
      setOtp("");
      setAdminCode("");
      setAdminPass("");
    }
  };

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>Đăng nhập</h1>

        {!role ? (
          <>
            <p className="choose-role-text">Chọn loại tài khoản:</p>
            <button onClick={() => handleSelectRole("user")}>Người dùng</button>
            <button onClick={() => handleSelectRole("admin")}>Quản trị viên (Admin)</button>
          </>
        ) : role === "user" ? (
          <>
            <h3 style={{ textAlign: "center", marginTop: "10px" }}>Đăng nhập Người dùng</h3>

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
                <button onClick={handleUserContinue}>Tiếp tục</button>
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
                <button onClick={handleUserContinue}>Xác nhận</button>
              </>
            )}

            <button className="back-btn" onClick={handleBack}>
              ← Quay lại
            </button>
          </>
        ) : (
          <>
            <h3 style={{ textAlign: "center", marginTop: "10px" }}>Đăng nhập Admin</h3>
            <div className="loginsignup-fields">
              <input
                type="text"
                placeholder="Mã Admin"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
              />
              <input
                type="password"
                placeholder="Mật khẩu"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
              />
            </div>
            <button onClick={handleAdminLogin}>Đăng nhập</button>

            <button className="back-btn" onClick={handleBack}>
              ← Quay lại
            </button>
          </>
        )}

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
