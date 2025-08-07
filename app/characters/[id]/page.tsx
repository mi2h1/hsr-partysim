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
  is_stackable: boolean;
  max_stacks: number;
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
    hp: number | null;
    attack: number | null;
    defense: number | null;
    speed: number | null;
    ep: number | null;
    stat_boost_1_type: string | null;
    stat_boost_1_value: number | null;
    stat_boost_2_type: string | null;
    stat_boost_2_value: number | null;
    stat_boost_3_type: string | null;
    stat_boost_3_value: number | null;
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
  const [showReimportModal, setShowReimportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [reimportLoading, setReimportLoading] = useState(false);

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

  const handleReimportCSV = async () => {
    if (!selectedFile || !characterId) return;

    setReimportLoading(true);
    try {
      // CSVファイルを再アップロード（既存キャラクターIDを指定）
      const formData = new FormData();
      formData.append('csvFile', selectedFile);
      formData.append('replaceCharacterId', characterId); // 既存キャラIDを指定

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await uploadResponse.json();

      if (result.success) {
        // 成功時は画面を更新
        window.location.reload();
      } else {
        const errorMessage = result.details ? `${result.error}: ${result.details}` : result.error || 'CSV取り込みに失敗しました';
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error('CSV再取り込みエラー:', err);
      alert('CSV再取り込み中にエラーが発生しました: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setReimportLoading(false);
      setShowReimportModal(false);
      setSelectedFile(null);
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
  
  const eidolonBuffs = characterData.buffs_debuffs
    .filter(buff => buff.skill.startsWith('星魂'))
    .sort((a, b) => {
      const levelA = parseInt(a.skill.replace('星魂', ''));
      const levelB = parseInt(b.skill.replace('星魂', ''));
      return levelA - levelB;
    });

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

              {/* 基礎ステータス表示 */}
              <div className="mb-3">
                <h6 className="fw-bold text-secondary mb-2">基礎ステータス</h6>
                <div className="row g-2">
                  <div className="col-6">
                    <div className="d-flex justify-content-between">
                      <small className="text-muted">HP</small>
                      <small className="fw-bold">{characterData.character.hp || '---'}</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex justify-content-between">
                      <small className="text-muted">攻撃力</small>
                      <small className="fw-bold">{characterData.character.attack || '---'}</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex justify-content-between">
                      <small className="text-muted">防御力</small>
                      <small className="fw-bold">{characterData.character.defense || '---'}</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex justify-content-between">
                      <small className="text-muted">速度</small>
                      <small className="fw-bold">{characterData.character.speed || '---'}</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex justify-content-between">
                      <small className="text-muted">EP</small>
                      <small className="fw-bold">{characterData.character.ep || '---'}</small>
                    </div>
                  </div>
                </div>
                
                {/* ステータスブースト表示 */}
                {(characterData.character.stat_boost_1_type || characterData.character.stat_boost_2_type || characterData.character.stat_boost_3_type) && (
                  <>
                    <h6 className="fw-bold text-secondary mb-2 mt-3">ステータスブースト</h6>
                    <div className="row g-2">
                      {characterData.character.stat_boost_1_type && (
                        <div className="col-12">
                          <div className="d-flex justify-content-between">
                            <small className="text-muted">{characterData.character.stat_boost_1_type}</small>
                            <small className="fw-bold text-success">+{characterData.character.stat_boost_1_value}</small>
                          </div>
                        </div>
                      )}
                      {characterData.character.stat_boost_2_type && (
                        <div className="col-12">
                          <div className="d-flex justify-content-between">
                            <small className="text-muted">{characterData.character.stat_boost_2_type}</small>
                            <small className="fw-bold text-success">+{characterData.character.stat_boost_2_value}</small>
                          </div>
                        </div>
                      )}
                      {characterData.character.stat_boost_3_type && (
                        <div className="col-12">
                          <div className="d-flex justify-content-between">
                            <small className="text-muted">{characterData.character.stat_boost_3_type}</small>
                            <small className="fw-bold text-success">+{characterData.character.stat_boost_3_value}</small>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
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
                戦闘バフ・デバフ・星魂効果
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

              {/* 星魂効果セクション */}
              {eidolonBuffs.length > 0 && (
                <div className="mt-5">
                  <h4 className="text-warning fw-bold border-bottom pb-2 mb-4">
                    <i className="bi bi-star me-2"></i>
                    星魂効果
                    <small className="text-muted ms-2">({eidolonBuffs.length})</small>
                  </h4>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-warning">
                        <tr>
                          <th><i className="bi bi-star me-1"></i>星魂</th>
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
                        {eidolonBuffs.map((buff, index) => {
                          const buffEidolonLevel = parseInt(buff.skill.replace('星魂', ''));
                          const isActive = buffEidolonLevel <= eidolonLevel;
                          
                          let rowClass = "";
                          if (isActive) {
                            rowClass = "table-success";
                          } else {
                            rowClass = "table-light text-muted";
                          }
                          
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
                            <tr key={index} className={rowClass}>
                              <td>
                                <span className={`badge ${isActive ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                                  <i className="bi bi-star me-1"></i>
                                  {buff.skill}
                                </span>
                              </td>
                              <td className="fw-bold">{buff.name}</td>
                              <td>
                                <span className={`badge ${typeClass} text-white`}>
                                  <i className={`bi ${typeIcon} me-1`}></i>
                                  {buff.type}
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

        {/* CSV再取り込みボタン */}
        <div className="position-fixed" style={{ bottom: '20px', right: '20px', zIndex: 1000 }}>
          <button 
            className="btn btn-outline-warning btn-sm"
            onClick={() => setShowReimportModal(true)}
            title="CSVファイルを再取り込みしてキャラクターデータを更新"
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            CSV再取り込み
          </button>
        </div>

        {/* CSV再取り込み確認モーダル */}
        {showReimportModal && (
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
                    CSV再取り込み確認
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowReimportModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p className="mb-3">
                    <strong>{characterData?.character.name}</strong> の既存データを完全に削除し、
                    CSVファイルから再取り込みします。
                  </p>
                  <div className="alert alert-warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    <strong>注意:</strong> この操作は取り消せません。
                    <br />以下のデータが削除されます：
                    <ul className="mt-2 mb-0">
                      <li>スキル情報（通常攻撃、戦闘スキル、必殺技等）</li>
                      <li>バフ・デバフ効果</li>
                      <li>星魂効果</li>
                    </ul>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">CSVファイルを選択:</label>
                    <input 
                      type="file" 
                      className="form-control"
                      accept=".csv"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setShowReimportModal(false);
                      setSelectedFile(null);
                    }}
                  >
                    キャンセル
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-warning" 
                    onClick={handleReimportCSV}
                    disabled={!selectedFile || reimportLoading}
                  >
                    {reimportLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        処理中...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        再取り込み実行
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}