import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(request: NextRequest) {
  console.log('API: POST request received at:', new Date().toISOString())
  console.log('API: Request URL:', request.url)
  console.log('API: Request method:', request.method)
  console.log('API: Request headers:', Object.fromEntries(request.headers.entries()))
  
  try {
    console.log('API: Processing request...')
    
    // Parse request body with better error handling
    let requestBody
    try {
      requestBody = await request.json()
    } catch (parseError) {
      console.error('API: Failed to parse request body:', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }
    
    const { email, planId, tenant } = requestBody
    console.log('API: Parsed request body:', { email, planId, tenant })

    if (!email || !planId) {
      console.error('API: Missing required fields:', { email: !!email, planId: !!planId })
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

    // Use the single subscription price ID
    const priceId = process.env.STRIPE_PRICE_ID
    
    if (!priceId) {
      console.error(`STRIPE_PRICE_ID environment variable is not set`)
      return NextResponse.json(
        { error: `Subscription configuration error. Please contact support.` },
        { status: 500 }
      )
    }

    // Create a subscription with setup intent for payment method collection
    let subscription
    try {
      subscription = await stripe.subscriptions.create({
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
    } catch (stripeError: any) {
      console.error('Stripe subscription creation failed:', stripeError)
      return NextResponse.json(
        { error: `Payment setup failed: ${stripeError.message || 'Please try again'}` },
        { status: 500 }
      )
    }

    const invoice = subscription.latest_invoice as Stripe.Invoice
    const paymentIntent = (invoice as any).payment_intent as Stripe.PaymentIntent

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      subscriptionId: subscription.id,
      customerId: customer.id,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    })

  } catch (error: any) {
    console.error('API: Error creating subscription:', error)
    console.error('API: Error stack:', error.stack)
    console.error('API: Error type:', typeof error)
    console.error('API: Error keys:', Object.keys(error || {}))
    
    // Provide more detailed error information
    let errorMessage = 'Failed to create subscription'
    let errorDetails = null
    
    if (error && typeof error === 'object') {
      if (error.type) {
        errorMessage = `Stripe error: ${error.type} - ${error.message || errorMessage}`
      } else if (error.message) {
        errorMessage = error.message
      }
      
      // Include more details for debugging
      errorDetails = {
        message: error.message,
        type: error.type,
        code: error.code,
        param: error.param,
        decline_code: error.decline_code
      }
    } else if (typeof error === 'string') {
      errorMessage = error
    }
    
    return NextResponse.json(
      { 
        error: errorMessage, 
        details: errorDetails,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Note: This API now uses a single STRIPE_PRICE_ID environment variable
// instead of multiple plan-specific price IDs
