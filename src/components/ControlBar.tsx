import { Button } from '@/components/ui/button';
import type { Team, GamePhase } from '@/data/types';

interface ControlBarProps {
  teams: [Team, Team];
  currentTeam: 'A' | 'B';
  diceValue: number | null;
  diceDisplay: number | null;
  diceRolling: boolean;
  phase: GamePhase;
  message: string;
  isMoving: boolean;
  showNextTurn: boolean;
  onRollDice: () => void;
  onNextTurn: () => void;
  onEndGame: () => void;
}

const TEAM_EMOJI: Record<string, string> = { A: '🐳', B: '🦊' };

export function ControlBar({
  teams, currentTeam, diceValue, diceRolling, phase, message,
  isMoving, showNextTurn, onRollDice, onNextTurn, onEndGame,
}: ControlBarProps) {
  const [teamA, teamB] = teams;
  const canRoll = phase === 'rolling' && !diceValue;

  return (
    <div
      className="flex items-stretch shrink-0"
      style={{
        height: 'clamp(100px, 14vh, 160px)',
        background: 'linear-gradient(180deg, #212529, #343A40)',
        borderTop: '3px solid #845EF7',
      }}
    >
      {/* Team A */}
      <div
        className="flex items-center gap-3 px-4 transition-all duration-300"
        style={{
          flex: '1 1 0',
          background: currentTeam === 'A' ? 'rgba(51,154,240,0.2)' : 'transparent',
          borderLeft: currentTeam === 'A' ? '5px solid #339AF0' : '5px solid transparent',
        }}
      >
        <div
          style={{
            width: 'clamp(40px, 5vw, 64px)',
            height: 'clamp(40px, 5vw, 64px)',
            borderRadius: '50%',
            background: '#339AF0',
            border: '3px solid white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'clamp(20px, 2.5vw, 36px)',
            boxShadow: currentTeam === 'A' ? '0 0 16px #339AF0' : 'none',
            flexShrink: 0,
          }}
        >
          {TEAM_EMOJI.A}
        </div>
        <div>
          <div className="font-bold leading-none" style={{ fontSize: 'clamp(13px, 1.6vw, 22px)', color: '#74C0FC' }}>
            {teamA.name}
            {currentTeam === 'A' && <span className="ml-2" style={{ fontSize: 'clamp(10px, 1.2vw, 16px)', color: '#FFD43B' }}>▶ 回合中</span>}
          </div>
          <div className="font-black text-white leading-tight mt-0.5" style={{ fontSize: 'clamp(28px, 3.8vw, 56px)' }}>
            {teamA.score}
            <span style={{ fontSize: 'clamp(11px, 1.3vw, 18px)', color: '#ADB5BD', marginLeft: 4, fontWeight: 600 }}>分</span>
          </div>
        </div>
      </div>

      {/* Center controls */}
      <div className="flex flex-col items-center justify-center px-4 gap-1" style={{ flex: '0 0 auto', minWidth: 'clamp(180px, 20vw, 320px)' }}>
        {message && (
          <div className="font-bold text-center animate-pulse" style={{ fontSize: 'clamp(12px, 1.4vw, 20px)', color: '#FFD43B' }}>
            {message}
          </div>
        )}
        <div className="flex items-center gap-3">
          {canRoll && (
            <button
              onClick={onRollDice}
              className="font-black text-white rounded-2xl transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #FFD43B, #FF922B)',
                fontSize: 'clamp(18px, 2.4vw, 32px)',
                padding: 'clamp(10px, 1.2vh, 18px) clamp(20px, 2.5vw, 40px)',
                boxShadow: '0 4px 20px rgba(255,146,43,0.5)',
                color: '#212529',
              }}
            >
              🎲 擲骰子！
            </button>
          )}
          {diceRolling && (
            <div className="font-bold animate-pulse" style={{ fontSize: 'clamp(14px, 1.6vw, 22px)', color: '#FFD43B' }}>擲骰中…</div>
          )}
          {isMoving && !diceRolling && (
            <div className="font-bold animate-pulse" style={{ fontSize: 'clamp(14px, 1.6vw, 22px)', color: '#51CF66' }}>移動中…</div>
          )}
          {showNextTurn && (
            <button
              onClick={onNextTurn}
              className="font-black text-white rounded-2xl transition-all hover:brightness-110 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #51CF66, #37B24D)',
                fontSize: 'clamp(16px, 2vw, 28px)',
                padding: 'clamp(8px, 1vh, 14px) clamp(16px, 2vw, 32px)',
                boxShadow: '0 4px 16px rgba(55,178,77,0.4)',
              }}
            >
              下一回合 →
            </button>
          )}
        </div>
      </div>

      {/* Team B */}
      <div
        className="flex items-center gap-3 px-4 justify-end transition-all duration-300"
        style={{
          flex: '1 1 0',
          background: currentTeam === 'B' ? 'rgba(255,146,43,0.2)' : 'transparent',
          borderRight: currentTeam === 'B' ? '5px solid #FF922B' : '5px solid transparent',
        }}
      >
        <div className="text-right">
          <div className="font-bold leading-none" style={{ fontSize: 'clamp(13px, 1.6vw, 22px)', color: '#FFC078' }}>
            {teamB.name}
            {currentTeam === 'B' && <span className="ml-2" style={{ fontSize: 'clamp(10px, 1.2vw, 16px)', color: '#FFD43B' }}>▶ 回合中</span>}
          </div>
          <div className="font-black text-white leading-tight mt-0.5" style={{ fontSize: 'clamp(28px, 3.8vw, 56px)' }}>
            {teamB.score}
            <span style={{ fontSize: 'clamp(11px, 1.3vw, 18px)', color: '#ADB5BD', marginLeft: 4, fontWeight: 600 }}>分</span>
          </div>
        </div>
        <div
          style={{
            width: 'clamp(40px, 5vw, 64px)',
            height: 'clamp(40px, 5vw, 64px)',
            borderRadius: '50%',
            background: '#FF922B',
            border: '3px solid white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'clamp(20px, 2.5vw, 36px)',
            boxShadow: currentTeam === 'B' ? '0 0 16px #FF922B' : 'none',
            flexShrink: 0,
          }}
        >
          {TEAM_EMOJI.B}
        </div>
      </div>

      <Button
        onClick={onEndGame}
        className="self-center mr-3 text-sm px-3 py-2 rounded-lg"
        style={{ background: '#495057', color: '#ADB5BD', border: '1px solid #6C757D' }}
        variant="outline"
      >
        結束
      </Button>
    </div>
  );
}
