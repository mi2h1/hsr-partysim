import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import 'bootstrap/dist/css/bootstrap.min.css'
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
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" />
      </head>
      <body className={inter.className}>
        <div className="min-vh-100 bg-light">
          <nav className="navbar navbar-dark bg-primary shadow-sm">
            <div className="container">
              <span className="navbar-brand mb-0 h1">
                <i className="bi bi-stars me-2"></i>
                崩壊スターレイル パーティシミュレーター
              </span>
              <small className="text-light opacity-75">キャラクターのバフ・デバフ効果を分析</small>
            </div>
          </nav>
          <main className="container my-4">
            {children}
          </main>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
      </body>
    </html>
  )
}