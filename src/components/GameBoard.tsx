import type { GameState, CellType } from '@/data/types';
import { BOARD_CELLS } from '@/data/questions';

interface GameBoardProps {
  state: GameState;
  // Animated position overrides during step movement
  displayPositions?: { A: number; B: number } | null;
  // Which cell is currently being highlighted during animation
  animatingCell?: number | null;
}

// Colors for board cells
const CELL_BG: Record<CellType, string> = {
  start:   '#FFFFFF',
  yellow:  '#FCD34D',
  red:     '#F87171',
  green:   '#4ADE80',
  chance:  '#FFFFFF',   // white background, black text (per user request)
  destiny: '#111827',
};

const CELL_TEXT: Record<CellType, string> = {
  start:   '#1F2937',
  yellow:  '#78350F',
  red:     '#7F1D1D',
  green:   '#14532D',
  chance:  '#111827',   // black text on white background
  destiny: '#FFFFFF',
};

const CELL_BORDER: Record<CellType, string> = {
  start:   '#9CA3AF',
  yellow:  '#D97706',
  red:     '#DC2626',
  green:   '#16A34A',
  chance:  '#6B7280',
  destiny: '#374151',
};

const CELL_EMOJI: Record<CellType, string> = {
  start:   '🏁',
  yellow:  '🤝',
  red:     '🎭',
  green:   '💚',
  chance:  '🧧',
  destiny: '🃏',
};

// Layout: 11 cells along top/bottom (0-10 top, 20-30 bottom reversed)
//         9 cells along sides (11-19 right, 31-39 left)
// Total = 11 + 9 + 11 + 9 = 40 cells

