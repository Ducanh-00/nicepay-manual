const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// NicePay Configuration
const NICEPAY_CONFIG = {
    clientKey: process.env.NICEPAY_CLIENT_KEY || 'S2_YOUR_SANDBOX_CLIENT_KEY',
    secretKey: process.env.NICEPAY_SECRET_KEY || 'YOUR_SANDBOX_SECRET_KEY',
    paymentDomain: process.env.PAYMENT_DOMAIN || 'https://pay.nicepay.co.kr',
    apiDomain: process.env.API_DOMAIN || 'https://api.nicepay.co.kr'
};

// Create Basic Auth credentials
const createBasicAuth = () => {
    const credentials = `${NICEPAY_CONFIG.clientKey}:${NICEPAY_CONFIG.secretKey}`;
    return Buffer.from(credentials).toString('base64');
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/easy-payment', (req, res) => {
    res.sendFile(__dirname + '/public/easy-payment.html');
});

// Payment callback endpoint
app.post('/payment/callback', async (req, res) => {
    console.log('🔔 Payment callback received:', req.body);
    
    const {
        authResultCode,
        authResultMsg,
        tid,
        orderId,
        amount,
        signature,
        clientId
    } = req.body;
    
    try {
        if (authResultCode === '0000') {
            console.log('✅ Authentication successful, processing payment...');
            
            // Approve payment
            const paymentResult = await approvePayment(tid, amount);
            
            res.json({
                success: true,
                message: 'Payment processed successfully',
                data: paymentResult
            });
        } else {
            console.error('❌ Authentication failed:', authResultMsg);
            res.json({
                success: false,
                message: 'Authentication failed',
                error: authResultMsg
            });
        }
    } catch (error) {
        console.error('❌ Payment processing error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment processing failed',
            error: error.message
        });
    }
});

// Payment approval function
async function approvePayment(tid, amount) {
    try {
        console.log(`💰 Approving payment: TID=${tid}, Amount=${amount}`);
        
        const response = await axios.post(
            `${NICEPAY_CONFIG.apiDomain}/v1/payments/${tid}`,
            {
                amount: parseInt(amount)
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${createBasicAuth()}`
                }
            }
        );
        
        console.log('✅ Payment approval response:', response.data);
        return response.data;
        
    } catch (error) {
        console.error('❌ Payment approval error:', error.response?.data || error.message);
        throw error;
    }
}

// Get payment status
app.get('/payment/status/:tid', async (req, res) => {
    try {
        const { tid } = req.params;
        console.log(`🔍 Checking payment status for TID: ${tid}`);
        
        const response = await axios.get(
            `${NICEPAY_CONFIG.apiDomain}/v1/payments/${tid}`,
            {
                headers: {
                    'Authorization': `Basic ${createBasicAuth()}`
                }
            }
        );
        
        res.json({
            success: true,
            data: response.data
        });
        
    } catch (error) {
        console.error('❌ Payment status check error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Cancel payment
app.post('/payment/cancel/:tid', async (req, res) => {
    try {
        const { tid } = req.params;
        const { amount, reason } = req.body;
        
        console.log(`❌ Cancelling payment: TID=${tid}, Amount=${amount}, Reason=${reason}`);
        
        const response = await axios.post(
            `${NICEPAY_CONFIG.apiDomain}/v1/payments/${tid}/cancel`,
            {
                amount: parseInt(amount),
                reason: reason || 'User cancellation'
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${createBasicAuth()}`
                }
            }
        );
        
        res.json({
            success: true,
            data: response.data
        });
        
    } catch (error) {
        console.error('❌ Payment cancellation error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get NicePay configuration
app.get('/api/config', (req, res) => {
    res.json({
        clientKey: NICEPAY_CONFIG.clientKey,
        paymentDomain: NICEPAY_CONFIG.paymentDomain,
        isSandbox: NICEPAY_CONFIG.paymentDomain.includes('sandbox')
    });
});

// Direct payment redirect (alternative method)
app.get('/payment/redirect', async (req, res) => {
    try {
        const { method = 'naverpayCard', amount = 1000, goodsName = 'Test Product' } = req.query;
        
        // Generate order ID
        const orderId = `REDIRECT_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const returnUrl = `${req.protocol}://${req.get('host')}/payment/callback`;
        
        console.log('🚀 Direct payment redirect:', { method, amount, goodsName, orderId });
        
        // Create form data
        const formData = new URLSearchParams();
        formData.append('clientId', NICEPAY_CONFIG.clientKey);
        formData.append('method', method);
        formData.append('orderId', orderId);
        formData.append('amount', amount);
        formData.append('goodsName', goodsName);
        formData.append('returnUrl', returnUrl);
        
        // Send HTML form that auto-submits
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Redirecting to NicePay...</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #667eea; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
        </head>
        <body>
            <h2>🔄 Redirecting to NicePay...</h2>
            <div class="spinner"></div>
            <p>Please wait while we redirect you to the payment page.</p>
            
            <form id="paymentForm" method="POST" action="${NICEPAY_CONFIG.paymentDomain}/payment">
                <input type="hidden" name="clientId" value="${NICEPAY_CONFIG.clientKey}">
                <input type="hidden" name="method" value="${method}">
                <input type="hidden" name="orderId" value="${orderId}">
                <input type="hidden" name="amount" value="${amount}">
                <input type="hidden" name="goodsName" value="${goodsName}">
                <input type="hidden" name="returnUrl" value="${returnUrl}">
            </form>
            
            <script>
                // Auto-submit form after 2 seconds
                setTimeout(() => {
                    document.getElementById('paymentForm').submit();
                }, 2000);
            </script>
        </body>
        </html>
        `;
        
        res.send(html);
        
    } catch (error) {
        console.error('❌ Payment redirect error:', error);
        res.status(500).send('Payment redirect failed');
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 NicePay Test Server running on http://localhost:${PORT}`);
    console.log(`📝 Sandbox Mode: ${NICEPAY_CONFIG.paymentDomain.includes('sandbox') ? 'YES' : 'NO'}`);
    
    if (NICEPAY_CONFIG.clientKey === 'S2_YOUR_SANDBOX_CLIENT_KEY') {
        console.log('⚠️  WARNING: Using default client key. Please update your .env file!');
    } else {
        console.log(`🔑 Client Key: ${NICEPAY_CONFIG.clientKey.substring(0, 10)}...`);
    }
    
    console.log(`🌐 Payment Domain: ${NICEPAY_CONFIG.paymentDomain}`);
    console.log(`🔗 API Domain: ${NICEPAY_CONFIG.apiDomain}`);
}); 