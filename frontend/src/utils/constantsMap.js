export const paymentMethodMap = {
    'CASH': 'Thanh toán khi nhận hàng',
    'VNBANK': 'VNPAY',
    'INTCARD': 'Thẻ quốc tế',
};

export const paymentStatusMap = {
    'unpaid': 'Chưa thanh toán',
    'paid': 'Đã thanh toán',
    'refunding': 'Đang hoàn tiền',
    'refunded': 'Đã hoàn tiền',
    'refunded-failed': 'Hoàn tiền không thành công',
    'failed': 'Không thành công',
};

export const shipStatusMap = {
    'pending': 'Chờ xác nhận',
    'processing': 'Đang xử lý',
    'in_transit': 'Đang giao hàng',
    'delivered': 'Giao thành công',
    'returned': 'Trả hàng',
    'cancelled': 'Đã hủy',
    'cancelled_due_to_insufficient_stock': 'Hủy do thiếu hàng',
    'cancelled_due_to_payment_expiry': 'Hủy do trễ thanh toán',
    'refunding': 'Đang hoàn tiền',
    'refunded': 'Đã hoàn tiền',
};