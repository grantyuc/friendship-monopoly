import { Button } from '@/components/ui/button';
import type { GamePhase, CellOwnership, TeamId } from '@/data/types';
import { BOARD_CELLS } from '@/data/questions';

interface EffectModalProps {
  phase: GamePhase;
  ownedCells: CellOwnership[];
  currentTeam: TeamId;
  onChooseSteps: (steps: number) => void;
  onRollBackward: () => void;
  onSelectBuilding: (cellId: number, action: 'upgrade' | 'destroy') => void;
  onSkip: () => void;
}

export function EffectModal({ phase, ownedCells, currentTeam, onChooseSteps, onRollBackward, onSelectBuilding, onSkip }: EffectModalProps) {
  const opponentId = currentTeam === 'A' ? 'B' : 'A';

  // Get cells owned by current team (for upgrade)
  const myUpgradableCells = ownedCells
    .map((c, idx) => ({ ...c, idx }))
    .filter(c => c.owner === currentTeam && c.houses < 2);

  // Get opponent cells with houses (for destroy)
  const opponentCellsWithHouses = ownedCells
    .map((c, idx) => ({ ...c, idx }))
    .filter(c => c.owner === opponentId && c.houses > 0);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full animate-slide-up">

        {phase === 'choose_forward' && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">🎯 選擇前進步數</h2>
            <p className="text-gray-600 mb-6">點擊數字選擇要前進幾步</p>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map(step => (
                <Button
                  key={step}
                  onClick={() => onChooseSteps(step)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-3xl py-6 rounded-xl transform hover:scale-110 transition-all"
                >
                  {step}
                </Button>
              ))}
            </div>
          </>
        )}

        {phase === 'roll_for_backward' && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">🎲 擲骰決定後退步數</h2>
            <p className="text-gray-600 mb-6">點擊按鈕擲骰子</p>
            <Button
              onClick={onRollBackward}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold text-2xl py-6 rounded-xl transform hover:scale-105 transition-all"
            >
              🎲 擲骰子
            </Button>
          </>
        )}

        {phase === 'select_building_upgrade' && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">🏠 選擇要升級的建築</h2>
            <p className="text-gray-600 mb-4">選擇一塊你擁有的土地來蓋房子</p>
            {myUpgradableCells.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {myUpgradableCells.map(c => (
                  <Button
                    key={c.idx}
                    onClick={() => onSelectBuilding(c.idx, 'upgrade')}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl"
                  >
                    {BOARD_CELLS[c.idx].label} ({c.houses}🏠)
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mb-4">目前沒有可升級的建築</p>
            )}
            <Button onClick={onSkip} className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-xl">
              跳過
            </Button>
          </>
        )}

        {phase === 'select_building_destroy' && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">💥 選擇要摧毀的對方建築</h2>
            <p className="text-gray-600 mb-4">選擇對方一塊有房子的土地來摧毀</p>
            {opponentCellsWithHouses.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {opponentCellsWithHouses.map(c => (
                  <Button
                    key={c.idx}
                    onClick={() => onSelectBuilding(c.idx, 'destroy')}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl"
                  >
                    {BOARD_CELLS[c.idx].label} ({c.houses}🏠)
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mb-4">對方目前沒有可摧毀的建築</p>
            )}
            <Button onClick={onSkip} className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-xl">
              跳過
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
