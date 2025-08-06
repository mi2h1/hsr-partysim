import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HSR Party Simulator',
  description: 'Honkai Star Rail Party Buff/Debuff Analyzer',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
          <nav className="bg-hsr-purple text-white p-4 shadow-lg">
            <div className="container mx-auto">
              <h1 className="text-2xl font-bold">崩壊スターレイル パーティシミュレーター</h1>
              <p className="text-sm opacity-90">キャラクターのバフ・デバフ効果を分析</p>
            </div>
          </nav>
          <main className="container mx-auto py-8 px-4">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}