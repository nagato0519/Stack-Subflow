# Environment Variables Setup

This document explains how to set up all required environment variables for the Stack application.

## Quick Start

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in all the values in `.env.local` with your actual credentials

3. Restart your development server

---

## Required Environment Variables

### Firebase Configuration

Required for user authentication and database.

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

**Where to find these values:**
- See `FIREBASE_SETUP.md` or `CONNECT_EXISTING_FIREBASE.md` for detailed instructions
- Firebase Console → Project Settings → Your apps → SDK setup and configuration

---

### Stripe Configuration

Required for payment processing.

```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_PRICE_ID=price_your_subscription_price_id
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**Where to find these values:**
- See `STRIPE_SETUP.md` for detailed instructions
- Stripe Dashboard → Developers → API keys
- For webhooks: Stripe Dashboard → Developers → Webhooks

---

### Gmail Configuration

Required for sending welcome emails to new users.

```env
EMAIL_SENDER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-gmail-app-password
```

**Where to find these values:**
- See `GMAIL_SETUP.md` for detailed step-by-step instructions
- You'll need to enable 2-Factor Authentication on your Gmail account
- Generate an App Password from: https://myaccount.google.com/apppasswords

**Important Notes:**
- Use a Gmail App Password, NOT your regular Gmail password
- Remove all spaces from the 16-character app password
- Consider using a dedicated email account for sending automated emails

---

## Environment Variables by Feature

### Core Functionality (Required)
- Firebase variables - Authentication & Database
- Stripe variables - Payment processing

### Optional Features
- Gmail variables - Welcome emails (app works without this, but users won't receive email)

---

## Development vs Production

### Development (`.env.local`)

```env
# Use Stripe test keys (start with sk_test_ and pk_test_)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Use test Gmail account
EMAIL_SENDER=test-stack-app@gmail.com
```

### Production (Vercel, etc.)

```env
# Use Stripe live keys (start with sk_live_ and pk_live_)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Use production Gmail account
EMAIL_SENDER=noreply@yourstack.com
```

**Setting up production environment variables:**

#### Vercel
1. Go to your project dashboard
2. Settings → Environment Variables
3. Add each variable with its production value
4. Redeploy your application

#### Other platforms
- Netlify: Site settings → Environment variables
- Railway: Project settings → Variables
- Render: Environment → Environment Variables

---

## Security Best Practices

1. ✅ **NEVER commit `.env.local`** to Git
   - It should be in `.gitignore` (already set up)
   - Only commit `.env.example` with placeholder values

2. ✅ **Use different keys** for development and production
   - Test keys for development (sk_test_, pk_test_)
   - Live keys only in production

3. ✅ **Rotate sensitive credentials** periodically
   - Change passwords every 3-6 months
   - Revoke unused API keys

4. ✅ **Limit key permissions** where possible
   - Use restricted API keys when available
   - Gmail: use dedicated account, not personal email

5. ✅ **Monitor usage**
   - Check Stripe dashboard for unusual activity
   - Review Firebase usage regularly
   - Monitor email sending volume

---

## Troubleshooting

### "Environment variable not found" errors

**Solutions:**
1. Make sure you created `.env.local` (not `.env`)
2. Restart your development server after adding variables
3. Check for typos in variable names
4. Ensure no quotes around values (unless value contains spaces)

### Firebase initialization errors

**Solutions:**
1. Double-check all Firebase variables are correct
2. Make sure project ID matches your Firebase project
3. Verify API key hasn't been restricted

### Stripe errors

**Solutions:**
1. Verify you're using test keys in development
2. Check that STRIPE_PRICE_ID exists in your Stripe dashboard
3. Make sure webhook secret matches your webhook configuration

### Email not sending

**Solutions:**
1. See detailed troubleshooting in `GMAIL_SETUP.md`
2. Verify EMAIL_SENDER and EMAIL_PASSWORD are correct
3. Make sure app password has no spaces
4. Check server logs for specific error messages

---

## Testing Your Configuration

After setting up all environment variables:

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Test Firebase connection:**
   - Try signing up with a test email
   - Check if user appears in Firebase Console

3. **Test Stripe integration:**
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date, any CVC
   - Check Stripe Dashboard for test payment

4. **Test email sending:**
   - Complete a full signup flow
   - Check inbox (and spam folder) for welcome email
   - Check server logs for email confirmation

---

## Reference Documentation

- **Firebase Setup**: See `FIREBASE_SETUP.md` or `CONNECT_EXISTING_FIREBASE.md`
- **Stripe Setup**: See `STRIPE_SETUP.md`
- **Gmail Setup**: See `GMAIL_SETUP.md`
- **Deployment**: See `DEPLOYMENT.md`

---

## Quick Checklist

Before deploying to production:

- [ ] All environment variables set in production platform
- [ ] Using live Stripe keys (not test keys)
- [ ] Firebase rules configured for production
- [ ] Gmail app password created and tested
- [ ] Webhook endpoints configured and working
- [ ] All sensitive data removed from code
- [ ] `.env.local` in `.gitignore`
- [ ] Tested full signup flow in production

---

**Last Updated**: October 21, 2025

