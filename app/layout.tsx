import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import Image from 'next/image'
import './globals.css'

export const metadata: Metadata = {
  title: 'ChatMate - AI英会話アプリ',
  description: 'AI技術を活用した英会話学習アプリケーション',
  generator: 'v0.app',
  icons: {
    icon: '/ChatMateIcon.png',
    shortcut: '/ChatMateIcon.png',
    apple: '/ChatMateIcon.png',
  },
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
              <div className="flex items-center gap-1">
                <Image 
                  src="/ChatMateIcon.png" 
                  alt="ChatMate Logo" 
                  width={28} 
                  height={28} 
                  className="rounded"
                  priority
                />
                <h1 className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
                  ChatMate
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
