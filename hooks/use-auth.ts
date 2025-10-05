import { useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getAuthErrorMessage } from '@/lib/auth'

export function useAuthOperations() {
  const { signUp, signOut, updateUserData, updateSubscription } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAuthOperation = useCallback(async (
    operation: () => Promise<void>,
    errorMessage?: string
  ) => {
    setLoading(true)
    setError(null)
    
    try {
      await operation()
    } catch (err: any) {
      const message = errorMessage || getAuthErrorMessage(err)
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSignUp = useCallback(async (email: string, password: string) => {
    return handleAuthOperation(
      () => signUp(email, password),
      'Failed to create account'
    )
  }, [signUp, handleAuthOperation])

  const handleSignOut = useCallback(async () => {
    return handleAuthOperation(
      () => signOut(),
      'Failed to sign out'
    )
  }, [signOut, handleAuthOperation])

  const handleUpdateUserData = useCallback(async (data: any) => {
    return handleAuthOperation(
      () => updateUserData(data),
      'Failed to update user data'
    )
  }, [updateUserData, handleAuthOperation])

  const handleUpdateSubscription = useCallback(async (data: {
    subscriptionStatus: 'active' | 'inactive' | 'trial'
    subscriptionPlan?: string
    stripeCustomerId?: string
  }) => {
    return handleAuthOperation(
      () => updateSubscription(data),
      'Failed to update subscription'
    )
  }, [updateSubscription, handleAuthOperation])

  return {
    handleSignUp,
    handleSignOut,
    handleUpdateUserData,
    handleUpdateSubscription,
    loading,
    error,
    clearError: () => setError(null)
  }
}
