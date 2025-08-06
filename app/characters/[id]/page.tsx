'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

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

interface Skill {
  type: string;
  name: string;
  description: string;
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

interface SkillsData {
  character: {
    id: number;
    name: string;
    element: string;
    path: string;
  };
  combat_skills: Skill[];
  additional_effects: Skill[];
  eidolons: Skill[];
}

export default function CharacterDetailPage() {
  const params = useParams();
  const characterId = params.id as string;
  
  const [characterData, setCharacterData] = useState<CharacterData | null>(null);
  const [skillsData, setSkillsData] = useState<SkillsData | null>(null);
  const [activeTab, setActiveTab] = useState('buffs');
  const [eidolonLevel, setEidolonLevel] = useState(0);
  const [loading, setLoading] = useState(true);
  const [eidolonLoading, setEidolonLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSkillsData = async (id: string) => {
    try {
      const response = await fetch(`/api/characters/${id}/skills`);
      const data = await response.json();
      
      if (data.success) {
        setSkillsData(data);
      } else {
        console.error('Skills data fetch failed:', data.error);
      }
    } catch (err) {
      console.error('Skills fetch error:', err);
    }
  };

  const fetchCharacterData = async (id: string, eidolon: number, isEidolonChange = false) => {
    try {
      if (isEidolonChange) {
        setEidolonLoading(true);
      } else {
        setLoading(true);
      }
      
      const response = await fetch(`/api/characters/${id}/buffs?eidolon=${eidolon}`);
      const data = await response.json();
      
      if (data.success) {
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
      fetchSkillsData(characterId);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-danger bg-opacity-10 border-danger">
        <div className="card-body text-center">
          <h2 className="text-danger mb-4">❌ エラーが発生しました</h2>
          <p className="text-danger">{error}</p>
          <button
            onClick={() => characterId && fetchCharacterData(characterId, eidolonLevel)}
            className="btn btn-primary"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  if (!characterData) {
    return (
      <div className="card">
        <div className="card-body">
          <p>キャラクターデータが見つかりません</p>
        </div>
      </div>
    );
  }

  // バフ・デバフを分類
  const combatBuffs = characterData.buffs_debuffs.filter(buff => 
    !buff.skill.startsWith('星魂')
  );
  
  const eidolonBuffs = characterData.buffs_debuffs.filter(buff => 
    buff.skill.startsWith('星魂')
  );

  const renderSkillSection = (title: string, skills: Skill[]) => {
    if (!skills || skills.length === 0) return null;
    
    return (
      <div className="mb-5">
        <h5 className="text-primary fw-bold border-bottom pb-2 mb-3">{title}</h5>
        {skills.map((skill, index) => (
          <div key={index} className="mb-4">
            <div className="d-flex align-items-center mb-2">
              <span className="badge bg-secondary me-2">{skill.type}</span>
              <h6 className="mb-0 fw-bold">{skill.name}</h6>
            </div>
            <p className="text-muted" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {skill.description}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* キャラクター情報ヘッダー */}
      <div className="card shadow-sm mb-4">
        <div className="row g-0" style={{ minHeight: '200px' }}>
          <div className="col-4" style={{ width: '20%' }}>
            <div style={{ height: '200px', width: '250px', overflow: 'hidden' }}>
              <img 
                src={`/imgs/${characterData.character.id}.webp`}
                alt={characterData.character.name}
                className="img-fluid"
                style={{ width: '100%', height: 'auto', objectFit: 'cover', objectPosition: 'center top' }}
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = `/imgs/${characterData.character.name}.webp`;
                }}
              />
            </div>
          </div>
          <div className="col-8 d-flex align-items-center">
            <div className="flex-grow-1 px-4">
              <h1 className="display-6 text-dark fw-bold mb-2">
                {characterData.character.name}
              </h1>
              <div className="d-flex gap-3 mb-3">
                <img 
                  src={`/imgs/i_${characterData.character.element}.webp`}
                  alt={characterData.character.element}
                  title={`属性: ${characterData.character.element}`}
                  style={{ width: '24px', height: '24px' }}
                />
                <img 
                  src={`/imgs/i_${characterData.character.path}.webp`}
                  alt={characterData.character.path}
                  title={`運命: ${characterData.character.path}`}
                  style={{ width: '24px', height: '24px' }}
                />
              </div>
            </div>
            <div className="pe-4">
              <label className="form-label fw-bold mb-2">星魂レベル</label>
              {eidolonLoading && (
                <div className="spinner-border spinner-border-sm text-primary mb-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              )}
              <select
                value={eidolonLevel}
                onChange={(e) => handleEidolonChange(parseInt(e.target.value))}
                className="form-select"
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

      {/* タブナビゲーション */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'buffs' ? 'active' : ''}`}
                onClick={() => setActiveTab('buffs')}
                type="button"
                role="tab"
              >
                <i className="bi bi-sword me-2"></i>
                戦闘バフ・デバフ
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'eidolon' ? 'active' : ''}`}
                onClick={() => setActiveTab('eidolon')}
                type="button"
                role="tab"
              >
                <i className="bi bi-star me-2"></i>
                星魂効果
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'skills' ? 'active' : ''}`}
                onClick={() => setActiveTab('skills')}
                type="button"
                role="tab"
              >
                <i className="bi bi-book me-2"></i>
                基本情報
              </button>
            </li>
          </ul>
        </div>
        
        <div className="card-body">
          {/* 戦闘バフ・デバフタブ */}
          {activeTab === 'buffs' && (
            <div className="position-relative">
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
              
              {combatBuffs.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-exclamation-triangle text-muted fs-1"></i>
                  <p className="text-muted mt-3">戦闘バフ・デバフ情報が見つかりませんでした</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-success">
                      <tr>
                        <th><i className="bi bi-list-ul me-1"></i>スキル</th>
                        <th><i className="bi bi-magic me-1"></i>バフ名</th>
                        <th><i className="bi bi-tag me-1"></i>種別</th>
                        <th><i className="bi bi-clock me-1"></i>継続</th>
                        <th><i className="bi bi-people me-1"></i>付与対象</th>
                        <th><i className="bi bi-bullseye me-1"></i>対象項目</th>
                        <th><i className="bi bi-arrow-up-circle me-1"></i>バフ量</th>
                        <th><i className="bi bi-info-circle me-1"></i>補足</th>
                      </tr>
                    </thead>
                    <tbody>
                      {combatBuffs.map((buff, index) => {
                        let typeClass = "";
                        let typeIcon = "";
                        switch (buff.type) {
                          case 'バフ':
                            typeClass = "bg-success";
                            typeIcon = "bi-arrow-up";
                            break;
                          case 'デバフ':
                            typeClass = "bg-danger";
                            typeIcon = "bi-arrow-down";
                            break;
                          default:
                            typeClass = "bg-info";
                            typeIcon = "bi-info-circle";
                        }
                        
                        return (
                          <tr key={index}>
                            <td className="fw-semibold">{buff.skill}</td>
                            <td className="fw-semibold">{buff.name}</td>
                            <td>
                              <span className={`badge ${typeClass}`}>
                                <i className={`bi ${typeIcon} me-1`}></i>
                                {buff.type || 'バフ'}
                              </span>
                            </td>
                            <td><span className="badge bg-info">{buff.duration}</span></td>
                            <td><span className="badge bg-warning text-dark">{buff.target}</span></td>
                            <td className="fw-bold text-primary">{buff.stat}</td>
                            <td>
                              <span className="badge bg-success fs-6">
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
              )}
            </div>
          )}

          {/* 星魂効果タブ */}
          {activeTab === 'eidolon' && (
            <div>
              {eidolonBuffs.length === 0 ? (
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
              )}
            </div>
          )}

          {/* 基本情報タブ */}
          {activeTab === 'skills' && (
            <div>
              {!skillsData ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-muted">基本情報を読み込み中...</p>
                </div>
              ) : (
                <div>
                  {renderSkillSection("戦闘スキル", skillsData.combat_skills)}
                  {renderSkillSection("追加効果", skillsData.additional_effects)}
                  {renderSkillSection("星魂", skillsData.eidolons)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ナビゲーション */}
      <div className="text-center mt-5">
        <div className="btn-group" role="group">
          <Link href="/characters" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-2"></i>
            キャラクター一覧に戻る
          </Link>
          <Link href="/party" className="btn btn-outline-primary">
            <i className="bi bi-people me-2"></i>
            パーティ編成
          </Link>
        </div>
      </div>
    </div>
  );
}