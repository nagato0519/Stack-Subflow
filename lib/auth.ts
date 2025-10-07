import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  User,
  UserCredential,
  AuthError,
  fetchSignInMethodsForEmail
} from 'firebase/auth'
import { 
  doc, 
  setDoc, 
  getDoc,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore'
import { auth, db } from './firebase'

// User data interface
export interface UserData {
  id: string
  email: string
  password: string
  stripeCustomerId?: string
  status?: 'active' | 'canceled' | 'trial'
}

// Authentication functions
export const authService = {
  // Create new user account (Firestore document will be created after payment)
  async signUp(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      return userCredential
    } catch (error) {
      throw error
    }
  },

  // Create user document in Firestore after successful payment
  async createUserDocument(uid: string, email: string, password: string, stripeCustomerId?: string): Promise<void> {
    try {
      await setDoc(doc(db, 'users', uid), {
        id: uid,  // Same as document ID
        email,
        password,
        status: 'active',
        ...(stripeCustomerId && { stripeCustomerId })
      })
    } catch (error) {
      throw error
    }
  },

  // Sign in existing user
  async signIn(email: string, password: string): Promise<UserCredential> {
    try {
      console.log("[AuthService] Attempting sign in with email:", email)
      console.log("[AuthService] Firebase auth instance:", auth)
      
      const result = await signInWithEmailAndPassword(auth, email, password)
      console.log("[AuthService] Sign in successful for user:", result.user.uid)
      return result
    } catch (error) {
      console.error("[AuthService] Sign in failed:", {
        code: (error as any)?.code,
        message: (error as any)?.message,
        email: email
      })
      throw error
    }
  },

  // Sign out current user
  async signOut(): Promise<void> {
    try {
      await signOut(auth)
    } catch (error) {
      throw error
    }
  },

  // Get user data from Firestore
  async getUserData(uid: string): Promise<UserData | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        return userDoc.data() as UserData
      }
      return null
    } catch (error) {
      throw error
    }
  },

  // Update user data in Firestore
  async updateUserData(uid: string, data: Partial<UserData>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...data,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      throw error
    }
  },

  // Update subscription information
  async updateSubscription(uid: string, subscriptionData: {
    subscriptionStatus: 'active' | 'inactive' | 'trial'
    subscriptionPlan?: string
    stripeCustomerId?: string
  }): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...subscriptionData,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      throw error
    }
  },

  // Cancel user subscription
  async cancelSubscription(uid: string): Promise<void> {
    try {
      // Call the API route to cancel the Stripe subscription and update Firestore
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: uid }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to cancel subscription')
      }

      const result = await response.json()
      console.log('Subscription canceled successfully:', result)
    } catch (error) {
      console.error('Error canceling subscription:', error)
      throw error
    }
  },

  // Check if email already exists
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email)
      return signInMethods.length > 0
    } catch (error) {
      // If there's an error checking, assume email doesn't exist to allow signup
      console.error("Error checking email existence:", error)
      return false
    }
  }
}

// Error handling helper
export const getAuthErrorMessage = (error: AuthError): string => {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'This email address is already in use. Please use a different email or try signing in.'
    case 'auth/invalid-email':
      return 'Invalid email address'
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters'
    case 'auth/user-not-found':
      return 'No account found with this email'
    case 'auth/wrong-password':
      return 'Incorrect password'
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your credentials and try again.'
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later'
    case 'auth/api-key-not-valid':
      return 'Firebase configuration error. Please contact support.'
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.'
    default:
      return `Authentication error: ${error.message || 'Please try again'}`
  }
}
