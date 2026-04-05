import { useState, useEffect } from 'react';
import type { CellOwnership, TeamId, GamePhase } from '@/data/types';
import { BOARD_CELLS } from '@/data/questions';
import { DiceFace } from '@/components/ui/DiceFace';

const DICE_SIZE = 90;

interface EffectModalProps {
  phase: GamePhase;
  ownedCells: CellOwnership[];
  currentTeam: TeamId;
  onChooseSteps: (steps: number) => void;
  onRollBackward: () => void;
  onSelectBuilding: (cellId: number, action: 'upgrade' | 'destroy') => void;
  onSkip: () => void;
  backwardDiceRolling?: boolean;
  backwardDiceDisplay?: number | null;
}

export function EffectModal({
  phase, ownedCells, currentTeam, onChooseSteps, onRollBackward, onSelectBuilding, onSkip,
  backwardDiceRolling = false, backwardDiceDisplay = null,
}: EffectModalProps) {
  const opponentId: TeamId = currentTeam === 'A' ? 'B' : 'A';

  // Spin animation matching GameBoard's normal dice
  const [diceAngle, setDiceAngle] = useState(0);
  useEffect(() => {
    if (!backwardDiceRolling) { setDiceAngle(0); return; }
    let frame: number;
    let a = 0;
    const spin = () => {
      a += 25;
      setDiceAngle(a);
      frame = requestAnimationFrame(spin);
    };
    frame = requestAnimationFrame(spin);
    return () => cancelAnimationFrame(frame);
  }, [backwardDiceRolling]);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border-2 border-gray-600 rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center">
        {/* Choose forward */}
        {phase === 'choose_forward' && (
          <>
            <div style={{ fontSize: 'clamp(32px, 5vw, 64px)' }} className="mb-4">🗺️</div>
            <h2 className="text-white font-black mb-2" style={{ fontSize: 'clamp(20px, 3vw, 36px)' }}>
              選擇前進步數
            </h2>
            <p className="text-gray-400 mb-6" style={{ fontSize: 'clamp(14px, 1.8vw, 22px)' }}>
              你可以選擇前進 1 到 6 步
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <button
                  key={n}
                  onClick={() => onChooseSteps(n)}
                  className="font-black text-white rounded-xl transition-all active:scale-95 hover:brightness-110"
                  style={{
                    background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                    fontSize: 'clamp(20px, 3vw, 40px)',
                    padding: 'clamp(10px, 1.5vh, 20px)',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Roll to move backward */}
        {(phase === 'roll_for_backward' || backwardDiceRolling || backwardDiceDisplay !== null) && (
          <>
            {/* Dice display: same 3D spin as normal turn */}
            <div className="mx-auto mb-4 flex items-center justify-center" style={{ height: DICE_SIZE + 20 }}>
              {backwardDiceDisplay !== null ? (
                <div
                  style={{
                    transform: backwardDiceRolling
                      ? `rotate(${diceAngle}deg) scale(${0.8 + Math.sin(diceAngle * 0.05) * 0.3})`
                      : !backwardDiceRolling && backwardDiceDisplay
                      ? 'rotate(0deg) scale(1.15)'
                      : 'rotate(0deg) scale(1)',
                    transition: backwardDiceRolling ? 'none' : 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                    filter: backwardDiceRolling ? 'blur(1.5px)' : 'none',
                  }}
                >
                  <DiceFace value={backwardDiceDisplay} size={DICE_SIZE} />
                </div>
              ) : (
                <div style={{ fontSize: 'clamp(32px, 5vw, 64px)', lineHeight: 1 }}>🎲</div>
              )}
            </div>
            <h2 className="text-white font-black mb-2" style={{ fontSize: 'clamp(20px, 3vw, 36px)' }}>
              {backwardDiceDisplay && !backwardDiceRolling
                ? `後退 ${backwardDiceDisplay} 步！`
                : backwardDiceRolling
                  ? '骰子滾動中…'
                  : '擲骰子決定退幾步'}
            </h2>
            <p className="text-gray-400 mb-8" style={{ fontSize: 'clamp(14px, 1.8vw, 22px)' }}>
              {backwardDiceDisplay && !backwardDiceRolling ? '準備後退…' : '後退由骰子決定命運！'}
            </p>
            <button
              onClick={onRollBackward}
              disabled={backwardDiceRolling || backwardDiceDisplay !== null}
              className="w-full font-black text-white rounded-2xl transition-all active:scale-95 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #DC2626, #EA580C)',
                fontSize: 'clamp(18px, 2.5vw, 32px)',
                padding: 'clamp(12px, 1.8vh, 24px)',
                boxShadow: '0 6px 20px rgba(220,38,38,0.4)',
              }}
            >
              🎲 擲骰子
            </button>
          </>
        )}

        {/* Upgrade building */}
        {phase === 'select_building_upgrade' && (
          <>
            <div style={{ fontSize: 'clamp(32px, 5vw, 64px)' }} className="mb-4">🏠</div>
            <h2 className="text-white font-black mb-2" style={{ fontSize: 'clamp(20px, 3vw, 36px)' }}>
              選擇要升級的格子
            </h2>
            <p className="text-gray-400 mb-4" style={{ fontSize: 'clamp(14px, 1.8vw, 22px)' }}>
              選擇你已佔領且可蓋房子的格子
            </p>
            <div className="max-h-48 overflow-y-auto space-y-2 mb-4">
              {ownedCells.map((cell, idx) => {
                if (cell.owner !== currentTeam || cell.houses >= 2) return null;
                const boardCell = BOARD_CELLS[idx];
                return (
                  <button
                    key={idx}
                    onClick={() => onSelectBuilding(idx, 'upgrade')}
                    className="w-full font-bold text-white rounded-xl py-2 px-4 transition-all active:scale-95 hover:brightness-110 text-left"
                    style={{ background: 'rgba(37,99,235,0.4)', border: '1px solid #2563EB' }}
                  >
                    格子 {idx + 1}（{boardCell.label}）— 🏠 × {cell.houses}
                  </button>
                );
              })}
            </div>
            <button
              onClick={onSkip}
              className="w-full font-bold text-gray-400 rounded-xl py-2 px-4 transition-all hover:text-white"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #374151' }}
            >
              跳過
            </button>
          </>
        )}

        {/* Destroy building */}
        {phase === 'select_building_destroy' && (
          <>
            <div style={{ fontSize: 'clamp(32px, 5vw, 64px)' }} className="mb-4">💥</div>
            <h2 className="text-white font-black mb-2" style={{ fontSize: 'clamp(20px, 3vw, 36px)' }}>
              選擇要摧毀的建築
            </h2>
            <p className="text-gray-400 mb-4" style={{ fontSize: 'clamp(14px, 1.8vw, 22px)' }}>
              選擇對手已有房子的格子
            </p>
            <div className="max-h-48 overflow-y-auto space-y-2 mb-4">
              {ownedCells.map((cell, idx) => {
                if (cell.owner !== opponentId || cell.houses === 0) return null;
                const boardCell = BOARD_CELLS[idx];
                return (
                  <button
                    key={idx}
                    onClick={() => onSelectBuilding(idx, 'destroy')}
                    className="w-full font-bold text-white rounded-xl py-2 px-4 transition-all active:scale-95 hover:brightness-110 text-left"
                    style={{ background: 'rgba(220,38,38,0.4)', border: '1px solid #DC2626' }}
                  >
                    格子 {idx + 1}（{boardCell.label}）— 🏠 × {cell.houses}
                  </button>
                );
              })}
            </div>
            <button
              onClick={onSkip}
              className="w-full font-bold text-gray-400 rounded-xl py-2 px-4 transition-all hover:text-white"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #374151' }}
            >
              跳過
            </button>
          </>
        )}
      </div>
    </div>
  );
}
