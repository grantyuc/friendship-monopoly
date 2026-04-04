import { useState } from 'react';

interface GameSetupProps {
  onStartGame: (teamAName: string, teamBName: string) => void;
}

export function GameSetup({ onStartGame }: GameSetupProps) {
  const [teamAName, setTeamAName] = useState('A隊');
  const [teamBName, setTeamBName] = useState('B隊');

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-blue-600 mb-2" style={{ fontFamily: '"Noto Sans TC", sans-serif' }}>友誼大富翁</h1>
        <h2 className="text-3xl text-orange-500 mb-10 font-semibold">情感存摺</h2>

        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md mx-auto border-2 border-gray-100">
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-bold text-blue-600 mb-2 text-left">🔵 隊伍 A</label>
              <input
                type="text"
                value={teamAName}
                onChange={(e) => setTeamAName(e.target.value)}
                className="w-full px-4 py-3 border-3 border-blue-300 rounded-xl text-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="輸入隊名"
              />
            </div>
            <div>
              <label className="block text-lg font-bold text-orange-500 mb-2 text-left">🟠 隊伍 B</label>
              <input
                type="text"
                value={teamBName}
                onChange={(e) => setTeamBName(e.target.value)}
                className="w-full px-4 py-3 border-3 border-orange-300 rounded-xl text-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                placeholder="輸入隊名"
              />
            </div>
          </div>

          <button
            onClick={() => { if (teamAName.trim() && teamBName.trim()) onStartGame(teamAName, teamBName); }}
            className="w-full mt-8 bg-gradient-to-r from-blue-500 to-orange-400 text-white text-2xl font-bold py-5 px-6 rounded-2xl hover:from-blue-600 hover:to-orange-500 transform hover:scale-105 transition-all shadow-lg"
          >
            🎲 開始遊戲！
          </button>
        </div>

        <div className="mt-10 flex gap-3 justify-center text-4xl">
          <span>🎉</span><span>💪</span><span>🌟</span><span>💝</span><span>🤝</span>
        </div>
      </div>
    </div>
  );
}
