import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  console.log('[Welcome Email] API called at:', new Date().toISOString())
  
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      console.error('[Welcome Email] Missing email or password')
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check environment variables
    const emailSender = process.env.EMAIL_SENDER
    const emailPassword = process.env.EMAIL_PASSWORD

    if (!emailSender || !emailPassword) {
      console.error('[Welcome Email] Email credentials not configured')
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    console.log('[Welcome Email] Creating transporter...')
    
    // Create transporter for Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailSender,
        pass: emailPassword
      }
    })

    // Email content (matching your original Cloud Function)
    const subject = 'ようこそ、Stackへ 🎉'
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
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0;">ようこそ、Stackへ 🎉</h1>
  </div>
  <div class="content">
    <p>Stackへのご登録ありがとうございます！</p>
    <p>あなたのログイン情報は以下の通りです：</p>
    
    <div class="credentials">
      <div class="credential-item">
        <div class="credential-label">📧 メールアドレス:</div>
        <div class="credential-value">${email}</div>
      </div>
      <div class="credential-item">
        <div class="credential-label">🔐 パスワード:</div>
        <div class="credential-value">${password}</div>
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
    `

    const textContent = `
Stackへのログイン情報は以下の通りです：

📧 メールアドレス: ${email}
🔐 パスワード: ${password}

この情報でアプリにログインしてください。
自己投資にハマり、人生を変えにいきましょう💪

アプリのリンク
https://apps.apple.com/jp/app/stack-%E8%87%AA%E5%B7%B1%E6%8A%95%E8%B3%87%E3%82%A2%E3%83%97%E3%83%AA/id6745755185?l=en-US
    `

    // Send email
    console.log('[Welcome Email] Sending email to:', email)
    const info = await transporter.sendMail({
      from: `"Stack" <${emailSender}>`,
      to: email,
      subject: subject,
      text: textContent,
      html: htmlContent
    })

    console.log('[Welcome Email] Email sent successfully:', info.messageId)
    
    return NextResponse.json({
      success: true,
      messageId: info.messageId
    })

  } catch (error: any) {
    console.error('[Welcome Email] Error sending email:', error)
    console.error('[Welcome Email] Error details:', {
      message: error.message,
      code: error.code,
      command: error.command
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to send welcome email',
        details: error.message
      },
      { status: 500 }
    )
  }
}

