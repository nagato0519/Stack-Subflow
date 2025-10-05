import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  User,
  UserCredential,
  AuthError
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
  async createUserDocument(uid: string, email: string, password: string): Promise<void> {
    try {
      await setDoc(doc(db, 'users', uid), {
        id: uid,  // Same as document ID
        email,
        password
      })
    } catch (error) {
      throw error
    }
  },

  // Sign in existing user
  async signIn(email: string, password: string): Promise<UserCredential> {
    try {
      return await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
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
