# Stack Subflow - Vercel Deployment Guide

## Prerequisites

Before deploying, ensure you have:
1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Your Firebase credentials
3. Your Stripe API keys and Price ID

## Required Environment Variables

You'll need to configure these environment variables in Vercel:

### Firebase Configuration
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

### Stripe Configuration
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_PRICE_ID=price_your_price_id
```

## Deployment Methods

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click **"Add New Project"**
3. Import your repository: `nagato0519/subflow`
4. Configure your project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
5. Add all environment variables listed above in the "Environment Variables" section
6. Click **"Deploy"**

### Method 2: Deploy via Vercel CLI

1. Install Vercel CLI (already done):
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from your project directory:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Set up and deploy: **Yes**
   - Which scope: Select your account
   - Link to existing project: **No**
   - Project name: **stack-subflow**
   - Directory: **./** (press Enter)
   - Override settings: **No**

5. Add environment variables via CLI or dashboard:
   ```bash
   vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
   vercel env add STRIPE_SECRET_KEY
   # ... add all other variables
   ```

6. Deploy to production:
   ```bash
   vercel --prod
   ```

## Post-Deployment Steps

1. **Update Stripe Webhook URLs** (if using webhooks):
   - Add your Vercel domain to Stripe webhook endpoints

2. **Update Firebase Auth Domains**:
   - Go to Firebase Console → Authentication → Settings → Authorized domains
   - Add your Vercel domain (e.g., `your-app.vercel.app`)

3. **Test Your Deployment**:
   - Visit your deployed URL
   - Test the signup flow
   - Verify Stripe payment integration
   - Ensure Firebase authentication works

## Continuous Deployment

Once connected to GitHub, Vercel will automatically:
- Deploy every push to the `main` branch to production
- Create preview deployments for pull requests
- Build and test changes before going live

## Troubleshooting

- **Build Errors**: Check Vercel deployment logs
- **Environment Variables**: Ensure all variables are set correctly
- **API Routes**: Verify serverless function limits haven't been exceeded
- **Firebase**: Confirm authorized domains include your Vercel URL

## Useful Commands

```bash
vercel                    # Deploy to preview
vercel --prod            # Deploy to production
vercel logs              # View deployment logs
vercel env ls            # List environment variables
vercel domains           # Manage custom domains
```

## Support

For issues, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)

