# Stripe Setup Instructions

## Quick Setup

1. **Run the setup script** to create products and prices in Stripe:
   ```bash
   npm run setup-stripe
   ```

2. **Add the environment variables** to your `.env.local` file:
   ```env
   STRIPE_MONTHLY_PRICE_ID=price_xxxxx
   STRIPE_SEMIANNUAL_PRICE_ID=price_xxxxx
   ```

3. **Restart your development server**:
   ```bash
   npm run dev
   ```

## Manual Setup (Alternative)

If you prefer to create the products manually in the Stripe Dashboard:

### 1. Create Product
- Go to [Stripe Dashboard > Products](https://dashboard.stripe.com/products)
- Click "Add product"
- Name: "AI English Learning Subscription"
- Description: "Monthly subscription for AI-powered English learning"

### 2. Create Monthly Price
- In the product, click "Add another price"
- Price: ¥1,000
- Billing period: Monthly
- Save the price ID (starts with `price_`)

### 3. Create 6-Month Price
- Add another price to the same product
- Price: ¥5,500
- Billing period: Every 6 months
- Save the price ID (starts with `price_`)

### 4. Update Environment Variables
Add the price IDs to your `.env.local`:
```env
STRIPE_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_SEMIANNUAL_PRICE_ID=price_xxxxx
```

## Environment Variables Required

Make sure you have these in your `.env.local`:
```env
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_SEMIANNUAL_PRICE_ID=price_xxxxx
```

## Testing

After setup, test the subscription flow:
1. Go to `/subscribe`
2. Select a plan
3. Enter payment details
4. Complete the subscription

The subscription should now work without the "unknown parameter" error.
