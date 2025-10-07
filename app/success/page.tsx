"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SuccessPage() {
  const router = useRouter()
  const [isCreatingAccount, setIsCreatingAccount] = useState(true)
  const [accountCreated, setAccountCreated] = useState(false)
  const [accountError, setAccountError] = useState("")

  useEffect(() => {
    // Account and Firestore document should already be created during payment
    // Just show success message
    setAccountCreated(true)
    setIsCreatingAccount(false)
    
    // Clear session storage
    sessionStorage.removeItem("email")
    sessionStorage.removeItem("password")
    sessionStorage.removeItem("selectedPlanId")
    sessionStorage.removeItem("created")
  }, [])


  return (
    <div className="form-container">
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl text-center">
          {isCreatingAccount ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 bg-blue-500/20">
                <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h1 className="text-2xl font-semibold mb-3 text-white">アカウント作成中...</h1>
              <p className="text-white/80">
                アカウントの設定とサブスクリプションの有効化をお待ちください。
              </p>
            </>
          ) : accountError ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 bg-red-500/20">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold mb-3 text-red-400">アカウント作成に失敗しました</h1>
              <p className="text-white/80 mb-6">
                {accountError}
              </p>
              <button 
                onClick={() => router.push('/signup')} 
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                再試行
              </button>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 bg-green-500/20">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold mb-3 text-white">アカウントの準備が完了しました！</h1>
              <p className="text-white/80">
                お支払い完了後、アカウントが作成され、サブスクリプションが有効になりました。メールアドレスとパスワードを使用してアプリをご利用いただけます。
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
