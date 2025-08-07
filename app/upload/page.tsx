'use client';

import { useState } from 'react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    
    if (selectedFile) {
      // ファイル拡張子をチェック（より柔軟に）
      const fileName = selectedFile.name.toLowerCase();
      if (fileName.endsWith('.csv') || selectedFile.type === 'text/csv' || selectedFile.type === 'application/vnd.ms-excel') {
        setFile(selectedFile);
        console.log('File selected:', selectedFile.name, 'Type:', selectedFile.type);
      } else {
        setError(`選択されたファイル「${selectedFile.name}」はCSVファイルではありません`);
        setFile(null);
      }
    } else {
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('ファイルが選択されていません');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('csv', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data);
        setFile(null);
        // ファイル入力をリセット
        const fileInput = document.getElementById('csvFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setError(data.error || 'アップロードに失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-xl-6">
          <div className="card shadow-lg">
            <div className="card-header bg-primary text-white text-center">
              <h2 className="card-title mb-0">
                <i className="bi bi-upload me-2"></i>
                キャラクター CSV アップロード
              </h2>
              <small className="text-light opacity-75">データ解析・自動取り込み</small>
            </div>
            <div className="card-body p-4">
              <div className="alert alert-info" role="alert">
                <i className="bi bi-info-circle me-2"></i>
                <strong>使用方法:</strong> 花火.csvや銀狼.csvなどのキャラクターデータをアップロードして、
                バフ・デバフ情報を自動解析・データベースに取り込みます。
              </div>

              <div className="mb-4">
                <label htmlFor="csvFile" className="form-label fw-semibold">
                  <i className="bi bi-file-earmark-text me-2"></i>
                  CSVファイルを選択
                </label>
                <input
                  id="csvFile"
                  type="file"
                  accept=".csv,text/csv,application/vnd.ms-excel"
                  onChange={handleFileChange}
                  className="form-control"
                />
              </div>

              {file && (
                <div className="alert alert-primary" role="alert">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-file-check me-2"></i>
                    <div>
                      <strong>選択されたファイル:</strong> {file.name}
                      <br />
                      <small>サイズ: {(file.size / 1024).toFixed(1)} KB</small>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  <strong>エラー:</strong> {error}
                </div>
              )}

              <div className="d-grid">
                <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className={`btn ${
                    (!file || uploading) 
                      ? 'btn-secondary disabled' 
                      : 'btn-success'
                  } btn-lg`}
                >
                  {uploading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      アップロード中...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-upload me-2"></i>
                      アップロード実行
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
      </div>

        {result && (
          <div className="row justify-content-center mt-4">
            <div className="col-lg-8 col-xl-6">
              <div className="card border-success">
                <div className="card-header bg-success text-white">
                  <h4 className="card-title mb-0">
                    <i className="bi bi-check-circle me-2"></i>
                    アップロード成功！
                  </h4>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-sm-6">
                      <strong>キャラクター名:</strong> {result.character.name}
                    </div>
                    <div className="col-sm-6">
                      <strong>属性:</strong> {result.character.element}
                    </div>
                    <div className="col-sm-6">
                      <strong>運命:</strong> {result.character.path}
                    </div>
                    <div className="col-sm-6">
                      <strong>スキル数:</strong> {result.character.skills_count}個
                    </div>
                  </div>
                  <hr />
                  <div className="text-center">
                    <a 
                      href={`/characters/${result.character.id}`}
                      className="btn btn-primary"
                    >
                      <i className="bi bi-eye me-2"></i>
                      バフ・デバフ詳細を見る
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="row justify-content-center mt-4">
          <div className="col-lg-8 col-xl-6">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="bi bi-question-circle me-2"></i>
                  トラブルシューティング
                </h5>
              </div>
              <div className="card-body">
                <div className="accordion" id="helpAccordion">
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFile">
                        ファイル選択の問題
                      </button>
                    </h2>
                    <div id="collapseFile" className="accordion-collapse collapse" data-bs-parent="#helpAccordion">
                      <div className="accordion-body">
                        <ul className="list-unstyled">
                          <li><i className="bi bi-check-circle text-success me-2"></i>ファイル名が「.csv」で終わっているか確認</li>
                          <li><i className="bi bi-check-circle text-success me-2"></i>ファイルサイズが10MB以下か確認</li>
                          <li><i className="bi bi-check-circle text-success me-2"></i>ブラウザを更新して再試行</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFormat">
                        CSVフォーマット例
                      </button>
                    </h2>
                    <div id="collapseFormat" className="accordion-collapse collapse" data-bs-parent="#helpAccordion">
                      <div className="accordion-body">
                        <code>
                          キャラクター名,花火,<br />
                          属性,量子,<br />
                          運命,調和,<br />
                          通常攻撃,独り芝居,説明文...
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}