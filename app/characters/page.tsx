'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Character {
  id: number;
  name: string;
  element: string;
  path: string;
  created_at: string;
}

interface CharacterListResponse {
  success: boolean;
  characters: Character[];
  error?: string;
}

export default function CharactersListPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch('/api/characters');
        const data: CharacterListResponse = await response.json();
        
        if (data.success) {
          setCharacters(data.characters);
        } else {
          setError(data.error || 'キャラクター一覧の取得に失敗しました');
        }
      } catch (err) {
        setError('ネットワークエラーが発生しました');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hsr-purple mx-auto mb-4"></div>
          <p>キャラクター一覧を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hsr-card bg-red-50">
        <h2 className="text-xl font-bold text-red-700 mb-4">
          ❌ エラーが発生しました
        </h2>
        <p className="text-red-600 mb-4">{error}</p>
        <Link 
          href="/upload"
          className="inline-block bg-hsr-purple text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
        >
          CSVをアップロードする
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="hsr-card">
        <h1 className="text-3xl font-bold text-hsr-purple mb-4">
          📋 キャラクター一覧
        </h1>
        <p className="text-gray-600 mb-6">
          アップロードされたキャラクターのバフ・デバフ情報を確認できます。
        </p>
      </div>

      {characters.length === 0 ? (
        <div className="hsr-card bg-blue-50">
          <div className="text-center py-8">
            <p className="text-blue-700 mb-4">
              まだキャラクターがアップロードされていません
            </p>
            <Link 
              href="/upload"
              className="inline-block bg-hsr-purple text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors"
            >
              📤 キャラクターをアップロード
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((character) => (
            <div key={character.id} className="hsr-card bg-gradient-to-br from-blue-50 to-purple-50">
              <h3 className="text-xl font-bold text-hsr-purple mb-3">
                {character.name}
              </h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">属性:</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {character.element}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">運命:</span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                    {character.path}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">登録日:</span>
                  <span className="text-sm">
                    {new Date(character.created_at).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              </div>
              <Link 
                href={`/characters/${character.id}`}
                className="block w-full bg-hsr-purple text-white text-center py-2 rounded hover:bg-purple-600 transition-colors"
              >
                バフ・デバフ詳細 →
              </Link>
            </div>
          ))}
        </div>
      )}

      <div className="text-center">
        <Link 
          href="/"
          className="inline-block bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 transition-colors mr-4"
        >
          ← メイン画面に戻る
        </Link>
        <Link 
          href="/upload"
          className="inline-block bg-hsr-purple text-white px-6 py-2 rounded hover:bg-purple-600 transition-colors"
        >
          📤 新しいキャラクターをアップロード
        </Link>
      </div>
    </div>
  );
}