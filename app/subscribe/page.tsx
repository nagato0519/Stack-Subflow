"use client"

import { useState, useEffect, useRef, type FormEvent } from "react"
import { useSearchParams } from "next/navigation"
import { ClientOnly } from "@/components/client-only"
import { authService } from "@/lib/auth"
import { auth } from "@/lib/firebase"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements, PaymentRequestButtonElement } from "@stripe/react-stripe-js"

// Initialize Stripe with publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// Single subscription plan configuration
const SUBSCRIPTION_PLAN = {
  planId: "stack_subscription",
  planName: "Stackサブスクリプション",
  publicLabel: "Stackに登録",
  description: "Stackサービスへのフルアクセス",
  price: 1500,
  originalPrice: 3000,
  currency: "¥"
}

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

function PaymentForm({ tenant, email }: { tenant: string, email: string }) {
  const selectedPlan = SUBSCRIPTION_PLAN.planId

  return (
    <Elements 
      stripe={stripePromise} 
      options={{ 
        locale: 'ja',
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#D8F966',
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
              border: '1px solid #D8F966',
              boxShadow: '0 0 0 2px rgba(216, 249, 102, 0.2)',
            },
          },
        },
        loader: 'auto',
      }}
    >
      <CheckoutForm 
        tenant={tenant}
        email={email}
      />
    </Elements>
  )
}

