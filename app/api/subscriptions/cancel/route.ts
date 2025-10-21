import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(request: NextRequest) {
  console.log('Cancel API: POST request received at:', new Date().toISOString())
  
  try {
    // Parse request body - now accepting email and stripeCustomerId from client
    const { email, stripeCustomerId } = await request.json()
    
    if (!email) {
      console.error('Cancel API: Missing email')
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    console.log('Cancel API: Processing cancellation for email:', email)

    // Find Stripe customer by email or use provided stripeCustomerId
    let customerId = stripeCustomerId

    if (!customerId) {
      console.log('Cancel API: No stripeCustomerId provided, searching by email')
      
      try {
        const existingCustomers = await stripe.customers.list({
          email: email,
          limit: 1
        })

        if (existingCustomers.data.length > 0) {
          customerId = existingCustomers.data[0].id
          console.log('Cancel API: Found Stripe customer by email:', customerId)
        } else {
          console.log('Cancel API: No Stripe customer found for email:', email)
          // No Stripe customer exists, return success with no expireDate
          return NextResponse.json({
            success: true,
            noSubscription: true,
            message: 'No active subscription found'
          })
        }
      } catch (searchError) {
        console.error('Cancel API: Error searching for customer by email:', searchError)
        return NextResponse.json(
          { error: 'Failed to find customer in payment system' },
          { status: 500 }
        )
      }
    }

    console.log('Cancel API: Using Stripe customer ID:', customerId)

    // Retrieve all active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
    })

    console.log('Cancel API: Found active subscriptions:', subscriptions.data.length)

    // Cancel all active subscriptions and get expireDate
    const canceledSubscriptions = []
    let expireDate = null
    
    for (const subscription of subscriptions.data) {
      console.log('Cancel API: Canceling subscription:', subscription.id)
      
      // Get subscription end date before canceling (current_period_end is Unix timestamp)
      const subscriptionEndDate = subscription.current_period_end
      const endDate = new Date(subscriptionEndDate * 1000) // Convert Unix to Date
      
      // Store the latest expireDate (in case of multiple subscriptions)
      if (!expireDate || endDate > expireDate) {
        expireDate = endDate
      }
      
      console.log('Cancel API: Subscription will expire at:', endDate.toISOString())
      
      const canceled = await stripe.subscriptions.cancel(subscription.id)
      canceledSubscriptions.push(canceled.id)
    }

    console.log('Cancel API: Successfully canceled subscriptions in Stripe')

    // Return the expireDate to the client so they can update Firestore
    return NextResponse.json({
      success: true,
      message: 'Subscription canceled successfully',
      canceledSubscriptions: canceledSubscriptions,
      expireDate: expireDate ? expireDate.toISOString() : null,
      stripeCustomerId: customerId
    })

  } catch (error: any) {
    console.error('Cancel API: Error canceling subscription:', error)
    console.error('Cancel API: Error stack:', error.stack)
    
    let errorMessage = 'Failed to cancel subscription'
    
    if (error && typeof error === 'object') {
      if (error.type) {
        errorMessage = `Stripe error: ${error.type} - ${error.message || errorMessage}`
      } else if (error.message) {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

