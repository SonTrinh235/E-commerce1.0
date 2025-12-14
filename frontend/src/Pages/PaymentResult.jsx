import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, Home, ShoppingBag, Loader2 } from 'lucide-react';
import './CSS/PaymentResult.css';

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [result, setResult] = useState({
    status: 'loading',
    title: 'Đang xử lý...',
    message: 'Vui lòng đợi trong giây lát',
    icon: <Loader2 size={60} className="animate-spin" color="#1488DB" />
  });

  useEffect(() => {
    const responseCode = searchParams.get('vnp_ResponseCode');

    if (responseCode === '00') {
        setResult({
            status: 'success',
            title: 'Thanh toán thành công!',
            message: 'Đơn hàng của bạn đã được xác nhận và đang được xử lý.',
            icon: <CheckCircle size={80} color="#10b981" />
        });
    } else if (responseCode === '24') {
        setResult({
            status: 'cancel',
            title: 'Giao dịch bị hủy',
            message: 'Bạn đã hủy quá trình thanh toán.',
            icon: <AlertCircle size={80} color="#f59e0b" />
        });
    } else {
        setResult({
            status: 'error',
            title: 'Thanh toán thất bại',
            message: `Giao dịch không thành công. Mã lỗi: ${responseCode || 'Unknown'}`,
            icon: <XCircle size={80} color="#ef4444" />
        });
    }
  }, [searchParams]);

  const getTitleClass = (status) => {
      switch (status) {
          case 'success': return 'status-success';
          case 'cancel': return 'status-cancel';
          case 'error': return 'status-error';
          default: return 'status-loading';
      }
  };

  return (
    <div className="payment-result-page">
      <div className="result-card">
        
        <div className="result-icon-wrapper">
          {result.icon}
        </div>

        <h1 className={`result-title ${getTitleClass(result.status)}`}>
          {result.title}
        </h1>
        
        <p className="result-message">
          {result.message}
        </p>

        <div className="button-group">
          <button 
              onClick={() => navigate('/')}
              className="btn-result btn-home"
          >
              <Home size={18} /> Về trang chủ
          </button>

          <button 
              onClick={() => navigate('/orders')} 
              className="btn-result btn-orders"
          >
              <ShoppingBag size={18} /> Xem đơn hàng
          </button>
        </div>

      </div>
    </div>
  );
}