function CheckoutForm({ tenant, email: initialEmail }: { tenant: string, email: string }) {
  const selectedPlan = SUBSCRIPTION_PLAN.planId
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [email, setEmail] = useState(initialEmail)
  const [fullName, setFullName] = useState("")
  const [cardHolderName, setCardHolderName] = useState("")
  const [paymentRequest, setPaymentRequest] = useState<any>(null)
  const [canMakePayment, setCanMakePayment] = useState(false)
  const [isIOSDevice, setIsIOSDevice] = useState(false)
  
  // Use ref to store current acceptTerms value to avoid closure issues
  const acceptTermsRef = useRef(acceptTerms)
  
  // Update ref whenever acceptTerms changes
  useEffect(() => {
    acceptTermsRef.current = acceptTerms
  }, [acceptTerms])

  // Update email state when initialEmail prop changes
  useEffect(() => {
    console.log("[CheckoutForm] Email prop changed to:", initialEmail)
    setEmail(initialEmail)
  }, [initialEmail])

  // Detect iOS device
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase()
    const isIOS = /iphone|ipad|ipod/.test(userAgent)
    setIsIOSDevice(isIOS)
    console.log('Device detection - iOS:', isIOS, 'User Agent:', userAgent)
  }, [])

  // Initialize Payment Request (Apple Pay, Google Pay, etc.)
  useEffect(() => {
    if (!stripe) {
      console.log('Missing stripe:', { stripe: !!stripe })
      return
    }

    // For payment request, we'll set the amount to match the subscription price
    // Stripe expects amount in the smallest currency unit (for JPY, that's 1 yen)
    const amount = SUBSCRIPTION_PLAN.price // 1500 JPY

    console.log('Creating Payment Request with:', {
      country: 'JP',
      currency: 'jpy',
      amount,
      label: SUBSCRIPTION_PLAN.planName
    })

    const pr = stripe.paymentRequest({
      country: 'JP',
      currency: 'jpy',
      total: {
        label: SUBSCRIPTION_PLAN.planName,
        amount: amount,
      },
      requestPayerName: true,
      requestPayerEmail: true,
      displayItems: [
        {
          label: SUBSCRIPTION_PLAN.planName,
          amount: amount,
        },
      ],
    })

    // Check if Apple Pay, Google Pay, etc. is available
    pr.canMakePayment().then((result) => {
      console.log('Payment Request canMakePayment result:', result)
      if (result) {
        console.log('Apple Pay/Google Pay is available')
        setPaymentRequest(pr)
        setCanMakePayment(true)
      } else {
        console.log('Apple Pay/Google Pay is not available')
        setCanMakePayment(false)
      }
    }).catch((error) => {
      console.error('Error checking payment availability:', error)
      setCanMakePayment(false)
    })

    pr.on('paymentmethod', async (e) => {
      // Use ref to get current value, avoiding closure issues
      if (!acceptTermsRef.current) {
        e.complete('fail')
        setErrorMessage("利用規約に同意してください")
        return
      }

      try {
        setIsProcessing(true)
        setErrorMessage("")

        // Create payment intent
        const requestData = {
          email: e.payerEmail || email,
          planId: selectedPlan,
          tenant,
        }
        
        const response = await fetch("/api/subscriptions/create", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(requestData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          e.complete('fail')
          setErrorMessage(errorData?.error || "決済に失敗しました")
          return
        }

        const data = await response.json()
        
        if (!data.clientSecret) {
          e.complete('fail')
          setErrorMessage("決済セッションの作成に失敗しました。もう一度お試しください。")
          return
        }
        
        const clientSecret = data.clientSecret
        const customerId = data.customerId

        // Confirm the payment
        const { error, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: e.paymentMethod.id },
          { handleActions: false }
        )

        if (error) {
          e.complete('fail')
          setErrorMessage(error.message || "決済に失敗しました")
          return
        }

        e.complete('success')

        if (paymentIntent && paymentIntent.status === 'succeeded') {
          try {
            const storedEmail = sessionStorage.getItem("email")
            const storedPassword = sessionStorage.getItem("password")
            
            if (!storedEmail || !storedPassword) {
              window.location.href = `${window.location.origin}/success`
              return
            }

            await authService.signUp(storedEmail, storedPassword)
            const currentUser = auth.currentUser
            
            if (currentUser) {
              await authService.createUserDocument(
                currentUser.uid,
                storedEmail,
                storedPassword,
                customerId
              )
            }
            
            sessionStorage.removeItem("email")
            sessionStorage.removeItem("password")
            
            window.location.href = `${window.location.origin}/success`
          } catch (updateError) {
            console.error("[CheckoutForm] Failed to create user document:", updateError)
            window.location.href = `${window.location.origin}/success`
          }
        }
      } catch (error: any) {
        e.complete('fail')
        console.error("[CheckoutForm] Payment submission error:", error)
        setErrorMessage(error.message || "予期しないエラーが発生しました")
      } finally {
        setIsProcessing(false)
      }
    })
  }, [stripe, email, tenant])

  // Pricing display for subscription
  const getPricingDisplay = () => {
    return SUBSCRIPTION_PLAN.publicLabel
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    if (!acceptTerms) {
      setErrorMessage("利用規約に同意してください")
      return
    }

    if (!email || !fullName || !cardHolderName) {
      setErrorMessage("すべての必須項目を入力してください")
      return
    }

    setIsProcessing(true)
    setErrorMessage("")

    try {
      // Create payment intent first
      const requestData = {
        email: email,
        planId: selectedPlan,
        tenant,
      }
      console.log("[CheckoutForm] Sending request to API with:", requestData)
      console.log("[CheckoutForm] Request URL:", "/api/subscriptions/create")
      
      const response = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(requestData),
      })

      console.log("[CheckoutForm] API Response status:", response.status, response.statusText)

      if (!response.ok) {
        let errorData
        try {
          const responseText = await response.text()
          console.error("[CheckoutForm] Raw response text:", responseText)
          
          if (responseText) {
            errorData = JSON.parse(responseText)
          } else {
            errorData = { error: 'Empty response from server' }
          }
        } catch (parseError) {
          console.error("[CheckoutForm] Failed to parse error response:", parseError)
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }
        
        console.error("[CheckoutForm] API Error Response:", errorData)
        console.error("[CheckoutForm] Response status:", response.status)
        console.error("[CheckoutForm] Response headers:", Object.fromEntries(response.headers.entries()))
        
        const errorMessage = errorData?.error || errorData?.message || `HTTP ${response.status}: ${response.statusText}`
        setErrorMessage(errorMessage)
        return
      }

      const data = await response.json()
      console.log("[CheckoutForm] API Response:", data)
      
      if (!data.clientSecret) {
        console.error("[CheckoutForm] Missing clientSecret in response:", data)
        setErrorMessage("決済セッションの作成に失敗しました。もう一度お試しください。")
        return
      }
      
      const clientSecret = data.clientSecret
      const customerId = data.customerId

      // Confirm the payment with the card element
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: cardHolderName,
            email: email,
          },
        },
      })

      if (error) {
        setErrorMessage(error.message || "決済に失敗しました")
        console.error("[CheckoutForm] Payment error:", error)
        return
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

          // Create Firebase Auth account after successful payment
          await authService.signUp(storedEmail, storedPassword)

          // Get current user from Firebase Auth
          const currentUser = auth.currentUser
          
          if (!currentUser) {
            console.error("[v0] No authenticated user found after account creation")
            window.location.href = `${window.location.origin}/success`
            return
          }

          // Create user document in Firestore after successful payment
          await authService.createUserDocument(
            currentUser.uid,
            storedEmail,
            storedPassword,
            customerId
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
      console.error("[CheckoutForm] Payment submission error:", error)
      setErrorMessage(error.message || "予期しないエラーが発生しました")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Pricing Display */}
      <div className="payment-section">
        <div className="text-center space-y-4">
          <div>
            <div className="text-sm text-muted-foreground mb-2">月額料金</div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl font-bold text-white">{SUBSCRIPTION_PLAN.currency}{SUBSCRIPTION_PLAN.price.toLocaleString()}</span>
              <span className="text-xl text-muted-foreground line-through">{SUBSCRIPTION_PLAN.currency}{SUBSCRIPTION_PLAN.originalPrice.toLocaleString()}</span>
            </div>
            <div className="mt-2">
              <span className="inline-block px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-sm font-medium">
                50%オフ
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {SUBSCRIPTION_PLAN.description}
          </p>
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
            <a href="#" className="terms-link">利用規約</a>と<a href="#" className="terms-link">プライバシーポリシー</a>に同意し、キャンセルまで支払いを続けることに同意します。
          </span>
        </label>
      </div>

      {/* Apple Pay / Google Pay Button */}
      {canMakePayment && paymentRequest && (
        <>
          <div className="payment-section">
            <h3 className="section-title">クイック決済</h3>
            
            {!acceptTerms ? (
              <div className="mb-4 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                <p className="text-sm text-yellow-500">
                  ⚠️ クイック決済を使用するには、上記の利用規約に同意してください
                </p>
              </div>
            ) : (
              <div className="mb-4">
                <PaymentRequestButtonElement 
                  options={{ 
                    paymentRequest,
                    style: {
                      paymentRequestButton: {
                        type: 'default',
                        theme: 'dark',
                        height: '48px',
                      },
                    },
                  }} 
                />
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[rgb(var(--background))] text-muted-foreground">またはカードで支払う</span>
            </div>
          </div>
        </>
      )}

      {/* CARD INFORMATION Section */}
      <div className="payment-section">
        <h3 className="section-title">カード情報</h3>
        <div className="space-y-4">
          <div>
            <label className="field-label">カード番号</label>
            <div className="card-element-container">
              <CardElement
                options={{
                  hidePostalCode: true,
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#ffffff',
                      backgroundColor: 'transparent',
                      '::placeholder': {
                        color: 'rgba(255, 255, 255, 0.6)',
                      },
                    },
                    invalid: {
                      color: '#ff6b6b',
                      backgroundColor: 'transparent',
                    },
                    complete: {
                      color: '#ffffff',
                      backgroundColor: 'transparent',
                    },
                  },
                }}
              />
            </div>
          </div>
          
          <div>
            <label className="field-label">カード名義人</label>
            <input
              type="text"
              value={cardHolderName}
              onChange={(e) => setCardHolderName(e.target.value)}
              className="form-input"
              placeholder="TARO YAMADA"
              required
            />
          </div>
          
        </div>
      </div>

      {/* YOUR INFORMATION Section */}
      <div className="payment-section">
        <h3 className="section-title">お客様情報</h3>
        <div className="space-y-4">
          <div>
            <label className="field-label">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="field-label">氏名</label>
              <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="form-input"
              placeholder="山田太郎"
                required
              />
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="error-message text-center" role="alert">
          {errorMessage}
        </div>
      )}

      <button type="submit" disabled={!stripe || isProcessing || !acceptTerms} className="primary-button">
        {isProcessing ? "処理中..." : "今すぐ登録"}
      </button>

      <p className="text-center text-sm text-muted-foreground">決済はStripeによって安全に処理されます。</p>
    </form>
  )
}

export default function SubscribePage() {
  const searchParams = useSearchParams()
  const tenant = searchParams.get("tenant") || "stack"

  const [email, setEmail] = useState("")

  useEffect(() => {
    // Load email from sessionStorage
    const storedEmail = sessionStorage.getItem("email")
    console.log("[SubscribePage] Loading email from sessionStorage:", storedEmail)
    if (storedEmail) {
      setEmail(storedEmail)
      console.log("[SubscribePage] Email set to:", storedEmail)
    }
  }, [])

  return (
    <div className="form-container">
      <div className="min-h-screen flex items-center justify-center px-4 py-12 pt-20">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-balance">Stackサブスクリプション</h1>
            <p className="text-muted-foreground">サブスクリプションを完了する</p>
          </div>

          <div className="space-y-8">
            {/* Payment Form */}
            <ClientOnly fallback={
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin mb-4"></div>
                <p className="text-muted-foreground">決済フォームを読み込んでいます...</p>
              </div>
            }>
              <PaymentForm 
                tenant={tenant}
                email={email}
              />
            </ClientOnly>
          </div>
        </div>
      </div>
    </div>
  )
}