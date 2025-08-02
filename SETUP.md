# 🚀 Quick Setup Guide

## Bước 1: Tạo file .env
```bash
npm run setup
```

## Bước 2: Lấy NicePay Sandbox Keys

1. **Đăng ký tài khoản**: [https://start.nicepay.co.kr/merchant/login/main.do](https://start.nicepay.co.kr/merchant/login/main.do)

2. **Tạo sandbox store**:
   - Đăng nhập vào NicePay
   - Click "테스트 상점 개설하기" (Create Test Store)
   - Đặt tên cho store

3. **Lấy keys**:
   - Vào **개발정보** (Development Info)
   - Copy **Client Key** (bắt đầu với `S2_`)
   - Copy **Secret Key**

## Bước 3: Cập nhật file .env

Mở file `.env` và thay thế:
```env
# Thay thế bằng keys thật của bạn
NICEPAY_CLIENT_KEY=S2_YOUR_ACTUAL_CLIENT_KEY
NICEPAY_SECRET_KEY=YOUR_ACTUAL_SECRET_KEY
```

## Bước 4: Chạy ứng dụng

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

## Bước 5: Test

Mở trình duyệt: `http://localhost:3000`

---

## 🔧 Troubleshooting

### Nếu gặp lỗi "Invalid client key":
- Kiểm tra client key có đúng format `S2_...` không
- Đảm bảo đã restart server sau khi cập nhật .env

### Nếu gặp lỗi CORS:
- Đảm bảo server đang chạy trên `localhost:3000`
- Kiểm tra firewall settings

### Nếu không thấy payment window:
- Kiểm tra console browser có lỗi gì không
- Đảm bảo đã include NicePay JS SDK

---

## 📞 Support

- **NicePay Dashboard**: https://start.nicepay.co.kr/
- **Documentation**: https://github.com/nicepayments/nicepay-manual
- **Web Log**: Xem trong NicePay dashboard để debug 