'use client';

import { useState, useEffect } from 'react';

interface Character {
  id: number;
  name: string;
  element: string;
  path: string;
}

interface BuffDebuff {
  id: number;
  effect_name: string;
  buff_type: 'バフ' | 'デバフ' | 'その他';
  target_type: string;
  stat_affected: string;
  value_expression: string;
  duration: string;
  condition?: string;
  is_stackable: boolean;
  max_stacks?: number;
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
      const response = await fetch(`/api/characters/${characterId}/buffs`);
      const data = await response.json();
      setCharacterBuffs(prev => ({
        ...prev,
        [characterId]: data.buffs || []
      }));
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
          
          {/* パーティスロット */}
          <div className="row g-3 mb-4">
            {partySlots.map((slot) => (
              <div key={slot.id} className="col-md-3">
                <div className="card h-100">
                  <div className="card-body d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                    {slot.character ? (
                      <div className="text-center">
                        <h5 className="card-title">{slot.character.name}</h5>
                        <p className="card-text">
                          <span className="badge bg-primary me-2">{slot.character.element}</span>
                          <span className="badge bg-secondary">{slot.character.path}</span>
                        </p>
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
              <div className="row mb-4">
                <div className="col">
                  <h3 className="mb-3">バフ効果</h3>
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
                              .filter(buff => buff.buff_type === 'バフ')
                              .map(buff => ({ ...buff, characterName: slot.character!.name }));
                          })
                          .map((buff, index) => (
                            <tr key={index}>
                              <td><strong className="text-success">{buff.characterName}</strong></td>
                              <td>{buff.effect_name}</td>
                              <td>{buff.target_type}</td>
                              <td>{buff.stat_affected}</td>
                              <td>{buff.value_expression}</td>
                              <td>{buff.duration}</td>
                              <td>{buff.condition || '-'}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="row mb-4">
                <div className="col">
                  <h3 className="mb-3">デバフ効果</h3>
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
                              .filter(buff => buff.buff_type === 'デバフ')
                              .map(buff => ({ ...buff, characterName: slot.character!.name }));
                          })
                          .map((buff, index) => (
                            <tr key={index}>
                              <td><strong className="text-danger">{buff.characterName}</strong></td>
                              <td>{buff.effect_name}</td>
                              <td>{buff.target_type}</td>
                              <td>{buff.stat_affected}</td>
                              <td>{buff.value_expression}</td>
                              <td>{buff.duration}</td>
                              <td>{buff.condition || '-'}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col">
                  <h3 className="mb-3">追加効果</h3>
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
                              .filter(buff => buff.buff_type === 'その他')
                              .map(buff => ({ ...buff, characterName: slot.character!.name }));
                          })
                          .map((buff, index) => (
                            <tr key={index}>
                              <td><strong className="text-secondary">{buff.characterName}</strong></td>
                              <td>{buff.effect_name}</td>
                              <td>{buff.target_type}</td>
                              <td>{buff.stat_affected}</td>
                              <td>{buff.value_expression}</td>
                              <td>{buff.duration}</td>
                              <td>{buff.condition || '-'}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}