# 🚀 Quick Start - Toss Payment

## Cách thực hiện thanh toán với Toss Payment

### 1. Khởi động ứng dụng
```bash
npm install
npm start
```

### 2. Truy cập trang Toss Payment
Mở trình duyệt và truy cập: `http://localhost:3000/toss-demo`

### 3. Chọn phương thức thanh toán

#### 💳 Thẻ tín dụng
- Hỗ trợ: Visa, MasterCard, JCB
- Test card: `4111-1111-1111-1111`
- Expiry: Bất kỳ ngày nào trong tương lai
- CVV: Bất kỳ 3 số nào

#### 💛 KakaoPay
- Yêu cầu ứng dụng KakaoPay
- Chuyển hướng đến app để xác nhận

#### 💚 NaverPay
- Yêu cầu tài khoản Naver
- Chuyển hướng đến NaverPay

#### 💙 TossPay
- Yêu cầu ứng dụng Toss
- Chuyển hướng đến app để xác nhận

### 4. Nhập thông tin thanh toán
- **Số tiền**: Tối thiểu 100 KRW
- **Tên sản phẩm**: Bất kỳ tên nào
- **Mã đơn hàng**: Tự động tạo

### 5. Nhấn "Thanh toán"
- Hệ thống sẽ chuyển hướng đến trang thanh toán Toss
- Hoàn thành thanh toán
- Quay lại trang thành công/thất bại

## Test Cases

### ✅ Thành công
- Sử dụng test card: `4111-1111-1111-1111`
- Số tiền: 1000 KRW
- Kết quả: Chuyển hướng đến trang thành công

### ❌ Thất bại
- Sử dụng card không hợp lệ
- Số tiền dưới 100 KRW
- Hủy thanh toán
- Kết quả: Chuyển hướng đến trang thất bại

## Debug

### Console Logs
Kiểm tra console để xem:
- SDK initialization
- Payment request
- Error messages

### Network Tab
Kiểm tra network requests:
- Toss API calls
- Callback URLs
- Error responses

## Troubleshooting

### Lỗi thường gặp

1. **SDK không load**
   - Kiểm tra internet connection
   - Refresh trang

2. **Payment failed**
   - Kiểm tra test card number
   - Đảm bảo số tiền >= 100 KRW

3. **Callback error**
   - Kiểm tra server logs
   - Verify callback URLs

## Production Setup

### 1. Đăng ký Toss Payment
- Truy cập: https://dashboard.tosspayments.com/
- Tạo merchant account
- Lấy production keys

### 2. Cập nhật environment
```env
TOSS_CLIENT_KEY=live_ck_...
TOSS_SECRET_KEY=live_sk_...
```

### 3. Cấu hình domain
- Whitelist domain trong dashboard
- Setup HTTPS
- Configure webhook URLs

## API Reference

### Frontend
```javascript
// Initialize
const tossPayments = TossPayments('your_client_key');

// Request payment
await tossPayments.requestPayment('card', {
    amount: 1000,
    orderId: 'ORDER_123',
    orderName: 'Product Name',
    customerName: 'Customer Name',
    customerEmail: 'customer@example.com',
    successUrl: 'https://yourdomain.com/success',
    failUrl: 'https://yourdomain.com/fail',
});
```

### Backend
```javascript
// Confirm payment
const response = await axios.post(
    'https://api.tosspayments.com/v1/payments/confirm',
    {
        paymentKey: paymentKey,
        orderId: orderId,
        amount: amount
    },
    {
        headers: {
            'Authorization': `Basic ${Buffer.from(secretKey + ':').toString('base64')}`,
            'Content-Type': 'application/json'
        }
    }
);
```

## Support

- [Toss Payment Documentation](https://docs.tosspayments.com/)
- [API Reference](https://docs.tosspayments.com/reference)
- [Dashboard](https://dashboard.tosspayments.com/)

---

**Happy Testing! 🎉** 