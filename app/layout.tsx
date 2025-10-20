import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import Image from 'next/image'
import './globals.css'

export const metadata: Metadata = {
  title: 'Stack - アカウント作成',
  description: 'Stackアカウントを作成',
  generator: 'v0.app',
  icons: {
    icon: '/stack.png',
    shortcut: '/stack.png',
    apple: '/stack.png',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" style={{ backgroundColor: 'var(--bg)' }}>
      <body 
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}
        style={{ backgroundColor: 'var(--bg)', color: '#ffffff' }}
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          <div className="min-h-screen w-full" style={{ backgroundColor: 'var(--bg)', color: '#ffffff' }}>
            <header className="absolute top-0 left-0 p-4 z-10">
              <div className="flex items-center gap-3">
                <Image 
                  src="/stack.png" 
                  alt="Stack Logo" 
                  width={28} 
                  height={28} 
                  className="rounded"
                  priority
                />
                <h1 className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
                  Stack
                </h1>
              </div>
            </header>
            {children}
          </div>
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}
