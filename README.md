# 🧪 Payment Integration Test Application

Ứng dụng test thanh toán tích hợp NicePay và Toss Payment với sandbox environment.

## 🚀 Quick Start

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cấu hình environment
Tạo file `.env` từ `env.example`:
```bash
cp env.example .env
```

Cập nhật thông tin trong file `.env`:
```env
# NicePay Sandbox Configuration
NICEPAY_CLIENT_KEY=S2_YOUR_SANDBOX_CLIENT_KEY
NICEPAY_SECRET_KEY=YOUR_SANDBOX_SECRET_KEY

# Toss Payment Configuration
TOSS_CLIENT_KEY=test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq
TOSS_SECRET_KEY=test_sk_D4yKeq5bgrpKRd0JYbLVGX0lzW6Y

# Server Configuration
PORT=3000
NODE_ENV=development

# Payment Configuration
PAYMENT_DOMAIN=https://sandbox-pay.nicepay.co.kr
API_DOMAIN=https://sandbox-api.nicepay.co.kr
```

## 🚀 Quick Start

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cấu hình environment
Tạo file `.env` từ `env.example`:
```bash
cp env.example .env
```

Cập nhật thông tin trong file `.env`:
```env
# NicePay Sandbox Configuration
NICEPAY_CLIENT_KEY=S2_YOUR_SANDBOX_CLIENT_KEY
NICEPAY_SECRET_KEY=YOUR_SANDBOX_SECRET_KEY

# Server Configuration
PORT=3000
NODE_ENV=development

# Payment Configuration
PAYMENT_DOMAIN=https://sandbox-pay.nicepay.co.kr
API_DOMAIN=https://sandbox-api.nicepay.co.kr
```

### 3. Lấy Sandbox Keys
1. Đăng ký tài khoản tại [NicePay Start](https://start.nicepay.co.kr/merchant/login/main.do)
2. Tạo sandbox store
3. Vào **개발정보** (Development Info) để lấy keys
4. Copy `Client Key` và `Secret Key` vào file `.env`

### 4. Chạy ứng dụng
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 5. Truy cập ứng dụng
Mở trình duyệt và truy cập các trang:

- **NicePay Test**: `http://localhost:3000`
- **NicePay Easy Payment**: `http://localhost:3000/easy-payment`
- **Toss Payment**: `http://localhost:3000/toss-payment`
- **Toss Payment Demo**: `http://localhost:3000/toss-demo`

## 📋 Features

### ✅ NicePay Payment Methods
- 💳 Credit Card
- 🏦 Bank Transfer  
- 📝 Virtual Account
- 📱 Mobile Payment

### ✅ Toss Payment Methods
- 💳 Credit/Debit Cards (Visa, MasterCard, JCB)
- 💛 KakaoPay
- 💚 NaverPay
- 💙 TossPay
- 🏦 Bank Transfers
- 📱 Mobile Payments

### ✅ Test Features
- Sandbox environment
- Multiple test amounts
- Real-time payment status
- Payment cancellation
- Error handling
- Beautiful UI

### ✅ API Endpoints

#### NicePay
- `GET /` - Main payment page
- `POST /payment/callback` - Payment callback handler
- `GET /payment/status/:tid` - Check payment status
- `POST /payment/cancel/:tid` - Cancel payment
- `GET /api/config` - Get configuration

#### Toss Payment
- `GET /toss-payment` - Toss payment page
- `GET /toss-demo` - Toss payment demo
- `GET /toss/success` - Success callback
- `GET /toss/fail` - Fail callback
- `GET /api/toss/config` - Get Toss configuration
- `GET /api/toss/payment/:paymentKey` - Check payment status
- `POST /api/toss/payment/:paymentKey/cancel` - Cancel payment

## 🔧 Configuration

### Sandbox vs Production
```javascript
// Sandbox (Test)
PAYMENT_DOMAIN=https://sandbox-pay.nicepay.co.kr
API_DOMAIN=https://sandbox-api.nicepay.co.kr

// Production
PAYMENT_DOMAIN=https://pay.nicepay.co.kr
API_DOMAIN=https://api.nicepay.co.kr
```

### Client Key Types
- `S2_` - Server Authorization (Manual approval)
- `C2_` - Client Authorization (Auto approval)

## 🧪 Testing

### Test Card Numbers (Sandbox)
```
1234567890123456  // Generic test card
4111111111111111  // Visa test
5555555555554444  // Mastercard test
```

### Test Amounts
- ₩1,000 (Minimum)
- ₩5,000
- ₩10,000
- ₩50,000

### Expected Response (Sandbox)
```json
{
  "resultCode": "0000",
  "resultMsg": "정상 처리되었습니다.",
  "tid": "UT0000113m01012111051714341073",
  "status": "paid",
  "amount": 1000,
  "card": {
    "cardCode": "04",
    "cardName": "삼성",
    "cardNum": "123412******1234"
  }
}
```

## 🔍 Debugging

### Console Logs
Ứng dụng sẽ log tất cả các bước:
```
🚀 NicePay Test Server running on http://localhost:3000
📝 Sandbox Mode: YES
🔑 Client Key: S2_af4543a...

🔔 Payment callback received: { authResultCode: '0000', ... }
✅ Authentication successful, processing payment...
💰 Approving payment: TID=UT0000113m01012111051714341073, Amount=1000
✅ Payment approval response: { resultCode: '0000', ... }
```

### Web Log (NicePay Dashboard)
- Đăng nhập vào sandbox store
- Vào **웹로그** (Web Log) tab
- Xem được tất cả API requests/responses

## ⚠️ Important Notes

### Security
- Không commit file `.env` vào git
- Không expose secret key
- Verify signature trong production

### Sandbox Limitations
- Không có giao dịch thực
- Response data là giả
- Chỉ dùng để test development

### Production Migration
Khi chuyển sang production:
1. Đổi domains từ sandbox sang production
2. Đổi client key và secret key
3. Test với giao dịch thật nhỏ
4. Verify signature và amount

## 🐛 Troubleshooting

### Common Issues

#### 1. CORS Error
```
Access to fetch at 'https://sandbox-pay.nicepay.co.kr' from origin 'http://localhost:3000' has been blocked by CORS policy
```
**Solution**: Đảm bảo sử dụng đúng domain và port

#### 2. Invalid Client Key
```
Payment Error: Invalid client key
```
**Solution**: Kiểm tra client key format (S2_... hoặc C2_...)

#### 3. Network Error
```
Failed to fetch
```
**Solution**: Kiểm tra firewall settings cho sandbox domains

#### 4. Payment Failed
```
authResultCode: '0001'
authResultMsg: '인증 실패'
```
**Solution**: Kiểm tra thông tin payment và sandbox configuration

## 📚 Resources

- [NicePay Developer Guide](https://github.com/nicepayments/nicepay-manual)
- [API Documentation](https://docs.nicepay.co.kr/)
- [Sandbox Testing](https://start.nicepay.co.kr/)

## 🤝 Support

Nếu gặp vấn đề:
1. Kiểm tra console logs
2. Xem web log trong NicePay dashboard
3. Verify configuration
4. Test với amount nhỏ hơn

---

**Happy Testing! 🎉**
