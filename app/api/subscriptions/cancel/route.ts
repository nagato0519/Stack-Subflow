import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { doc, updateDoc, serverTimestamp, getDoc, Timestamp } from 'firebase/firestore'
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
    let stripeCustomerId = userData.stripeCustomerId

    // If no stripeCustomerId in Firestore, try to find customer by email
    if (!stripeCustomerId) {
      console.log('Cancel API: No stripeCustomerId in Firestore, searching by email:', userData.email)
      
      if (!userData.email) {
        console.error('Cancel API: No email found for user')
        return NextResponse.json(
          { error: 'No email address found for user' },
          { status: 400 }
        )
      }

      try {
        const existingCustomers = await stripe.customers.list({
          email: userData.email,
          limit: 1
        })

        if (existingCustomers.data.length > 0) {
          stripeCustomerId = existingCustomers.data[0].id
          console.log('Cancel API: Found Stripe customer by email:', stripeCustomerId)
          
          // Update Firestore with the found stripeCustomerId for future use
          await updateDoc(userDocRef, {
            stripeCustomerId: stripeCustomerId
          })
          console.log('Cancel API: Updated Firestore with stripeCustomerId')
        } else {
          console.log('Cancel API: No Stripe customer found for email:', userData.email)
          // No Stripe customer exists, just update Firestore role to canceled
          await updateDoc(userDocRef, {
            role: 'canceled',
            updatedAt: serverTimestamp()
          })
          
          return NextResponse.json({
            success: true,
            message: 'Account role updated to canceled (no active subscription found)'
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

    console.log('Cancel API: Using Stripe customer ID:', stripeCustomerId)

    // Retrieve all active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
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

    // Update user document role to 'canceled' and add expireDate
    const updateData: any = {
      role: 'canceled',
      updatedAt: serverTimestamp()
    }
    
    if (expireDate) {
      updateData.expireDate = Timestamp.fromDate(expireDate)
      console.log('Cancel API: Setting expireDate to:', expireDate.toISOString())
    }
    
    await updateDoc(userDocRef, updateData)

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