function getCellStyle(index: number) {
  const COLS = 11;
  const ROWS = 11; // 11 cells in each direction
  const W = 100 / COLS; // % width of each cell
  const H = 100 / ROWS; // % height of each cell

  let left = 0, top = 0, width = W, height = H;

  if (index <= 10) {
    // Top row: left to right
    left = index * W;
    top = 0;
  } else if (index <= 19) {
    // Right column: top to bottom (skip top-right corner = already cell 10)
    left = (COLS - 1) * W;
    top = (index - 9) * H;  // 11 -> row 2, 19 -> row 10
  } else if (index <= 30) {
    // Bottom row: right to left (30 = left corner, 20 = right side)
    left = (30 - index) * W;
    top = (ROWS - 1) * H;
  } else {
    // Left column: bottom to top (31 = near bottom, 39 = near top)
    left = 0;
    top = (ROWS - 1 - (index - 30)) * H; // 31 -> row 9, 39 -> row 1
  }

  return { left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` };
}

export function GameBoard({ state, displayPositions, animatingCell }: GameBoardProps) {
  const teamAPos = displayPositions?.A ?? state.teams[0].position;
  const teamBPos = displayPositions?.B ?? state.teams[1].position;

  return (
    <div className="w-full h-full relative bg-gray-100">
      <div className="absolute inset-1 bg-white border-4 border-gray-800 shadow-2xl" style={{ borderRadius: '4px' }}>

        {/* Render all 40 cells */}
        {BOARD_CELLS.map((cell, idx) => {
          const style = getCellStyle(idx);
          const bg = CELL_BG[cell.type];
          const textColor = CELL_TEXT[cell.type];
          const borderColor = CELL_BORDER[cell.type];
          const emoji = CELL_EMOJI[cell.type];
          const ownership = state.cellOwnership[idx];

          const teamAHere = teamAPos === idx;
          const teamBHere = teamBPos === idx;

          // Highlight during animation
          const isAnimating = animatingCell === idx;
          // Highlight if current team is here and not in setup
          const isActive = state.phase !== 'setup' && (
            (state.currentTeam === 'A' && teamAPos === idx) ||
            (state.currentTeam === 'B' && teamBPos === idx)
          );

          return (
            <div
              key={idx}
              className="absolute flex flex-col items-center justify-center overflow-hidden"
              style={{
                ...style,
                backgroundColor: bg,
                borderRight: `1.5px solid ${borderColor}`,
                borderBottom: `1.5px solid ${borderColor}`,
                boxShadow: isAnimating
                  ? `inset 0 0 0 3px #FBBF24, 0 0 16px 6px rgba(251,191,36,0.6)`
                  : isActive && !displayPositions
                  ? `inset 0 0 0 2px #3B82F6`
                  : 'none',
                transition: 'box-shadow 0.15s',
                zIndex: isAnimating ? 5 : 1,
              }}
            >
              {/* Cell emoji (small, top) */}
              <span style={{ fontSize: 'clamp(10px, 1.2vw, 18px)', lineHeight: 1, marginBottom: '1px' }}>
                {cell.type === 'start' ? '🏁' : emoji}
              </span>

              {/* Cell label */}
              <span
                className="font-bold text-center leading-tight"
                style={{
                  color: textColor,
                  fontSize: 'clamp(10px, 1.3vw, 18px)',
                  padding: '0 2px',
                  textShadow: cell.type === 'destiny' ? 'none' : 'none',
                }}
              >
                {cell.type === 'start' ? '起點' : cell.label}
              </span>

              {/* Ownership dot */}
              {ownership.owner && (
                <div
                  className="absolute rounded-full border-2 border-white shadow-md"
                  style={{
                    width: 'clamp(8px, 1.1vw, 16px)',
                    height: 'clamp(8px, 1.1vw, 16px)',
                    backgroundColor: ownership.owner === 'A' ? '#2563EB' : '#EA580C',
                    top: '3px',
                    right: '3px',
                  }}
                />
              )}

              {/* Houses — rendered as house icons, stacked */}
              {ownership.houses > 0 && (
                <div
                  className="absolute flex"
                  style={{ bottom: '2px', left: '2px', gap: '1px' }}
                >
                  {Array(ownership.houses).fill(0).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-center text-white font-bold rounded shadow"
                      style={{
                        width: 'clamp(12px, 1.4vw, 22px)',
                        height: 'clamp(12px, 1.4vw, 22px)',
                        backgroundColor: ownership.owner === 'A' ? '#1D4ED8' : '#C2410C',
                        fontSize: 'clamp(7px, 0.9vw, 14px)',
                      }}
                    >
                      🏠
                    </div>
                  ))}
                </div>
              )}

              {/* Team tokens */}
              {teamAHere && (
                <TeamToken
                  label={state.teams[0].name.charAt(0)}
                  color="#2563EB"
                  offsetLeft={teamBHere}
                  isMoving={displayPositions !== null && displayPositions !== undefined && state.currentTeam === 'A'}
                />
              )}
              {teamBHere && (
                <TeamToken
                  label={state.teams[1].name.charAt(0)}
                  color="#EA580C"
                  offsetRight={teamAHere}
                  isMoving={displayPositions !== null && displayPositions !== undefined && state.currentTeam === 'B'}
                />
              )}
            </div>
          );
        })}

        {/* Center content area — the inner 9×9 area */}
        <div
          className="absolute flex flex-col items-center justify-center pointer-events-none"
          style={{
            left: `${(1/11)*100}%`,
            top: `${(1/11)*100}%`,
            width: `${(9/11)*100}%`,
            height: `${(9/11)*100}%`,
          }}
        >
          {/* Title */}
          <h1
            className="font-black text-blue-600 leading-none text-center"
            style={{
              fontSize: 'clamp(28px, 4vw, 72px)',
              letterSpacing: '-0.02em',
              textShadow: '2px 2px 0 rgba(59,130,246,0.15)',
            }}
          >
            友誼大富翁
          </h1>
          <p
            className="text-orange-400 font-bold mt-1"
            style={{ fontSize: 'clamp(12px, 1.4vw, 24px)' }}
          >
            情感存摺
          </p>

          {/* Decorative stars */}
          <div className="flex gap-2 mt-2" style={{ fontSize: 'clamp(16px, 2vw, 36px)' }}>
            <span>✨</span><span>💝</span><span>🤝</span><span>💝</span><span>✨</span>
          </div>

          {/* Card piles */}
          <div className="flex gap-6 mt-4">
            <CardPile label="機會" color="white" border="#6B7280" textColor="#111827" remaining={state.chanceDeck.length} />
            <CardPile label="命運" color="#111827" border="#374151" textColor="white" remaining={state.destinyDeck.length} />
          </div>

          {/* Scores display in center for easy viewing */}
          <div className="flex gap-8 mt-4">
            <ScoreDisplay name={state.teams[0].name} score={state.teams[0].score} color="#2563EB" active={state.currentTeam === 'A'} />
            <ScoreDisplay name={state.teams[1].name} score={state.teams[1].score} color="#EA580C" active={state.currentTeam === 'B'} />
          </div>
        </div>
      </div>
    </div>
  );
}

