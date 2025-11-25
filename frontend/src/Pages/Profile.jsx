import React, { useEffect, useState } from "react";
import "./CSS/Profile.css";
import AddressSelector from "../Components/AddressSelector/AddressSelector";
import { editName, editEmail, editAddress } from "../api/userService";

const Profile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [editingAddress, setEditingAddress] = useState(false);

  // local editable fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressObj, setAddressObj] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("userInfo") || "{}";
      const info = JSON.parse(raw);
      setUserInfo(info);
      const u = info?.user || info || {};
      setName(u.displayName || "");
      setEmail(u.email || "");
      setPhone(u.phoneNumber || "");
      setAddressObj(u.address || JSON.parse(localStorage.getItem("userAddress") || "null") || null);
    } catch (e) {
      console.warn("Profile: failed to parse localStorage userInfo", e);
    }
  }, []);

  const saveName = async () => {
    if (!name) return alert("Tên không được để trống");
    try {
      await editName({ fullName: name });
      // update localStorage
      const raw = localStorage.getItem("userInfo") || "{}";
      const info = JSON.parse(raw);
      const u = info?.user || info || {};
      u.displayName = name;
      const updated = { ...info, user: u };
      localStorage.setItem("userInfo", JSON.stringify(updated));
      // also sync name into userAddress so checkout can use it directly
      try {
        const addrRaw = localStorage.getItem("userAddress");
        const addr = addrRaw ? JSON.parse(addrRaw) : {};
        addr.contactName = name;
        localStorage.setItem("userAddress", JSON.stringify(addr));
      } catch {}
      setUserInfo(updated);
      window.dispatchEvent(new Event("auth-changed"));
      alert("Cập nhật tên thành công");
    } catch (e) {
      console.error("saveName failed", e);
      // Fallback: persist locally so Checkout can use the updated name
      try {
        const raw = localStorage.getItem("userInfo") || "{}";
        const info = JSON.parse(raw);
        const u = info?.user || info || {};
        u.displayName = name;
        const updated = { ...info, user: u };
        localStorage.setItem("userInfo", JSON.stringify(updated));
        const addrRaw = localStorage.getItem("userAddress");
        const addr = addrRaw ? JSON.parse(addrRaw) : {};
        addr.contactName = name;
        localStorage.setItem("userAddress", JSON.stringify(addr));
        setUserInfo(updated);
        window.dispatchEvent(new Event("auth-changed"));
      } catch (err) {
        console.error("saveName: local fallback failed", err);
      }
      alert("Lưu cục bộ tên thành công (API thất bại)");
    }
  };

  const saveEmail = async () => {
    if (!email) return alert("Email không được để trống");
    try {
      await editEmail({ email });
      const raw = localStorage.getItem("userInfo") || "{}";
      const info = JSON.parse(raw);
      const u = info?.user || info || {};
      u.email = email;
      const updated = { ...info, user: u };
      localStorage.setItem("userInfo", JSON.stringify(updated));
      // also sync email into userAddress for checkout if desired
      try {
        const addrRaw = localStorage.getItem("userAddress");
        const addr = addrRaw ? JSON.parse(addrRaw) : {};
        addr.contactEmail = email;
        localStorage.setItem("userAddress", JSON.stringify(addr));
      } catch {}
      setUserInfo(updated);
      alert("Cập nhật email thành công");
    } catch (e) {
      console.error("saveEmail failed", e);
      // Fallback: persist locally so Checkout can use new email
      try {
        const raw = localStorage.getItem("userInfo") || "{}";
        const info = JSON.parse(raw);
        const u = info?.user || info || {};
        u.email = email;
        const updated = { ...info, user: u };
        localStorage.setItem("userInfo", JSON.stringify(updated));
        const addrRaw = localStorage.getItem("userAddress");
        const addr = addrRaw ? JSON.parse(addrRaw) : {};
        addr.contactEmail = email;
        localStorage.setItem("userAddress", JSON.stringify(addr));
        setUserInfo(updated);
      } catch (err) {
        console.error("saveEmail: local fallback failed", err);
      }
      alert("Lưu cục bộ email thành công (API thất bại)");
    }
  };

  const saveAddress = async () => {
    if (!addressObj || !addressObj.province || !addressObj.district || !addressObj.ward) {
      return alert("Vui lòng chọn đầy đủ Tỉnh/Quận/Phường trước khi lưu địa chỉ");
    }
    try {
      const addressString = `${addressObj.houseNumber || ""}, ${addressObj.ward?.name || ""} - ${addressObj.district?.name || ""} - ${addressObj.province?.name || ""}`;
      await editAddress({ fullName: name, address: addressObj, addressString });
      // update localstorage
      const raw = localStorage.getItem("userInfo") || "{}";
      const info = JSON.parse(raw);
      const u = info?.user || info || {};
      u.address = addressObj;
      u.addressString = addressString;
      const updated = { ...info, user: u };
      localStorage.setItem("userInfo", JSON.stringify(updated));
      // save address plus contact info so checkout can use it
      try {
        const savedAddr = { ...addressObj, contactName: name, contactPhone: phone, contactEmail: email };
        localStorage.setItem("userAddress", JSON.stringify(savedAddr));
      } catch {}
      setUserInfo(updated);
      setEditingAddress(false);
      window.dispatchEvent(new Event("auth-changed"));
      alert("Cập nhật địa chỉ thành công");
    } catch (e) {
      console.error("saveAddress failed", e);
      // Fallback: still save locally so checkout can use address
      try {
        const addressString = `${addressObj.houseNumber || ""}, ${addressObj.ward?.name || ""} - ${addressObj.district?.name || ""} - ${addressObj.province?.name || ""}`;
        const raw = localStorage.getItem("userInfo") || "{}";
        const info = JSON.parse(raw);
        const u = info?.user || info || {};
        u.address = addressObj;
        u.addressString = addressString;
        const updated = { ...info, user: u };
        localStorage.setItem("userInfo", JSON.stringify(updated));
        const savedAddr = { ...addressObj, contactName: name, contactPhone: phone, contactEmail: email };
        localStorage.setItem("userAddress", JSON.stringify(savedAddr));
        setUserInfo(updated);
        setEditingAddress(false);
        window.dispatchEvent(new Event("auth-changed"));
      } catch (err) {
        console.error("saveAddress: local fallback failed", err);
      }
      alert("Lưu cục bộ địa chỉ thành công (API thất bại)");
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h2>Thông tin cá nhân</h2>

        <div className="row">
          <label>Họ và tên</label>
          <div className="row-inline">
            <input value={name} onChange={(e) => setName(e.target.value)} />
            <button onClick={saveName}>Lưu</button>
          </div>
        </div>

        <div className="row">
          <label>Email</label>
          <div className="row-inline">
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
            <button onClick={saveEmail}>Lưu</button>
          </div>
        </div>

        <div className="row">
          <label>Số điện thoại</label>
          <div className="readonly-field">{phone || "Chưa có số điện thoại"}</div>
        </div>

        <div className="row">
          <label>Địa chỉ</label>
          <div className="address-summary">
            <div>{userInfo?.user?.addressString || userInfo?.addressString || "Chưa có địa chỉ"}</div>
            <button onClick={() => setEditingAddress(true)}>Chỉnh sửa địa chỉ</button>
          </div>
        </div>
      </div>

      {editingAddress && (
        <div className="profile-modal">
          <div className="profile-modal-body">
            <h3>Địa chỉ mới (dùng thông tin trước sẵn có)</h3>
            <div className="modal-row">
              <AddressSelector value={addressObj} onChange={(addr) => setAddressObj(addr)} />
            </div>
            <div className="modal-actions">
              <button onClick={() => setEditingAddress(false)}>Hủy</button>
              <button onClick={saveAddress}>Hoàn thành</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
