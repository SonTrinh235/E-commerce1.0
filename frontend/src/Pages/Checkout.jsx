import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../Context/ShopContext";
import { CartContext } from "../Context/CartContext";
import CheckoutOrderPreview from "../Components/CheckoutOrderPreview/CheckoutOrderPreview.jsx";
import "./CSS/Checkout.css";
import COD_light from "../assets/COD_light.png";
import VNPAYLogo from "../assets/Logo-VNPAY-QR.png";
import DefaultImage from "../assets/placeholder-image.png";

import { vnd } from "../utils/currencyUtils.js";
import AddressSelector from "../Components/AddressSelector/AddressSelector";
import { geocodeAddress } from "../api/geocodeService";

// import APIs
import { createOrder } from "../api/orderService.js";
import { getPublicIp } from "../api/getPublicIp.js";
import { editAddress } from "../api/userService";
import LoadingOverlay from "../Components/LoadingOverlay/LoadingOverlay.jsx";

const Checkout = () => {
  const [loading, setLoading] = useState(false);
  const { userId } = useContext(ShopContext);

  const {
    isCartLoading,
    cartTotal,
    cartItems,
    cartTotalItems,
    productsLookup,
    appliedVoucher,
    resetCart,
  } = useContext(CartContext);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  // Address selector state
  const [addressObj, setAddressObj] = useState(null);

  // Shipping fee state
  const [shippingFee, setShippingFee] = useState(0);
  const [lastLocationKey, setLastLocationKey] = useState(null);

  // Load address from localStorage on mount
  useEffect(() => {
    try {
      // Prefer locally saved checkout address override
      const uaRaw = localStorage.getItem("userAddress");
      const ua = uaRaw ? JSON.parse(uaRaw) : null;
      if (ua) {
        setAddressObj(ua);
        const addressString = `${ua.houseNumber || ""}, ${ua.ward?.name || ""} - ${ua.district?.name || ""} - ${ua.province?.name || ""}`.trim();
        setFormData(prev => ({ ...prev, address: addressString, name: ua.contactName || prev.name, email: ua.contactEmail || prev.email, phone: ua.contactPhone || prev.phone }));
      } else {
        const raw = localStorage.getItem("userInfo") || "{}";
        const info = JSON.parse(raw);
        const addr = info?.user?.address;
        if (addr) {
          setAddressObj(addr);
          const addressString = `${addr.houseNumber || ""}, ${addr.ward?.name || ""} - ${addr.district?.name || ""} - ${addr.province?.name || ""}`.trim();
          setFormData(prev => ({ ...prev, address: addressString }));
        }
        if (info?.user) {
          setFormData(prev => ({ ...prev, name: info.user.displayName || prev.name, email: info.user.email || prev.email, phone: info.user.phoneNumber || prev.phone }));
        }
      }
    } catch (e) {
      console.warn("Failed to load address from localStorage", e);
    }
  }, []);

  // Update formData.address when addressObj changes
  useEffect(() => {
    if (addressObj) {
      const addressString = `${addressObj.houseNumber || ""}, ${addressObj.ward?.name || ""} - ${addressObj.district?.name || ""} - ${addressObj.province?.name || ""}`.trim();
      setFormData(prev => ({ ...prev, address: addressString }));
    }
  }, [addressObj]);


  // Store coordinates for the shop (store origin) — adjust to your actual store location
  const STORE_COORDS = { lat: 10.762622, lon: 106.660172 };

  // Haversine distance (km)
  const haversineKm = (lat1, lon1, lat2, lon2) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // When province/district/ward change (codes), geocode and compute shippingFee
  useEffect(() => {
    const addr = addressObj;
    if (!addr) return;
    const provCode = addr.province?.code || "";
    const distCode = addr.district?.code || "";
    const wardCode = addr.ward?.code || "";
    // only proceed if we have the three codes
    if (!(provCode && distCode && wardCode)) return;
    const key = `${provCode}-${distCode}-${wardCode}`;
    if (key === lastLocationKey) return; // don't re-call if same codes
    setLastLocationKey(key);

    (async () => {
      try {
        const q = `${addr.houseNumber || ""} ${addr.ward?.name || ""} ${addr.district?.name || ""} ${addr.province?.name || ""}`.trim();
        const coords = await geocodeAddress(q);
        if (coords) {
          // save coords locally
          localStorage.setItem("userAddressCoords", JSON.stringify(coords));
          // compute distance to store
          const distKm = haversineKm(STORE_COORDS.lat, STORE_COORDS.lon, coords.lat, coords.lon);
          let fee = 30000;
          if (distKm <= 5) fee = 15000;
          else if (distKm <= 15) fee = 20000;
          else if (distKm <= 30) fee = 25000;
          else fee = 30000;
          setShippingFee(fee);
        }
      } catch (e) {
        console.error("Failed to geocode and compute shipping fee", e);
      }
    })();
  }, [addressObj]);

  const orderContent = Object.values(cartItems).map(cartItem => {
    // strip key "order"
    const { order, ...restOfCartItem } = cartItem;

    const productId = cartItem.productId;
    const productInfo = productsLookup[productId];

    return {
      ...restOfCartItem, // Spread all existing cart item properties
      productName: productInfo?.name || null,  // Add prod name from the lookup
      productImageUrl: productInfo?.imageInfo?.url || null // Add imageInfo from the lookup

    };
  });

  const SHIPPING_FEE = shippingFee || 0;

    const calculateDiscountAmount = () => {
    if (!appliedVoucher) return 0;

    const voucherType = appliedVoucher.discountType;
    const voucherValue = appliedVoucher.discountValue;
    const subtotal = cartTotal;

    if (voucherType === "percentage") {
      return (subtotal * voucherValue/100);
    } else if (voucherType === "fixed") {
      return Math.min(subtotal, voucherValue);
    }
    return 0;
  };

  const getShippingFee = () => {
    return SHIPPING_FEE;
  };

  const getFinalTotal = () => {
    const subtotal = cartTotal;
    const discount = calculateDiscountAmount();
    // const shippingFee = getShippingFee();
    return subtotal - discount + SHIPPING_FEE;
  };


  // Snapshots to display order preview upon order create
  const [orderSnapshot, setOrderSnapshot] = useState(null);
  const [orderLookupSnapshot, setOrderLookupSnapshot] = useState(null);
  const [orderTotalItemSnapshot, setOrderTotalItemSnapshot] = useState(null);
  const [orderTotalSnapshot, setOrderTotalSnapshot] = useState(null);

  const captureOrderSnapshot = () => {
    setOrderSnapshot(orderContent);
    setOrderLookupSnapshot(productsLookup);
    setOrderTotalItemSnapshot(cartTotalItems);
    setOrderTotalSnapshot(getFinalTotal());
  };

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("CASH");

  const [showOrderPreview, setShowOrderPreview] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!true) {
      alert("Your cart is empty!");
      return;
    }
    alert(
      `Order placed successfully!\n\nName: ${formData.name}\nAddress: ${
        formData.address
      }\nPhone: ${formData.phone}\nEmail: ${formData.email}\n\nTotal: ${vnd(
        cartTotal
      )}`
    );
  };

  const ConfirmPlaceOrder = () => {
    if (cartTotalItems === 0) {
      alert("Giỏ hàng của bạn đang trống!");
    } else {
      if (!userId || !selectedPaymentMethod) {
        alert("Đơn hàng của bạn thiếu thông tin!");
      } else {
        if (window.confirm("Đơn hàng sẽ được đặt, hãy xác nhận:")) {
          placeOrder();
        }
      }
    }
  };

  const placeOrder = async () => {
    setLoading(true);

    console.log("Checkout: New order");
    console.log("Checkout: User ID: ", userId);
    console.log("Checkout: Order content: ", orderContent);
    console.log("Checkout: Payment method: ", selectedPaymentMethod);

    let userPublicIp = null;
    // Call API

    // fetch IP
    try {
      userPublicIp = await getPublicIp();
    } catch(error) {
      console.log("IP fetch failed", error);
    }

    // create order
    try {
      // Build shippingAddressInfo in the shape backend expects (see your screenshot)
      const shippingAddressInfo = addressObj
        ? {
            displayName: formData.name || null,
            phoneNumber: formData.phone || null,
            provinceCode: addressObj.province?.code || null,
            districtCode: addressObj.district?.code || null,
            wardCode: addressObj.ward?.code || null,
            provinceName: addressObj.province?.name || null,
            districtName: addressObj.district?.name || null,
            wardName: addressObj.ward?.name || null,
            street: addressObj.houseNumber || "",
            note: "",
          }
        : {
            displayName: formData.name || null,
            phoneNumber: formData.phone || null,
            provinceCode: null,
            districtCode: null,
            wardCode: null,
            provinceName: null,
            districtName: null,
            wardName: null,
            street: formData.address || "",
            note: "",
          };

      const payload = {
        userId: userId,
        paymentMethod: selectedPaymentMethod,
        productsInfo: orderContent,
        voucherCode: appliedVoucher?.code || null,
        ipAddr: userPublicIp,
        // ensure backend-required shippingFee is present and positive
        shippingFee: SHIPPING_FEE && SHIPPING_FEE > 0 ? SHIPPING_FEE : 15000,
        shippingAddressInfo,
      };
      console.log("createOrder payload:", payload);
      // Temporary debug: persist the exact payload we're about to send so it's easy to inspect
      try {
        localStorage.setItem("lastOrderPayload", JSON.stringify(payload));
      } catch (err) {
        console.warn("Could not save lastOrderPayload to localStorage", err);
      }
      const res = await createOrder(payload);
      console.log("createOrder response:", res);
      
      
      // Open payment page if should
      if (selectedPaymentMethod === "VNBANK" || selectedPaymentMethod === "INTCARD") {
        const ImmediatePaymentUrl = res.data.newPayment.paymentUrl;
        if (ImmediatePaymentUrl) {
          window.open(ImmediatePaymentUrl, '_blank');
        }
      }


      // Capture snapshot for order preview
      captureOrderSnapshot();
      // Display order preview
      setShowOrderPreview(true);
      // Update cart
      resetCart();

      // If user had no saved address in their profile, save the checkout address to their profile now
      try {
        const raw = localStorage.getItem("userInfo") || "{}";
        const info = JSON.parse(raw);
        const hasSavedAddress = !!(info?.user && info.user.address);
        // addressObj may be null if user typed free-text; prefer addressObj, otherwise use formData.address
        if (!hasSavedAddress && (addressObj || (formData.address && formData.address.trim()))) {
          const addressString = addressObj
            ? `${addressObj.houseNumber || ""}, ${addressObj.ward?.name || ""} - ${addressObj.district?.name || ""} - ${addressObj.province?.name || ""}`.trim()
            : formData.address;
          // call editAddress to persist on server
          try {
            await editAddress({ fullName: formData.name, address: addressObj || null, addressString });
            // update localStorage.userInfo and localStorage.userAddress
            try {
              const u = info?.user || info || {};
              u.address = addressObj || null;
              u.addressString = addressString;
              const updated = { ...info, user: u };
              localStorage.setItem("userInfo", JSON.stringify(updated));
              const savedAddr = { ...(addressObj || {}), houseNumber: (addressObj?.houseNumber || formData.address || ""), contactName: formData.name, contactPhone: formData.phone, contactEmail: formData.email };
              localStorage.setItem("userAddress", JSON.stringify(savedAddr));
            } catch (err) {
              console.error("Failed to persist saved address locally", err);
            }
          } catch (err) {
            console.warn("editAddress failed after order; persisting locally", err);
            // fallback: persist locally even if API fails
            try {
              const savedAddr = { ...(addressObj || {}), houseNumber: (addressObj?.houseNumber || formData.address || ""), contactName: formData.name, contactPhone: formData.phone, contactEmail: formData.email };
              localStorage.setItem("userAddress", JSON.stringify(savedAddr));
            } catch (err2) {
              console.error("Failed fallback local save for address", err2);
            }
          }
        }
      } catch (err) {
        console.error("post-order address-save routine failed", err);
      }
    } catch (error) {
      console.error("createOrder failed:", error);
      // If apiClient attached body/status, show a more informative alert and log details
      if (error && (error.body || error.status)) {
        console.error("createOrder server error body/status:", error.status, error.body);
        const msg = (error.body && (error.body.message || JSON.stringify(error.body))) || error.message || "Unknown server error";
        alert(`Create Order failed: ${msg} (status ${error.status || "?"})`);
      } else {
        alert("Create Order failed: check console");
      }
    }

    setLoading(false);
  };

  return (
    // Page Container
    <div className="Checkout-page">

      {loading && <LoadingOverlay/>}

      <div className="Checkout-container">
        <h1 className="Checkout-title">Thanh Toán</h1>
        <div className="Checkout-content">
          {isCartLoading ? (
            <div>Loading cart ... </div>
          ) : (
            // Cart content
            <div className="Checkout-items">
              <h3>Sản Phẩm Mua:</h3>
              {cartTotalItems === 0 ? (
                <div>Giỏ hàng của bạn đang trống</div>
              ) : (
                Object.values(cartItems).map((item) => {
                  const currentItemData = productsLookup[item.productId];
                  return (
                    <div key={item.productId} className="Checkout-item">
                      <img
                        src={currentItemData.imageInfo?.url || DefaultImage}
                        alt={currentItemData.name}
                      />
                      <div>
                        <h3>{currentItemData.name}</h3>
                        <p>
                          Số lượng {item.quantity} x {vnd(item.price)} ={" "}
                          <b>{vnd(item.price * item.quantity)}</b>
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* RIGHT SIDE CHECKOUT */}
          <div className="Checkout-right">
            {/* Ship Info */}
            <div className="Checkout-shipinfo">
              <h3>Thông Tin Giao Hàng</h3>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="name"
                  placeholder="Họ và Tên"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <div style={{ marginBottom: 10 }}>
                  <AddressSelector value={addressObj} onChange={(addr) => setAddressObj(addr)} />
                </div>
                <input
                  type="text"
                  name="phone"
                  placeholder="Số Điện Thoại"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </form>
            </div>

            {/* Checkout Summary */}
            <div className="Checkout-summary">
              <h3>Tổng Quan Đơn Hàng</h3>
              <p>Tổng số lượng: {cartTotalItems} sản phẩm</p>
              <b> Giá trị hàng: {vnd(cartTotal)}</b>
              <p> Giảm giá: {vnd(calculateDiscountAmount())}</p>
              <p> Phí vận chuyển: {vnd(getShippingFee())}</p>
              <h3>Tổng thanh toán: {vnd(getFinalTotal())}</h3>
            </div>

            {/* Payments */}
            <div className="Checkout-payments">
              <h3>Chọn phương thức thanh toán: </h3>
              <div className="option">
                <label>
                  <input
                    type="radio"
                    name="payment-method"
                    value="CASH"
                    checked={selectedPaymentMethod === "CASH"}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  />
                  <img src={COD_light} alt="" />
                  Thanh toán khi nhận hàng (COD)
                </label>
              </div>
              <div className="option">
                <label>
                  <input
                    type="radio"
                    name="payment-method"
                    value="VNBANK"
                    checked={selectedPaymentMethod === "VNBANK"}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  ></input>
                  <img src={VNPAYLogo} alt="" />
                  VN Pay
                </label>
              </div>
              <div className="option">
                <label>
                  <input
                    type="radio"
                    name="payment-method"
                    value="INTCARD"
                    checked={selectedPaymentMethod === "INTCARD"}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  ></input>
                  Thẻ quốc tế
                </label>
              </div>
            </div>
            {/* Place Order */}
            <button className="Checkout-placeorder" onClick={ConfirmPlaceOrder}>
              Đặt Hàng
            </button>
          </div>
        </div>
      </div>

      {showOrderPreview && (
        <div className="Checkout-OrderPreview-overlay">
          <CheckoutOrderPreview
            orderContent={orderSnapshot}
            productsLookup={orderLookupSnapshot}
            orderTotalItems={orderTotalItemSnapshot}
            orderTotal={orderTotalSnapshot}
          />
        </div>
      )}
    </div>
  );
};

export default Checkout;
