'use client';

import { useState, useEffect } from 'react';

interface Character {
  id: number;
  name: string;
  element: string;
  path: string;
}

interface BuffDebuff {
  skill: string;
  name: string;
  type: 'バフ' | 'デバフ' | 'その他';
  target: string;
  stat: string;
  value: string;
  duration: string;
  note?: string;
}

interface PartySlot {
  id: number;
  character: Character | null;
}

export default function PartyPage() {
  const [partySlots, setPartySlots] = useState<PartySlot[]>([
    { id: 1, character: null },
    { id: 2, character: null },
    { id: 3, character: null },
    { id: 4, character: null },
  ]);
  const [availableCharacters, setAvailableCharacters] = useState<Character[]>([]);
  const [characterBuffs, setCharacterBuffs] = useState<Record<number, BuffDebuff[]>>({});
  const [displayMode, setDisplayMode] = useState<'unified' | 'individual'>('unified');

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const response = await fetch('/api/characters');
      const data = await response.json();
      setAvailableCharacters(data.characters || []);
    } catch (error) {
      console.error('キャラクター取得エラー:', error);
      setAvailableCharacters([]);
    }
  };

  const fetchCharacterBuffs = async (characterId: number) => {
    try {
      console.log('バフ取得開始 - キャラクターID:', characterId);
      const response = await fetch(`/api/characters/${characterId}/buffs`);
      const data = await response.json();
      console.log('バフ取得結果:', data);
      console.log('バフデータサンプル:', data.buffs_debuffs?.[0]);
      setCharacterBuffs(prev => {
        const newState = {
          ...prev,
          [characterId]: data.buffs_debuffs || []
        };
        console.log('バフステート更新:', newState);
        console.log('バフステート更新サンプル:', newState[characterId]?.[0]);
        return newState;
      });
    } catch (error) {
      console.error('バフ取得エラー:', error);
      setCharacterBuffs(prev => ({
        ...prev,
        [characterId]: []
      }));
    }
  };

  const handleCharacterSelect = (slotId: number, character: Character | null) => {
    setPartySlots(prev => prev.map(slot => 
      slot.id === slotId ? { ...slot, character } : slot
    ));
    
    if (character) {
      fetchCharacterBuffs(character.id);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col">
          <h1 className="mb-4">パーティ編成</h1>
          
          {/* 表示切り替え */}
          {partySlots.some(slot => slot.character) && (
            <div className="mb-4">
              <div className="btn-group" role="group">
                <input 
                  type="radio" 
                  className="btn-check" 
                  name="displayMode" 
                  id="unified" 
                  checked={displayMode === 'unified'}
                  onChange={() => setDisplayMode('unified')}
                />
                <label className="btn btn-outline-primary" htmlFor="unified">
                  <i className="bi bi-list-ul me-1"></i>
                  統合表示
                </label>

                <input 
                  type="radio" 
                  className="btn-check" 
                  name="displayMode" 
                  id="individual" 
                  checked={displayMode === 'individual'}
                  onChange={() => setDisplayMode('individual')}
                />
                <label className="btn btn-outline-primary" htmlFor="individual">
                  <i className="bi bi-people me-1"></i>
                  キャラクター別表示
                </label>
              </div>
            </div>
          )}
          
          {/* パーティスロット */}
          <div className="row g-3 mb-4">
            {partySlots.map((slot) => (
              <div key={slot.id} className="col-md-3">
                <div className="card h-100">
                  <div className="card-body d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                    {slot.character ? (
                      <div className="text-center">
                        <div className="mb-3">
                          <img 
                            src={`/imgs/${slot.character.id}.webp`}
                            alt={slot.character.name}
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
                            <i className="bi bi-person-circle" style={{ fontSize: '80px', color: '#0d6efd' }}></i>
                          </div>
                        </div>
                        <h5 className="card-title">{slot.character.name}</h5>
                        <div className="d-flex justify-content-center gap-3 mb-2">
                          <img 
                            src={`/imgs/i_${slot.character.element}.webp`}
                            alt={slot.character.element}
                            title={slot.character.element}
                            style={{ width: '20px', height: '20px' }}
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.style.display = 'none';
                            }}
                          />
                          <img 
                            src={`/imgs/i_${slot.character.path}.webp`}
                            alt={slot.character.path}
                            title={slot.character.path}
                            style={{ width: '20px', height: '20px' }}
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.style.display = 'none';
                            }}
                          />
                        </div>
                        <button 
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleCharacterSelect(slot.id, null)}
                        >
                          外す
                        </button>
                      </div>
                    ) : (
                      <div className="text-center text-muted">
                        <div className="mb-3">
                          <i className="bi bi-person-plus" style={{ fontSize: '3rem' }}></i>
                        </div>
                        <p>キャラクター{slot.id}</p>
                        <select 
                          className="form-select"
                          onChange={(e) => {
                            const characterId = parseInt(e.target.value);
                            const character = availableCharacters.find(c => c.id === characterId);
                            if (character) {
                              handleCharacterSelect(slot.id, character);
                            }
                          }}
                          defaultValue=""
                        >
                          <option value="">選択してください</option>
                          {availableCharacters
                            .filter(char => !partySlots.some(s => s.character?.id === char.id))
                            .map(character => (
                            <option key={character.id} value={character.id}>
                              {character.name} ({character.element}/{character.path})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* バフ・デバフ表示 */}
          {partySlots.some(slot => slot.character) && (
            <>
              {displayMode === 'unified' ? (
                // 統合表示
                <>
                  <div className="row mb-4">
                <div className="col">
                  <h3 className="mb-3">バフ効果 
                    <small className="text-muted">
                      ({partySlots
                        .filter(slot => slot.character)
                        .flatMap(slot => {
                          const buffs = characterBuffs[slot.character!.id] || [];
                          return buffs.filter(buff => buff.type === 'バフ');
                        }).length}件)
                    </small>
                  </h3>
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>キャラクター</th>
                          <th>効果名</th>
                          <th>対象</th>
                          <th>ステータス</th>
                          <th>数値</th>
                          <th>継続時間</th>
                          <th>条件</th>
                        </tr>
                      </thead>
                      <tbody>
                        {partySlots
                          .filter(slot => slot.character)
                          .flatMap(slot => {
                            const buffs = characterBuffs[slot.character!.id] || [];
                            console.log(`${slot.character!.name}のバフ:`, buffs);
                            console.log(`バフタイプでフィルタ前:`, buffs.length);
                            const filtered = buffs.filter(buff => {
                              console.log(`バフチェック:`, buff.name, 'タイプ:', buff.type);
                              return buff.type === 'バフ';
                            });
                            console.log(`バフタイプでフィルタ後:`, filtered.length);
                            return filtered.map(buff => ({ ...buff, characterName: slot.character!.name }));
                          })
                          .map((buff, index) => (
                            <tr key={index}>
                              <td><strong className="text-success">{buff.characterName}</strong></td>
                              <td>{buff.name}</td>
                              <td>{buff.target}</td>
                              <td>{buff.stat}</td>
                              <td>{buff.value}</td>
                              <td>{buff.duration}</td>
                              <td>{buff.note || '-'}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="row mb-4">
                <div className="col">
                  <h3 className="mb-3">デバフ効果
                    <small className="text-muted">
                      ({partySlots
                        .filter(slot => slot.character)
                        .flatMap(slot => {
                          const buffs = characterBuffs[slot.character!.id] || [];
                          return buffs.filter(buff => buff.type === 'デバフ');
                        }).length}件)
                    </small>
                  </h3>
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>キャラクター</th>
                          <th>効果名</th>
                          <th>対象</th>
                          <th>ステータス</th>
                          <th>数値</th>
                          <th>継続時間</th>
                          <th>条件</th>
                        </tr>
                      </thead>
                      <tbody>
                        {partySlots
                          .filter(slot => slot.character)
                          .flatMap(slot => {
                            const buffs = characterBuffs[slot.character!.id] || [];
                            return buffs
                              .filter(buff => buff.type === 'デバフ')
                              .map(buff => ({ ...buff, characterName: slot.character!.name }));
                          })
                          .map((buff, index) => (
                            <tr key={index}>
                              <td><strong className="text-danger">{buff.characterName}</strong></td>
                              <td>{buff.name}</td>
                              <td>{buff.target}</td>
                              <td>{buff.stat}</td>
                              <td>{buff.value}</td>
                              <td>{buff.duration}</td>
                              <td>{buff.note || '-'}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col">
                  <h3 className="mb-3">追加効果
                    <small className="text-muted">
                      ({partySlots
                        .filter(slot => slot.character)
                        .flatMap(slot => {
                          const buffs = characterBuffs[slot.character!.id] || [];
                          return buffs.filter(buff => buff.type === 'その他');
                        }).length}件)
                    </small>
                  </h3>
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>キャラクター</th>
                          <th>効果名</th>
                          <th>対象</th>
                          <th>ステータス</th>
                          <th>数値</th>
                          <th>継続時間</th>
                          <th>条件</th>
                        </tr>
                      </thead>
                      <tbody>
                        {partySlots
                          .filter(slot => slot.character)
                          .flatMap(slot => {
                            const buffs = characterBuffs[slot.character!.id] || [];
                            return buffs
                              .filter(buff => buff.type === 'その他')
                              .map(buff => ({ ...buff, characterName: slot.character!.name }));
                          })
                          .map((buff, index) => (
                            <tr key={index}>
                              <td><strong className="text-secondary">{buff.characterName}</strong></td>
                              <td>{buff.name}</td>
                              <td>{buff.target}</td>
                              <td>{buff.stat}</td>
                              <td>{buff.value}</td>
                              <td>{buff.duration}</td>
                              <td>{buff.note || '-'}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // キャラクター別表示
            <div className="row">
              {partySlots
                .filter(slot => slot.character)
                .map((slot, index) => {
                  const character = slot.character!;
                  const buffs = characterBuffs[character.id] || [];
                  const buffEffects = buffs.filter(buff => buff.type === 'バフ');
                  const debuffEffects = buffs.filter(buff => buff.type === 'デバフ');
                  const otherEffects = buffs.filter(buff => buff.type === 'その他');

                  return (
                    <div key={character.id} className="col-lg-6 col-xl-3 mb-4">
                      <div className="card h-100">
                        <div className="card-header">
                          <div className="d-flex align-items-center">
                            <div className="me-3">
                              <img 
                                src={`/imgs/${character.id}.webp`}
                                alt={character.name}
                                className="img-fluid rounded-circle"
                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                onError={(e) => {
                                  const img = e.target as HTMLImageElement;
                                  img.style.display = 'none';
                                  const fallback = img.nextElementSibling as HTMLDivElement;
                                  if (fallback) fallback.style.display = 'block';
                                }}
                              />
                              <div style={{ display: 'none' }}>
                                <i className="bi bi-person-circle" style={{ fontSize: '50px', color: '#0d6efd' }}></i>
                              </div>
                            </div>
                            <div>
                              <h5 className="card-title mb-0">
                                <strong>{character.name}</strong>
                              </h5>
                              <div className="mt-2 d-flex gap-2">
                                <img 
                                  src={`/imgs/i_${character.element}.webp`}
                                  alt={character.element}
                                  title={character.element}
                                  style={{ width: '18px', height: '18px' }}
                                  onError={(e) => {
                                    const img = e.target as HTMLImageElement;
                                    img.style.display = 'none';
                                  }}
                                />
                                <img 
                                  src={`/imgs/i_${character.path}.webp`}
                                  alt={character.path}
                                  title={character.path}
                                  style={{ width: '18px', height: '18px' }}
                                  onError={(e) => {
                                    const img = e.target as HTMLImageElement;
                                    img.style.display = 'none';
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="card-body">
                          {/* バフ効果 */}
                          {buffEffects.length > 0 && (
                            <div className="mb-3">
                              <h6 className="text-success mb-2">
                                <i className="bi bi-arrow-up-circle me-1"></i>
                                バフ効果 ({buffEffects.length})
                              </h6>
                              <div className="table-responsive">
                                <table className="table table-sm">
                                  <tbody>
                                    {buffEffects.map((buff, buffIndex) => (
                                      <tr key={buffIndex}>
                                        <td className="border-0 p-1">
                                          <small>
                                            <strong>{buff.name}</strong><br/>
                                            <span className="text-muted">
                                              {buff.target} | {buff.stat} {buff.value}
                                              {buff.duration && ` (${buff.duration})`}
                                            </span>
                                          </small>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {/* デバフ効果 */}
                          {debuffEffects.length > 0 && (
                            <div className="mb-3">
                              <h6 className="text-danger mb-2">
                                <i className="bi bi-arrow-down-circle me-1"></i>
                                デバフ効果 ({debuffEffects.length})
                              </h6>
                              <div className="table-responsive">
                                <table className="table table-sm">
                                  <tbody>
                                    {debuffEffects.map((buff, buffIndex) => (
                                      <tr key={buffIndex}>
                                        <td className="border-0 p-1">
                                          <small>
                                            <strong>{buff.name}</strong><br/>
                                            <span className="text-muted">
                                              {buff.target} | {buff.stat} {buff.value}
                                              {buff.duration && ` (${buff.duration})`}
                                            </span>
                                          </small>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {/* 追加効果 */}
                          {otherEffects.length > 0 && (
                            <div className="mb-3">
                              <h6 className="text-secondary mb-2">
                                <i className="bi bi-plus-circle me-1"></i>
                                追加効果 ({otherEffects.length})
                              </h6>
                              <div className="table-responsive">
                                <table className="table table-sm">
                                  <tbody>
                                    {otherEffects.map((buff, buffIndex) => (
                                      <tr key={buffIndex}>
                                        <td className="border-0 p-1">
                                          <small>
                                            <strong>{buff.name}</strong><br/>
                                            <span className="text-muted">
                                              {buff.target} | {buff.stat} {buff.value}
                                              {buff.duration && ` (${buff.duration})`}
                                            </span>
                                          </small>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {/* 効果がない場合 */}
                          {buffs.length === 0 && (
                            <p className="text-muted mb-0">
                              <small>効果データがありません</small>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}