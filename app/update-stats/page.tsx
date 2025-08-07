'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function UpdateStatsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    updated_characters?: string[];
    not_found_characters?: string[];
    error?: string;
    details?: string;
  } | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
    setResult(null); // 前回の結果をクリア
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('csvFile', selectedFile);

      const response = await fetch('/api/update-stats', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        setSelectedFile(null);
        // ファイル選択をリセット
        const fileInput = document.getElementById('csvFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } catch (error) {
      console.error('アップロードエラー:', error);
      setResult({
        success: false,
        error: 'アップロード中にエラーが発生しました',
        details: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* ヘッダー */}
          <div className="card shadow-sm mb-4">
            <div className="card-body text-center">
              <h1 className="display-6 mb-3">
                <i className="bi bi-speedometer2 me-3 text-primary"></i>
                ステータス専用更新
              </h1>
              <p className="lead text-muted mb-0">
                既存のキャラクター情報は保持したまま、ステータス項目のみを更新します
              </p>
            </div>
          </div>

          {/* CSVフォーマット説明 */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                CSVフォーマット
              </h5>
            </div>
            <div className="card-body">
              <div className="alert alert-warning mb-3">
                <i className="bi bi-exclamation-triangle me-2"></i>
                <strong>重要:</strong> この機能はステータス項目（HP、攻撃力、防御力、速度、EP、ステータスブースト）のみを更新します。
                スキルやバフ・デバフ情報は一切変更されません。
              </div>

              <h6 className="fw-bold">必須ヘッダー:</h6>
              <div className="bg-light p-3 rounded mb-3">
                <code style={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>
                  キャラクター名,HP,攻撃力,防御力,速度,EP,ステータスブースト1種別,ステータスブースト1数値,ステータスブースト2種別,ステータスブースト2数値,ステータスブースト3種別,ステータスブースト3数値
                </code>
              </div>

              <h6 className="fw-bold">データ例:</h6>
              <div className="bg-light p-3 rounded">
                <code style={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>
                  ロビン,1281,640,485,102,110,会心率,5.3,会心ダメージ,5.3,効果命中,4.0<br />
                  トパーズ,1203,620,461,110,110,会心率,3.2,攻撃力,4.3,速度,2.3<br />
                  花火,917,523,551,106,120,攻撃力%,4.3,速度,2.3,,
                </code>
              </div>

              <div className="mt-3">
                <h6 className="fw-bold">注意事項:</h6>
                <ul className="small">
                  <li><strong>キャラクター名</strong>: データベースに既存のキャラクター名と完全一致する必要があります</li>
                  <li><strong>数値項目</strong>: 空欄の場合はnullで更新されます</li>
                  <li><strong>ステータスブースト</strong>: 種別と数値はセットで入力してください</li>
                  <li><strong>部分更新</strong>: 必要な項目のみ入力し、他は空欄でも構いません</li>
                </ul>
              </div>
            </div>
          </div>

          {/* アップロードフォーム */}
          <div className="card shadow-sm mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-upload me-2"></i>
                CSVファイルアップロード
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="csvFile" className="form-label fw-bold">
                  CSVファイルを選択
                </label>
                <input
                  id="csvFile"
                  type="file"
                  accept=".csv"
                  className="form-control"
                  onChange={handleFileSelect}
                  disabled={uploading}
                />
                {selectedFile && (
                  <div className="form-text text-success">
                    <i className="bi bi-check-circle me-1"></i>
                    選択されたファイル: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                  </div>
                )}
              </div>

              <div className="d-grid">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                >
                  {uploading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      更新中...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-cloud-upload me-2"></i>
                      ステータス更新を実行
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 結果表示 */}
          {result && (
            <div className="card shadow-sm mb-4">
              <div className={`card-header ${result.success ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                <h5 className="mb-0">
                  <i className={`bi ${result.success ? 'bi-check-circle' : 'bi-x-circle'} me-2`}></i>
                  {result.success ? '更新完了' : '更新失敗'}
                </h5>
              </div>
              <div className="card-body">
                {result.success ? (
                  <>
                    <div className="alert alert-success">
                      <i className="bi bi-check-circle me-2"></i>
                      {result.message}
                    </div>
                    
                    {result.updated_characters && result.updated_characters.length > 0 && (
                      <div className="mb-3">
                        <h6 className="fw-bold text-success">更新されたキャラクター ({result.updated_characters.length}人):</h6>
                        <div className="row g-2">
                          {result.updated_characters.map((name, index) => (
                            <div key={index} className="col-auto">
                              <span className="badge bg-success">{name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.not_found_characters && result.not_found_characters.length > 0 && (
                      <div className="mb-3">
                        <h6 className="fw-bold text-warning">見つからなかったキャラクター ({result.not_found_characters.length}人):</h6>
                        <div className="row g-2">
                          {result.not_found_characters.map((name, index) => (
                            <div key={index} className="col-auto">
                              <span className="badge bg-warning text-dark">{name}</span>
                            </div>
                          ))}
                        </div>
                        <div className="alert alert-warning mt-2">
                          <i className="bi bi-exclamation-triangle me-2"></i>
                          <small>これらのキャラクターはデータベースに存在しないため、スキップされました。</small>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="alert alert-danger">
                      <i className="bi bi-x-circle me-2"></i>
                      {result.error}
                    </div>
                    
                    {result.details && (
                      <div className="bg-light p-3 rounded">
                        <h6 className="fw-bold">エラー詳細:</h6>
                        <pre className="mb-0 small" style={{ whiteSpace: 'pre-wrap' }}>{result.details}</pre>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* ナビゲーション */}
          <div className="text-center mb-5">
            <div className="btn-group" role="group">
              <Link href="/characters" className="btn btn-outline-secondary">
                <i className="bi bi-people me-2"></i>
                キャラクター一覧
              </Link>
              <Link href="/upload" className="btn btn-outline-primary">
                <i className="bi bi-cloud-upload me-2"></i>
                通常のCSVアップロード
              </Link>
              <Link href="/party" className="btn btn-outline-success">
                <i className="bi bi-person-plus me-2"></i>
                パーティ編成
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}