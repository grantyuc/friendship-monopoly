import { useState, useEffect } from 'react';
import type { GameState, CellType, TeamId } from '@/data/types';
import { BOARD_CELLS } from '@/data/questions';
import { DiceFace } from '@/components/ui/DiceFace';

interface GameBoardProps {
  state: GameState;
  displayPositions: { A: number; B: number } | null;
  animatingCell: number | null;
  diceDisplay: number | null;
  diceRolling: boolean;
  diceSettled: boolean;
}

// Bright, cute, child-friendly palette
const CELL_BG: Record<CellType, string> = {
  start:   '#FFF9DB', // warm cream
  yellow:  '#FFD43B', // bright sunny yellow
  red:     '#FF6B6B', // soft coral red
  green:   '#51CF66', // fresh mint green
  chance:  '#FFFFFF', // white
  destiny: '#212529', // black
};

const CELL_ICON: Record<CellType, string> = {
  start:   '🏁',
  yellow:  '🤝',
  red:     '🎭',
  green:   '💚',
  chance:  '🧧',
  destiny: '🃏',
};

const TEAM_COLORS: Record<TeamId, string> = {
  A: '#339AF0', // friendly blue
  B: '#FF922B', // warm orange
};

const TEAM_EMOJI: Record<TeamId, string> = {
  A: '🐳',
  B: '🦊',
};

const GRID_COLS = 12;
const GRID_ROWS = 10;

function cellToGrid(id: number): [number, number] {
  if (id < GRID_COLS) return [id, 0];
  const rightCount = GRID_ROWS - 2;
  if (id < GRID_COLS + rightCount) return [GRID_COLS - 1, 1 + (id - GRID_COLS)];
  if (id < GRID_COLS + rightCount + GRID_COLS) return [GRID_COLS - 1 - (id - GRID_COLS - rightCount), GRID_ROWS - 1];
  const leftStart = GRID_COLS + rightCount + GRID_COLS;
  return [0, GRID_ROWS - 2 - (id - leftStart)];
}


interface CellCompProps {
  type: CellType;
  ownership: { owner: TeamId | null; houses: number };
  teamsHere: TeamId[];
  isAnimating: boolean;
  cellW: number;
  cellH: number;
}

