import { Button } from '@/components/ui/button';
import type { Team, GamePhase } from '@/data/types';

interface ControlBarProps {
  teams: [Team, Team];
  currentTeam: 'A' | 'B';
  diceValue: number | null;
  phase: GamePhase;
  message: string;
  isMoving: boolean;
  showNextTurn: boolean;
  onRollDice: () => void;
  onNextTurn: () => void;
  onEndGame: () => void;
}

// Large SVG dice faces for better visibility on projector
const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export function ControlBar({
  teams, currentTeam, diceValue, phase, message,
  isMoving, showNextTurn, onRollDice, onNextTurn, onEndGame,
}: ControlBarProps) {
  const [teamA, teamB] = teams;
  const canRoll = phase === 'rolling' && !diceValue;
  const currentTeamName = currentTeam === 'A' ? teamA.name : teamB.name;

  return (
    <div
      className="bg-gray-900 border-t-4 border-gray-700 flex items-stretch shrink-0"
      style={{ height: 'clamp(88px, 10vh, 130px)' }}
    >
      {/* ── Team A panel ── */}
      <div
        className="flex items-center gap-3 px-5 transition-all duration-300"
        style={{
          flex: '1 1 0',
          backgroundColor: currentTeam === 'A' ? 'rgba(37,99,235,0.25)' : 'transparent',
          borderRight: '2px solid #374151',
          borderLeft: currentTeam === 'A' ? '6px solid #2563EB' : '6px solid transparent',
        }}
      >
        {/* Big token circle */}
        <div
          className="rounded-full flex items-center justify-center font-black text-white shrink-0 shadow-lg"
          style={{
            width: 'clamp(36px, 4.5vw, 60px)',
            height: 'clamp(36px, 4.5vw, 60px)',
            backgroundColor: '#2563EB',
            fontSize: 'clamp(16px, 2vw, 28px)',
            border: '3px solid white',
            boxShadow: currentTeam === 'A' ? '0 0 16px #2563EB' : '0 3px 8px rgba(0,0,0,0.3)',
          }}
        >
          {teamA.name.charAt(0)}
        </div>
        <div>
          <div
            className="font-bold text-blue-300 leading-none"
            style={{ fontSize: 'clamp(13px, 1.6vw, 22px)' }}
          >
            {teamA.name}
            {currentTeam === 'A' && (
              <span className="ml-2 text-yellow-300" style={{ fontSize: 'clamp(10px, 1.2vw, 16px)' }}>
                ▶ 回合中
              </span>
            )}
          </div>
          <div
            className="font-black text-white leading-tight mt-0.5"
            style={{ fontSize: 'clamp(26px, 3.5vw, 52px)' }}
          >
            {teamA.score}
            <span style={{ fontSize: 'clamp(11px, 1.3vw, 18px)', color: '#9CA3AF', marginLeft: '4px', fontWeight: '600' }}>分</span>
          </div>
        </div>
      </div>

      {/* ── Center: dice + controls ── */}
      <div className="flex flex-col items-center justify-center px-4 gap-1" style={{ flex: '0 0 auto', minWidth: 'clamp(200px, 22vw, 360px)' }}>
        {/* Message area */}
        {message ? (
          <div
            className="font-bold text-yellow-300 text-center animate-pulse"
            style={{ fontSize: 'clamp(12px, 1.3vw, 18px)' }}
          >
            {message}
          </div>
        ) : (
          <div
            className="text-gray-500 text-center"
            style={{ fontSize: 'clamp(11px, 1.2vw, 16px)' }}
          >
            {currentTeamName} 的回合
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Dice result display */}
          {diceValue && (
            <div
              className={isMoving ? 'animate-bounce' : ''}
              style={{ fontSize: 'clamp(36px, 5vw, 72px)', lineHeight: 1 }}
            >
              {DICE_FACES[diceValue - 1]}
            </div>
          )}

          {/* Roll button — only when no dice yet */}
          {canRoll && (
            <button
              onClick={onRollDice}
              className="font-black text-white rounded-2xl transition-all active:scale-95 shadow-xl"
              style={{
                background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
                fontSize: 'clamp(16px, 2vw, 28px)',
                padding: 'clamp(8px, 1vh, 16px) clamp(16px, 2vw, 32px)',
                boxShadow: '0 6px 20px rgba(239,68,68,0.5)',
              }}
            >
              🎲 擲骰子！
            </button>
          )}

          {/* Moving indicator */}
          {isMoving && (
            <div
              className="font-bold text-yellow-300 animate-pulse"
              style={{ fontSize: 'clamp(14px, 1.6vw, 22px)' }}
            >
              移動中…
            </div>
          )}

          {/* Next turn button */}
          {showNextTurn && (
            <button
              onClick={onNextTurn}
              className="font-black text-white rounded-2xl transition-all hover:brightness-110 active:scale-95 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #10B981, #059669)',
                fontSize: 'clamp(14px, 1.7vw, 24px)',
                padding: 'clamp(8px, 1vh, 14px) clamp(14px, 1.8vw, 28px)',
              }}
            >
              下一回合 →
            </button>
          )}
        </div>
      </div>

      {/* ── Team B panel ── */}
      <div
        className="flex items-center gap-3 px-5 justify-end transition-all duration-300"
        style={{
          flex: '1 1 0',
          backgroundColor: currentTeam === 'B' ? 'rgba(234,88,12,0.25)' : 'transparent',
          borderLeft: '2px solid #374151',
          borderRight: currentTeam === 'B' ? '6px solid #EA580C' : '6px solid transparent',
        }}
      >
        <div className="text-right">
          <div
            className="font-bold text-orange-300 leading-none"
            style={{ fontSize: 'clamp(13px, 1.6vw, 22px)' }}
          >
            {teamB.name}
            {currentTeam === 'B' && (
              <span className="ml-2 text-yellow-300" style={{ fontSize: 'clamp(10px, 1.2vw, 16px)' }}>
                ▶ 回合中
              </span>
            )}
          </div>
          <div
            className="font-black text-white leading-tight mt-0.5"
            style={{ fontSize: 'clamp(26px, 3.5vw, 52px)' }}
          >
            {teamB.score}
            <span style={{ fontSize: 'clamp(11px, 1.3vw, 18px)', color: '#9CA3AF', marginLeft: '4px', fontWeight: '600' }}>分</span>
          </div>
        </div>
        <div
          className="rounded-full flex items-center justify-center font-black text-white shrink-0 shadow-lg"
          style={{
            width: 'clamp(36px, 4.5vw, 60px)',
            height: 'clamp(36px, 4.5vw, 60px)',
            backgroundColor: '#EA580C',
            fontSize: 'clamp(16px, 2vw, 28px)',
            border: '3px solid white',
            boxShadow: currentTeam === 'B' ? '0 0 16px #EA580C' : '0 3px 8px rgba(0,0,0,0.3)',
          }}
        >
          {teamB.name.charAt(0)}
        </div>
      </div>

      {/* End game button */}
      <Button
        onClick={onEndGame}
        className="self-center mr-3 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm px-3 py-2 rounded-lg border border-gray-600"
        variant="outline"
      >
        結束
      </Button>
    </div>
  );
}
