"use client"

import { useState, useEffect } from "react"
import { authService, getAuthErrorMessage } from "@/lib/auth"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, User } from "firebase/auth"
import { sendPasswordResetEmail } from "firebase/auth"

export default function CancelPage() {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [canceling, setCanceling] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [error, setError] = useState("")
  const [cancelSuccess, setCancelSuccess] = useState(false)
  
  // Login form states
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        try {
          const data = await authService.getUserData(currentUser.uid)
          setUserData(data)
        } catch (error) {
          console.error("Error fetching user data:", error)
          setError("ユーザー情報の取得に失敗しました")
        }
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setLoginError("メールアドレスとパスワードを入力してください")
      return
    }

    try {
      setLoginLoading(true)
      setLoginError("")
      
      // Add detailed logging for debugging
      console.log("[CancelPage] Attempting login with email:", email)
      console.log("[CancelPage] Firebase auth object:", auth)
      console.log("[CancelPage] Firebase config check:", {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✓ Set" : "✗ Missing",
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "✓ Set" : "✗ Missing",
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "✓ Set" : "✗ Missing"
      })
      
      await authService.signIn(email, password)
      console.log("[CancelPage] Login successful")
    } catch (error: any) {
      console.error("[CancelPage] Login error details:", {
        code: error.code,
        message: error.message,
        email: email,
        timestamp: new Date().toISOString()
      })
      setLoginError(getAuthErrorMessage(error))
    } finally {
      setLoginLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!email) {
      setLoginError("メールアドレスを入力してください")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLoginError("有効なメールアドレスを入力してください")
      return
    }

    try {
      await sendPasswordResetEmail(auth, email)
      setResetEmailSent(true)
      setLoginError("")
    } catch (error: any) {
      console.error("[CancelPage] Password reset error:", error)
      setLoginError(getAuthErrorMessage(error))
    }
  }

  const handleCancelSubscription = async () => {
    if (!user) return

    try {
      setCanceling(true)
      setError("")
      
      await authService.cancelSubscription(user.uid)
      
      // Update local state
      setUserData({ ...userData, status: 'canceled' })
      setShowConfirmation(false)
      setCancelSuccess(true)
      
    } catch (error) {
      console.error("Error canceling subscription:", error)
      setError("サブスクリプションのキャンセルに失敗しました。もう一度お試しください。")
    } finally {
      setCanceling(false)
    }
  }

  const handleLogout = async () => {
    try {
      await authService.signOut()
      setUser(null)
      setUserData(null)
      setShowConfirmation(false)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (loading) {
    return (
      <div className="form-container">
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 bg-blue-500/20">
              <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h1 className="text-2xl font-semibold mb-3 text-white">読み込み中...</h1>
            <p className="text-white/80">認証状態を確認しています</p>
          </div>
        </div>
      </div>
    )
  }

  // Show login form if user is not authenticated
  if (!user) {
    return (
      <div className="form-container">
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2 text-balance">サブスクリプションキャンセル</h1>
              <p className="text-muted-foreground">キャンセルするにはログインしてください</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="form-label">
                  メールアドレス
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setLoginError("")
                  }}
                  className="form-input"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="form-label">
                  パスワード
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setLoginError("")
                  }}
                  className="form-input"
                  placeholder="••••••••"
                  required
                />
              </div>

              {loginError && (
                <div className="error-message text-center" role="alert">
                  {loginError}
                  {loginError.includes("Invalid email or password") && (
                    <div className="mt-3 text-sm text-muted-foreground">
                      <p>確認してください：</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>メールアドレスが正しく入力されているか</li>
                        <li>パスワードが正しいか</li>
                        <li>アカウントが作成されているか</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={!email || !password || loginLoading}
                className="primary-button w-full"
              >
                {loginLoading ? "ログイン中..." : "ログイン"}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowResetPassword(!showResetPassword)}
                  className="text-sm text-muted-foreground hover:text-foreground underline"
                >
                  パスワードを忘れた場合
                </button>
              </div>

              {showResetPassword && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <h3 className="text-sm font-medium">パスワードリセット</h3>
                  <p className="text-sm text-muted-foreground">
                    上記のメールアドレスにパスワードリセット用のリンクを送信します。
                  </p>
                  
                  {resetEmailSent ? (
                    <div className="text-sm text-green-600">
                      パスワードリセット用のメールを送信しました。メールボックスをご確認ください。
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      className="secondary-button w-full"
                    >
                      リセットメールを送信
                    </button>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Show success message after cancellation
  if (cancelSuccess) {
    return (
      <div className="form-container">
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 bg-green-500/20">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold mb-3 text-white">サブスクリプションのキャンセルが完了しました</h1>
            <p className="text-white/80 mb-6">
              定期支払いが停止され、アカウントのステータスが更新されました。
            </p>
            <button 
              onClick={handleLogout}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Check if subscription is already canceled
  if (userData?.status === 'canceled') {
    return (
      <div className="form-container">
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 bg-yellow-500/20">
              <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold mb-3 text-white">サブスクリプションは既にキャンセル済みです</h1>
            <p className="text-white/80 mb-6">
              このアカウントのサブスクリプションは既にキャンセルされています。
            </p>
            <button 
              onClick={handleLogout}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show cancellation interface for authenticated users
  return (
    <div className="form-container">
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-balance">サブスクリプションキャンセル</h1>
            <p className="text-muted-foreground">アカウント情報を確認してください</p>
          </div>

          <div className="space-y-6">
            {/* User Information */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="text-sm font-medium mb-3">アカウント情報</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">メールアドレス:</span>
                  <span className="ml-2">{userData?.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">ステータス:</span>
                  <span className="ml-2 capitalize">{userData?.status || 'active'}</span>
                </div>
                {userData?.stripeCustomerId && (
                  <div>
                    <span className="text-muted-foreground">顧客ID:</span>
                    <span className="ml-2 font-mono text-xs">{userData.stripeCustomerId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-yellow-400 mb-1">注意事項</h4>
                  <p className="text-sm text-yellow-300">
                    サブスクリプションをキャンセルすると、サービスへのアクセスが制限される場合があります。
                    この操作は取り消すことができません。
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {!showConfirmation ? (
                <>
                  <button
                    onClick={() => setShowConfirmation(true)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    サブスクリプションをキャンセル
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    ログアウト
                  </button>
                </>
              ) : (
                <>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-red-400 mb-2">最終確認</h4>
                    <p className="text-sm text-red-300 mb-4">
                      本当にサブスクリプションをキャンセルしますか？この操作は取り消すことができません。
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleCancelSubscription}
                        disabled={canceling}
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        {canceling ? "キャンセル中..." : "はい、キャンセルします"}
                      </button>
                      <button
                        onClick={() => setShowConfirmation(false)}
                        disabled={canceling}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