interface TeamTokenProps {
  label: string;
  color: string;
  offsetLeft?: boolean;
  offsetRight?: boolean;
  isMoving?: boolean;
}

function TeamToken({ label, color, offsetLeft, offsetRight, isMoving }: TeamTokenProps) {
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    width: 'clamp(22px, 2.8vw, 44px)',
    height: 'clamp(22px, 2.8vw, 44px)',
    borderRadius: '50%',
    backgroundColor: color,
    border: '3px solid white',
    boxShadow: isMoving
      ? `0 0 0 3px ${color}, 0 4px 12px rgba(0,0,0,0.4)`
      : '0 3px 8px rgba(0,0,0,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '900',
    fontSize: 'clamp(11px, 1.4vw, 22px)',
    zIndex: 10,
    transition: 'box-shadow 0.2s',
    // Slight animation when moving
    animation: isMoving ? 'tokenPulse 0.4s ease-in-out infinite alternate' : 'none',
  };

  if (offsetLeft) {
    return <div style={{ ...baseStyle, bottom: '18%', left: '8%' }}>{label}</div>;
  }
  if (offsetRight) {
    return <div style={{ ...baseStyle, bottom: '18%', right: '8%' }}>{label}</div>;
  }
  return <div style={{ ...baseStyle, bottom: '18%', left: '50%', transform: 'translateX(-50%)' }}>{label}</div>;
}

interface CardPileProps {
  label: string;
  color: string;
  border: string;
  textColor: string;
  remaining: number;
}

function CardPile({ label, color, border, textColor, remaining }: CardPileProps) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="flex items-center justify-center font-bold rounded-lg shadow-lg"
        style={{
          width: 'clamp(44px, 5.5vw, 80px)',
          height: 'clamp(58px, 7vw, 108px)',
          backgroundColor: color,
          border: `2px solid ${border}`,
          color: textColor,
          fontSize: 'clamp(12px, 1.5vw, 20px)',
          writingMode: 'vertical-rl',
          textOrientation: 'upright',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </div>
      <span style={{ fontSize: 'clamp(9px, 1vw, 14px)', color: '#6B7280', marginTop: '4px' }}>
        剩 {remaining} 張
      </span>
    </div>
  );
}

interface ScoreDisplayProps {
  name: string;
  score: number;
  color: string;
  active: boolean;
}

function ScoreDisplay({ name, score, color, active }: ScoreDisplayProps) {
  return (
    <div
      className="flex flex-col items-center px-4 py-2 rounded-xl transition-all"
      style={{
        backgroundColor: active ? `${color}22` : 'transparent',
        border: active ? `2px solid ${color}` : '2px solid transparent',
        minWidth: 'clamp(70px, 8vw, 120px)',
      }}
    >
      <span style={{ color, fontWeight: '700', fontSize: 'clamp(13px, 1.5vw, 22px)' }}>{name}</span>
      <span style={{ color, fontWeight: '900', fontSize: 'clamp(20px, 2.5vw, 40px)', lineHeight: 1.1 }}>{score}</span>
    </div>
  );
}
