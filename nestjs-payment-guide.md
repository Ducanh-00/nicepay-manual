# 💳 NestJS + NicePay Easy Payment Guide
## Hướng dẫn implement Naver Pay & Kakao Pay với NestJS

---

## 📋 **Mục lục**
1. [Chuẩn bị dự án](#bước-1-chuẩn-bị-dự-án)
2. [Cài đặt dependencies](#bước-2-cài-đặt-dependencies)
3. [Cấu hình environment](#bước-3-cấu-hình-environment)
4. [Tạo NicePay Module](#bước-4-tạo-nicepay-module)
5. [Tạo Payment Service](#bước-5-tạo-payment-service)
6. [Tạo Payment Controller](#bước-6-tạo-payment-controller)
7. [Tạo DTOs](#bước-7-tạo-dtos)
8. [Tạo Frontend](#bước-8-tạo-frontend)
9. [Test và Debug](#bước-9-test-và-debug)
10. [Deploy Production](#bước-10-deploy-production)

---

## 🛠️ **Bước 1: Chuẩn bị dự án**

### **1.1 Tạo dự án NestJS mới**
```bash
# Cài đặt NestJS CLI (nếu chưa có)
npm i -g @nestjs/cli

# Tạo dự án mới
nest new nicepay-payment-app
cd nicepay-payment-app

# Cấu trúc dự án sẽ như sau:
nicepay-payment-app/
├── src/
│   ├── nicepay/
│   │   ├── dto/
│   │   ├── nicepay.module.ts
│   │   ├── nicepay.service.ts
│   │   └── nicepay.controller.ts
│   ├── app.module.ts
│   └── main.ts
├── public/
│   ├── index.html
│   └── payment.html
├── .env
└── package.json
```

### **1.2 Cấu trúc thư mục**
```bash
# Tạo thư mục cần thiết
mkdir -p src/nicepay/dto
mkdir -p public
mkdir -p config
```

---

## 📦 **Bước 2: Cài đặt dependencies**

### **2.1 Cài đặt packages cần thiết**
```bash
# Core dependencies
npm install @nestjs/config
npm install @nestjs/common
npm install @nestjs/platform-express

# HTTP client
npm install axios

# Validation
npm install class-validator
npm install class-transformer

# CORS (nếu cần)
npm install @nestjs/common

# Development dependencies
npm install -D @types/node
npm install -D @types/express
```

### **2.2 Cập nhật package.json**
```json
{
  "name": "nicepay-payment-app",
  "version": "1.0.0",
  "description": "NicePay Easy Payment with NestJS",
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

---

## ⚙️ **Bước 3: Cấu hình environment**

### **3.1 Tạo file .env**
```env
# NicePay Configuration
NICEPAY_CLIENT_KEY=S2_YOUR_SANDBOX_CLIENT_KEY
NICEPAY_SECRET_KEY=YOUR_SANDBOX_SECRET_KEY

# Environment
NODE_ENV=development
PORT=3000

# NicePay URLs
NICEPAY_PAYMENT_DOMAIN=https://pay.nicepay.co.kr
NICEPAY_API_DOMAIN=https://api.nicepay.co.kr

# Sandbox URLs (nếu dùng sandbox)
# NICEPAY_PAYMENT_DOMAIN=https://sandbox-pay.nicepay.co.kr
# NICEPAY_API_DOMAIN=https://sandbox-api.nicepay.co.kr

# Application URLs
APP_URL=http://localhost:3000
CALLBACK_URL=http://localhost:3000/payment/callback
```

### **3.2 Tạo file .env.example**
```env
# NicePay Configuration
NICEPAY_CLIENT_KEY=S2_YOUR_SANDBOX_CLIENT_KEY
NICEPAY_SECRET_KEY=YOUR_SANDBOX_SECRET_KEY

# Environment
NODE_ENV=development
PORT=3000

# NicePay URLs
NICEPAY_PAYMENT_DOMAIN=https://pay.nicepay.co.kr
NICEPAY_API_DOMAIN=https://api.nicepay.co.kr

# Application URLs
APP_URL=http://localhost:3000
CALLBACK_URL=http://localhost:3000/payment/callback
```

### **3.3 Cập nhật .gitignore**
```gitignore
# Environment
.env
.env.local
.env.production

# Dependencies
node_modules/

# Build
dist/
build/

# Logs
logs/
*.log

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

---

## 🏗️ **Bước 4: Tạo NicePay Module**

### **4.1 Tạo NicePay Module (src/nicepay/nicepay.module.ts)**
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NicepayService } from './nicepay.service';
import { NicepayController } from './nicepay.controller';

@Module({
  imports: [ConfigModule],
  controllers: [NicepayController],
  providers: [NicepayService],
  exports: [NicepayService],
})
export class NicepayModule {}
```

### **4.2 Cập nhật App Module (src/app.module.ts)**
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NicepayModule } from './nicepay/nicepay.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    NicepayModule,
  ],
})
export class AppModule {}
```

---

## 🔧 **Bước 5: Tạo Payment Service**

### **5.1 Tạo NicePay Service (src/nicepay/nicepay.service.ts)**
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { 
  CreatePaymentDto, 
  PaymentCallbackDto, 
  PaymentStatusDto 
} from './dto';

@Injectable()
export class NicepayService {
  private readonly logger = new Logger(NicepayService.name);
  private readonly clientKey: string;
  private readonly secretKey: string;
  private readonly paymentDomain: string;
  private readonly apiDomain: string;
  private readonly callbackUrl: string;

  constructor(private configService: ConfigService) {
    this.clientKey = this.configService.get<string>('NICEPAY_CLIENT_KEY');
    this.secretKey = this.configService.get<string>('NICEPAY_SECRET_KEY');
    this.paymentDomain = this.configService.get<string>('NICEPAY_PAYMENT_DOMAIN');
    this.apiDomain = this.configService.get<string>('NICEPAY_API_DOMAIN');
    this.callbackUrl = this.configService.get<string>('CALLBACK_URL');
  }

  /**
   * Tạo Basic Auth header
   */
  private createBasicAuth(): string {
    const credentials = `${this.clientKey}:${this.secretKey}`;
    return Buffer.from(credentials).toString('base64');
  }

  /**
   * Tạo payment URL và form data
   */
  async createPayment(createPaymentDto: CreatePaymentDto) {
    try {
      const { method, amount, goodsName, orderId } = createPaymentDto;
      
      // Sử dụng URL chính xác cho NicePay
      const paymentUrl = `${this.paymentDomain}/v1/payment/request`;
      const formData = {
        clientId: this.clientKey,
        method: method,
        orderId: orderId,
        amount: amount.toString(),
        goodsName: goodsName,
        returnUrl: this.callbackUrl,
        // Thêm các parameters cần thiết khác
        currency: 'KRW',
        mallReserved: 'test',
        useEscrow: 'false',
        language: 'ko'
      };

      this.logger.log(`Payment created: ${JSON.stringify(formData)}`);

      return {
        success: true,
        paymentUrl: paymentUrl,
        formData: formData,
        returnUrl: this.callbackUrl,
      };
    } catch (error) {
      this.logger.error(`Payment creation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Xử lý payment callback
   */
  async handlePaymentCallback(callbackData: PaymentCallbackDto) {
    try {
      const {
        authResultCode,
        authResultMsg,
        tid,
        orderId,
        amount,
        signature,
        clientId,
      } = callbackData;

      this.logger.log(`Payment callback received: ${JSON.stringify(callbackData)}`);

      if (authResultCode === '0000') {
        this.logger.log('Authentication successful, processing payment...');
        
        // Approve payment
        const paymentResult = await this.approvePayment(tid, amount);
        
        return {
          success: true,
          message: 'Payment processed successfully',
          data: paymentResult,
        };
      } else {
        this.logger.error(`Authentication failed: ${authResultMsg}`);
        return {
          success: false,
          message: 'Authentication failed',
          error: authResultMsg,
        };
      }
    } catch (error) {
      this.logger.error(`Payment processing error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Approve payment
   */
  async approvePayment(tid: string, amount: string) {
    try {
      this.logger.log(`Approving payment: TID=${tid}, Amount=${amount}`);
      
      const response = await axios.post(
        `${this.apiDomain}/v1/payments/${tid}`,
        {
          amount: parseInt(amount),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${this.createBasicAuth()}`,
          },
        }
      );
      
      this.logger.log('Payment approval response:', response.data);
      return response.data;
    } catch (error) {
      this.logger.error('Payment approval error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Kiểm tra payment status
   */
  async getPaymentStatus(tid: string) {
    try {
      this.logger.log(`Checking payment status for TID: ${tid}`);
      
      const response = await axios.get(
        `${this.apiDomain}/v1/payments/${tid}`,
        {
          headers: {
            'Authorization': `Basic ${this.createBasicAuth()}`,
          },
        }
      );
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      this.logger.error('Payment status check error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Cancel payment
   */
  async cancelPayment(tid: string, amount: string, reason?: string) {
    try {
      this.logger.log(`Cancelling payment: TID=${tid}, Amount=${amount}, Reason=${reason}`);
      
      const response = await axios.post(
        `${this.apiDomain}/v1/payments/${tid}/cancel`,
        {
          amount: parseInt(amount),
          reason: reason || 'User cancellation',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${this.createBasicAuth()}`,
          },
        }
      );
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      this.logger.error('Payment cancellation error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Lấy cấu hình NicePay
   */
  getConfig() {
    return {
      clientKey: this.clientKey,
      paymentDomain: this.paymentDomain,
      isSandbox: this.paymentDomain.includes('sandbox'),
    };
  }
}
```

---

## 🎮 **Bước 6: Tạo Payment Controller**

### **6.1 Tạo NicePay Controller (src/nicepay/nicepay.controller.ts)**
```typescript
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Res,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { NicepayService } from './nicepay.service';
import {
  CreatePaymentDto,
  PaymentCallbackDto,
  PaymentStatusDto,
  CancelPaymentDto,
} from './dto';

@Controller('payment')
export class NicepayController {
  constructor(private readonly nicepayService: NicepayService) {}

  /**
   * Tạo payment
   */
  @Post('create')
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    try {
      return await this.nicepayService.createPayment(createPaymentDto);
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Payment callback
   */
  @Post('callback')
  async paymentCallback(@Body() callbackData: PaymentCallbackDto) {
    try {
      return await this.nicepayService.handlePaymentCallback(callbackData);
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Kiểm tra payment status
   */
  @Get('status/:tid')
  async getPaymentStatus(@Param('tid') tid: string) {
    try {
      return await this.nicepayService.getPaymentStatus(tid);
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Cancel payment
   */
  @Post('cancel/:tid')
  async cancelPayment(
    @Param('tid') tid: string,
    @Body() cancelPaymentDto: CancelPaymentDto,
  ) {
    try {
      const { amount, reason } = cancelPaymentDto;
      return await this.nicepayService.cancelPayment(tid, amount, reason);
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lấy cấu hình NicePay
   */
  @Get('config')
  getConfig() {
    return this.nicepayService.getConfig();
  }

  /**
   * Redirect to payment (Server-side redirect) - v1 API support
   */
  @Get('v1/payment/redirect')
  async redirectToPaymentV1(@Query() query: any, @Res() res: Response) {
    return this.redirectToPayment(query, res);
  }

  /**
   * Redirect to payment (Server-side redirect)
   */
  @Get('redirect')
  async redirectToPayment(@Query() query: any, @Res() res: Response) {
    try {
      const { method = 'naverpayCard', amount = '1000', goodsName = 'Test Product' } = query;
      const orderId = `REDIRECT_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      const paymentData = await this.nicepayService.createPayment({
        method,
        amount: parseInt(amount),
        goodsName,
        orderId,
      });

      // Tạo HTML form auto-submit thay vì redirect
      const html = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Redirecting to NicePay...</title>
          <style>
              body { 
                  font-family: Arial, sans-serif; 
                  text-align: center; 
                  padding: 50px; 
                  background: #f5f5f5;
              }
              .spinner { 
                  border: 4px solid #f3f3f3; 
                  border-top: 4px solid #667eea; 
                  border-radius: 50%; 
                  width: 40px; 
                  height: 40px; 
                  animation: spin 1s linear infinite; 
                  margin: 20px auto; 
              }
              @keyframes spin { 
                  0% { transform: rotate(0deg); } 
                  100% { transform: rotate(360deg); } 
              }
              .container {
                  background: white;
                  padding: 30px;
                  border-radius: 10px;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                  max-width: 400px;
                  margin: 0 auto;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h2>🔄 Redirecting to NicePay...</h2>
              <div class="spinner"></div>
              <p>Please wait while we redirect you to the payment page.</p>
              
              <form id="paymentForm" method="POST" action="${paymentData.paymentUrl}">
                  ${Object.entries(paymentData.formData)
                    .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}">`)
                    .join('')}
              </form>
              
              <script>
                  setTimeout(() => {
                      document.getElementById('paymentForm').submit();
                  }, 2000);
              </script>
          </div>
      </body>
      </html>
      `;

      res.send(html);
    } catch (error) {
      res.status(500).send('Payment redirect failed');
    }
  }

  /**
   * Test different payment URLs
   */
  @Get('test-urls')
  async testPaymentUrls(@Res() res: Response) {
    try {
      const testUrls = [
        `${this.paymentDomain}/v1/payment`,
        `${this.paymentDomain}/v1/payment/request`,
        `${this.paymentDomain}/payment`,
        `${this.paymentDomain}/payment/request`,
        `${this.paymentDomain}/v1/payment/start`,
        `${this.paymentDomain}/start`
      ];

      const results = [];
      
      for (const url of testUrls) {
        try {
          const response = await axios.get(url, { timeout: 5000 });
          results.push({
            url: url,
            status: response.status,
            available: true
          });
        } catch (error) {
          results.push({
            url: url,
            status: error.response?.status || 'timeout',
            available: false,
            error: error.message
          });
        }
      }

      res.json({
        success: true,
        testResults: results,
        recommendedUrl: results.find(r => r.available)?.url || 'No available URL found'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}
```

---

## 📝 **Bước 7: Tạo DTOs**

### **7.1 Tạo DTOs (src/nicepay/dto/index.ts)**
```typescript
export * from './create-payment.dto';
export * from './payment-callback.dto';
export * from './payment-status.dto';
export * from './cancel-payment.dto';
```

### **7.2 Create Payment DTO (src/nicepay/dto/create-payment.dto.ts)**
```typescript
import { IsString, IsNumber, IsNotEmpty, IsIn } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['naverpayCard', 'kakaopay', 'kakaopayCard', 'kakaopayMoney', 'card', 'vbank'])
  method: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  goodsName: string;

  @IsString()
  @IsNotEmpty()
  orderId: string;
}
```

### **7.3 Payment Callback DTO (src/nicepay/dto/payment-callback.dto.ts)**
```typescript
import { IsString, IsOptional } from 'class-validator';

export class PaymentCallbackDto {
  @IsString()
  @IsOptional()
  authResultCode?: string;

  @IsString()
  @IsOptional()
  authResultMsg?: string;

  @IsString()
  @IsOptional()
  tid?: string;

  @IsString()
  @IsOptional()
  orderId?: string;

  @IsString()
  @IsOptional()
  amount?: string;

  @IsString()
  @IsOptional()
  signature?: string;

  @IsString()
  @IsOptional()
  clientId?: string;
}
```

### **7.4 Payment Status DTO (src/nicepay/dto/payment-status.dto.ts)**
```typescript
import { IsString, IsNotEmpty } from 'class-validator';

export class PaymentStatusDto {
  @IsString()
  @IsNotEmpty()
  tid: string;
}
```

### **7.5 Cancel Payment DTO (src/nicepay/dto/cancel-payment.dto.ts)**
```typescript
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CancelPaymentDto {
  @IsString()
  @IsNotEmpty()
  amount: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
```

---

## 🎨 **Bước 8: Tạo Frontend**

### **8.1 Tạo main HTML (public/index.html)**
```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NicePay Easy Payment Test</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .payment-method {
            margin: 20px 0;
            padding: 20px;
            border: 2px solid #e9ecef;
            border-radius: 10px;
            background: #f8f9fa;
        }
        .payment-method.naver {
            border-color: #03c75a;
            background: linear-gradient(135deg, #03c75a 0%, #02a94f 100%);
            color: white;
        }
        .payment-method.kakao {
            border-color: #fee500;
            background: linear-gradient(135deg, #fee500 0%, #fdd835 100%);
            color: #3c1e1e;
        }
        .form-group {
            margin: 15px 0;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input, select {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
        }
        button {
            background: #007bff;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin: 5px;
            transition: background 0.3s;
        }
        button:hover {
            background: #0056b3;
        }
        button.naver-btn {
            background: #03c75a;
        }
        button.kakao-btn {
            background: #fee500;
            color: #3c1e1e;
        }
        .status {
            padding: 15px;
            margin: 15px 0;
            border-radius: 5px;
            font-weight: bold;
        }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        .info { background: #d1ecf1; color: #0c5460; }
        .log {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            max-height: 200px;
            overflow-y: auto;
            border: 1px solid #dee2e6;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>💳 NicePay Easy Payment Test</h1>
        <p>Test Naver Pay and Kakao Pay with NestJS backend</p>
        
        <div id="status" class="status info">Ready to test payments...</div>
        
        <!-- Naver Pay Section -->
        <div class="payment-method naver">
            <h3>🟢 Naver Pay</h3>
            <div class="form-group">
                <label for="naverAmount">Amount (KRW):</label>
                <input type="number" id="naverAmount" value="1000" min="100" step="100">
            </div>
            <div class="form-group">
                <label for="naverProduct">Product Name:</label>
                <input type="text" id="naverProduct" value="Naver Pay Test Product">
            </div>
            <button class="naver-btn" onclick="testNaverPay()">Test Naver Pay</button>
            <button onclick="redirectNaverPay()">Redirect Naver Pay</button>
        </div>
        
        <!-- Kakao Pay Section -->
        <div class="payment-method kakao">
            <h3>🟡 Kakao Pay</h3>
            <div class="form-group">
                <label for="kakaoAmount">Amount (KRW):</label>
                <input type="number" id="kakaoAmount" value="1000" min="100" step="100">
            </div>
            <div class="form-group">
                <label for="kakaoProduct">Product Name:</label>
                <input type="text" id="kakaoProduct" value="Kakao Pay Test Product">
            </div>
            <button class="kakao-btn" onclick="testKakaoPay()">Test Kakao Pay</button>
            <button onclick="redirectKakaoPay()">Redirect Kakao Pay</button>
        </div>
        
        <!-- Console Logs -->
        <h3>Console Logs:</h3>
        <div id="console" class="log"></div>
    </div>

    <!-- NicePay SDK -->
    <script src="https://pay.nicepay.co.kr/v1/js/"></script>
    
    <script>
        let logCount = 0;
        
        // Custom console log
        function log(message, type = 'info') {
            const consoleDiv = document.getElementById('console');
            const timestamp = new Date().toLocaleTimeString();
            logCount++;
            consoleDiv.innerHTML += `[${logCount}] [${timestamp}] ${message}\n`;
            consoleDiv.scrollTop = consoleDiv.scrollHeight;
            console.log(message);
        }
        
        // Update status
        function updateStatus(message, type = 'info') {
            const statusDiv = document.getElementById('status');
            statusDiv.textContent = message;
            statusDiv.className = `status ${type}`;
        }
        
        // Test Naver Pay with SDK
        async function testNaverPay() {
            const amount = document.getElementById('naverAmount').value;
            const product = document.getElementById('naverProduct').value;
            const orderId = 'NAVER_' + Date.now();
            
            log('🟢 Testing Naver Pay...');
            updateStatus('Testing Naver Pay...', 'info');
            
            try {
                // Get config from backend
                const configResponse = await fetch('/payment/config');
                const config = await configResponse.json();
                
                if (typeof AUTHNICE !== 'undefined') {
                    AUTHNICE.requestPay({
                        clientId: config.clientKey,
                        method: 'naverpayCard',
                        orderId: orderId,
                        amount: parseInt(amount),
                        goodsName: product,
                        returnUrl: window.location.origin + '/payment/callback',
                        fnError: function(result) {
                            log(`❌ Naver Pay Error: ${result.errorMsg}`, 'error');
                            updateStatus('Naver Pay failed', 'error');
                        }
                    });
                    log('✅ Naver Pay request sent successfully');
                    updateStatus('Naver Pay request sent', 'success');
                } else {
                    log('❌ NicePay SDK not loaded', 'error');
                    updateStatus('SDK not loaded', 'error');
                }
            } catch (error) {
                log(`❌ Naver Pay request failed: ${error.message}`, 'error');
                updateStatus('Naver Pay request failed', 'error');
            }
        }
        
        // Test Kakao Pay with SDK
        async function testKakaoPay() {
            const amount = document.getElementById('kakaoAmount').value;
            const product = document.getElementById('kakaoProduct').value;
            const orderId = 'KAKAO_' + Date.now();
            
            log('🟡 Testing Kakao Pay...');
            updateStatus('Testing Kakao Pay...', 'info');
            
            try {
                // Get config from backend
                const configResponse = await fetch('/payment/config');
                const config = await configResponse.json();
                
                if (typeof AUTHNICE !== 'undefined') {
                    AUTHNICE.requestPay({
                        clientId: config.clientKey,
                        method: 'kakaopay',
                        orderId: orderId,
                        amount: parseInt(amount),
                        goodsName: product,
                        returnUrl: window.location.origin + '/payment/callback',
                        fnError: function(result) {
                            log(`❌ Kakao Pay Error: ${result.errorMsg}`, 'error');
                            updateStatus('Kakao Pay failed', 'error');
                        }
                    });
                    log('✅ Kakao Pay request sent successfully');
                    updateStatus('Kakao Pay request sent', 'success');
                } else {
                    log('❌ NicePay SDK not loaded', 'error');
                    updateStatus('SDK not loaded', 'error');
                }
            } catch (error) {
                log(`❌ Kakao Pay request failed: ${error.message}`, 'error');
                updateStatus('Kakao Pay request failed', 'error');
            }
        }
        
        // Redirect Naver Pay
        function redirectNaverPay() {
            const amount = document.getElementById('naverAmount').value;
            const product = document.getElementById('naverProduct').value;
            
            const params = new URLSearchParams({
                method: 'naverpayCard',
                amount: amount,
                goodsName: product
            });
            
            window.location.href = `/payment/redirect?${params.toString()}`;
        }
        
        // Redirect Kakao Pay
        function redirectKakaoPay() {
            const amount = document.getElementById('kakaoAmount').value;
            const product = document.getElementById('kakaoProduct').value;
            
            const params = new URLSearchParams({
                method: 'kakaopay',
                amount: amount,
                goodsName: product
            });
            
            window.location.href = `/payment/redirect?${params.toString()}`;
        }
        
        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            log('🚀 Payment test page loaded');
            updateStatus('Ready to test payments', 'info');
            
            // Check SDK loading
            let checkCount = 0;
            const maxChecks = 10;
            const checkInterval = setInterval(() => {
                checkCount++;
                if (typeof AUTHNICE !== 'undefined') {
                    log('✅ NicePay SDK loaded successfully');
                    updateStatus('SDK loaded - Ready to test', 'success');
                    clearInterval(checkInterval);
                } else if (checkCount >= maxChecks) {
                    log('⏰ SDK loading timeout', 'warning');
                    updateStatus('SDK loading timeout - Some features may not work', 'warning');
                    clearInterval(checkInterval);
                }
            }, 1000);
        });
    </script>
</body>
</html>
```

### **8.2 Cập nhật main.ts để serve static files**
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());
  
  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'public'));
  
  // Global prefix
  app.setGlobalPrefix('api');
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📱 Payment test page: http://localhost:${port}/index.html`);
}
bootstrap();
```

---

## 🧪 **Bước 9: Test và Debug**

### **9.1 Chạy ứng dụng**
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

### **9.2 Test các endpoints**
```bash
# Test config
curl http://localhost:3000/api/payment/config

# Test create payment
curl -X POST http://localhost:3000/api/payment/create \
  -H "Content-Type: application/json" \
  -d '{
    "method": "naverpayCard",
    "amount": 1000,
    "goodsName": "Test Product",
    "orderId": "TEST_001"
  }'

# Test redirect
http://localhost:3000/api/v1/payment/redirect?method=naverpayCard&amount=1000&goodsName=Test
```

### **9.3 Test Frontend**
```bash
# Mở browser
http://localhost:3000/index.html
```

### **9.4 Debug tips**
```typescript
// Thêm logging chi tiết
this.logger.debug('Payment data:', paymentData);

// Check environment variables
console.log('Environment:', {
  clientKey: this.clientKey,
  paymentDomain: this.paymentDomain,
  apiDomain: this.apiDomain,
});
```

---

## 🚀 **Bước 10: Deploy Production**

### **10.1 Environment Production**
```env
# Production .env
NICEPAY_CLIENT_KEY=YOUR_PRODUCTION_CLIENT_KEY
NICEPAY_SECRET_KEY=YOUR_PRODUCTION_SECRET_KEY
NODE_ENV=production
PORT=3000
NICEPAY_PAYMENT_DOMAIN=https://pay.nicepay.co.kr
NICEPAY_API_DOMAIN=https://api.nicepay.co.kr
APP_URL=https://your-domain.com
CALLBACK_URL=https://your-domain.com/api/payment/callback
```

### **10.2 Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY public ./public

EXPOSE 3000

CMD ["node", "dist/main"]
```

### **10.3 Docker Compose**
```yaml
version: '3.8'
services:
  nicepay-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NICEPAY_CLIENT_KEY=${NICEPAY_CLIENT_KEY}
      - NICEPAY_SECRET_KEY=${NICEPAY_SECRET_KEY}
      - NICEPAY_PAYMENT_DOMAIN=${NICEPAY_PAYMENT_DOMAIN}
      - NICEPAY_API_DOMAIN=${NICEPAY_API_DOMAIN}
      - APP_URL=${APP_URL}
      - CALLBACK_URL=${CALLBACK_URL}
```

### **10.4 PM2 (Alternative)**
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start dist/main.js --name "nicepay-app"

# Save PM2 configuration
pm2 save
pm2 startup
```

---

## 📋 **Checklist hoàn thành**

- [ ] ✅ Tạo dự án NestJS
- [ ] ✅ Cài đặt dependencies
- [ ] ✅ Cấu hình environment
- [ ] ✅ Tạo NicePay Module
- [ ] ✅ Tạo Payment Service
- [ ] ✅ Tạo Payment Controller
- [ ] ✅ Tạo DTOs
- [ ] ✅ Tạo Frontend
- [ ] ✅ Test và Debug
- [ ] ✅ Deploy Production

---

## 🔗 **API Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payment/config` | Lấy cấu hình NicePay |
| POST | `/api/payment/create` | Tạo payment |
| POST | `/api/payment/callback` | Xử lý callback |
| GET | `/api/payment/status/:tid` | Kiểm tra status |
| POST | `/api/payment/cancel/:tid` | Cancel payment |
| GET | `/api/payment/redirect` | Redirect to payment |

---

## 🎯 **Method Values**

| Payment Method | Method Value |
|----------------|--------------|
| Naver Pay | `naverpayCard` |
| Kakao Pay | `kakaopay` |
| Kakao Pay Card | `kakaopayCard` |
| Kakao Pay Money | `kakaopayMoney` |

---

**Happy coding! 🚀** 