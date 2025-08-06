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
      <div className="mb-4">
        <h2 className="fw-bold text-primary mb-2">
          <i className="bi bi-people-fill me-2"></i>
          キャラクター一覧
        </h2>
        <p className="text-muted">
          アップロードされたキャラクターのバフ・デバフ情報を確認できます。
        </p>
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
        <div className="d-flex flex-wrap justify-content-center gap-2">
          {characters.map((character) => (
            <div key={character.id} style={{ flex: '0 0 calc(14.28% - 8px)', maxWidth: 'calc(14.28% - 8px)' }}>
              <Link 
                href={`/characters/${character.id}`}
                className="text-decoration-none"
              >
                <div className="card h-100 shadow-sm hover-card position-relative" style={{ minHeight: '270px' }}>
                  <img 
                    src={`/imgs/${character.id}.webp`}
                    alt={character.name}
                    className="img-fluid w-100"
                    style={{ objectFit: 'cover', objectPosition: 'center top', height: '240px' }}
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      console.log(`キャラクター画像読み込み失敗: /imgs/${character.id}.webp`);
                      img.src = `/imgs/${character.name}.webp`;
                    }}
                    onLoad={() => {
                      console.log(`キャラクター画像読み込み成功: /imgs/${character.id}.webp`);
                    }}
                  />
                  
                  {/* 画像下の余白エリア */}
                  <div className="position-relative px-2" style={{ height: '30px', backgroundColor: 'white' }}>
                    {/* 属性・運命アイコン - 上段 */}
                    <div className="d-flex gap-2 position-absolute" style={{ top: '-10px', left: '8px' }}>
                      <img 
                        src={`/imgs/i_${character.element}.webp`}
                        alt={character.element}
                        title={character.element}
                        style={{ width: '22px', height: '22px', objectFit: 'contain' }}
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          console.log(`アイコン読み込み失敗: /imgs/i_${character.element}.webp`);
                          img.style.visibility = 'hidden';
                        }}
                        onLoad={() => {
                          console.log(`アイコン読み込み成功: /imgs/i_${character.element}.webp`);
                        }}
                      />
                      <img 
                        src={`/imgs/i_${character.path}.webp`}
                        alt={character.path}
                        title={character.path}
                        style={{ width: '22px', height: '22px', objectFit: 'contain' }}
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          console.log(`アイコン読み込み失敗: /imgs/i_${character.path}.webp`);
                          img.style.visibility = 'hidden';
                        }}
                        onLoad={() => {
                          console.log(`アイコン読み込み成功: /imgs/i_${character.path}.webp`);
                        }}
                      />
                    </div>
                    
                    {/* 名前テキスト - 下段 */}
                    <div className="position-absolute bottom-0 start-0 px-2 pb-1">
                      <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                        {character.name}
                      </h6>
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