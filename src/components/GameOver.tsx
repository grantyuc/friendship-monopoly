import type { Team } from '@/data/types';

interface GameOverProps {
  teams: [Team, Team];
  onRestart: () => void;
}

export function GameOver({ teams, onRestart }: GameOverProps) {
  const [teamA, teamB] = teams;
  const winner = teamA.score > teamB.score ? teamA : teamB.score > teamA.score ? teamB : null;
  const isDraw = teamA.score === teamB.score;

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900">
      <div className="text-center">
        <div style={{ fontSize: 'clamp(48px, 10vw, 120px)' }} className="mb-4">
          {isDraw ? '🤝' : '🏆'}
        </div>
        <h1
          className="font-black text-white mb-2"
          style={{ fontSize: 'clamp(32px, 6vw, 80px)', fontFamily: '"Noto Sans TC", sans-serif' }}
        >
          {isDraw ? '平手！' : `${winner!.name} 獲勝！`}
        </h1>
        <p className="text-gray-400 mb-10" style={{ fontSize: 'clamp(14px, 2vw, 24px)' }}>
          {isDraw ? '兩隊同分，友誼勝！' : '恭喜！'}
        </p>

        {/* Scoreboard */}
        <div className="flex gap-6 justify-center mb-10">
          {[teamA, teamB].map((team, idx) => (
            <div
              key={team.id}
              className="rounded-2xl px-8 py-6 text-center"
              style={{
                background: winner?.id === team.id ? 'rgba(37,99,235,0.25)' : 'rgba(255,255,255,0.08)',
                border: `3px solid ${winner?.id === team.id ? (idx === 0 ? '#2563EB' : '#EA580C') : 'rgba(255,255,255,0.15)'}`,
              }}
            >
              <div
                className="rounded-full mx-auto mb-3 flex items-center justify-center font-black text-white shadow-lg"
                style={{
                  width: 'clamp(48px, 6vw, 80px)',
                  height: 'clamp(48px, 6vw, 80px)',
                  background: idx === 0 ? '#2563EB' : '#EA580C',
                  fontSize: 'clamp(20px, 3vw, 40px)',
                }}
              >
                {team.name.charAt(0)}
              </div>
              <div className="font-bold text-gray-300" style={{ fontSize: 'clamp(14px, 1.8vw, 24px)' }}>
                {team.name}
              </div>
              <div className="font-black text-white" style={{ fontSize: 'clamp(32px, 5vw, 64px)' }}>
                {team.score}
              </div>
              <div className="text-gray-400" style={{ fontSize: 'clamp(12px, 1.4vw, 18px)' }}>分</div>
              {winner?.id === team.id && (
                <div className="mt-2 text-yellow-400 font-bold" style={{ fontSize: 'clamp(12px, 1.5vw, 20px)' }}>
                  👑 勝利
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={onRestart}
          className="font-black text-white rounded-2xl transition-all active:scale-95 hover:brightness-110"
          style={{
            background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
            fontSize: 'clamp(18px, 2.5vw, 32px)',
            padding: 'clamp(12px, 1.8vh, 22px) clamp(36px, 5vw, 64px)',
            boxShadow: '0 6px 24px rgba(37,99,235,0.4)',
          }}
        >
          🎲 再玩一次
        </button>
      </div>
    </div>
  );
}
