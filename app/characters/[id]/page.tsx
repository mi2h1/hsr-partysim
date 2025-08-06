'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface BuffDebuff {
  skill: string;
  name: string;
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
  const [error, setError] = useState<string | null>(null);

  const fetchCharacterData = async (id: string, eidolon: number) => {
    try {
      setLoading(true);
      console.log('Fetching data for character ID:', id, 'eidolon:', eidolon);
      const response = await fetch(`/api/characters/${id}/buffs?eidolon=${eidolon}`);
      console.log('API Response status:', response.status);
      const data = await response.json();
      console.log('API Response data:', data);
      
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
      setLoading(false);
    }
  };

  useEffect(() => {
    if (characterId) {
      fetchCharacterData(characterId, eidolonLevel);
    }
  }, [characterId, eidolonLevel]);

  const handleEidolonChange = (newLevel: number) => {
    setEidolonLevel(newLevel);
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
    <div className="space-y-6">
      {/* キャラクター情報ヘッダー */}
      <div className="hsr-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-hsr-purple mb-2">
              {characterData.character.name}
            </h1>
            <div className="flex gap-4 text-sm">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                属性: {characterData.character.element}
              </span>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                運命: {characterData.character.path}
              </span>
            </div>
          </div>
          
          {/* 星魂レベル選択 */}
          <div className="text-center">
            <label className="block text-sm font-medium mb-2">星魂レベル</label>
            <select
              value={eidolonLevel}
              onChange={(e) => handleEidolonChange(parseInt(e.target.value))}
              className="bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-hsr-purple focus:border-transparent"
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

      {/* 戦闘バフ・デバフ一覧テーブル */}
      <div className="hsr-card">
        <h2 className="text-2xl font-bold mb-4">
          戦闘バフ・デバフ一覧
        </h2>
        
        {(() => {
          const combatBuffs = characterData.buffs_debuffs.filter(buff => 
            !buff.skill.startsWith('星魂')
          );
          
          return combatBuffs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>戦闘バフ・デバフ情報が見つかりませんでした</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="hsr-table">
                <thead>
                  <tr>
                    <th>スキル</th>
                    <th>バフ名</th>
                    <th>継続</th>
                    <th>付与対象</th>
                    <th>対象項目</th>
                    <th>バフ量</th>
                    <th>補足</th>
                  </tr>
                </thead>
                <tbody>
                  {combatBuffs.map((buff, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="font-medium">{buff.skill}</td>
                      <td>{buff.name}</td>
                      <td>{buff.duration}</td>
                      <td>{buff.target}</td>
                      <td className="font-medium text-hsr-purple">{buff.stat}</td>
                      <td className="font-bold text-green-600">{buff.value}</td>
                      <td className="text-sm text-gray-600">{buff.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>

      {/* 星魂効果一覧テーブル */}
      <div className="hsr-card">
        <h2 className="text-2xl font-bold mb-4">
          星魂効果一覧 ({eidolonLevel > 0 ? `${eidolonLevel}凸時` : '無凸'})
        </h2>
        
        {(() => {
          const eidolonBuffs = characterData.buffs_debuffs.filter(buff => 
            buff.skill.startsWith('星魂')
          );
          
          return eidolonBuffs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>星魂効果情報が見つかりませんでした</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="hsr-table">
                <thead>
                  <tr>
                    <th>星魂</th>
                    <th>バフ名</th>
                    <th>継続</th>
                    <th>付与対象</th>
                    <th>対象項目</th>
                    <th>バフ量</th>
                    <th>補足</th>
                  </tr>
                </thead>
                <tbody>
                  {eidolonBuffs.map((buff, index) => {
                    const buffEidolonLevel = parseInt(buff.skill.replace('星魂', ''));
                    const isActive = buffEidolonLevel <= eidolonLevel;
                    
                    let rowClass = "hover:bg-gray-50";
                    if (isActive) {
                      rowClass += " bg-green-100 border-green-300";
                    } else {
                      rowClass += " opacity-50 bg-gray-100";
                    }
                    
                    return (
                      <tr key={index} className={rowClass}>
                        <td className="font-medium">
                          {buff.skill}
                          {isActive && (
                            <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                              有効
                            </span>
                          )}
                        </td>
                        <td className={isActive ? "font-semibold" : ""}>{buff.name}</td>
                        <td>{buff.duration}</td>
                        <td>{buff.target}</td>
                        <td className="font-medium text-hsr-purple">{buff.stat}</td>
                        <td className={`font-bold ${isActive ? "text-green-700" : "text-gray-500"}`}>
                          {buff.value}
                        </td>
                        <td className="text-sm text-gray-600">{buff.note}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>

      {/* 統計情報 */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="hsr-card bg-blue-50">
          <h3 className="font-semibold text-blue-700 mb-2">
            戦闘バフ・デバフ
          </h3>
          <p className="text-2xl font-bold text-blue-800">
            {characterData.buffs_debuffs.filter(b => !b.skill.startsWith('星魂')).length}個
          </p>
          <div className="mt-2 text-sm text-gray-600">
            味方支援: {characterData.buffs_debuffs.filter(b => !b.skill.startsWith('星魂') && b.target.includes('味方')).length}個
          </div>
        </div>
        
        <div className="hsr-card bg-green-50">
          <h3 className="font-semibold text-green-700 mb-2">
            星魂効果（有効）
          </h3>
          <p className="text-2xl font-bold text-green-800">
            {characterData.buffs_debuffs.filter(b => b.skill.startsWith('星魂') && parseInt(b.skill.replace('星魂', '')) <= eidolonLevel).length}個
          </p>
          <div className="mt-2 text-sm text-gray-600">
            全星魂効果: {characterData.buffs_debuffs.filter(b => b.skill.startsWith('星魂')).length}個
          </div>
        </div>
        
        <div className="hsr-card bg-purple-50">
          <h3 className="font-semibold text-purple-700 mb-2">
            現在の総効果数
          </h3>
          <p className="text-2xl font-bold text-purple-800">
            {characterData.buffs_debuffs.filter(b => 
              !b.skill.startsWith('星魂') || 
              parseInt(b.skill.replace('星魂', '')) <= eidolonLevel
            ).length}個
          </p>
          <div className="mt-2 text-sm text-gray-600">
            戦闘+有効星魂効果
          </div>
        </div>
      </div>

      {/* 戻るボタン */}
      <div className="text-center">
        <a 
          href="/"
          className="inline-block bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 transition-colors"
        >
          ← メイン画面に戻る
        </a>
      </div>
    </div>
  );
}