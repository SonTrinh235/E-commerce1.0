import React, { useEffect, useState } from "react";
import "./CSS/Profile.css";
import AddressSelector from "../Components/AddressSelector/AddressSelector";
import { editName, editEmail, editAddress } from "../api/userService";

const Profile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [editingAddress, setEditingAddress] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  const [addressObj, setAddressObj] = useState(null);

  const mapApiAddressToSelectorState = (apiAddress) => {
    if (!apiAddress) return null;
    return {
        houseNumber: apiAddress.street || "", 
        province: { 
            code: apiAddress.provinceCode, 
            name: apiAddress.provinceName 
        },
        district: { 
            code: apiAddress.districtCode, 
            name: apiAddress.districtName 
        },
        ward: { 
            code: apiAddress.wardCode, 
            name: apiAddress.wardName 
        }
    };
  };

  const renderAddressString = (addr) => {
    if (!addr) return "Chưa có địa chỉ";
    
    const street = addr.street || "";
    const ward = addr.wardName || "";
    const district = addr.districtName || "";
    const province = addr.provinceName || "";
    
    return [street, ward, district, province].filter(Boolean).join(", ");
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem("userInfo") || "{}";
      const info = JSON.parse(raw);
      setUserInfo(info);
      
      const u = info?.user || info || {};
      setName(u.displayName || "");
      setEmail(u.email || "");
      setPhone(u.phoneNumber || "");

      if (u.address) {
        setAddressObj(mapApiAddressToSelectorState(u.address));
      } else {
        setAddressObj(JSON.parse(localStorage.getItem("userAddress") || "null") || null);
      }
    } catch (e) {
      console.warn("Profile: failed to parse localStorage userInfo", e);
    }
  }, []);

  const saveName = async () => {
    if (!name) return alert("Tên không được để trống");
    try {
      await editName({ displayName: name }); 
      
      const raw = localStorage.getItem("userInfo") || "{}";
      const info = JSON.parse(raw);
      const u = info?.user || info || {};
      u.displayName = name;
      const updated = { ...info, user: u };
      
      localStorage.setItem("userInfo", JSON.stringify(updated));
      setUserInfo(updated);
      window.dispatchEvent(new Event("auth-changed"));
      alert("Cập nhật tên thành công");
    } catch (e) {
      console.error("saveName failed", e);
      alert("Lỗi khi cập nhật tên");
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
      setUserInfo(updated);
      alert("Cập nhật email thành công");
    } catch (e) {
      console.error("saveEmail failed", e);
      alert("Lỗi khi cập nhật email");
    }
  };

  const saveAddress = async () => {
    if (!addressObj || !addressObj.province || !addressObj.district || !addressObj.ward) {
      return alert("Vui lòng chọn đầy đủ Tỉnh/Quận/Phường trước khi lưu địa chỉ");
    }
    
    const addressString = renderAddressString({
        street: addressObj.houseNumber,
        wardName: addressObj.ward.name,
        districtName: addressObj.district.name,
        provinceName: addressObj.province.name,
    });
    
    try {
      await editAddress({ 
        fullName: name, 
        address: addressString 
      }); 

      const flatApiAddress = {
        street: addressObj.houseNumber || "",
        provinceCode: addressObj.province.code, 
        districtCode: addressObj.district.code,
        wardCode: addressObj.ward.code,
        provinceName: addressObj.province.name,
        districtName: addressObj.district.name,
        wardName: addressObj.ward.name
      };
      
      const raw = localStorage.getItem("userInfo") || "{}";
      const info = JSON.parse(raw);
      const u = info?.user || info || {};
      
      u.address = flatApiAddress;
      
      const updated = { ...info, user: u };
      localStorage.setItem("userInfo", JSON.stringify(updated));

      try {
        const savedAddr = { 
          ...addressObj, 
          ...flatApiAddress,
          contactName: name, 
          contactPhone: phone, 
          contactEmail: email 
        };
        localStorage.setItem("userAddress", JSON.stringify(savedAddr));
      } catch {}

      setUserInfo(updated);
      setEditingAddress(false);
      window.dispatchEvent(new Event("auth-changed"));
      alert("Cập nhật địa chỉ thành công");
      
    } catch (e) {
      console.error("saveAddress failed", e);
      alert("Lưu địa chỉ thất bại (Lỗi API)");
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
            <div>{renderAddressString(userInfo?.user?.address)}</div> 
            <button onClick={() => setEditingAddress(true)}>Chỉnh sửa địa chỉ</button>
          </div>
        </div>
      </div>

      {editingAddress && (
        <div className="profile-modal">
          <div className="profile-modal-body">
            <h3>Địa chỉ mới (thông tin cũ được tải sẵn)</h3>
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