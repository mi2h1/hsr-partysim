'use client';

import { useState } from 'react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('CSVファイルを選択してください');
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
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-hsr-purple file:text-white hover:file:bg-purple-600"
            />
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
            className="w-full bg-hsr-purple text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600 transition-colors"
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
        <h3 className="text-lg font-semibold mb-3">📋 CSVフォーマットについて</h3>
        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
          <p>アップロードするCSVファイルは以下の形式に従ってください：</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>1行目: キャラクター名,ロビン,</li>
            <li>2行目: 属性,物理,</li>
            <li>3行目: 運命,調和,</li>
            <li>4行目以降: 通常攻撃,スキル名,説明文</li>
            <li>続いて: 戦闘スキル、必殺技、天賦、秘技、追加効果1-3、星魂1-6</li>
          </ul>
        </div>
      </div>
    </div>
  );
}