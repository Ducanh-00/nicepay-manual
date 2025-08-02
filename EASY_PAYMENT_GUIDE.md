# 💳 Easy Payment Guide - Naver Pay & Kakao Pay

## 🎯 Overview

NicePay hỗ trợ các phương thức thanh toán dễ dàng (Easy Payment) bao gồm:
- **Naver Pay** (네이버페이)
- **Kakao Pay** (카카오페이)

## 🚀 Quick Start

### 1. Truy cập trang test
```bash
http://localhost:3000/easy-payment
```

### 2. Test các phương thức
- **Naver Pay**: Click "🟢 Test Naver Pay"
- **Kakao Pay**: Click "🟡 Test Kakao Pay"
- **Quick Test**: Click "Quick Test (₩1,000)"

## 📋 Implementation Methods

### Method 1: JavaScript SDK (Recommended)

```javascript
// Load NicePay SDK
<script src="https://pay.nicepay.co.kr/v1/js/"></script>

// Naver Pay
AUTHNICE.requestPay({
    clientId: 'YOUR_CLIENT_KEY',
    method: 'naverpayCard',
    orderId: 'ORDER_123',
    amount: 1000,
    goodsName: 'Test Product',
    returnUrl: 'https://your-domain.com/callback'
});

// Kakao Pay
AUTHNICE.requestPay({
    clientId: 'YOUR_CLIENT_KEY',
    method: 'kakaopay',
    orderId: 'ORDER_123',
    amount: 1000,
    goodsName: 'Test Product',
    returnUrl: 'https://your-domain.com/callback'
});
```

### Method 2: Form Submission

```html
<form method="POST" action="https://pay.nicepay.co.kr/v1/payment">
    <input type="hidden" name="clientId" value="YOUR_CLIENT_KEY">
    <input type="hidden" name="method" value="naverpay">
    <input type="hidden" name="orderId" value="ORDER_123">
    <input type="hidden" name="amount" value="1000">
    <input type="hidden" name="goodsName" value="Test Product">
    <input type="hidden" name="returnUrl" value="https://your-domain.com/callback">
</form>
```

### Method 3: Server-side Redirect

```javascript
// Backend redirect
app.get('/payment/redirect', (req, res) => {
    const { method = 'naverpay', amount = 1000, goodsName = 'Test Product' } = req.query;
    const orderId = `TEST_${Date.now()}`;
    const returnUrl = `${req.protocol}://${req.get('host')}/payment/callback`;
    
    const html = `
    <form method="POST" action="https://pay.nicepay.co.kr/v1/payment">
        <input type="hidden" name="clientId" value="${clientKey}">
        <input type="hidden" name="method" value="${method}">
        <input type="hidden" name="orderId" value="${orderId}">
        <input type="hidden" name="amount" value="${amount}">
        <input type="hidden" name="goodsName" value="${goodsName}">
        <input type="hidden" name="returnUrl" value="${returnUrl}">
    </form>
    <script>document.forms[0].submit();</script>
    `;
    
    res.send(html);
});
```

## 🔧 Configuration

### Environment Variables
```env
# NicePay Configuration
NICEPAY_CLIENT_KEY=S2_YOUR_SANDBOX_CLIENT_KEY
NICEPAY_SECRET_KEY=YOUR_SANDBOX_SECRET_KEY

# URLs
PAYMENT_DOMAIN=https://pay.nicepay.co.kr
API_DOMAIN=https://api.nicepay.co.kr
```

### Method Values
- **Naver Pay**: `naverpayCard`
- **Kakao Pay**: `kakaopay`
- **Kakao Pay Card**: `kakaopayCard`
- **Kakao Pay Money**: `kakaopayMoney`

## 📱 User Experience

### Naver Pay Flow
1. User clicks "Naver Pay" button
2. NicePay redirects to Naver Pay login
3. User authenticates with Naver
4. Payment confirmation
5. Redirect back to your site

### Kakao Pay Flow
1. User clicks "Kakao Pay" button
2. NicePay redirects to Kakao Pay
3. User authenticates with Kakao
4. Payment confirmation
5. Redirect back to your site

## 🔍 Testing

### Test URLs
```bash
# Easy Payment Test Page
http://localhost:3000/easy-payment

# Individual Tests
http://localhost:3000/easy-payment#naver
http://localhost:3000/easy-payment#kakao
```

### Test Data
- **Amount**: 1000 KRW (minimum test amount)
- **Product**: Test Product
- **Order ID**: Auto-generated with timestamp

## ⚠️ Important Notes

### 1. Client Key Requirements
- Must use **Server Authorization** client key
- Client key starts with `S2_` for sandbox
- Different client keys for sandbox vs production

### 2. Return URL
- Must be HTTPS in production
- Must be accessible from NicePay servers
- Should handle both success and failure cases

### 3. Amount Limits
- **Minimum**: 100 KRW
- **Maximum**: Depends on merchant limits
- **Test**: Use 1000 KRW for testing

### 4. Browser Support
- **Naver Pay**: Modern browsers, mobile browsers
- **Kakao Pay**: Modern browsers, mobile browsers
- **Mobile**: Works best on mobile devices

## 🐛 Troubleshooting

### Common Issues

#### 1. "SDK not loaded" Error
```javascript
// Check if SDK is loaded
if (typeof AUTHNICE !== 'undefined') {
    // SDK is ready
} else {
    // SDK not loaded yet
}
```

#### 2. "Invalid client key" Error
- Verify client key in `.env` file
- Check if using correct environment (sandbox vs production)
- Ensure client key starts with `S2_` for sandbox

#### 3. "Method not supported" Error
- Verify method value: `naverpay` or `kakao`
- Check if method is enabled in your NicePay account
- Contact NicePay support if method is not available

#### 4. "Return URL error"
- Ensure return URL is accessible
- Check HTTPS requirement in production
- Verify URL format and encoding

### Debug Steps
1. Check browser console for errors
2. Verify network connectivity to NicePay
3. Test with different browsers
4. Check NicePay dashboard for transaction logs
5. Use debug page: `http://localhost:3000/debug`

## 📞 Support

### NicePay Documentation
- [API Documentation](https://docs.nicepay.co.kr/)
- [Sandbox Testing](https://start.nicepay.co.kr/)
- [Support Center](https://start.nicepay.co.kr/homepage/fnq.do)

### Test Environment
- **Sandbox URL**: `https://sandbox-pay.nicepay.co.kr`
- **Sandbox API**: `https://sandbox-api.nicepay.co.kr`
- **Test Cards**: Available in NicePay dashboard

### Production Environment
- **Production URL**: `https://pay.nicepay.co.kr`
- **Production API**: `https://api.nicepay.co.kr`
- **Live Transactions**: Real money transactions

## 🎉 Success Checklist

- [ ] SDK loads successfully
- [ ] Client key is valid
- [ ] Return URL is accessible
- [ ] Payment window opens
- [ ] User can authenticate
- [ ] Payment completes
- [ ] Callback receives data
- [ ] Transaction appears in dashboard

---

**Happy coding! 🚀** 