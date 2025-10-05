"use client"

import { useState, useEffect, type FormEvent } from "react"
import { useSearchParams } from "next/navigation"
import { ThemeCustomizer } from "@/components/theme-customizer"
import { ClientOnly } from "@/components/client-only"
import { authService } from "@/lib/auth"
import { auth } from "@/lib/firebase"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js"

// Initialize Stripe with publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Plan {
  planId: string
  planName: string
  publicLabel: string
  description: string
}

const PLANS: Plan[] = [
  {
    planId: "monthly_basic",
    planName: "月額プラン",
    publicLabel: "¥980 / 月",
    description: "初心者におすすめ",
  },
  {
    planId: "semiannual_basic",
    planName: "6ヶ月プラン",
    publicLabel: "¥5,280 / 6ヶ月",
    description: "6ヶ月一括でお得",
  },
]

const COUNTRY_CODES = [
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+1", country: "United States", flag: "🇺🇸" },
  { code: "+44", country: "United Kingdom", flag: "🇬🇧" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+82", country: "South Korea", flag: "🇰🇷" },
  { code: "+886", country: "Taiwan", flag: "🇹🇼" },
  { code: "+852", country: "Hong Kong", flag: "🇭🇰" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+60", country: "Malaysia", flag: "🇲🇾" },
  { code: "+66", country: "Thailand", flag: "🇹🇭" },
  { code: "+63", country: "Philippines", flag: "🇵🇭" },
  { code: "+84", country: "Vietnam", flag: "🇻🇳" },
  { code: "+62", country: "Indonesia", flag: "🇮🇩" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+64", country: "New Zealand", flag: "🇳🇿" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+39", country: "Italy", flag: "🇮🇹" },
  { code: "+34", country: "Spain", flag: "🇪🇸" },
  { code: "+31", country: "Netherlands", flag: "🇳🇱" },
  { code: "+46", country: "Sweden", flag: "🇸🇪" },
  { code: "+47", country: "Norway", flag: "🇳🇴" },
  { code: "+45", country: "Denmark", flag: "🇩🇰" },
  { code: "+358", country: "Finland", flag: "🇫🇮" },
  { code: "+41", country: "Switzerland", flag: "🇨🇭" },
  { code: "+43", country: "Austria", flag: "🇦🇹" },
  { code: "+32", country: "Belgium", flag: "🇧🇪" },
  { code: "+351", country: "Portugal", flag: "🇵🇹" },
  { code: "+30", country: "Greece", flag: "🇬🇷" },
]

function CheckoutForm({ onPaymentElementMount, selectedPlan, clientSecret }: { onPaymentElementMount: () => void, selectedPlan: string, clientSecret: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [countryCode, setCountryCode] = useState("+81")

  // Get pricing display for selected plan
  const getPricingDisplay = (planId: string) => {
    const plan = PLANS.find(p => p.planId === planId)
    return plan ? plan.publicLabel : "¥1,000 / month"
  }

  // Handle form ready event
  const handleFormReady = () => {
    onPaymentElementMount()
  }

  // Load stored data on mount
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("email")
    if (storedEmail) {
      setEmail(storedEmail)
    }
    handleFormReady()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    if (!acceptTerms) {
      setErrorMessage("利用規約に同意してください")
      return
    }

    if (!email || !phoneNumber || !fullName) {
      setErrorMessage("すべての必須項目を入力してください")
      return
    }

    setIsProcessing(true)
    setErrorMessage("")

    try {
      // Confirm payment with PaymentElement (supports Apple Pay, Google Pay, cards, etc.)
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/success`,
          payment_method_data: {
            billing_details: {
              name: fullName || email.split('@')[0],
              email: email,
              phone: `${countryCode}${phoneNumber}`,
            },
          },
        },
        redirect: 'if_required',
      })

      if (error) {
        setErrorMessage(error.message || "決済に失敗しました")
        console.error("[v0] Payment error:", error)
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        try {
          // Get user data from sessionStorage
          const storedEmail = sessionStorage.getItem("email")
          const storedPassword = sessionStorage.getItem("password")
          
          if (!storedEmail || !storedPassword) {
            console.error("[v0] Missing user data for Firestore document creation")
            // Still redirect to success page as payment was successful
            window.location.href = `${window.location.origin}/success`
            return
          }

          // Get current user from Firebase Auth
          const currentUser = auth.currentUser
          
          if (!currentUser) {
            console.error("[v0] No authenticated user found")
            window.location.href = `${window.location.origin}/success`
            return
          }

          // Create user document in Firestore after successful payment
          await authService.createUserDocument(
            currentUser.uid,
            storedEmail,
            storedPassword
          )
          
          // Clear stored data
          sessionStorage.removeItem("email")
          sessionStorage.removeItem("password")
          
          // Redirect to success page
          window.location.href = `${window.location.origin}/success`
        } catch (updateError) {
          console.error("[v0] Failed to create user document:", updateError)
          // Still redirect to success page as payment was successful
          window.location.href = `${window.location.origin}/success`
        }
      }
    } catch (error: any) {
      console.error("[v0] Payment submission error:", error)
      setErrorMessage("予期しないエラーが発生しました")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* PAYMENT METHODS Section */}
      <div className="payment-section">
        <h3 className="section-title">お支払い方法</h3>
        <div className="space-y-4">
          <div>
            <label className="field-label">支払い方法を選択</label>
            <div className="payment-element-container">
              <style jsx>{`
                .payment-element-container {
                  padding: 16px;
                  background: rgba(255, 255, 255, 0.05);
                  border-radius: 8px;
                  border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .payment-element-container .p-Input {
                  background: rgba(255, 255, 255, 0.1) !important;
                  border: 1px solid rgba(255, 255, 255, 0.2) !important;
                  color: #ffffff !important;
                }
                .payment-element-container .p-Input:focus {
                  border: 1px solid #ff9100 !important;
                  box-shadow: 0 0 0 2px rgba(255, 145, 0, 0.2) !important;
                }
              `}</style>
              <PaymentElement 
                options={{
                  layout: {
                    type: 'tabs',
                    defaultCollapsed: false,
                  },
                  fields: {
                    billingDetails: {
                      name: 'auto',
                      email: 'auto',
                      phone: 'auto',
                    },
                  },
                  wallets: {
                    applePay: 'auto',
                    googlePay: 'auto',
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* YOUR INFORMATION Section */}
      <div className="payment-section">
        <h3 className="section-title">お客様情報</h3>
        <div className="space-y-4">
          <div>
            <label className="field-label">お名前</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="form-input"
              placeholder="山田 太郎"
              required
            />
          </div>
          <div>
            <label className="field-label">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="example@gmail.com"
              required
            />
          </div>
          <div>
            <label className="field-label">電話番号</label>
            <div className="phone-input-container">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="country-code-select"
              >
                {COUNTRY_CODES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.code}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="phone-number-input"
                placeholder="90-1234-5678"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Total Due Section */}
      <div className="total-section">
        <div className="flex justify-between items-center">
          <span className="total-label">合計金額:</span>
          <span className="total-amount">{getPricingDisplay(selectedPlan)}</span>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="terms-section">
        <label className="terms-checkbox">
          <input 
            type="checkbox" 
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="checkbox-input"
          />
          <span className="checkbox-text">
            <a href="#" className="terms-link">利用規約</a>および<a href="#" className="terms-link">プライバシーポリシー</a>に同意し、キャンセルするまで{getPricingDisplay(selectedPlan)}の支払いに同意します。
          </span>
        </label>
      </div>

      {errorMessage && (
        <div className="error-message text-center" role="alert">
          {errorMessage}
        </div>
      )}

      <button type="submit" disabled={!stripe || isProcessing || !acceptTerms} className="primary-button">
        {isProcessing ? "処理中..." : "購読する"}
      </button>

      <p className="text-center text-sm text-muted-foreground">お支払いはStripeによって安全に処理されます。</p>
    </form>
  )
}

export default function SubscribePage() {
  const searchParams = useSearchParams()
  const tenant = searchParams.get("tenant") || "ai-english"

  const [email, setEmail] = useState("")
  const [emailInput, setEmailInput] = useState("")
  const [selectedPlanId, setSelectedPlanId] = useState("")
  const [clientSecret, setClientSecret] = useState("")
  const [isLoadingPayment, setIsLoadingPayment] = useState(false)
  const [error, setError] = useState("")
  const [paymentElementMounted, setPaymentElementMounted] = useState(false)

  useEffect(() => {
    // Load email from sessionStorage
    const storedEmail = sessionStorage.getItem("email")
    if (storedEmail) {
      setEmail(storedEmail)
    }

    // Load last selected plan
    const storedPlan = sessionStorage.getItem("selectedPlanId")
    if (storedPlan) {
      setSelectedPlanId(storedPlan)
      // Auto-load payment form if plan is already selected
      setTimeout(() => loadPaymentForm(storedPlan), 100)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePlanSelect = async (planId: string) => {
    setSelectedPlanId(planId)
    sessionStorage.setItem("selectedPlanId", planId)
    
    // Reset payment state when plan changes
    setClientSecret("")
    setPaymentElementMounted(false)
    setError("")
    
    // Auto-load payment form for new plan
    await loadPaymentForm(planId)
  }

  const loadPaymentForm = async (planId?: string) => {
    // Get email from multiple sources, prioritizing sessionStorage
    const storedEmail = sessionStorage.getItem("email")
    const finalEmail = storedEmail || email || emailInput
    const planToUse = planId || selectedPlanId

    if (!finalEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(finalEmail)) {
      setError("有効なメールアドレスを入力してください")
      return
    }

    if (!planToUse) {
      setError("プランを選択してください")
      return
    }

    setIsLoadingPayment(true)
    setError("")

    try {
      console.log('Creating subscription with:', { email: finalEmail, planId: planToUse, tenant })
      
      // Call your API to create a subscription setup
      const response = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: finalEmail,
          planId: planToUse,
          tenant,
        }),
      })

      console.log('API response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create payment session' }))
        console.error('API error response:', errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Stripe publishable key is already set via environment variable

      setClientSecret(data.clientSecret)

      // Store email if it was entered inline and update state
      if (emailInput && !storedEmail) {
        sessionStorage.setItem("email", emailInput)
        setEmail(emailInput)
      }
    } catch (error: any) {
      console.error("[v0] Payment form load error:", error)
      setError(error.message || "お支払いフォームの読み込みに失敗しました")
    } finally {
      setIsLoadingPayment(false)
    }
  }

  const isReadyToSubscribe = (email || emailInput) && selectedPlanId && clientSecret && paymentElementMounted

  return (
    <div className="form-container">
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-balance">プランを選択</h1>
            <p className="text-muted-foreground">続行するにはサブスクリプションプランを選択してください</p>
          </div>

          <div className="space-y-8">
            {/* Email recall/input */}
            {!email && (
              <div>
                <label htmlFor="email-input" className="form-label">
                  メールアドレス
                </label>
                <input
                  id="email-input"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="form-input"
                  placeholder="you@example.com"
                  required
                />
              </div>
            )}


            {/* Plan selector */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="step-number">1</span>
                <h2 className="text-xl font-semibold">プランを選択</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {PLANS.map((plan) => (
                  <button
                    key={plan.planId}
                    type="button"
                    onClick={() => handlePlanSelect(plan.planId)}
                    className={`plan-card text-left ${selectedPlanId === plan.planId ? "selected" : ""}`}
                  >
                    <div className="font-semibold text-lg mb-1">{plan.planName}</div>
                    <div className="text-2xl font-bold mb-2" style={{ color: "var(--accent)" }}>
                      {plan.publicLabel}
                    </div>
                    <div className="text-sm text-muted-foreground">{plan.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Element */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="step-number">2</span>
                <h2 className="text-xl font-semibold">お支払い詳細</h2>
              </div>

              {!selectedPlanId ? (
                <div className="text-center text-muted-foreground py-8">
                  お支払いを続行するには、上記からプランを選択してください
                </div>
              ) : isLoadingPayment ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin mb-4"></div>
                  <p className="text-muted-foreground">お支払いフォームを読み込み中...</p>
                </div>
              ) : error ? (
                <div className="error-message text-center py-4" role="alert">
                  <div className="mb-2">{error}</div>
                  <button 
                    onClick={() => loadPaymentForm()} 
                    className="text-sm underline hover:no-underline"
                  >
                    再試行
                  </button>
                </div>
              ) : clientSecret ? (
                <ClientOnly fallback={
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin mb-4"></div>
                    <p className="text-muted-foreground">お支払いフォームを読み込み中...</p>
                  </div>
                }>
                  <Elements 
                    stripe={stripePromise} 
                    options={{ 
                      clientSecret,
                      appearance: {
                        theme: 'stripe',
                        variables: {
                          colorPrimary: '#ff9100',
                          colorBackground: 'rgba(255, 255, 255, 0.08)',
                          colorText: '#ffffff',
                          colorTextSecondary: 'rgba(255, 255, 255, 0.9)',
                          colorDanger: '#ff6b6b',
                          colorIcon: '#ffffff',
                          colorIconHover: '#ff9100',
                          fontFamily: 'system-ui, sans-serif',
                          spacingUnit: '4px',
                          borderRadius: '8px',
                        },
                        rules: {
                          '.Input': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: '#ffffff',
                          },
                          '.Input:focus': {
                            border: '1px solid #ff9100',
                            boxShadow: '0 0 0 2px rgba(255, 145, 0, 0.2)',
                          },
                        },
                      },
                      loader: 'auto',
                    }}
                  >
                    <CheckoutForm 
                      onPaymentElementMount={() => setPaymentElementMounted(true)} 
                      selectedPlan={selectedPlanId}
                      clientSecret={clientSecret}
                    />
                  </Elements>
                </ClientOnly>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <ClientOnly>
        <ThemeCustomizer />
      </ClientOnly>
    </div>
  )
}
