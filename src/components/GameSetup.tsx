import { useState } from 'react';

interface GameSetupProps {
  onStartGame: (teamAName: string, teamBName: string) => void;
  onCardDrawMode: () => void;
  onCardEditor: () => void;
  initialTeamA?: string;
  initialTeamB?: string;
}

export function GameSetup({ onStartGame, onCardDrawMode, onCardEditor, initialTeamA = 'A隊', initialTeamB = 'B隊' }: GameSetupProps) {
  const [teamA, setTeamA] = useState(initialTeamA);
  const [teamB, setTeamB] = useState(initialTeamB);

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="text-center">
        <h1
          className="font-black text-blue-600 mb-2 tracking-tight"
          style={{ fontSize: 'clamp(48px, 8vw, 96px)', fontFamily: '"Noto Sans TC", sans-serif' }}
        >
          友誼大富翁
        </h1>
        <p className="text-gray-500 mb-10" style={{ fontSize: 'clamp(16px, 2vw, 24px)' }}>
          合作・分享・理解
        </p>

        {/* Team name inputs */}
        <p className="text-gray-400 mb-4" style={{ fontSize: 'clamp(12px, 1.4vw, 16px)' }}>
          ✏️ 點擊下方輸入框可修改隊名
        </p>
        <div className="flex gap-8 justify-center mb-10">
          {/* Team A */}
          <div className="text-center">
            <div
              className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-black shadow-lg"
              style={{ background: '#2563EB', fontSize: 'clamp(28px, 4vw, 48px)' }}
            >
              {teamA.charAt(0) || 'A'}
            </div>
            <input
              className="border-2 border-blue-300 rounded-xl text-center font-bold text-blue-700 px-4 py-2 outline-none focus:border-blue-500 transition-colors"
              style={{ fontSize: 'clamp(16px, 2vw, 24px)', width: 'clamp(120px, 15vw, 200px)' }}
              value={teamA}
              onChange={e => setTeamA(e.target.value)}
              maxLength={8}
              placeholder="A隊名稱"
            />
          </div>

          <div
            className="self-center font-black text-gray-400"
            style={{ fontSize: 'clamp(24px, 4vw, 48px)' }}
          >
            VS
          </div>

          {/* Team B */}
          <div className="text-center">
            <div
              className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-black shadow-lg"
              style={{ background: '#EA580C', fontSize: 'clamp(28px, 4vw, 48px)' }}
            >
              {teamB.charAt(0) || 'B'}
            </div>
            <input
              className="border-2 border-orange-300 rounded-xl text-center font-bold text-orange-700 px-4 py-2 outline-none focus:border-orange-500 transition-colors"
              style={{ fontSize: 'clamp(16px, 2vw, 24px)', width: 'clamp(120px, 15vw, 200px)' }}
              value={teamB}
              onChange={e => setTeamB(e.target.value)}
              maxLength={8}
              placeholder="B隊名稱"
            />
          </div>
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => onStartGame(teamA || 'A隊', teamB || 'B隊')}
            className="font-black text-white rounded-2xl transition-all active:scale-95 shadow-2xl hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
              fontSize: 'clamp(20px, 3vw, 36px)',
              padding: 'clamp(14px, 2vh, 24px) 0',
              width: 'clamp(200px, 28vw, 360px)',
              boxShadow: '0 8px 32px rgba(37,99,235,0.4)',
            }}
          >
            🎲 開始遊戲！
          </button>
          <button
            onClick={onCardDrawMode}
            className="font-black text-white rounded-2xl transition-all active:scale-95 shadow-2xl hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, #EC4899, #F59E0B)',
              fontSize: 'clamp(20px, 3vw, 36px)',
              padding: 'clamp(14px, 2vh, 24px) 0',
              width: 'clamp(200px, 28vw, 360px)',
              boxShadow: '0 8px 32px rgba(236,72,153,0.4)',
            }}
          >
            🃏 抽牌模式
          </button>
        </div>
        <button
          onClick={onCardEditor}
          className="mt-4 font-bold text-gray-400 hover:text-indigo-500 transition-colors"
          style={{ fontSize: 'clamp(14px, 1.8vw, 22px)' }}
        >
          📝 卡片管理（編輯 / 匯入匯出）
        </button>

        {/* Legend */}
        <div className="flex gap-4 justify-center mt-10 flex-wrap">
          {[
            { color: '#F59E0B', label: '🤝 通力合作' },
            { color: '#DC2626', label: '🎭 情境表演' },
            { color: '#16A34A', label: '💚 心情分享' },
            { color: '#fff',    label: '🧧 機會',    border: '#374151' },
            { color: '#111827', label: '🃏 命運',    border: '#374151' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded"
                style={{ background: item.color, border: item.border ? `2px solid ${item.border}` : undefined }}
              />
              <span className="text-gray-600" style={{ fontSize: 'clamp(12px, 1.4vw, 18px)' }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
