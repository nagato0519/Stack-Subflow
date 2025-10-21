# Gmail App Password Setup Guide

This guide will help you set up a Gmail App Password to send welcome emails from your Stack application.

## What is an App Password?

An **App Password** is a 16-digit passcode that lets you sign in to your Google Account from apps that don't support 2-Step Verification. It's more secure than using your regular password.

---

## Prerequisites

Before you can create an App Password, you need:

1. ✅ **2-Step Verification enabled** on your Google Account
2. ✅ A Gmail account (your main account or a dedicated one for sending emails)

---

## Step-by-Step Instructions

### Step 1: Enable 2-Step Verification (If Not Already Enabled)

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **"Security"** in the left sidebar
3. Under **"How you sign in to Google"**, find **"2-Step Verification"**
4. Click **"Get started"** and follow the setup process
5. Complete the verification setup (you can use your phone number or authenticator app)

### Step 2: Create an App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **"Security"** in the left sidebar
3. Scroll down to **"How you sign in to Google"**
4. Click on **"2-Step Verification"**
5. Scroll down to the bottom and find **"App passwords"**
   - **Note**: If you don't see "App passwords", make sure 2-Step Verification is properly enabled
6. Click on **"App passwords"**
7. You may be asked to sign in again for security

### Step 3: Generate Your App Password

1. Under "Select app", choose **"Mail"** (or "Other" if Mail isn't available)
2. Under "Select device", choose **"Other (Custom name)"**
3. Type a name like: **"Stack Welcome Email Service"**
4. Click **"Generate"**
5. Google will display a 16-character password that looks like: `abcd efgh ijkl mnop`

### Step 4: Save Your App Password

⚠️ **IMPORTANT**: Copy this password immediately! You won't be able to see it again.

```
Example format: abcd efgh ijkl mnop
Remove spaces when using: abcdefghijklmnop
```

---

## Adding to Your Application

### Option 1: Using `.env.local` File (Recommended for Development)

1. Open or create the file `.env.local` in your project root:

```bash
# Gmail Configuration for Welcome Emails
EMAIL_SENDER=your-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
```

2. Replace:
   - `your-email@gmail.com` with your Gmail address
   - `abcdefghijklmnop` with your 16-character app password (no spaces)

### Option 2: Using Vercel Environment Variables (Production)

If deploying to Vercel:

1. Go to your Vercel project dashboard
2. Click on **"Settings"** → **"Environment Variables"**
3. Add two new environment variables:
   - **Name**: `EMAIL_SENDER`  
     **Value**: `your-email@gmail.com`
   - **Name**: `EMAIL_PASSWORD`  
     **Value**: `abcdefghijklmnop` (your app password)
4. Click **"Save"**
5. Redeploy your application

---

## Testing Your Setup

After adding the environment variables:

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Complete a test signup on your application
3. Check the terminal logs for:
   ```
   [Welcome Email] Email sent successfully
   ```

4. Check your inbox (and spam folder) for the welcome email

---

## Troubleshooting

### Issue: "App passwords" option not showing

**Solution**: Make sure 2-Step Verification is enabled and fully set up. Wait a few minutes after enabling it, then refresh the page.

### Issue: "Invalid login" or "Authentication failed"

**Solutions**:
- Make sure you removed all spaces from the app password
- Verify the email address is correct
- Try generating a new app password
- Make sure you're using the app password, not your regular Gmail password

### Issue: Emails going to spam

**Solutions**:
- Ask recipients to mark your email as "Not Spam"
- Consider using a professional email service like SendGrid or AWS SES for production
- Make sure your sender name is clear and professional

### Issue: Environment variables not loading

**Solutions**:
- Make sure `.env.local` is in your project root (same folder as `package.json`)
- Restart your development server after adding variables
- Check there are no typos in the variable names
- Make sure there are no quotes around the values (unless the value itself contains spaces)

---

## Security Best Practices

1. ✅ **Never commit** `.env.local` to Git (it should be in `.gitignore`)
2. ✅ **Use a dedicated email** for sending automated emails (not your personal account)
3. ✅ **Rotate passwords** periodically for security
4. ✅ **Revoke unused** app passwords in your Google Account
5. ✅ **Monitor usage** - Check your sent emails regularly for suspicious activity

---

## Alternative Email Services (Recommended for Production)

For production applications with high email volume, consider:

- **SendGrid** - Free tier: 100 emails/day
- **AWS SES** - Very affordable, scalable
- **Mailgun** - Free tier: 5,000 emails/month
- **Postmark** - Focus on transactional emails

Gmail is great for development and small-scale apps, but dedicated email services offer better deliverability and features for production use.

---

## Quick Reference

### Environment Variables Needed:
```env
EMAIL_SENDER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

### Gmail App Password Link:
https://myaccount.google.com/apppasswords

### Where Emails are Sent From:
- API Route: `/app/api/send-welcome-email/route.ts`
- Triggered after: Successful payment and user creation
- Email Template: HTML + Plain text fallback

---

## Need Help?

If you're still having issues:

1. Check the server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Try the Gmail SMTP test: https://www.gmass.co/smtp-test
4. Create a new app password and try again

---

**Last Updated**: October 21, 2025

