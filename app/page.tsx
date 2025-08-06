import Link from 'next/link'

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="hsr-card text-center">
        <h2 className="text-3xl font-bold text-hsr-purple mb-4">
          ようこそ HSR パーティシミュレーターへ
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          崩壊スターレイルのキャラクターのバフ・デバフ効果を分析し、最適なパーティ編成をシミュレートできます。
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="hsr-card">
          <h3 className="text-xl font-semibold mb-3">📊 キャラクター分析</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            個別キャラクターのバフ・デバフ効果を詳細に確認できます
          </p>
          <Link 
            href="/characters" 
            className="inline-block bg-hsr-blue text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            キャラクター一覧へ
          </Link>
        </div>

        <div className="hsr-card">
          <h3 className="text-xl font-semibold mb-3">👥 パーティ編成</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            4キャラクターの組み合わせでバフ・デバフの相乗効果を確認
          </p>
          <Link 
            href="/party" 
            className="inline-block bg-hsr-purple text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
          >
            パーティ編成へ
          </Link>
        </div>

        <div className="hsr-card">
          <h3 className="text-xl font-semibold mb-3">📤 CSV アップロード</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            新しいキャラクターのCSVデータをアップロードして追加
          </p>
          <Link 
            href="/upload" 
            className="inline-block bg-hsr-gold text-black px-4 py-2 rounded hover:bg-yellow-500 transition-colors"
          >
            CSV アップロード
          </Link>
        </div>

        <div className="hsr-card">
          <h3 className="text-xl font-semibold mb-3">ℹ️ システム情報</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            ゲームシステムの仕組みと計算式について
          </p>
          <Link 
            href="/about" 
            className="inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            詳細を見る
          </Link>
        </div>
      </div>

      <div className="hsr-card">
        <h3 className="text-lg font-semibold mb-3">🚀 クイックスタート</h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <p><strong>1.</strong> まず「CSV アップロード」でキャラクターデータ（robin.csv、tori.csvなど）をアップロード</p>
          <p><strong>2.</strong> 「キャラクター分析」で各キャラのバフ・デバフ効果を確認</p>
          <p><strong>3.</strong> 「パーティ編成」で4キャラの組み合わせをシミュレート</p>
        </div>
      </div>
    </div>
  )
}