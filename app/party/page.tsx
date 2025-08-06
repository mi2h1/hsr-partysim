'use client';

import { useState, useEffect } from 'react';

interface Character {
  id: number;
  name: string;
  element: string;
  path: string;
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

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const response = await fetch('/api/characters');
      const characters = await response.json();
      setAvailableCharacters(characters);
    } catch (error) {
      console.error('キャラクター取得エラー:', error);
    }
  };

  const handleCharacterSelect = (slotId: number, character: Character | null) => {
    setPartySlots(prev => prev.map(slot => 
      slot.id === slotId ? { ...slot, character } : slot
    ));
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

          {/* パーティ情報表示 */}
          <div className="row">
            <div className="col">
              <div className="card">
                <div className="card-header">
                  <h5>パーティ構成</h5>
                </div>
                <div className="card-body">
                  {partySlots.some(slot => slot.character) ? (
                    <div>
                      <h6>選択中のキャラクター:</h6>
                      <ul className="list-group">
                        {partySlots
                          .filter(slot => slot.character)
                          .map(slot => (
                          <li key={slot.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <span>
                              <strong>{slot.character!.name}</strong>
                              <span className="ms-2">
                                <span className="badge bg-primary me-1">{slot.character!.element}</span>
                                <span className="badge bg-secondary">{slot.character!.path}</span>
                              </span>
                            </span>
                            <span className="badge bg-light text-dark">スロット {slot.id}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-muted">パーティにキャラクターが選択されていません。</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}