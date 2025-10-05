"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { authService, UserData } from './auth'

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateUserData: (data: Partial<UserData>) => Promise<void>
  updateSubscription: (data: {
    subscriptionStatus: 'active' | 'inactive' | 'trial'
    subscriptionPlan?: string
    stripeCustomerId?: string
  }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      
      if (user) {
        try {
          const data = await authService.getUserData(user.uid)
          setUserData(data)
        } catch (error) {
          console.error('Error fetching user data:', error)
          setUserData(null)
        }
      } else {
        setUserData(null)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    try {
      const userCredential = await authService.signUp(email, password)
      // User data will be set automatically via onAuthStateChanged
    } catch (error) {
      throw error
    }
  }

  const signOut = async () => {
    try {
      await authService.signOut()
      setUser(null)
      setUserData(null)
    } catch (error) {
      throw error
    }
  }

  const updateUserData = async (data: Partial<UserData>) => {
    if (!user) throw new Error('No user logged in')
    
    try {
      await authService.updateUserData(user.uid, data)
      // Refresh user data
      const updatedData = await authService.getUserData(user.uid)
      setUserData(updatedData)
    } catch (error) {
      throw error
    }
  }

  const updateSubscription = async (data: {
    subscriptionStatus: 'active' | 'inactive' | 'trial'
    subscriptionPlan?: string
    stripeCustomerId?: string
  }) => {
    if (!user) throw new Error('No user logged in')
    
    try {
      await authService.updateSubscription(user.uid, data)
      // Refresh user data
      const updatedData = await authService.getUserData(user.uid)
      setUserData(updatedData)
    } catch (error) {
      throw error
    }
  }

  const value = {
    user,
    userData,
    loading,
    signUp,
    signOut,
    updateUserData,
    updateSubscription,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
