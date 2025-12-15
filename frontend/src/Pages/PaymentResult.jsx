import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Home, ShoppingBag, Loader2, Receipt } from 'lucide-react';
import { vnd } from "../utils/currencyUtils"; 
import { getOrderById } from "../api/orderService"; 

import './CSS/PaymentResult.css';

const PaymentResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const [status, setStatus] = useState('loading'); 
  const [orderInfo, setOrderInfo] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const checkResult = async () => {
        if (location.state) {
            if (location.state.status === 'success') {
                setStatus('success');
                setOrderInfo({
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

        const vnpResponseCode = searchParams.get('vnp_ResponseCode');
        if (vnpResponseCode) {
            const vnpTxnRef = searchParams.get('vnp_TxnRef');
            const vnpAmount = searchParams.get('vnp_Amount');

            if (vnpResponseCode === '00') {
                setStatus('success');
                setOrderInfo({
                    orderId: vnpTxnRef,
                    amount: vnpAmount ? parseInt(vnpAmount) / 100 : 0,
                    method: 'VNPAY'
                });
            } else {
                setStatus('failed');
                setErrorMsg("Giao dịch thanh toán bị hủy hoặc xảy ra lỗi.");
            }
            return;
        }

        const orderIdParam = searchParams.get('orderId');
        if (orderIdParam) {
            try {
                const res = await getOrderById(orderIdParam);
                if (res && res.success && res.data) {
                    const order = res.data;
                    
                    if (order.paymentStatus === 'paid') {
                        setStatus('success');
                    } else if (order.paymentStatus === 'failed') {
                        setStatus('failed');
                        setErrorMsg("Thanh toán thất bại.");
                    } else {
                        setStatus('info'); 
                    }

                    setOrderInfo({
                        orderId: order._id,
                        amount: order.grandTotal,
                        method: order.paymentMethod === 'CASH' ? 'Tiền mặt (COD)' : order.paymentMethod
                    });
                } else {
                    setStatus('failed');
                    setErrorMsg("Không tìm thấy thông tin đơn hàng.");
                }
            } catch (error) {
                console.error(error);
                setStatus('failed');
                setErrorMsg("Lỗi kết nối đến hệ thống.");
            }
            return;
        }

        navigate('/');
    };

    checkResult();
  }, [location, searchParams, navigate]);

  if (status === 'loading') return (
    <div className="payment-result-page">
        <div className="loading-container">
            <Loader2 className="animate-spin" size={48} color="#1488DB" />
            <p style={{marginTop: 15}}>Đang xử lý kết quả...</p>
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
            <p className="result-message">Cảm ơn bạn đã mua hàng. Đơn hàng đã được thanh toán/ghi nhận.</p>
          </>
        )}

        {status === 'info' && (
           <>
            <div className="result-icon-wrapper">
                <Receipt size={80} className="status-warning" />
            </div>
            <h1 className="result-title status-warning">Thông tin đơn hàng</h1>
            <p className="result-message">Trạng thái thanh toán: <strong>Chưa hoàn tất</strong></p>
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

        {orderInfo && (
            <div className="order-info-box">
                <div className="info-row">
                    <span className="info-label">Mã đơn hàng:</span>
                    <span className="info-value mono">#{orderInfo.orderId?.slice(-6).toUpperCase()}</span>
                </div>
                <div className="info-row">
                    <span className="info-label">Phương thức:</span>
                    <span className="info-value">{orderInfo.method}</span>
                </div>
                <div className="info-row">
                    <span className="info-label">Tổng thanh toán:</span>
                    <span className="info-value amount-highlight">{vnd(orderInfo.amount)}</span>
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