const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up NicePay Test Application...\n');

// Check if .env already exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (fs.existsSync(envPath)) {
    console.log('✅ File .env already exists');
    console.log('📝 Please update your NicePay keys in the .env file:');
    console.log('   - NICEPAY_CLIENT_KEY=S2_YOUR_SANDBOX_CLIENT_KEY');
    console.log('   - NICEPAY_SECRET_KEY=YOUR_SANDBOX_SECRET_KEY\n');
} else {
    // Copy env.example to .env
    if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ Created .env file from env.example');
        console.log('📝 Please update your NicePay keys in the .env file:');
        console.log('   - NICEPAY_CLIENT_KEY=S2_YOUR_SANDBOX_CLIENT_KEY');
        console.log('   - NICEPAY_SECRET_KEY=YOUR_SANDBOX_SECRET_KEY\n');
    } else {
        console.log('❌ env.example file not found');
        process.exit(1);
    }
}

console.log('🚀 Next steps:');
console.log('1. Get your sandbox keys from NicePay dashboard');
console.log('2. Update the .env file with your actual keys');
console.log('3. Run: npm install');
console.log('4. Run: npm run dev');
console.log('5. Open: http://localhost:3000\n');

console.log('🔗 NicePay Dashboard: https://start.nicepay.co.kr/merchant/login/main.do');
console.log('📚 Documentation: https://github.com/nicepayments/nicepay-manual\n'); 