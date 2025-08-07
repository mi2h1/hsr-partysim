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
          <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
            <div className="container">
              <span className="navbar-brand mb-0 h1">
                <i className="bi bi-stars me-2"></i>
                崩壊スターレイル パーティシミュレーター
              </span>
              <div className="navbar-nav ms-auto">
                <a className="nav-link" href="/">
                  <i className="bi bi-house me-1"></i>
                  ホーム
                </a>
                <a className="nav-link" href="/characters">
                  <i className="bi bi-people me-1"></i>
                  キャラクター
                </a>
                <a className="nav-link" href="/party">
                  <i className="bi bi-person-lines-fill me-1"></i>
                  パーティ編成
                </a>
                <div className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                    <i className="bi bi-upload me-1"></i>
                    データ管理
                  </a>
                  <ul className="dropdown-menu">
                    <li>
                      <a className="dropdown-item" href="/upload">
                        <i className="bi bi-file-earmark-plus me-2"></i>
                        新規キャラ追加
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="/update-stats">
                        <i className="bi bi-speedometer2 me-2"></i>
                        ステータス更新
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
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