import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, User, CreditCard, Truck, Calendar, Clock, Check, Mail, Zap } from 'lucide-react';
import { CartContext } from "../Context/CartContext";
import { ShopContext } from "../Context/ShopContext";
import { ImageWithFallback } from '../Components/figma/ImageWithFallback.tsx';
import AddressSelector from "../Components/AddressSelector/AddressSelector";
import LoadingOverlay from "../Components/LoadingOverlay/LoadingOverlay";

import { createOrder } from "../api/orderService";
import { getPublicIp } from "../api/getPublicIp";
import { geocodeAddress } from "../api/geocodeService";
import { getUserById } from "../api/userService";
import { vnd } from "../utils/currencyUtils";

import './CSS/Checkout.css';

import COD_light from "../assets/COD_light.png";
import VNPAYLogo from "../assets/Logo-VNPAY-QR.png";

const STORE_COORDS = { lat: 10.762622, lon: 106.660172 };

const haversineKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function Checkout() {
  const navigate = useNavigate();
  const { userId } = useContext(ShopContext);
  const { 
    cartItems, 
    productsLookup, 
    cartTotalItems, 
    resetCart, 
    appliedVoucher 
  } = useContext(CartContext);

  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    addressDetail: '',
    note: ''
  });
  
  const [addressObj, setAddressObj] = useState(null);
  
  const [shippingFee, setShippingFee] = useState(0);
  const [lastLocationKey, setLastLocationKey] = useState(null);
  
  const [paymentMethod, setPaymentMethod] = useState('CASH'); 
  const [deliveryTime, setDeliveryTime] = useState('asap');
  const [customTime, setCustomTime] = useState('');
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadUserData = async () => {
        try {
            const rawInfo = localStorage.getItem("userInfo") || "{}";
            const info = JSON.parse(rawInfo);
            let user = info?.user || info;

            const currentUserId = userId || user?._id || user?.id;
            if (currentUserId) {
                const res = await getUserById(currentUserId);
                if (res && res.success && res.data) {
                    user = res.data;
                }
            }

            if (user) {
                let formattedPhone = user.phoneNumber || "";
                if (formattedPhone.startsWith("+84")) {
                    formattedPhone = formattedPhone.replace("+84", "0");
                }

                setFormData(prev => ({
                    ...prev,
                    fullName: user.displayName || prev.fullName,
                    phone: formattedPhone || prev.phone,
                    email: user.email || prev.email,
                }));

                if (user.address && typeof user.address === 'object') {
                    if (user.address.provinceCode) {
                        setAddressObj({
                            province: { code: user.address.provinceCode, name: user.address.provinceName },
                            district: { code: user.address.districtCode, name: user.address.districtName },
                            ward: { code: user.address.wardCode, name: user.address.wardName },
                            houseNumber: user.address.street
                        });
                        setFormData(prev => ({ ...prev, addressDetail: user.address.street || "" }));
                    }
                }
            }
        } catch (e) {
            console.warn(e);
        }
    };

    loadUserData();
  }, [userId]);

  useEffect(() => {
    const addr = addressObj;
    if (!addr) return;
    const provCode = addr.province?.code;
    const distCode = addr.district?.code;
    const wardCode = addr.ward?.code;
    
    if (!(provCode && distCode && wardCode)) return;
    
    const key = `${provCode}-${distCode}-${wardCode}`;
    if (key === lastLocationKey) return;
    setLastLocationKey(key);

    (async () => {
      try {
        const q = `${addr.houseNumber || ""} ${addr.ward?.name || ""} ${addr.district?.name || ""} ${addr.province?.name || ""}`.trim();
        const coords = await geocodeAddress(q);
        if (coords) {
          const distKm = haversineKm(STORE_COORDS.lat, STORE_COORDS.lon, coords.lat, coords.lon);
          let fee = 30000;
          if (distKm <= 5) fee = 25000;
          else if (distKm <= 15) fee = 20000;
          else if (distKm <= 30) fee = 25000;
          
          setShippingFee(fee);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [addressObj, lastLocationKey]);

  const displayItems = Object.values(cartItems).map(item => {
    const productInfo = productsLookup[item.productId];
    const computed = item.computedPrice || {};
    const quantity = Number(item.quantity) || 1;
    
    const lineTotal = computed.totalForItemPrice !== undefined 
                      ? Number(computed.totalForItemPrice) 
                      : (Number(item.price) || 0) * quantity;

    return {
      ...item,
      id: item.productId,
      name: item.productName || productInfo?.name || "Đang tải...",
      image: item.productImageUrl || productInfo?.imageInfo?.url || "",
      originalPrice: productInfo?.originalPrice,
      price: item.price,
      computedPrice: computed,
      lineTotal: lineTotal,
      quantity: quantity
    };
  });

  const subtotal = displayItems.reduce((acc, item) => acc + item.lineTotal, 0);

  const calculateDiscount = () => {
    if (!appliedVoucher) return 0;
    if (appliedVoucher.discountType === "percentage") {
      return (subtotal * appliedVoucher.discountValue / 100);
    } else if (appliedVoucher.discountType === "fixed") {
      return Math.min(subtotal, appliedVoucher.discountValue);
    }
    return 0;
  };
  const discountAmount = calculateDiscount();
  const total = subtotal + shippingFee - discountAmount;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
    if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) newErrors.phone = 'SĐT không hợp lệ';
    
    if (!addressObj || !addressObj.province || !addressObj.district || !addressObj.ward) {
        newErrors.address = 'Vui lòng chọn đầy đủ địa chỉ';
    }
    if (!formData.addressDetail.trim()) newErrors.addressDetail = 'Vui lòng nhập số nhà/tên đường';

    if (deliveryTime === 'custom' && !customTime) newErrors.customTime = 'Vui lòng chọn giờ';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (cartTotalItems === 0) {
        alert("Giỏ hàng trống!");
        return;
    }

    setLoading(true);
    
    const fullAddressString = `${formData.addressDetail}, ${addressObj.ward.name}, ${addressObj.district.name}, ${addressObj.province.name}`;
    
    const productsInfo = displayItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        productName: item.name,
        productImageUrl: item.image
    }));

    try {
        const userPublicIp = await getPublicIp();
        
        const shippingAddressInfo = {
            displayName: formData.fullName,
            phoneNumber: formData.phone,
            provinceCode: addressObj.province.code,
            districtCode: addressObj.district.code,
            wardCode: addressObj.ward.code,
            provinceName: addressObj.province.name,
            districtName: addressObj.district.name,
            wardName: addressObj.ward.name,
            street: formData.addressDetail,
            note: formData.note
        };

        const payload = {
            userId: userId,
            paymentMethod: paymentMethod,
            productsInfo: productsInfo,
            voucherCode: appliedVoucher?.code || null,
            ipAddr: userPublicIp,
            shippingFee: shippingFee,
            shippingAddressInfo: shippingAddressInfo,
            shippingAddressString: fullAddressString,
            contactName: formData.fullName,
            contactPhone: formData.phone,
            contactEmail: formData.email
        };

        const res = await createOrder(payload);
        
        if (paymentMethod === "VNBANK" || paymentMethod === "INTCARD") {
            const paymentUrl = res.data?.newPayment?.paymentUrl;
            if (paymentUrl) window.location.href = paymentUrl;
        } else {
            alert('Đặt hàng thành công! Cảm ơn bạn đã mua sắm.');
            resetCart();
            navigate('/'); 
        }

    } catch (error) {
        console.error("Order failed:", error);
        alert("Đặt hàng thất bại. Vui lòng thử lại.");
    } finally {
        setLoading(false);
    }
  };

  if (cartTotalItems === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="empty-checkout">
            <h2>Giỏ hàng trống</h2>
            <p>Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán</p>
            <button onClick={() => navigate('/')} className="back-home-btn">
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {loading && <LoadingOverlay />}
      
      <div className="container">
        <button onClick={() => navigate('/cart')} className="back-button">
          <ArrowLeft className="icon" /> Quay lại giỏ hàng
        </button>

        <h1 className="page-title">Thanh toán</h1>

        <div className="checkout-content">
          <form onSubmit={handleSubmit} className="checkout-form">
            
            <div className="form-section">
              <h2 className="section-title">
                <MapPin className="section-icon" /> Thông tin giao hàng
              </h2>
              
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="fullName"><User className="label-icon" /> Họ và tên <span className="required">*</span></label>
                  <input
                    type="text" name="fullName" id="fullName"
                    value={formData.fullName} onChange={handleInputChange}
                    placeholder="Nhập họ và tên"
                    className={errors.fullName ? 'error' : ''}
                  />
                  {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone"><Phone className="label-icon" /> Số điện thoại <span className="required">*</span></label>
                  <input
                    type="tel" name="phone" id="phone"
                    value={formData.phone} onChange={handleInputChange}
                    placeholder="Nhập số điện thoại"
                    className={errors.phone ? 'error' : ''}
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email"><Mail className="label-icon" /> Email</label>
                  <input
                    type="email" name="email" id="email"
                    value={formData.email} onChange={handleInputChange}
                    placeholder="Nhập email (để nhận hóa đơn)"
                  />
                </div>

                <div className="form-group full-width">
                    <label><MapPin className="label-icon" /> Địa chỉ (Tỉnh - Huyện - Xã) <span className="required">*</span></label>
                    <div className={errors.address ? 'selector-error' : ''}>
                        <AddressSelector value={addressObj} onChange={setAddressObj} />
                    </div>
                    {errors.address && <span className="error-message">{errors.address}</span>}
                </div>

                <div className="form-group full-width">
                  <label htmlFor="addressDetail">Số nhà, tên đường <span className="required">*</span></label>
                  <input
                    type="text" name="addressDetail" id="addressDetail"
                    value={formData.addressDetail} onChange={handleInputChange}
                    placeholder="Ví dụ: 123 Nguyễn Văn Linh"
                    className={errors.addressDetail ? 'error' : ''}
                  />
                  {errors.addressDetail && <span className="error-message">{errors.addressDetail}</span>}
                </div>

                <div className="form-group full-width">
                  <label htmlFor="note">Ghi chú</label>
                  <textarea
                    name="note" id="note" rows="2"
                    value={formData.note} onChange={handleInputChange}
                    placeholder="Ghi chú về đơn hàng (tùy chọn)"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2 className="section-title">
                <Truck className="section-icon" /> Thời gian giao hàng
              </h2>
              
              <div className="delivery-options">
                <label className={`delivery-option ${deliveryTime === 'asap' ? 'selected' : ''}`}>
                  <input type="radio" name="deliveryTime" value="asap" checked={deliveryTime === 'asap'} onChange={(e) => setDeliveryTime(e.target.value)} />
                  <div className="option-content">
                    <Clock className="option-icon" />
                    <div><h4>Giao ngay</h4><p>Trong vòng 1-2 giờ</p></div>
                  </div>
                  {deliveryTime === 'asap' && <Check className="check-icon" />}
                </label>

                <label className={`delivery-option ${deliveryTime === 'custom' ? 'selected' : ''}`}>
                  <input type="radio" name="deliveryTime" value="custom" checked={deliveryTime === 'custom'} onChange={(e) => setDeliveryTime(e.target.value)} />
                  <div className="option-content">
                    <Calendar className="option-icon" />
                    <div><h4>Chọn giờ giao</h4><p>Tùy chỉnh thời gian</p></div>
                  </div>
                  {deliveryTime === 'custom' && <Check className="check-icon" />}
                </label>

                {deliveryTime === 'custom' && (
                  <div className="custom-time-input">
                    <input
                      type="datetime-local"
                      value={customTime}
                      onChange={(e) => setCustomTime(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className={errors.customTime ? 'error' : ''}
                    />
                    {errors.customTime && <span className="error-message">{errors.customTime}</span>}
                  </div>
                )}
              </div>
            </div>

            <div className="form-section">
              <h2 className="section-title">
                <CreditCard className="section-icon" /> Phương thức thanh toán
              </h2>
              <div className="payment-options">
                <label className={`payment-option ${paymentMethod === 'CASH' ? 'selected' : ''}`}>
                  <input type="radio" name="paymentMethod" value="CASH" checked={paymentMethod === 'CASH'} onChange={(e) => setPaymentMethod(e.target.value)} />
                  <div className="option-content">
                    <div className="payment-icon"><img src={COD_light} alt="COD" style={{width: 32}}/></div>
                    <div><h4>Tiền mặt (COD)</h4><p>Thanh toán khi nhận hàng</p></div>
                  </div>
                  {paymentMethod === 'CASH' && <Check className="check-icon" />}
                </label>

                <label className={`payment-option ${paymentMethod === 'VNBANK' ? 'selected' : ''}`}>
                  <input type="radio" name="paymentMethod" value="VNBANK" checked={paymentMethod === 'VNBANK'} onChange={(e) => setPaymentMethod(e.target.value)} />
                  <div className="option-content">
                    <div className="payment-icon"><img src={VNPAYLogo} alt="VNPAY" style={{width: 32}}/></div>
                    <div><h4>VNPAY QR</h4><p>Quét mã qua ứng dụng ngân hàng</p></div>
                  </div>
                  {paymentMethod === 'VNBANK' && <Check className="check-icon" />}
                </label>

                <label className={`payment-option ${paymentMethod === 'INTCARD' ? 'selected' : ''}`}>
                  <input type="radio" name="paymentMethod" value="INTCARD" checked={paymentMethod === 'INTCARD'} onChange={(e) => setPaymentMethod(e.target.value)} />
                  <div className="option-content">
                    <div className="payment-icon">💳</div>
                    <div><h4>Thẻ quốc tế</h4><p>Visa, Mastercard, JCB</p></div>
                  </div>
                  {paymentMethod === 'INTCARD' && <Check className="check-icon" />}
                </label>
              </div>
            </div>
          </form>

          <div className="checkout-sidebar">
            <div className="order-summary">
              <h2>Đơn hàng của bạn</h2>
              <div className="order-items">
                {displayItems.map((item) => (
                  <div key={item.id} className="order-item">
                    <div className="item-image-wrapper">
                      <ImageWithFallback src={item.image} alt={item.name} className="item-image" />
                      <span className="item-quantity">{item.quantity}</span>
                    </div>
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p className="item-price">
                        {item.computedPrice?.flashQty > 0 ? (
                           <span style={{color: '#eab308', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 'bold'}}>
                              <Zap size={12} fill="#eab308"/> {vnd(item.lineTotal)}
                           </span>
                        ) : (
                           vnd(item.lineTotal)
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-totals">
                <div className="total-row">
                  <span>Tạm tính</span>
                  <span>{vnd(subtotal)}</span>
                </div>
                {appliedVoucher && (
                  <div className="total-row discount-row">
                    <span>Voucher ({appliedVoucher.code})</span>
                    <span className="discount-amount">-{vnd(discountAmount)}</span>
                  </div>
                )}
                <div className="total-row">
                  <span>Phí vận chuyển</span>
                  <span className={shippingFee === 0 ? 'free-text' : ''}>
                    {shippingFee === 0 ? 'Miễn phí' : vnd(shippingFee)}
                  </span>
                </div>
                <div className="total-row grand-total">
                  <span>Tổng cộng</span>
                  <span className="total-amount">{vnd(total)}</span>
                </div>
              </div>

              <button type="button" onClick={handleSubmit} className="submit-order-btn">
                <Check className="btn-icon" /> Xác nhận đặt hàng
              </button>

              <div className="security-info">
                <div className="security-item">
                  <span className="security-icon"></span><span>Thanh toán an toàn & bảo mật</span>
                </div>
                <div className="security-item">
                  <span className="security-icon">✓</span><span>Hoàn tiền 100% nếu không hài lòng</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}