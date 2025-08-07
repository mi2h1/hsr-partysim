# 崩壊スターレイル パーティーシミュレーター

## 技術仕様

### フレームワーク・ライブラリ
- **Next.js 15** - React フレームワーク（App Router使用）
- **TypeScript** - 型安全性を重視した開発
- **React 18** - UIコンポーネント構築

### データベース
- **PostgreSQL** - リレーショナルデータベース
- **Neon** - クラウドPostgreSQLサービス

### UI/スタイリング
- **Bootstrap 5** - CSSフレームワーク
- **Bootstrap Icons** - アイコンライブラリ
- **レスポンシブデザイン** - モバイルファーストアプローチ

### デプロイメント
- **Vercel** - ホスティング・デプロイプラットフォーム
- **Git** - バージョン管理

### データ処理
- **CSV解析** - キャラクターデータ一括取り込み機能
- **REST API** - Next.js API Routes使用

### 主な機能
- キャラクター管理（基本情報・ステータス・スキル・星魂）
- パーティー編成（4キャラクター選択）
- バフ・デバフ効果表示
- CSVデータインポート
- レスポンシブUI

### アーキテクチャ
- **フロントエンド**: Next.js (React) + TypeScript + Bootstrap
- **バックエンド**: Next.js API Routes
- **データベース**: PostgreSQL (Neon)
- **デプロイ**: Vercel