"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SuccessPage() {
  const router = useRouter()
  const [isCreatingAccount, setIsCreatingAccount] = useState(true)
  const [accountCreated, setAccountCreated] = useState(false)
  const [accountError, setAccountError] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    // Get login credentials before clearing
    const storedEmail = sessionStorage.getItem("email") || ""
    const storedPassword = sessionStorage.getItem("password") || ""
    
    setEmail(storedEmail)
    setPassword(storedPassword)
    
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
              <h1 className="text-2xl font-semibold mb-3 text-white">アカウントを作成しています...</h1>
              <p className="text-white/80">
                アカウントを設定し、サブスクリプションを有効化しています。
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
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: 'rgba(216, 249, 102, 0.2)' }}>
                <svg className="w-8 h-8" style={{ color: '#D8F966' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold mb-3 text-white">Stackへようこそ！</h1>
              <p className="text-white/80 mb-6">
                アカウントが作成され、サブスクリプションが有効になりました。以下の情報でStackにログインできます。
              </p>

              {/* Login Credentials */}
              {email && password && (
                <div className="mb-6 p-6 bg-white/5 border border-white/10 rounded-lg text-left">
                  <h2 className="text-lg font-semibold mb-4 text-white text-center">ログイン情報</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-white/70 block mb-1">メールアドレス</label>
                      <div className="bg-white/10 border border-white/20 rounded-lg p-3 font-mono text-white break-all">
                        {email}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-white/70 block mb-1">パスワード</label>
                      <div className="bg-white/10 border border-white/20 rounded-lg p-3 font-mono text-white break-all">
                        {password}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-yellow-400 mt-4 text-center">
                    ⚠️ この情報を安全な場所に保存してください
                  </p>
                </div>
              )}
              
              {/* App Store Download Link */}
              <div className="mt-8 space-y-4">
                <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
                  <h2 className="text-lg font-semibold mb-3 text-white">アプリをダウンロード</h2>
                  <p className="text-white/70 text-sm mb-4">
                    今すぐStackアプリをダウンロードして、自己投資を始めましょう！
                  </p>
                  <a
                    href="https://apps.apple.com/by/app/stack-%E8%87%AA%E5%B7%B1%E6%8A%95%E8%B3%87%E3%82%A2%E3%83%97%E3%83%AA/id6745755185"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full bg-black hover:bg-black/80 text-white font-medium py-3 px-6 rounded-lg transition-colors border border-white/20"
                  >
                    <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    App Storeからダウンロード
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
