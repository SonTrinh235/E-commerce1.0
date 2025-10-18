import React, { useState } from "react";
import "./CSS/LoginSignup.css";
import { auth } from "../firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

let recaptchaVerifier = null;

const LoginSignup = () => {
  const [role, setRole] = useState(null); // user | admin
  const [step, setStep] = useState("phone"); // phone | otp
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [adminCode, setAdminCode] = useState("");
  const [adminPass, setAdminPass] = useState("");

  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");

  // --- Setup Recaptcha ---
  const setupRecaptcha = () => {
    if (!recaptchaVerifier) {
      recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => console.log("✅ reCAPTCHA passed"),
        "expired-callback": () => console.warn("⚠️ reCAPTCHA expired"),
      });
    }
    return recaptchaVerifier;
  };

  // --- Xử lý user đăng nhập ---
  const handleUserContinue = async () => {
    if (step === "phone") {
      if (phone.trim().length < 9) {
        alert("Vui lòng nhập số điện thoại hợp lệ!");
        return;
      }

      try {
        const appVerifier = setupRecaptcha();
        const phoneNumber = phone.startsWith("+")
          ? phone
          : "+84" + phone.replace(/^0/, "");

        const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
        setConfirmationResult(result);
        setStep("otp");
        alert("✅ Mã OTP đã được gửi đến số điện thoại của bạn!");
      } catch (error) {
        console.error("❌ Lỗi gửi OTP:", error);
        alert("Không gửi được OTP: " + (error.message || error));
      }
    } else if (step === "otp") {
      if (otp.trim().length !== 6) {
        alert("Vui lòng nhập đủ 6 chữ số OTP!");
        return;
      }

      try {
        if (!confirmationResult) {
          alert("⚠️ Phiên OTP không hợp lệ, vui lòng thử lại!");
          return;
        }

        const userCredential = await confirmationResult.confirm(otp);
        const user = userCredential.user;
        const idToken = await user.getIdToken();

        alert(`🎉 Đăng nhập thành công: ${user.phoneNumber}`);

        const payload = {
          phoneNumber: user.phoneNumber,
          idToken,
          displayName: user.displayName || "",
          address: "",
        };

        // const res = await fetch("http://localhost:5000/user/auth", {
        const res = await fetch("https://www.bachkhoaxanh.xyz/user/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const json = await res.json();
        console.log("📦 API response:", json);

        if (json.success) {
          localStorage.setItem("userToken", json.data?.token || idToken);
          localStorage.setItem("userInfo", JSON.stringify(json.data || { phone: user.phoneNumber }));
          alert("✅ Đăng nhập thành công!");
          window.location.href = "/";
        } else {
          alert("❌ Đăng nhập thất bại: " + (json.message || "Không rõ lỗi"));
        }
      } catch (error) {
        console.error("❌ Lỗi xác minh OTP:", error);
        alert("Mã OTP không hợp lệ hoặc đã hết hạn! " + (error.message || ""));
      }
    }
  };

  // --- Admin login ---
  const handleAdminLogin = async () => {
    setAdminError("");
    if (!adminCode || !adminPass) {
      setAdminError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      setAdminLoading(true);

      const payload = {
        username: adminCode,
        password: adminPass,
      };

      const res = await fetch("https://www.bachkhoaxanh.xyz/user/admin/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      console.log("🔐 Admin auth response:", json);

      if (json.success) {
        localStorage.setItem("adminToken", json.data?.token || "");
        localStorage.setItem("admin", JSON.stringify({ role: "admin", username: adminCode }));
        alert("✅ Đăng nhập thành công (Admin)");
        window.location.href = "/admin";
      } else {
        setAdminError(json.message || "Sai username hoặc mật khẩu");
      }
    } catch (err) {
      console.error("❌ Lỗi khi gọi API admin:", err);
      setAdminError(err.message || "Lỗi mạng hoặc server");
    } finally {
      setAdminLoading(false);
    }
  };

  // --- Quay lại ---
  const handleBack = () => {
    if (role === "user" && step === "otp") {
      setStep("phone");
      setOtp("");
    } else {
      setRole(null);
      setPhone("");
      setOtp("");
      setAdminCode("");
      setAdminPass("");
      setConfirmationResult(null);
      setAdminError("");
    }
  };

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>Đăng nhập</h1>

        {!role ? (
          <>
            <p className="choose-role-text">Chọn loại tài khoản:</p>
            <button onClick={() => setRole("user")}>Người dùng</button>
            <button onClick={() => setRole("admin")}>Quản trị viên (Admin)</button>
          </>
        ) : role === "user" ? (
          <>
            <h3 style={{ textAlign: "center", marginTop: "10px" }}>Đăng nhập bằng số điện thoại</h3>

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
                <button onClick={handleUserContinue}>Gửi mã OTP</button>
                <div id="recaptcha-container"></div>
              </>
            ) : (
              <>
                <p className="otp-info">
                  Mã OTP đã gửi tới <b>{phone}</b>
                </p>
                <div className="loginsignup-fields">
                  <input
                    type="text"
                    placeholder="Nhập OTP (6 chữ số)"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                  />
                </div>
                <button onClick={handleUserContinue}>Xác nhận OTP</button>
              </>
            )}

            <button className="back-btn" onClick={handleBack}>
              ← Quay lại
            </button>
          </>
        ) : (
          <>
            <h3 style={{ textAlign: "center", marginTop: "10px" }}>Đăng nhập Quản trị viên</h3>
            <div className="loginsignup-fields">
              <input
                type="text"
                placeholder="Tên đăng nhập"
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

            {adminError && <p style={{ color: "red", marginBottom: "8px" }}>{adminError}</p>}

            <button onClick={handleAdminLogin} disabled={adminLoading}>
              {adminLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
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
