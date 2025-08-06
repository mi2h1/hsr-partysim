'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface BuffDebuff {
  skill: string;
  name: string;
  type?: 'バフ' | 'デバフ' | 'その他';
  duration: string;
  target: string;
  stat: string;
  value: string;
  note: string;
}

interface CharacterData {
  character: {
    id: number;
    name: string;
    element: string;
    path: string;
  };
  eidolon_level: number;
  buffs_debuffs: BuffDebuff[];
}

export default function CharacterDetailPage() {
  const params = useParams();
  const characterId = params.id as string;
  
  // デバッグ用コンソール出力
  console.log('Character Detail Page - Params:', params);
  console.log('Character Detail Page - ID:', characterId);
  
  const [characterData, setCharacterData] = useState<CharacterData | null>(null);
  const [eidolonLevel, setEidolonLevel] = useState(0);
  const [loading, setLoading] = useState(true);
  const [eidolonLoading, setEidolonLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCharacterData = async (id: string, eidolon: number, isEidolonChange = false) => {
    try {
      if (isEidolonChange) {
        setEidolonLoading(true);
      } else {
        setLoading(true);
      }
      console.log('Fetching data for character ID:', id, 'eidolon:', eidolon);
      const response = await fetch(`/api/characters/${id}/buffs?eidolon=${eidolon}`);
      console.log('API Response status:', response.status);
      const data = await response.json();
      console.log('API Response data for eidolon', eidolon + ':', data);
      console.log('Buffs count:', data.buffs_debuffs?.length);
      console.log('Combat buffs:', data.buffs_debuffs?.filter(b => !b.skill.startsWith('星魂')).length);
      console.log('Eidolon buffs:', data.buffs_debuffs?.filter(b => b.skill.startsWith('星魂')).length);
      
      if (data.success) {
        console.log('Setting character data with eidolon level:', eidolon);
        console.log('Previous data buffs:', characterData?.buffs_debuffs?.length);
        console.log('New data buffs:', data.buffs_debuffs?.length);
        setCharacterData(data);
        setError(null);
      } else {
        setError(data.error || 'データの取得に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
      console.error('Fetch error:', err);
    } finally {
      if (isEidolonChange) {
        setEidolonLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (characterId) {
      fetchCharacterData(characterId, 0);
    }
  }, [characterId]);

  const handleEidolonChange = (newLevel: number) => {
    setEidolonLevel(newLevel);
    if (characterId) {
      fetchCharacterData(characterId, newLevel, true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hsr-purple mx-auto mb-4"></div>
          <p>データを読み込み中...</p>
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
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => fetchCharacterData(characterId, eidolonLevel)}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          再試行
        </button>
      </div>
    );
  }

  if (!characterData) {
    return (
      <div className="hsr-card">
        <p>キャラクターデータが見つかりません</p>
      </div>
    );
  }

  return (
    <div>
      {/* キャラクター情報ヘッダー */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-2 text-center">
              <img 
                src={`/imgs/${characterData.character.id}.webp`}
                alt={characterData.character.name}
                className="img-fluid rounded-circle"
                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = 'none';
                  const fallback = img.nextElementSibling as HTMLDivElement;
                  if (fallback) fallback.style.display = 'block';
                }}
              />
              <div style={{ display: 'none' }}>
                <i className="bi bi-person-circle display-3 text-primary"></i>
              </div>
            </div>
            <div className="col-md-6">
              <h1 className="display-5 text-primary fw-bold mb-3">
                {characterData.character.name}
              </h1>
              <div className="d-flex gap-4 flex-wrap">
                <img 
                  src={`/imgs/i_${characterData.character.element}.webp`}
                  alt={characterData.character.element}
                  title={`属性: ${characterData.character.element}`}
                  style={{ width: '32px', height: '32px' }}
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                  }}
                />
                <img 
                  src={`/imgs/i_${characterData.character.path}.webp`}
                  alt={characterData.character.path}
                  title={`運命: ${characterData.character.path}`}
                  style={{ width: '32px', height: '32px' }}
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                  }}
                />
              </div>
            </div>
            
            {/* 星魂レベル選択 */}
            <div className="col-md-4 text-center">
              <label className="form-label fw-bold">
                星魂レベル
                {eidolonLoading && (
                  <span className="ms-2">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </span>
                )}
              </label>
              <select
                value={eidolonLevel}
                onChange={(e) => handleEidolonChange(parseInt(e.target.value))}
                className="form-select form-select-lg"
                disabled={eidolonLoading}
              >
                {[0, 1, 2, 3, 4, 5, 6].map(level => (
                  <option key={level} value={level}>
                    {level === 0 ? '無凸' : `${level}凸`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 戦闘バフ・デバフ一覧テーブル */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-success text-white">
          <h3 className="mb-0">
            <i className="bi bi-sword me-2"></i>
            戦闘バフ・デバフ一覧
          </h3>
        </div>
        <div className="card-body position-relative">
          {eidolonLoading && (
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75" style={{ zIndex: 10 }}>
              <div className="text-center">
                <div className="spinner-border text-primary mb-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <small className="text-muted">データを更新中...</small>
              </div>
            </div>
          )}
          {(() => {
            const combatBuffs = characterData.buffs_debuffs.filter(buff => 
              !buff.skill.startsWith('星魂')
            );
            
            return combatBuffs.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-info-circle text-muted fs-1"></i>
                <p className="text-muted mt-3">戦闘バフ・デバフ情報が見つかりませんでした</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover table-striped">
                  <thead className="table-dark">
                    <tr>
                      <th><i className="bi bi-gear me-1"></i>スキル</th>
                      <th><i className="bi bi-magic me-1"></i>バフ名</th>
                      <th><i className="bi bi-clock me-1"></i>継続</th>
                      <th><i className="bi bi-people me-1"></i>付与対象</th>
                      <th><i className="bi bi-bullseye me-1"></i>対象項目</th>
                      <th><i className="bi bi-arrow-up-circle me-1"></i>バフ量</th>
                      <th><i className="bi bi-info-circle me-1"></i>補足</th>
                    </tr>
                  </thead>
                  <tbody>
                    {combatBuffs.map((buff, index) => {
                      const typeClass = buff.type === 'デバフ' ? 'text-danger' : 
                                      buff.type === 'その他' ? 'text-secondary' : 'text-success';
                      const typeBadge = buff.type === 'デバフ' ? 'bg-danger' : 
                                      buff.type === 'その他' ? 'bg-secondary' : 'bg-success';
                      
                      return (
                        <tr key={index}>
                          <td className="fw-semibold">{buff.skill}</td>
                          <td>
                            <span className={`badge ${typeBadge} me-2`}>
                              {buff.type || 'バフ'}
                            </span>
                            {buff.name}
                          </td>
                          <td><span className="badge bg-info">{buff.duration}</span></td>
                          <td><span className="badge bg-warning text-dark">{buff.target}</span></td>
                          <td className={`fw-bold ${typeClass}`}>{buff.stat}</td>
                          <td><span className={`badge ${typeBadge} fs-6`}>{buff.value}</span></td>
                          <td><small className="text-muted">{buff.note}</small></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      </div>

      {/* 星魂効果一覧テーブル */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-warning text-dark">
          <h3 className="mb-0">
            <i className="bi bi-star-fill me-2"></i>
            星魂効果一覧 ({eidolonLevel > 0 ? `${eidolonLevel}凸時` : '無凸'})
          </h3>
        </div>
        <div className="card-body position-relative">
          {eidolonLoading && (
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75" style={{ zIndex: 10 }}>
              <div className="text-center">
                <div className="spinner-border text-warning mb-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <small className="text-muted">星魂データを更新中...</small>
              </div>
            </div>
          )}
          {(() => {
            const eidolonBuffs = characterData.buffs_debuffs.filter(buff => 
              buff.skill.startsWith('星魂')
            );
            
            return eidolonBuffs.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-star text-muted fs-1"></i>
                <p className="text-muted mt-3">星魂効果情報が見つかりませんでした</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-warning">
                    <tr>
                      <th><i className="bi bi-star me-1"></i>星魂</th>
                      <th><i className="bi bi-magic me-1"></i>バフ名</th>
                      <th><i className="bi bi-clock me-1"></i>継続</th>
                      <th><i className="bi bi-people me-1"></i>付与対象</th>
                      <th><i className="bi bi-bullseye me-1"></i>対象項目</th>
                      <th><i className="bi bi-arrow-up-circle me-1"></i>バフ量</th>
                      <th><i className="bi bi-info-circle me-1"></i>補足</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eidolonBuffs.map((buff, index) => {
                      const buffEidolonLevel = parseInt(buff.skill.replace('星魂', ''));
                      const isActive = buffEidolonLevel <= eidolonLevel;
                      
                      let rowClass = "";
                      if (isActive) {
                        rowClass = "table-success";
                      } else {
                        rowClass = "table-light opacity-50";
                      }
                      
                      return (
                        <tr key={index} className={rowClass}>
                          <td className="fw-semibold">
                            {buff.skill}
                            {isActive && (
                              <span className="badge bg-success ms-2">
                                有効
                              </span>
                            )}
                          </td>
                          <td className={isActive ? "fw-semibold" : ""}>{buff.name}</td>
                          <td><span className="badge bg-info">{buff.duration}</span></td>
                          <td><span className="badge bg-warning text-dark">{buff.target}</span></td>
                          <td className="fw-bold text-primary">{buff.stat}</td>
                          <td>
                            <span className={`badge fs-6 ${isActive ? "bg-success" : "bg-secondary"}`}>
                              {buff.value}
                            </span>
                          </td>
                          <td><small className="text-muted">{buff.note}</small></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      </div>

      {/* 統計情報 */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card bg-info text-white h-100">
            <div className="card-body text-center">
              <i className="bi bi-sword display-4"></i>
              <h4 className="card-title mt-2">戦闘バフ・デバフ</h4>
              <p className="display-6 fw-bold">
                {characterData.buffs_debuffs.filter(b => !b.skill.startsWith('星魂')).length}個
              </p>
              <small className="opacity-75">
                味方支援: {characterData.buffs_debuffs.filter(b => !b.skill.startsWith('星魂') && b.target.includes('味方')).length}個
              </small>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card bg-success text-white h-100">
            <div className="card-body text-center">
              <i className="bi bi-star-fill display-4"></i>
              <h4 className="card-title mt-2">星魂効果（有効）</h4>
              <p className="display-6 fw-bold">
                {characterData.buffs_debuffs.filter(b => b.skill.startsWith('星魂') && parseInt(b.skill.replace('星魂', '')) <= eidolonLevel).length}個
              </p>
              <small className="opacity-75">
                全星魂効果: {characterData.buffs_debuffs.filter(b => b.skill.startsWith('星魂')).length}個
              </small>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card bg-primary text-white h-100">
            <div className="card-body text-center">
              <i className="bi bi-collection display-4"></i>
              <h4 className="card-title mt-2">現在の総効果数</h4>
              <p className="display-6 fw-bold">
                {characterData.buffs_debuffs.filter(b => 
                  !b.skill.startsWith('星魂') || 
                  parseInt(b.skill.replace('星魂', '')) <= eidolonLevel
                ).length}個
              </p>
              <small className="opacity-75">
                戦闘+有効星魂効果
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* ナビゲーション */}
      <div className="text-center">
        <div className="btn-group" role="group">
          <a 
            href="/"
            className="btn btn-outline-secondary"
          >
            <i className="bi bi-house-fill me-1"></i>
            メイン画面に戻る
          </a>
          <a 
            href="/characters"
            className="btn btn-outline-primary"
          >
            <i className="bi bi-list me-1"></i>
            キャラクター一覧
          </a>
        </div>
      </div>
    </div>
  );
}