function BoardCellComp({ type, ownership, teamsHere, isAnimating, cellW, cellH }: CellCompProps) {
  const bg = CELL_BG[type];
  const icon = CELL_ICON[type];
  const hasOwner = ownership.owner !== null;
  const ownerColor = hasOwner ? TEAM_COLORS[ownership.owner!] : null;
  const s = Math.min(cellW, cellH);

  return (
    <div
      style={{
        width: cellW,
        height: cellH,
        background: bg,
        border: '2px solid #DEE2E6',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'visible',
        boxShadow: isAnimating
          ? '0 0 24px 8px rgba(255,215,0,0.85), inset 0 0 12px rgba(255,235,100,0.4)'
          : 'none',
        transition: 'box-shadow 0.15s ease',
        zIndex: isAnimating ? 20 : 1,
      }}
    >
      {/* Owner strip at bottom */}
      {hasOwner && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: Math.max(4, s * 0.1),
            background: ownerColor!,
            opacity: 0.85,
          }}
        />
      )}

      {/* Houses */}
      {ownership.houses > 0 && (
        <div style={{ position: 'absolute', top: 2, right: 2, display: 'flex', gap: 1 }}>
          {Array.from({ length: ownership.houses }).map((_, i) => (
            <span key={i} style={{ fontSize: s * 0.28, lineHeight: 1 }}>🏠</span>
          ))}
        </div>
      )}

      {/* Icon only — no text label */}
      <div style={{ fontSize: s * 0.45, lineHeight: 1 }}>
        {icon}
      </div>

      {/* Player tokens — 3x size, overlapping is OK */}
      {teamsHere.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: s * 0.05,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 0,
            zIndex: 30,
          }}
        >
          {teamsHere.map((teamId, idx) => {
            const tkn = s * 0.85; // 3x bigger
            return (
              <div
                key={teamId}
                style={{
                  width: tkn,
                  height: tkn,
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 40% 35%, ${TEAM_COLORS[teamId]}CC, ${TEAM_COLORS[teamId]})`,
                  border: '3px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: tkn * 0.55,
                  lineHeight: 1,
                  boxShadow: `0 3px 12px rgba(0,0,0,0.35), 0 0 16px ${TEAM_COLORS[teamId]}66`,
                  marginLeft: idx > 0 ? -tkn * 0.3 : 0,
                  zIndex: 30 + idx,
                  flexShrink: 0,
                }}
              >
                {TEAM_EMOJI[teamId]}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function GameBoard({ state, displayPositions, animatingCell, diceDisplay, diceRolling, diceSettled }: GameBoardProps) {
  const posA = displayPositions?.A ?? state.teams[0].position;
  const posB = displayPositions?.B ?? state.teams[1].position;

  // Board sizing: leave 13% for control bar, add 2px padding to avoid edge clipping
  const pad = 4;
  const boardW = window.innerWidth - pad * 2;
  const boardH = window.innerHeight * 0.83 - pad * 2;

  const cellW = Math.floor(boardW / GRID_COLS);
  const cellH = Math.floor(boardH / GRID_ROWS);
  const gridW = cellW * GRID_COLS;
  const gridH = cellH * GRID_ROWS;

  const cells = BOARD_CELLS.map(cell => {
    const [col, row] = cellToGrid(cell.id);
    const teamsHere: TeamId[] = [];
    if (posA === cell.id) teamsHere.push('A');
    if (posB === cell.id) teamsHere.push('B');
    return { ...cell, col, row, teamsHere, isAnimating: animatingCell === cell.id };
  });

  // Dice animation angle
  const [diceAngle, setDiceAngle] = useState(0);
  useEffect(() => {
    if (!diceRolling) return;
    let frame: number;
    let a = 0;
    const spin = () => {
      a += 25;
      setDiceAngle(a);
      frame = requestAnimationFrame(spin);
    };
    frame = requestAnimationFrame(spin);
    return () => cancelAnimationFrame(frame);
  }, [diceRolling]);

  const diceSize = Math.max(60, Math.min(cellW, cellH) * 1.2);
  const showDice = diceDisplay !== null;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#FFF9DB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: pad,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: gridW,
          height: gridH,
          border: '4px solid #845EF7',
          borderRadius: 8,
          background: '#FFFFFF',
          overflow: 'visible',
        }}
      >
        {cells.map(cell => (
          <div
            key={cell.id}
            style={{
              position: 'absolute',
              left: cell.col * cellW,
              top: cell.row * cellH,
              zIndex: cell.isAnimating ? 20 : cell.teamsHere.length > 0 ? 10 : 1,
            }}
          >
            <BoardCellComp
              type={cell.type}
              ownership={state.cellOwnership[cell.id]}
              teamsHere={cell.teamsHere}
              isAnimating={cell.isAnimating}
              cellW={cellW}
              cellH={cellH}
            />
          </div>
        ))}

        {/* Center area */}
        <div
          style={{
            position: 'absolute',
            left: cellW,
            top: cellH,
            width: (GRID_COLS - 2) * cellW,
            height: (GRID_ROWS - 2) * cellH,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 6,
            pointerEvents: 'none',
          }}
        >
          {/* Dice in center */}
          {showDice && (
            <div
              style={{
                transform: diceRolling
                  ? `rotate(${diceAngle}deg) scale(${0.8 + Math.sin(diceAngle * 0.05) * 0.3})`
                  : diceSettled
                  ? 'rotate(0deg) scale(1.15)'
                  : 'rotate(0deg) scale(1)',
                transition: diceRolling ? 'none' : 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                marginBottom: 12,
                filter: diceRolling ? 'blur(1.5px)' : 'none',
              }}
            >
              <DiceFace value={diceDisplay!} size={diceSize} />
            </div>
          )}

          {!showDice && (
            <>
              <div style={{ fontSize: Math.max(12, cellH * 0.3), letterSpacing: '0.3em', opacity: 0.4 }}>
                ✦ ✧ ★ ✧ ✦
              </div>
              <div
                style={{
                  fontSize: Math.max(28, cellH * 1.2),
                  fontWeight: 900,
                  color: '#339AF0',
                  fontFamily: '"Noto Sans TC", sans-serif',
                  letterSpacing: '0.08em',
                  textAlign: 'center',
                }}
              >
                友誼大富翁
              </div>
              <div style={{ fontSize: Math.max(12, cellH * 0.3), color: '#868E96', fontWeight: 600 }}>
                合作 · 分享 · 理解
              </div>
              <div style={{ fontSize: Math.max(16, cellH * 0.4), letterSpacing: '0.4em', marginTop: 2, opacity: 0.5 }}>
                🎲🎵🌈🎉
              </div>
            </>
          )}

          {/* Current team indicator */}
          <div
            style={{
              marginTop: showDice ? 4 : 10,
              background: state.currentTeam === 'A' ? '#E7F5FF' : '#FFF4E6',
              border: `3px solid ${state.currentTeam === 'A' ? '#339AF0' : '#FF922B'}`,
              borderRadius: 16,
              padding: `${Math.max(5, cellH * 0.08)}px ${Math.max(14, cellW * 0.2)}px`,
            }}
          >
            <span
              style={{
                color: state.currentTeam === 'A' ? '#1971C2' : '#E8590C',
                fontWeight: 800,
                fontSize: Math.max(13, cellH * 0.3),
                fontFamily: '"Noto Sans TC", sans-serif',
              }}
            >
              {TEAM_EMOJI[state.currentTeam]} {state.teams[state.currentTeam === 'A' ? 0 : 1].name} 的回合
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
