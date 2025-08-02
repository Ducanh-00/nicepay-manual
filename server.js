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