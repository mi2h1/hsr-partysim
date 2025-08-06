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
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">キャラクター一覧を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          エラーが発生しました
        </h4>
        <p>{error}</p>
        <hr />
        <Link 
          href="/upload"
          className="btn btn-primary"
        >
          <i className="bi bi-upload me-2"></i>
          CSVをアップロードする
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* ページヘッダー */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h1 className="display-5 fw-bold text-primary mb-3">
            <i className="bi bi-people-fill me-2"></i>
            キャラクター一覧
          </h1>
          <p className="text-muted">
            アップロードされたキャラクターのバフ・デバフ情報を確認できます。
          </p>
        </div>
      </div>

      {characters.length === 0 ? (
        <div className="alert alert-info" role="alert">
          <div className="text-center py-4">
            <i className="bi bi-inbox display-1 text-info mb-3"></i>
            <h4>まだキャラクターがアップロードされていません</h4>
            <p className="text-muted mb-4">CSVファイルをアップロードしてキャラクターを追加してください。</p>
            <Link 
              href="/upload"
              className="btn btn-primary btn-lg"
            >
              <i className="bi bi-upload me-2"></i>
              キャラクターをアップロード
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {characters.map((character) => (
            <div key={character.id} className="col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-person-circle me-2"></i>
                    {character.name}
                  </h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">
                        <i className="bi bi-lightning-fill me-1"></i>
                        属性:
                      </span>
                      <span className="badge bg-info">
                        {character.element}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">
                        <i className="bi bi-compass-fill me-1"></i>
                        運命:
                      </span>
                      <span className="badge bg-secondary">
                        {character.path}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted">
                        <i className="bi bi-calendar-fill me-1"></i>
                        登録日:
                      </span>
                      <small className="text-muted">
                        {new Date(character.created_at).toLocaleDateString('ja-JP')}
                      </small>
                    </div>
                  </div>
                  <Link 
                    href={`/characters/${character.id}`}
                    className="btn btn-primary w-100"
                  >
                    <i className="bi bi-list-ul me-2"></i>
                    バフ・デバフ詳細を見る
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ナビゲーション */}
      <div className="text-center mt-5">
        <div className="btn-group" role="group">
          <Link 
            href="/"
            className="btn btn-outline-secondary"
          >
            <i className="bi bi-house-fill me-2"></i>
            メイン画面に戻る
          </Link>
          <Link 
            href="/upload"
            className="btn btn-outline-primary"
          >
            <i className="bi bi-upload me-2"></i>
            新しいキャラクターをアップロード
          </Link>
        </div>
      </div>
    </div>
  );
}