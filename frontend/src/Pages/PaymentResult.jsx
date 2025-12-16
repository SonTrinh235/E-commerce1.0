import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Home, ShoppingBag, Loader2, Receipt } from 'lucide-react';
import { CartContext } from '../Context/CartContext';
import { vnd } from "../utils/currencyUtils"; 
import { getPaymentByOrderId } from "../api/paymentService"; 

import './CSS/PaymentResult.css';

const PaymentResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { resetCart } = useContext(CartContext);
  
  const [status, setStatus] = useState('loading'); 
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const checkResult = async () => {
        // TRƯỜNG HỢP 1: Thanh toán Tiền mặt (Có state từ trang Checkout chuyển sang)
        if (location.state && location.state.orderId) {
            if (location.state.status === 'success') {
                setStatus('success');
                setPaymentInfo({
                    orderId: location.state.orderId,
                    amount: location.state.amount,
                    method: location.state.method === 'CASH' ? 'Tiền mặt (COD)' : location.state.method
                });
            } else {
                setStatus('failed');
                setErrorMsg("Có lỗi xảy ra khi xử lý đơn hàng.");
            }
            return;
        }

        // TRƯỜNG HỢP 2: VNPAY trả về (Có tham số vnp_TxnRef trên URL)
        const vnpTxnRef = searchParams.get('vnp_TxnRef'); // Đây là Order ID
        const vnpResponseCode = searchParams.get('vnp_ResponseCode');

        if (vnpTxnRef) {
            try {
                // Gọi API getPaymentByOrderId như yêu cầu
                const res = await getPaymentByOrderId(vnpTxnRef);
                
                if (res && res.success && res.data) {
                    const payment = res.data; // Dữ liệu trả về từ dòng 
                    
                    // Kiểm tra status từ Database (chuẩn nhất)
                    if (payment.status === 'paid') {
                        setStatus('success');
                        resetCart(); 
                    } else if (payment.status === 'failed') {
                        setStatus('failed');
                        setErrorMsg("Giao dịch thanh toán thất bại.");
                    } else {
                        // Trường hợp 'unpaid' nhưng VNPAY trả về 00 (có thể do backend update chậm)
                        if (vnpResponseCode === '00') {
                             setStatus('success'); 
                             resetCart();
                        } else {
                             setStatus('info'); // Đang chờ xử lý
                        }
                    }

                    setPaymentInfo({
                        orderId: payment.orderId,
                        amount: payment.amount,
                        method: payment.method === 'VNBANK' ? 'VNPAY QR' : payment.method,
                        paymentDate: payment.updatedAt
                    });
                } else {
                    setStatus('failed');
                    setErrorMsg("Không tìm thấy thông tin thanh toán.");
                }
            } catch (error) {
                console.error("Lỗi xác thực thanh toán:", error);
                
                // Fallback: Nếu API lỗi nhưng VNPAY trả code 00
                if (vnpResponseCode === '00') {
                     setStatus('info'); 
                     setPaymentInfo({ orderId: vnpTxnRef, method: 'VNPAY', amount: 0 });
                } else {
                     setStatus('failed');
                     setErrorMsg("Lỗi kết nối khi xác thực thanh toán.");
                }
            }
            return;
        }

        // Không có thông tin gì -> Về trang chủ
        navigate('/');
    };

    checkResult();
  }, [location, searchParams, navigate, resetCart]);

  if (status === 'loading') return (
    <div className="payment-result-page">
        <div className="loading-container">
            <Loader2 className="animate-spin" size={48} color="#10b981" />
            <p style={{marginTop: 15}}>Đang xác thực kết quả thanh toán...</p>
        </div>
    </div>
  );

  return (
    <div className="payment-result-page">
      <div className="result-card">
        
        {status === 'success' && (
          <>
            <div className="result-icon-wrapper">
                <CheckCircle size={80} className="status-success" />
            </div>
            <h1 className="result-title status-success">Giao dịch thành công</h1>
            <p className="result-message">Cảm ơn bạn đã mua hàng. Đơn hàng đã được thanh toán thành công.</p>
          </>
        )}

        {status === 'info' && (
           <>
            <div className="result-icon-wrapper">
                <Receipt size={80} className="status-warning" />
            </div>
            <h1 className="result-title status-warning">Đang xử lý</h1>
            <p className="result-message">Giao dịch đã được ghi nhận. Hệ thống đang cập nhật trạng thái đơn hàng.</p>
           </>
        )}

        {status === 'failed' && (
          <>
            <div className="result-icon-wrapper">
                <XCircle size={80} className="status-error" />
            </div>
            <h1 className="result-title status-error">Giao dịch thất bại</h1>
            <p className="result-message">{errorMsg}</p>
          </>
        )}

        {paymentInfo && (
            <div className="order-info-box">
                <div className="info-row">
                    <span className="info-label">Mã đơn hàng:</span>
                    <span className="info-value mono">#{paymentInfo.orderId?.slice(-6).toUpperCase()}</span>
                </div>
                <div className="info-row">
                    <span className="info-label">Phương thức:</span>
                    <span className="info-value">{paymentInfo.method}</span>
                </div>
                <div className="info-row">
                    <span className="info-label">Số tiền:</span>
                    <span className="info-value amount-highlight">{paymentInfo.amount ? vnd(paymentInfo.amount) : '---'}</span>
                </div>
            </div>
        )}

        <div className="button-group">
          <button onClick={() => navigate('/')} className="btn-result btn-home">
            <Home size={18} /> Trang chủ
          </button>
          
          <button onClick={() => navigate('/orders')} className="btn-result btn-orders">
            <ShoppingBag size={18} /> Đơn hàng
          </button>
        </div>

      </div>
    </div>
  );
};

export default PaymentResult;