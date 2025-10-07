import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(request: NextRequest) {
  console.log('Cancel API: POST request received at:', new Date().toISOString())
  
  try {
    // Parse request body
    const { userId } = await request.json()
    
    if (!userId) {
      console.error('Cancel API: Missing userId')
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('Cancel API: Processing cancellation for user:', userId)

    // Get user data from Firestore to retrieve stripeCustomerId
    const userDocRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      console.error('Cancel API: User document not found')
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const userData = userDoc.data()
    const stripeCustomerId = userData.stripeCustomerId

    if (!stripeCustomerId) {
      console.error('Cancel API: No Stripe customer ID found for user')
      return NextResponse.json(
        { error: 'No Stripe customer ID found' },
        { status: 400 }
      )
    }

    console.log('Cancel API: Found Stripe customer ID:', stripeCustomerId)

    // Retrieve all active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'active',
    })

    console.log('Cancel API: Found active subscriptions:', subscriptions.data.length)

    // Cancel all active subscriptions
    const canceledSubscriptions = []
    for (const subscription of subscriptions.data) {
      console.log('Cancel API: Canceling subscription:', subscription.id)
      const canceled = await stripe.subscriptions.cancel(subscription.id)
      canceledSubscriptions.push(canceled.id)
    }

    // Update user document status to 'canceled'
    await updateDoc(userDocRef, {
      status: 'canceled',
      updatedAt: serverTimestamp()
    })

    console.log('Cancel API: Successfully canceled subscriptions and updated user status')

    return NextResponse.json({
      success: true,
      message: 'Subscription canceled successfully',
      canceledSubscriptions: canceledSubscriptions
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

