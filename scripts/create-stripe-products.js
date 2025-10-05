#!/usr/bin/env node

/**
 * Script to create Stripe products and prices for the subscription service
 * Run this script once to set up your Stripe products
 * 
 * Usage: node scripts/create-stripe-products.js
 */

const Stripe = require('stripe');

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

async function createProductsAndPrices() {
  try {
    console.log('Creating Stripe products and prices...\n');

    // Create the main product
    const product = await stripe.products.create({
      name: 'AI English Learning Subscription',
      description: 'Monthly subscription for AI-powered English learning',
      metadata: {
        service: 'ai-english'
      }
    });

    console.log(`✅ Product created: ${product.id}`);
    console.log(`   Name: ${product.name}`);

    // Create monthly price (¥1,000/month)
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 1000, // ¥1,000 in yen
      currency: 'jpy',
      recurring: {
        interval: 'month',
        interval_count: 1
      },
      metadata: {
        plan: 'monthly_basic'
      }
    });

    console.log(`✅ Monthly price created: ${monthlyPrice.id}`);
    console.log(`   Amount: ¥1,000/month`);

    // Create 6-month price (¥5,500/6 months)
    const semiannualPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 5500, // ¥5,500 in yen
      currency: 'jpy',
      recurring: {
        interval: 'month',
        interval_count: 6
      },
      metadata: {
        plan: 'semiannual_basic'
      }
    });

    console.log(`✅ 6-month price created: ${semiannualPrice.id}`);
    console.log(`   Amount: ¥5,500/6 months`);

    console.log('\n🎉 All products and prices created successfully!');
    console.log('\n📋 Add these environment variables to your .env.local file:');
    console.log(`STRIPE_MONTHLY_PRICE_ID=${monthlyPrice.id}`);
    console.log(`STRIPE_SEMIANNUAL_PRICE_ID=${semiannualPrice.id}`);

  } catch (error) {
    console.error('❌ Error creating products:', error.message);
    process.exit(1);
  }
}

// Run the script
createProductsAndPrices();
