# Hướng dẫn tích hợp Toss Payment

## Tổng quan

Toss Payment là một cổng thanh toán phổ biến ở Hàn Quốc, hỗ trợ nhiều phương thức thanh toán bao gồm:
- 💳 Thẻ tín dụng/ghi nợ
- 💛 KakaoPay
- 💚 NaverPay
- 💙 TossPay
- 🏦 Chuyển khoản ngân hàng
- 📱 Thanh toán di động

## Cài đặt và Cấu hình

### 1. Đăng ký Toss Payment

1. Truy cập [Toss Payments Console](https://dashboard.tosspayments.com/)
2. Tạo tài khoản và đăng ký merchant
3. Lấy Client Key và Secret Key từ dashboard

### 2. Cấu hình Environment Variables

Tạo file `.env` trong thư mục gốc:

```env
# Toss Payment Configuration
TOSS_CLIENT_KEY=your_client_key_here
TOSS_SECRET_KEY=your_secret_key_here
TOSS_API_URL=https://api.tosspayments.com

# NicePay Configuration (existing)
NICEPAY_CLIENT_KEY=your_nicepay_client_key
NICEPAY_SECRET_KEY=your_nicepay_secret_key
```

### 3. Cài đặt Dependencies

```bash
npm install
```

## Sử dụng

### 1. Khởi động Server

```bash
npm start
```

### 2. Truy cập Toss Payment Page

Mở trình duyệt và truy cập: `http://localhost:3000/toss-payment`

### 3. Chọn Phương thức Thanh toán

- **Thẻ tín dụng**: Hỗ trợ tất cả các loại thẻ Visa, MasterCard, JCB
- **KakaoPay**: Thanh toán qua ứng dụng KakaoPay
- **NaverPay**: Thanh toán qua NaverPay
- **TossPay**: Thanh toán qua TossPay

## API Endpoints

### Frontend Integration

```javascript
// Khởi tạo Toss Payments SDK
const tossPayments = TossPayments('your_client_key');

// Yêu cầu thanh toán
await tossPayments.requestPayment('card', {
    amount: 1000,
    orderId: 'ORDER_123',
    orderName: 'Test Product',
    customerName: 'Customer Name',
    customerEmail: 'customer@example.com',
    successUrl: 'http://localhost:3000/toss/success',
    failUrl: 'http://localhost:3000/toss/fail',
});
```

### Backend API Endpoints

#### 1. Lấy cấu hình Toss
```
GET /api/toss/config
```

#### 2. Kiểm tra trạng thái thanh toán
```
GET /api/toss/payment/:paymentKey
```

#### 3. Hủy thanh toán
```
POST /api/toss/payment/:paymentKey/cancel
Body: { "cancelReason": "User cancellation" }
```

#### 4. Callback URLs
- **Success**: `GET /toss/success?paymentKey=xxx&orderId=xxx&amount=xxx`
- **Fail**: `GET /toss/fail?code=xxx&message=xxx&orderId=xxx`

## Phương thức Thanh toán Chi tiết

### 1. Thẻ tín dụng (Card)

```javascript
await tossPayments.requestPayment('card', {
    amount: 1000,
    orderId: 'ORDER_123',
    orderName: 'Test Product',
    cardInstallmentPlan: 0, // 0: 일시불, 2-12: 할부
    useInternationalCardOnly: false,
    flowMode: 'DEFAULT', // DEFAULT, BILLING
    cardCompany: null, // 특정 카드사 지정 (선택사항)
    customerName: 'Customer Name',
    customerEmail: 'customer@example.com',
    successUrl: 'http://localhost:3000/toss/success',
    failUrl: 'http://localhost:3000/toss/fail',
});
```

### 2. KakaoPay

```javascript
await tossPayments.requestPayment('kakao', {
    amount: 1000,
    orderId: 'ORDER_123',
    orderName: 'Test Product',
    customerName: 'Customer Name',
    customerEmail: 'customer@example.com',
    successUrl: 'http://localhost:3000/toss/success',
    failUrl: 'http://localhost:3000/toss/fail',
});
```

### 3. NaverPay

```javascript
await tossPayments.requestPayment('naver', {
    amount: 1000,
    orderId: 'ORDER_123',
    orderName: 'Test Product',
    customerName: 'Customer Name',
    customerEmail: 'customer@example.com',
    successUrl: 'http://localhost:3000/toss/success',
    failUrl: 'http://localhost:3000/toss/fail',
});
```

### 4. TossPay

```javascript
await tossPayments.requestPayment('toss', {
    amount: 1000,
    orderId: 'ORDER_123',
    orderName: 'Test Product',
    customerName: 'Customer Name',
    customerEmail: 'customer@example.com',
    successUrl: 'http://localhost:3000/toss/success',
    failUrl: 'http://localhost:3000/toss/fail',
});
```

## Xử lý Callback

### Success Callback

Khi thanh toán thành công, Toss sẽ redirect về `successUrl` với các tham số:
- `paymentKey`: Khóa thanh toán
- `orderId`: Mã đơn hàng
- `amount`: Số tiền

Server sẽ tự động confirm payment với Toss API:

```javascript
// Confirm payment
const confirmResponse = await axios.post(
    'https://api.tosspayments.com/v1/payments/confirm',
    {
        paymentKey: paymentKey,
        orderId: orderId,
        amount: parseInt(amount)
    },
    {
        headers: {
            'Authorization': `Basic ${Buffer.from(secretKey + ':').toString('base64')}`,
            'Content-Type': 'application/json'
        }
    }
);
```

### Fail Callback

Khi thanh toán thất bại, Toss sẽ redirect về `failUrl` với các tham số:
- `code`: Mã lỗi
- `message`: Thông báo lỗi
- `orderId`: Mã đơn hàng (nếu có)

## Testing

### Sandbox Mode

Sử dụng test keys để test trong môi trường sandbox:

```javascript
// Test Client Key
const clientKey = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';

// Test Secret Key  
const secretKey = 'test_sk_D4yKeq5bgrpKRd0JYbLVGX0lzW6Y';
```

### Test Card Numbers

- **Visa**: 4111-1111-1111-1111
- **MasterCard**: 5555-5555-5555-4444
- **JCB**: 3569-9900-1009-5841

### Test Amounts

- Tối thiểu: 100 KRW
- Tối đa: 10,000,000 KRW

## Bảo mật

### 1. HTTPS Required

Toss Payment yêu cầu HTTPS trong production. Sử dụng ngrok hoặc HTTPS proxy để test locally:

```bash
# Install ngrok
npm install -g ngrok

# Start tunnel
ngrok http 3000
```

### 2. Webhook Verification

Implement webhook verification để đảm bảo tính toàn vẹn của callback:

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secretKey) {
    const expectedSignature = crypto
        .createHmac('sha256', secretKey)
        .update(payload)
        .digest('hex');
    
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}
```

### 3. Error Handling

Luôn xử lý lỗi một cách an toàn:

```javascript
try {
    const result = await tossPayments.requestPayment(method, options);
    // Handle success
} catch (error) {
    console.error('Payment error:', error);
    // Handle error appropriately
    if (error.code === 'PAY_PROCESS_CANCELED') {
        // User cancelled payment
    } else if (error.code === 'PAY_PROCESS_ABORTED') {
        // Payment was aborted
    }
}
```

## Troubleshooting

### Common Issues

1. **CORS Error**: Đảm bảo domain được whitelist trong Toss dashboard
2. **Invalid Amount**: Số tiền phải là số nguyên và trong khoảng cho phép
3. **Duplicate Order ID**: Mỗi orderId phải unique
4. **Network Error**: Kiểm tra kết nối internet và firewall

### Debug Mode

Enable debug logging:

```javascript
// Enable debug mode
tossPayments.debug = true;

// Check SDK status
console.log('TossPayments loaded:', typeof TossPayments !== 'undefined');
```

## Production Checklist

- [ ] Đăng ký domain trong Toss dashboard
- [ ] Cấu hình HTTPS
- [ ] Implement webhook verification
- [ ] Test tất cả phương thức thanh toán
- [ ] Setup monitoring và logging
- [ ] Implement retry logic
- [ ] Setup backup payment methods

## Tài liệu tham khảo

- [Toss Payments Documentation](https://docs.tosspayments.com/)
- [Toss Payments API Reference](https://docs.tosspayments.com/reference)
- [Toss Payments SDK](https://docs.tosspayments.com/guides/payment-widget/integration)
- [Toss Payments Console](https://dashboard.tosspayments.com/) 