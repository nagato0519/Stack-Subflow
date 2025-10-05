import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(request: NextRequest) {
  try {
    const { email, planId, tenant } = await request.json()

    console.log('Creating subscription for:', { email, planId, tenant })

    if (!email || !planId) {
      return NextResponse.json(
        { error: 'Email and planId are required' },
        { status: 400 }
      )
    }

    // Validate Stripe secret key
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not set')
      return NextResponse.json(
        { error: 'Stripe configuration error' },
        { status: 500 }
      )
    }

    // Test Stripe connection
    try {
      await stripe.customers.list({ limit: 1 })
      console.log('Stripe connection successful')
    } catch (stripeError) {
      console.error('Stripe connection failed:', stripeError)
      return NextResponse.json(
        { error: 'Stripe connection failed', details: stripeError },
        { status: 500 }
      )
    }

    // Create or retrieve a Stripe customer
    let customer
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1
    })

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
    } else {
      customer = await stripe.customers.create({
        email: email,
        metadata: {
          tenant: tenant || 'ai-english',
          planId: planId
        }
      })
    }

    // Get the price ID for the selected plan
    const priceId = getPriceIdForPlan(planId)
    
    if (!priceId) {
      throw new Error(`No price ID found for plan: ${planId}`)
    }

    // Create a subscription with setup intent for payment method collection
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{
        price: priceId,
      }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        planId: planId,
        tenant: tenant || 'ai-english',
        email: email
      }
    })

    const invoice = subscription.latest_invoice as Stripe.Invoice
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      subscriptionId: subscription.id,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    })

  } catch (error: any) {
    console.error('Error creating subscription:', error)
    
    // Provide more detailed error information
    let errorMessage = 'Failed to create subscription'
    if (error.type) {
      errorMessage = `Stripe error: ${error.type} - ${error.message || errorMessage}`
    } else if (error.message) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { error: errorMessage, details: error },
      { status: 500 }
    )
  }
}

// Helper function to get Stripe price ID for plan
// You need to create these products and prices in your Stripe Dashboard first
function getPriceIdForPlan(planId: string): string | null {
  const priceIds: Record<string, string> = {
    'monthly_basic': process.env.STRIPE_MONTHLY_PRICE_ID || '', // Replace with your actual price ID
    'semiannual_basic': process.env.STRIPE_SEMIANNUAL_PRICE_ID || '', // Replace with your actual price ID
  }
  
  return priceIds[planId] || null
}
