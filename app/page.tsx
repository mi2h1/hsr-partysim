import Link from 'next/link'

export default function Home() {
  return (
    <div>
      {/* 機能カード */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <i className="bi bi-bar-chart-line-fill text-info fs-3 me-3"></i>
                <h4 className="card-title mb-0">キャラクター分析</h4>
              </div>
              <p className="card-text text-muted">
                個別キャラクターのバフ・デバフ効果を詳細に確認できます
              </p>
              <Link 
                href="/characters" 
                className="btn btn-info"
              >
                <i className="bi bi-arrow-right me-1"></i>
                キャラクター一覧へ
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <i className="bi bi-people-fill text-success fs-3 me-3"></i>
                <h4 className="card-title mb-0">パーティ編成</h4>
              </div>
              <p className="card-text text-muted">
                4キャラクターの組み合わせでバフ・デバフの相乗効果を確認
              </p>
              <Link 
                href="/party" 
                className="btn btn-success"
              >
                <i className="bi bi-arrow-right me-1"></i>
                パーティ編成へ
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <i className="bi bi-cloud-upload-fill text-warning fs-3 me-3"></i>
                <h4 className="card-title mb-0">CSV アップロード</h4>
              </div>
              <p className="card-text text-muted">
                新しいキャラクターのCSVデータをアップロードして追加
              </p>
              <Link 
                href="/upload" 
                className="btn btn-warning"
              >
                <i className="bi bi-upload me-1"></i>
                CSV アップロード
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <i className="bi bi-info-circle-fill text-secondary fs-3 me-3"></i>
                <h4 className="card-title mb-0">システム情報</h4>
              </div>
              <p className="card-text text-muted">
                ゲームシステムの仕組みと計算式について
              </p>
              <Link 
                href="/about" 
                className="btn btn-secondary"
              >
                <i className="bi bi-book me-1"></i>
                詳細を見る
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* クイックスタートガイド */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">
            <i className="bi bi-rocket-takeoff me-2"></i>
            クイックスタート
          </h4>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4 mb-3">
              <div className="d-flex align-items-start">
                <span className="badge bg-primary rounded-pill me-3 mt-1">1</span>
                <div>
                  <strong>CSV アップロード</strong>
                  <p className="text-muted small mb-0">キャラクターデータ（robin.csv等）をアップロード</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="d-flex align-items-start">
                <span className="badge bg-primary rounded-pill me-3 mt-1">2</span>
                <div>
                  <strong>キャラクター分析</strong>
                  <p className="text-muted small mb-0">各キャラのバフ・デバフ効果を確認</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="d-flex align-items-start">
                <span className="badge bg-primary rounded-pill me-3 mt-1">3</span>
                <div>
                  <strong>パーティ編成</strong>
                  <p className="text-muted small mb-0">4キャラの組み合わせをシミュレート</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}