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
            <div key={character.id} className="col-sm-6 col-md-4 col-lg-3">
              <Link 
                href={`/characters/${character.id}`}
                className="text-decoration-none"
              >
                <div className="card h-100 shadow-sm hover-card">
                  <div className="card-body text-center py-4">
                    <div className="mb-3">
                      <img 
                        src={`/imgs/${character.id}.webp`}
                        alt={character.name}
                        className="img-fluid rounded-circle"
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                          const fallback = img.nextElementSibling as HTMLDivElement;
                          if (fallback) fallback.style.display = 'block';
                        }}
                      />
                      <div style={{ display: 'none' }}>
                        <i className="bi bi-person-circle" style={{ fontSize: '100px', color: '#0d6efd' }}></i>
                      </div>
                    </div>
                    
                    <h5 className="card-title mb-3 text-dark">
                      {character.name}
                    </h5>
                    
                    <div className="d-flex justify-content-center gap-2">
                      <span className="badge bg-info px-2 py-1 d-flex align-items-center">
                        <img 
                          src={`/imgs/i_${character.element}.webp`}
                          alt={character.element}
                          style={{ width: '16px', height: '16px', marginRight: '4px' }}
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.style.display = 'none';
                          }}
                        />
                        {character.element}
                      </span>
                      <span className="badge bg-secondary px-2 py-1 d-flex align-items-center">
                        <img 
                          src={`/imgs/i_${character.path}.webp`}
                          alt={character.path}
                          style={{ width: '16px', height: '16px', marginRight: '4px' }}
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.style.display = 'none';
                          }}
                        />
                        {character.path}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
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