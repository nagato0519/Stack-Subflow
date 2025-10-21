/**
 * Test script to verify Gmail email sending works
 * 
 * Usage:
 *   1. Make sure EMAIL_SENDER and EMAIL_PASSWORD are set in .env.local
 *   2. Run: node test-email.js test@example.com
 */

const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

const testEmail = process.argv[2];

if (!testEmail) {
  console.error('❌ Please provide a test email address');
  console.log('Usage: node test-email.js test@example.com');
  process.exit(1);
}

const emailSender = process.env.EMAIL_SENDER;
const emailPassword = process.env.EMAIL_PASSWORD;

if (!emailSender || !emailPassword) {
  console.error('❌ Missing environment variables!');
  console.log('Required in .env.local:');
  console.log('  EMAIL_SENDER=contact@stack-community.org');
  console.log('  EMAIL_PASSWORD=gljjgeybuyuubypn');
  process.exit(1);
}

console.log('📧 Testing email configuration...');
console.log('From:', emailSender);
console.log('To:', testEmail);
console.log('');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailSender,
    pass: emailPassword
  }
});

const testPassword = 'TestPassword123!';

const subject = 'ようこそ、Stackへ 🎉';
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif;
      line-height: 1.8;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 10px 10px 0 0;
      text-align: center;
    }
    .content {
      background: #f9f9f9;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .credentials {
      background: white;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .credential-item {
      margin: 10px 0;
      font-size: 16px;
    }
    .credential-label {
      font-weight: bold;
      color: #667eea;
    }
    .credential-value {
      font-family: monospace;
      background: #f0f0f0;
      padding: 8px 12px;
      border-radius: 4px;
      display: inline-block;
      margin-top: 5px;
    }
    .app-link {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      color: #666;
      font-size: 14px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }
    .test-banner {
      background: #fff3cd;
      border: 2px solid #ffc107;
      color: #856404;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
      text-align: center;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="test-banner">
    🧪 これはテストメールです / This is a test email
  </div>
  <div class="header">
    <h1 style="margin: 0;">ようこそ、Stackへ 🎉</h1>
  </div>
  <div class="content">
    <p>Stackへのご登録ありがとうございます！</p>
    <p>あなたのログイン情報は以下の通りです：</p>
    
    <div class="credentials">
      <div class="credential-item">
        <div class="credential-label">📧 メールアドレス:</div>
        <div class="credential-value">${testEmail}</div>
      </div>
      <div class="credential-item">
        <div class="credential-label">🔐 パスワード:</div>
        <div class="credential-value">${testPassword}</div>
      </div>
    </div>

    <p>この情報でアプリにログインしてください。<br>
    自己投資にハマり、人生を変えにいきましょう💪</p>

    <div style="text-align: center;">
      <a href="https://apps.apple.com/jp/app/stack-%E8%87%AA%E5%B7%B1%E6%8A%95%E8%B3%87%E3%82%A2%E3%83%97%E3%83%AA/id6745755185?l=en-US" class="app-link">
        アプリをダウンロード 📱
      </a>
    </div>

    <p style="margin-top: 30px; font-size: 14px; color: #666;">
      ⚠️ このメールには重要なログイン情報が含まれています。<br>
      安全な場所に保存し、他の人と共有しないでください。
    </p>
  </div>
  <div class="footer">
    <p>このメールに心当たりがない場合は、削除してください。</p>
    <p>© 2024 Stack. All rights reserved.</p>
  </div>
</body>
</html>
`;

const textContent = `
🧪 これはテストメールです / This is a test email

Stackへのログイン情報は以下の通りです：

📧 メールアドレス: ${testEmail}
🔐 パスワード: ${testPassword}

この情報でアプリにログインしてください。
自己投資にハマり、人生を変えにいきましょう💪

アプリのリンク
https://apps.apple.com/jp/app/stack-%E8%87%AA%E5%B7%B1%E6%8A%95%E8%B3%87%E3%82%A2%E3%83%97%E3%83%AA/id6745755185?l=en-US
`;

console.log('📤 Sending test email...');

transporter.sendMail({
  from: `"Stack (TEST)" <${emailSender}>`,
  to: testEmail,
  subject: `[TEST] ${subject}`,
  text: textContent,
  html: htmlContent
})
.then(info => {
  console.log('');
  console.log('✅ Email sent successfully!');
  console.log('Message ID:', info.messageId);
  console.log('');
  console.log('📬 Check your inbox at:', testEmail);
  console.log('💡 Also check your SPAM/Junk folder');
  console.log('');
  console.log('✨ If you received the email, your setup is working perfectly!');
  process.exit(0);
})
.catch(error => {
  console.error('');
  console.error('❌ Failed to send email');
  console.error('Error:', error.message);
  console.error('');
  console.error('Common issues:');
  console.error('  1. Password has spaces - should be: gljjgeybuyuubypn (no spaces)');
  console.error('  2. Wrong email address');
  console.error('  3. 2-Step Verification not enabled on Gmail');
  console.error('  4. App Password is incorrect or revoked');
  console.error('');
  console.error('See GMAIL_SETUP.md for detailed troubleshooting');
  process.exit(1);
});

