import React, { useState } from "react";
import "./CSS/LoginSignup.css";
import { auth } from "../firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import AddressSelector from "../Components/AddressSelector/AddressSelector";
import { editAddress } from "../api/userService";

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

  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [fullName, setFullName] = useState("");
  // addressObj shape: { province, district, ward, houseNumber }
  const [addressObj, setAddressObj] = useState(null);

  const handleSaveProfile = async () => {
    if (!fullName || !addressObj) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const token = localStorage.getItem("userToken");
    // Build a human readable address string as fallback for older backends
    const addressString = `${addressObj.houseNumber || ""}, ${addressObj.ward?.name || ""} - ${addressObj.district?.name || ""} - ${addressObj.province?.name || ""}`;

    const payload = {
      fullName,
      address: addressObj,
      addressString,
    };

    try {
      // Call server API to update profile/address
      await editAddress(payload);

      // Update localStorage to reflect new info for Navbar and Checkout
      try {
        const old = JSON.parse(localStorage.getItem("userInfo") || "{}");
        const updated = {
          ...old,
          user: {
            ...(old?.user || {}),
            displayName: fullName,
            address: payload.address,
            addressString,
          },
        };
        localStorage.setItem("userInfo", JSON.stringify(updated));
        localStorage.setItem("userAddress", JSON.stringify(payload.address));
        window.dispatchEvent(new Event("auth-changed"));
      } catch (e) {
        console.warn("Failed to update localStorage after editAddress", e);
      }

      alert("Cập nhật thông tin thành công!");
      setShowProfilePopup(false);
      window.location.href = "/";
    } catch (e) {
      console.error(e);
      alert("Lỗi khi cập nhật hồ sơ: " + (e.message || ""));
    }
  };

  // --- Setup Recaptcha ---
  const setupRecaptcha = () => {
    if (!recaptchaVerifier) {
      recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => console.log("reCAPTCHA passed"),
        "expired-callback": () => console.warn("reCAPTCHA expired"),
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

      if (!/^(\+84|0)\d{8,9}$/.test(phone.trim())) {
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

        console.log("🪪 Firebase ID Token:", idToken);
        console.log("📱 Phone number:", user.phoneNumber);
        console.log("👤 UID:", user.uid);
        console.log("⏱ Token expires at:", new Date(user.stsTokenManager.expirationTime));

        alert(`🎉 Đăng nhập thành công: ${user.phoneNumber}`);

        const payload = {
          phoneNumber: user.phoneNumber,
          idToken,
          displayName: user.displayName || "",
          address: "",
        };

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

          // Cho UI (Navbar...) cập nhật ngay
          window.dispatchEvent(new Event("auth-changed"));

          // user mới thì hiện popup nhập thông tin
          if (json.data?.isNewUser) {
            setShowProfilePopup(true);
          } else {
            alert("✅ Đăng nhập thành công!");
            window.location.href = "/";
          }
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

      const payload = { username: adminCode, password: adminPass };

      const res = await fetch("https://www.bachkhoaxanh.xyz/user/admin/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      console.log("🔐 Admin auth response:", json);

      if (json.success) {
        // Luôn lưu token truthy để guard không fail nếu server trả "" (edge case)
        localStorage.setItem("adminToken", json.data?.token ?? "admin-session");
        localStorage.setItem("admin", JSON.stringify({ role: "admin", username: adminCode }));

        // Báo UI cập nhật ngay (AdminNavbar, guard…)
        window.dispatchEvent(new Event("auth-changed"));

        alert("✅ Đăng nhập thành công (Admin)");
        // Admin vẫn xem được store như user (public routes).
        // Chuyển thẳng vào dashboard admin:
        window.location.href = "/admin/dashboard";
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

      {/* Popup yêu cầu hoàn thiện thông tin */}
      {showProfilePopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Hoàn thiện thông tin cá nhân</h2>
            <p>Vui lòng nhập đầy đủ thông tin trước khi tiếp tục</p>
            <input
              type="text"
              placeholder="Họ và tên"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <div style={{ marginTop: 8 }}>
              <AddressSelector value={addressObj} onChange={(addr) => setAddressObj(addr)} />
            </div>
            <button onClick={handleSaveProfile}>Lưu thông tin</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginSignup;
