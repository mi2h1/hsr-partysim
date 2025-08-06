import Link from 'next/link';

export default function SystemPage() {
  return (
    <div>
      {/* システム解説ヘッダー */}
      <div className="card shadow-sm mb-4">
        <div className="card-body text-center">
          <h1 className="display-5 text-primary fw-bold mb-3">
            <i className="bi bi-gear-fill me-2"></i>
            崩壊スターレイル ゲームシステム解説
          </h1>
          <p className="lead text-muted">
            ゲームシステムを理解して、より効果的なパーティ編成とキャラクター運用を実現しましょう。
          </p>
        </div>
      </div>

      {/* システム概要 */}
      <div className="row g-4 mb-5">
        <div className="col-md-6">
          <div className="card h-100 border-primary">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0"><i className="bi bi-controller me-2"></i>基本システム</h4>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  ターン制バトルRPG
                  <span className="badge bg-primary rounded-pill">Turn-Based</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  4キャラクター制
                  <span className="badge bg-primary rounded-pill">4 Members</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  7属性 × 7運命
                  <span className="badge bg-primary rounded-pill">49 Types</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card h-100 border-success">
            <div className="card-header bg-success text-white">
              <h4 className="mb-0"><i className="bi bi-lightning-charge me-2"></i>属性システム</h4>
            </div>
            <div className="card-body">
              <div className="row g-2">
                <div className="col-6"><span className="badge bg-secondary w-100">物理 - 裂創</span></div>
                <div className="col-6"><span className="badge bg-danger w-100">炎 - 燃焼</span></div>
                <div className="col-6"><span className="badge bg-info w-100">氷 - 凍結</span></div>
                <div className="col-6"><span className="badge bg-warning w-100">雷 - 感電</span></div>
                <div className="col-6"><span className="badge bg-success w-100">風 - 風化</span></div>
                <div className="col-6"><span className="badge bg-primary w-100">量子 - もつれ</span></div>
                <div className="col-12"><span className="badge bg-dark w-100">虚数 - 禁錮</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 運命システム */}
      <div className="card shadow-sm mb-5">
        <div className="card-header bg-warning text-dark">
          <h3 className="mb-0"><i className="bi bi-star-fill me-2"></i>運命システム（7種類）</h3>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="card border-danger">
                <div className="card-body text-center">
                  <h5 className="text-danger">壊滅</h5>
                  <p className="small text-muted mb-0">アタッカー</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-warning">
                <div className="card-body text-center">
                  <h5 className="text-warning">巡狩</h5>
                  <p className="small text-muted mb-0">単体アタッカー</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-info">
                <div className="card-body text-center">
                  <h5 className="text-info">知恵</h5>
                  <p className="small text-muted mb-0">サブアタッカー・デバフ</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-success">
                <div className="card-body text-center">
                  <h5 className="text-success">調和</h5>
                  <p className="small text-muted mb-0">サポート・バフ</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-primary">
                <div className="card-body text-center">
                  <h5 className="text-primary">虚無</h5>
                  <p className="small text-muted mb-0">デバフ・妨害</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-secondary">
                <div className="card-body text-center">
                  <h5 className="text-secondary">存護</h5>
                  <p className="small text-muted mb-0">タンク・防御</p>
                </div>
              </div>
            </div>
            <div className="col-md-12">
              <div className="card border-success">
                <div className="card-body text-center">
                  <h5 className="text-success">豊穣</h5>
                  <p className="small text-muted mb-0">ヒーラー・回復</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ダメージ計算システム */}
      <div className="card shadow-sm mb-5">
        <div className="card-header bg-danger text-white">
          <h3 className="mb-0"><i className="bi bi-calculator me-2"></i>ダメージ計算システム</h3>
        </div>
        <div className="card-body">
          <div className="alert alert-info" role="alert">
            <h5><i className="bi bi-info-circle me-2"></i>基本計算式</h5>
            <code className="bg-light p-2 d-block rounded">
              最終ダメージ = 基礎ダメージ × 会心係数 × ダメージバフ係数 × 防御係数 × 属性耐性係数 × 被ダメージ係数 × ブレイク係数
            </code>
          </div>
          
          <div className="row g-3">
            <div className="col-md-6">
              <h5 className="text-primary">ダメージバフの種類</h5>
              <ul className="list-group">
                <li className="list-group-item">
                  <strong>攻撃力%バフ</strong> - 基礎ダメージに影響
                </li>
                <li className="list-group-item">
                  <strong>与ダメージ%バフ</strong> - 全ダメージタイプに有効
                </li>
                <li className="list-group-item">
                  <strong>属性ダメージ%バフ</strong> - 特定属性のみ
                </li>
                <li className="list-group-item">
                  <strong>スキル特化ダメージ%</strong> - 特定スキルのみ
                </li>
              </ul>
            </div>
            
            <div className="col-md-6">
              <h5 className="text-success">バフの計算ルール</h5>
              <div className="alert alert-success">
                <strong>重要&colon;</strong> 異種バフは乗算で計算されます
                <hr className="my-2" />
                <small>
                  例&colon; 攻撃力+30%、与ダメージ+20%、炎属性+25%<br />
                  &rarr; 1.30 &times; 1.20 &times; 1.25 = <strong>1.95倍</strong>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ステータス体系 */}
      <div className="card shadow-sm mb-5">
        <div className="card-header bg-info text-white">
          <h3 className="mb-0"><i className="bi bi-bar-chart-line me-2"></i>ステータス体系</h3>
        </div>
        <div className="card-body">
          <div className="row g-4">
            <div className="col-md-3">
              <h5 className="text-primary">基礎ステータス</h5>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">HP</li>
                <li className="list-group-item">攻撃力</li>
                <li className="list-group-item">防御力</li>
                <li className="list-group-item">速度</li>
              </ul>
            </div>
            
            <div className="col-md-3">
              <h5 className="text-success">戦闘ステータス</h5>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">会心率</li>
                <li className="list-group-item">会心ダメージ</li>
                <li className="list-group-item">撃破特効</li>
              </ul>
            </div>
            
            <div className="col-md-3">
              <h5 className="text-warning">属性ダメージ</h5>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">物理属性ダメージ</li>
                <li className="list-group-item">炎属性ダメージ</li>
                <li className="list-group-item">氷属性ダメージ</li>
                <li className="list-group-item">その他各属性...</li>
              </ul>
            </div>
            
            <div className="col-md-3">
              <h5 className="text-secondary">補助ステータス</h5>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">治癒量</li>
                <li className="list-group-item">EP回復効率</li>
                <li className="list-group-item">効果命中</li>
                <li className="list-group-item">効果抵抗</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 速度・行動値システム */}
      <div className="card shadow-sm mb-5">
        <div className="card-header bg-primary text-white">
          <h3 className="mb-0"><i className="bi bi-speedometer2 me-2"></i>速度・行動値システム</h3>
        </div>
        <div className="card-body">
          <div className="row g-4">
            <div className="col-md-8">
              <h5>行動値システムの仕組み</h5>
              <ol className="list-group list-group-numbered">
                <li className="list-group-item">全キャラクター行動ポイント0からスタート</li>
                <li className="list-group-item">各キャラの速度に応じて行動ポイントが蓄積</li>
                <li className="list-group-item">行動ポイントが10,000に達すると行動可能</li>
                <li className="list-group-item">行動後、行動ポイントは0にリセット</li>
              </ol>
            </div>
            
            <div className="col-md-4">
              <div className="alert alert-primary">
                <h6><i className="bi bi-calculator me-1"></i>計算式</h6>
                <code className="bg-light p-2 d-block rounded small">
                  行動値 = (10,000 - 現在の行動ポイント) / 速度
                </code>
                <small className="text-muted">行動値が低いほど先に行動</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 星魂システム */}
      <div className="card shadow-sm mb-5">
        <div className="card-header bg-warning text-dark">
          <h3 className="mb-0"><i className="bi bi-star-fill me-2"></i>星魂（凸）システム</h3>
        </div>
        <div className="card-body">
          <div className="row g-3 mb-4">
            <div className="col-md-12">
              <div className="progress" style={{ height: '30px' }}>
                <div className="progress-bar bg-secondary" style={{ width: '14%' }}>無凸</div>
                <div className="progress-bar bg-primary" style={{ width: '14%' }}>1凸</div>
                <div className="progress-bar bg-info" style={{ width: '14%' }}>2凸</div>
                <div className="progress-bar bg-success" style={{ width: '14%' }}>3凸</div>
                <div className="progress-bar bg-warning" style={{ width: '14%' }}>4凸</div>
                <div className="progress-bar bg-danger" style={{ width: '16%' }}>5凸</div>
                <div className="progress-bar bg-dark" style={{ width: '14%' }}>完凸</div>
              </div>
            </div>
          </div>
          
          <div className="row g-3">
            <div className="col-md-6">
              <h5>効果の特徴</h5>
              <ul className="list-group">
                <li className="list-group-item">既存スキルの強化</li>
                <li className="list-group-item">新しい効果の追加</li>
                <li className="list-group-item">数値の向上</li>
                <li className="list-group-item">条件の緩和</li>
              </ul>
            </div>
            
            <div className="col-md-6">
              <div className="alert alert-warning">
                <h6><i className="bi bi-info-circle me-1"></i>取得方法</h6>
                <ul className="mb-0">
                  <li>同じキャラクターを複数回入手</li>
                  <li>星魂専用アイテム使用</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 実戦応用 */}
      <div className="card shadow-sm mb-5">
        <div className="card-header bg-success text-white">
          <h3 className="mb-0"><i className="bi bi-people-fill me-2"></i>チーム編成の基本原則</h3>
        </div>
        <div className="card-body">
          <div className="row g-4">
            <div className="col-md-6">
              <h5>理想的な編成</h5>
              <div className="list-group">
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <strong>アタッカー</strong>
                  <span className="badge bg-danger rounded-pill">1名</span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <strong>サポート</strong>
                  <span className="badge bg-success rounded-pill">1-2名</span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <strong>サブアタッカー</strong>
                  <span className="badge bg-warning rounded-pill">0-1名</span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <strong>汎用枠</strong>
                  <span className="badge bg-info rounded-pill">1名</span>
                </div>
              </div>
            </div>
            
            <div className="col-md-6">
              <h5>最適化のポイント</h5>
              <ul className="list-group">
                <li className="list-group-item">
                  <i className="bi bi-arrow-up-right text-success me-2"></i>
                  <strong>乗算バフの組み合わせ</strong> - 異種バフを重ねる
                </li>
                <li className="list-group-item">
                  <i className="bi bi-bullseye text-warning me-2"></i>
                  <strong>会心バランス</strong> - 会心率×会心ダメージの最適比
                </li>
                <li className="list-group-item">
                  <i className="bi bi-lightning-charge text-danger me-2"></i>
                  <strong>属性一致</strong> - アタッカーの属性ダメージバフ
                </li>
                <li className="list-group-item">
                  <i className="bi bi-shield-slash text-primary me-2"></i>
                  <strong>デバフの活用</strong> - 防御減少・耐性減少
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ナビゲーション */}
      <div className="text-center mt-5">
        <div className="btn-group" role="group">
          <Link href="/" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-2"></i>
            メインページに戻る
          </Link>
          <Link href="/characters" className="btn btn-outline-primary">
            <i className="bi bi-people me-2"></i>
            キャラクター一覧
          </Link>
          <Link href="/party" className="btn btn-outline-success">
            <i className="bi bi-people-fill me-2"></i>
            パーティ編成
          </Link>
        </div>
      </div>
    </div>
  );
}