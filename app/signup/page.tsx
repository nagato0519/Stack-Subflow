"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth"

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isIOSDevice, setIsIOSDevice] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Detect if user is actually on iOS
  const isActuallyIOS = typeof window !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!email) {
      newErrors.email = "メールアドレスは必須です"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "有効なメールアドレスを入力してください"
    }

    if (!password) {
      newErrors.password = "パスワードは必須です"
    } else if (password.length < 6) {
      newErrors.password = "パスワードは6文字以上である必要があります"
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "パスワードが一致しません"
    }

    if (!isIOSDevice) {
      newErrors.iosDevice = "iOSデバイスをご使用であることを確認してください"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setLoading(true)
      setErrors({})

      // Check if email already exists
      const emailExists = await authService.checkEmailExists(email)
      if (emailExists) {
        setErrors({ email: "このメールアドレスは既に登録されています。ログインページからサインインしてください。" })
        return
      }

      // Store email and password for the subscription flow (Firebase auth will be created after payment)
      console.log("[SignupPage] Storing email in sessionStorage:", email)
      sessionStorage.setItem("email", email)
      sessionStorage.setItem("password", password)
      console.log("[SignupPage] Email stored successfully, navigating to subscribe page")

      // Navigate to subscribe page
      router.push("/subscribe?tenant=ai-english")
    } catch (error: any) {
      console.error("[SignupPage] Error during signup:", error)
      setErrors({ submit: "アカウント作成中にエラーが発生しました。もう一度お試しください。" })
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = email && password && confirmPassword && password === confirmPassword && password.length >= 6 && isIOSDevice

  return (
    <div className="form-container">
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-balance">アカウントを作成</h1>
            <p className="text-muted-foreground">ChatMateでAI英会話の旅を始めましょう</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  setErrors({ ...errors, email: "" })
                }}
                className="form-input"
                placeholder="you@example.com"
                required
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="error-message" role="alert">
                  {errors.email}
                </p>
              )}
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
                  setErrors({ ...errors, password: "" })
                }}
                className="form-input"
                placeholder="••••••••"
                required
                aria-invalid={!!errors.password}
                aria-describedby="password-helper password-error"
              />
              <p id="password-helper" className="helper-text">
                6文字以上
              </p>
              {errors.password && (
                <p id="password-error" className="error-message" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label">
                パスワード確認
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setErrors({ ...errors, confirmPassword: "" })
                }}
                className="form-input"
                placeholder="••••••••"
                required
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? "confirm-error" : undefined}
              />
              {errors.confirmPassword && (
                <p id="confirm-error" className="error-message" role="alert">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* iOS Device Checkbox */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <input
                  id="iosDevice"
                  type="checkbox"
                  checked={isIOSDevice}
                  onChange={(e) => {
                    setIsIOSDevice(e.target.checked)
                    setErrors({ ...errors, iosDevice: "" })
                  }}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                  aria-invalid={!!errors.iosDevice}
                  aria-describedby={errors.iosDevice ? "ios-error" : undefined}
                />
                <label htmlFor="iosDevice" className="text-sm text-muted-foreground cursor-pointer">
                  iOSデバイス（iPhone、iPad）を使用しています
                </label>
              </div>
              
              {!isActuallyIOS && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex items-start">
                  <svg className="w-5 h-5 text-yellow-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-sm text-yellow-300">
                    ⚠️ iOSデバイスが検出されませんでした。このサービスはiOSデバイス（iPhone、iPad）専用です。
                  </p>
                </div>
              )}
              
              {errors.iosDevice && (
                <p id="ios-error" className="error-message" role="alert">
                  {errors.iosDevice}
                </p>
              )}
            </div>

            {errors.submit && (
              <div className="error-message text-center" role="alert">
                {errors.submit}
              </div>
            )}

            <button type="submit" disabled={!isFormValid || loading} className="primary-button">
              {loading ? "アカウント作成中..." : "アカウントを作成"}
            </button>

            <p className="text-center text-sm text-muted-foreground">
              次のステップでプランを選択し、お支払いを行います。お支払いはStripeによって安全に処理されます。
            </p>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              既にアカウントをお持ちですか？{" "}
              <a 
                href="/cancel" 
                className="text-blue-400 hover:text-blue-300 underline"
              >
                ログイン / サブスクリプションキャンセル
              </a>
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
