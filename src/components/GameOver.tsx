import { Button } from '@/components/ui/button';
import type { Team } from '@/data/types';

interface GameOverProps {
  teams: [Team, Team];
  onRestart: () => void;
}

export function GameOver({ teams, onRestart }: GameOverProps) {
  const [teamA, teamB] = teams;
  const winner = teamA.score > teamB.score ? teamA : teamB;
  const isTeamATie = teamA.score === teamB.score;

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-100 to-orange-100">
      <div className="text-center">
        {!isTeamATie && (
          <>
            <div className="text-8xl mb-4 animate-bounce">
              🎉
            </div>
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              {winner.name} 獲勝!
            </h1>
          </>
        )}

        {isTeamATie && (
          <h1 className="text-5xl font-bold text-gray-800 mb-8">
            平手!
          </h1>
        )}

        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl mt-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">最終成績</h2>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-blue-600 mb-4">
                {teamA.name}
              </h3>
              <p className="text-5xl font-bold text-blue-700">
                {teamA.score}
              </p>
              <p className="text-gray-600 mt-2">分數</p>
            </div>

            <div className="bg-red-50 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-red-600 mb-4">
                {teamB.name}
              </h3>
              <p className="text-5xl font-bold text-red-700">
                {teamB.score}
              </p>
              <p className="text-gray-600 mt-2">分數</p>
            </div>
          </div>

          <Button
            onClick={onRestart}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl font-bold py-4 px-6 rounded-lg hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all"
          >
            再玩一次
          </Button>
        </div>

        <div className="mt-12 flex gap-4 justify-center text-5xl animate-pulse">
          <span>✨</span>
          <span>🏆</span>
          <span>✨</span>
        </div>
      </div>
    </div>
  );
}
