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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="hsr-card">
        <h2 className="text-2xl font-bold text-hsr-purple mb-4">
          📤 キャラクター CSV アップロード
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          ロビン.csvやトリビー.csvなどのキャラクターデータをアップロードして、
          バフ・デバフ情報を自動解析します。
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="csvFile" className="block text-sm font-medium mb-2">
              CSVファイルを選択
            </label>
            <input
              id="csvFile"
              type="file"
              accept=".csv,text/csv,application/vnd.ms-excel"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-hsr-purple file:text-white hover:file:bg-purple-600"
            />
          </div>

          {/* デバッグ情報表示 */}
          <div className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 p-2 rounded">
            <p>デバッグ情報:</p>
            <p>ファイル選択: {file ? '✅' : '❌'}</p>
            {file && (
              <>
                <p>ファイル名: {file.name}</p>
                <p>ファイルタイプ: {file.type || '不明'}</p>
                <p>ファイルサイズ: {(file.size / 1024).toFixed(1)} KB</p>
              </>
            )}
            <p>アップロードボタン: {(!file || uploading) ? '無効' : '有効'}</p>
          </div>

          {file && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                選択されたファイル: <strong>{file.name}</strong>
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                サイズ: {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">
                ❌ {error}
              </p>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
              (!file || uploading) 
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                : 'bg-hsr-purple text-white hover:bg-purple-600'
            }`}
          >
            {uploading ? '🔄 アップロード中...' : '📤 アップロード'}
          </button>
        </div>
      </div>

      {result && (
        <div className="hsr-card bg-green-50 dark:bg-green-900/20">
          <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-3">
            ✅ アップロード成功！
          </h3>
          <div className="space-y-2 text-sm">
            <p><strong>キャラクター名:</strong> {result.character.name}</p>
            <p><strong>属性:</strong> {result.character.element}</p>
            <p><strong>運命:</strong> {result.character.path}</p>
            <p><strong>スキル数:</strong> {result.character.skills_count}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-700">
            <a 
              href={`/characters/${result.character.id}`}
              className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              バフ・デバフ詳細を見る →
            </a>
          </div>
        </div>
      )}

      <div className="hsr-card bg-gray-50 dark:bg-gray-800">
        <h3 className="text-lg font-semibold mb-3">📋 トラブルシューティング</h3>
        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
          <p><strong>ファイルが選択できない場合：</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>ファイル名が「.csv」で終わっているか確認</li>
            <li>ファイルサイズが10MB以下か確認</li>
            <li>ブラウザを更新して再試行</li>
          </ul>
          <p className="mt-4"><strong>CSVフォーマット例：</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>1行目: キャラクター名,ロビン,</li>
            <li>2行目: 属性,物理,</li>
            <li>3行目: 運命,調和,</li>
          </ul>
        </div>
      </div>
    </div>
  );
}