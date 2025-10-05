"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { ThemeCustomizer } from "@/components/theme-customizer"
import { useAuthOperations } from "@/hooks/use-auth"

export default function SignupPage() {
  const router = useRouter()
  const { handleSignUp, loading, error, clearError } = useAuthOperations()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      // Create Firebase Auth account
      await handleSignUp(email, password)

      // Store email and password for the subscription flow (to create Firestore document after payment)
      sessionStorage.setItem("email", email)
      sessionStorage.setItem("password", password)

      // Navigate to subscribe page
      router.push("/subscribe?tenant=ai-english")
    } catch (error: any) {
      console.error("[v0] Signup error:", error)
      console.error("[v0] Error code:", error.code)
      console.error("[v0] Error message:", error.message)
      setErrors({ submit: error.message || "アカウントの作成に失敗しました。もう一度お試しください。" })
    }
  }

  const isFormValid = email && password && confirmPassword && password === confirmPassword && password.length >= 6

  return (
    <div className="form-container">
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-balance">アカウントを作成</h1>
            <p className="text-muted-foreground">AI英会話の旅を始めましょう</p>
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
        </div>
      </div>

      <ThemeCustomizer />
    </div>
  )
}
