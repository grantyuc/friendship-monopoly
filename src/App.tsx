import { useReducer, useCallback, useEffect, useRef, useState } from 'react';
import { useSound } from '@/hooks/useSound';
import type { GameState, GamePhase, TeamId, CardEffect, SpecialCard, Team } from '@/data/types';
import { BOARD_CELLS, yellowQuestions, redQuestions, greenQuestions, chanceCards, destinyCards, shuffleArray } from '@/data/questions';
import { GameSetup } from '@/components/GameSetup';
import { GameBoard } from '@/components/GameBoard';
import { ControlBar } from '@/components/ControlBar';
import { CardModal } from '@/components/CardModal';
import { EffectModal } from '@/components/EffectModal';
import { GameOver } from '@/components/GameOver';

type GameAction =
  | { type: 'START_GAME'; teamAName: string; teamBName: string }
  | { type: 'ROLL_DICE' }
  | { type: 'MOVE_COMPLETE' }
  | { type: 'COMPLETE_TASK' }
  | { type: 'FAIL_TASK' }
  | { type: 'RECHALLENGE_SUCCESS' }
  | { type: 'CONFIRM_SPECIAL_CARD' }
  | { type: 'EXECUTE_EFFECT'; effect: CardEffect }
  | { type: 'CHOOSE_FORWARD_STEPS'; steps: number }
  | { type: 'ROLL_BACKWARD_COMPLETE'; diceValue: number }
  | { type: 'SELECT_BUILDING'; cellId: number; action: 'upgrade' | 'destroy' }
  | { type: 'SKIP_BUILDING_SELECT' }
  | { type: 'NEXT_TURN' }
  | { type: 'END_GAME' };

const initialState: GameState = {
  phase: 'setup',
  teams: [
    { id: 'A', name: 'A隊', score: 1500, position: 0, color: '#3B82F6', skipNextTurn: false },
    { id: 'B', name: 'B隊', score: 1500, position: 0, color: '#F97316', skipNextTurn: false },
  ],
  currentTeam: 'A',
  cellOwnership: Array(40).fill(null).map(() => ({ owner: null, houses: 0 })),
  diceValue: null,
  currentCard: null,
  currentCardType: null,
  yellowDeck: [],
  redDeck: [],
  greenDeck: [],
  chanceDeck: [],
  destinyDeck: [],
  message: '',
  passedStart: false,
  isOwnTerritory: false,
  pendingEffects: [],
};

function drawFromDeck(deck: number[], totalCards: number): { cardId: number; newDeck: number[] } {
  if (deck.length === 0) {
    // Reshuffle
    const newDeck = shuffleArray(Array.from({ length: totalCards }, (_, i) => i + 1));
    return { cardId: newDeck[0], newDeck: newDeck.slice(1) };
  }
  return { cardId: deck[0], newDeck: deck.slice(1) };
}

function processEffect(state: GameState, effect: CardEffect): GameState {
  const newState = { ...state };
  const teamIdx = state.currentTeam === 'A' ? 0 : 1;
  const teams: [Team, Team] = [{ ...state.teams[0] }, { ...state.teams[1] }];

  switch (effect.type) {
    case 'score_change':
      teams[teamIdx].score = Math.max(0, teams[teamIdx].score + (effect.value || 0));
      return { ...newState, teams, phase: 'rolling' as GamePhase };

    case 'move_forward': {
      const newPos = (teams[teamIdx].position + (effect.value || 0)) % 40;
      teams[teamIdx].position = newPos;
      return { ...newState, teams, phase: 'rolling' as GamePhase };
    }

    case 'move_backward': {
      const newPos = (teams[teamIdx].position - (effect.value || 0) + 40) % 40;
      teams[teamIdx].position = newPos;
      return { ...newState, teams, phase: 'rolling' as GamePhase };
    }

    case 'move_to_start':
      teams[teamIdx].position = 0;
      return { ...newState, teams, phase: 'rolling' as GamePhase };

    case 'skip_turn':
      teams[teamIdx].skipNextTurn = true;
      return { ...newState, teams, phase: 'rolling' as GamePhase };

    case 'extra_turn':
      // Don't switch turns - stay on rolling for same team
      return { ...newState, teams, phase: 'rolling' as GamePhase, message: '再擲一次！' };

    case 'choose_forward':
      return { ...newState, phase: 'choose_forward' as GamePhase };

    case 'roll_to_move_back':
      return { ...newState, phase: 'roll_for_backward' as GamePhase };

    case 'upgrade_building':
      return { ...newState, phase: 'select_building_upgrade' as GamePhase };

    case 'destroy_building':
      return { ...newState, phase: 'select_building_destroy' as GamePhase };

    case 'stay':
      return { ...newState, phase: 'rolling' as GamePhase, message: '原地停留' };

    case 'composite': {
      if (effect.effects && effect.effects.length > 0) {
        // Process non-interactive effects immediately, queue interactive ones
        const interactive = ['choose_forward', 'roll_to_move_back', 'upgrade_building', 'destroy_building'];
        let result = { ...newState, teams: [...teams] as [Team, Team] };
        const pending: CardEffect[] = [];

        for (const e of effect.effects) {
          if (interactive.includes(e.type)) {
            pending.push(e);
          } else {
            result = processEffect(result, e);
          }
        }

        if (pending.length > 0) {
          return { ...result, pendingEffects: pending, phase: processEffect(result, pending[0]).phase };
        }
        return { ...result, phase: 'rolling' as GamePhase };
      }
      return { ...newState, phase: 'rolling' as GamePhase };
    }

    default:
      return { ...newState, phase: 'rolling' as GamePhase };
  }
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      return {
        ...initialState,
        phase: 'rolling',
        teams: [
          { ...initialState.teams[0], name: action.teamAName || 'A隊' },
          { ...initialState.teams[1], name: action.teamBName || 'B隊' },
        ] as [Team, Team],
        yellowDeck: shuffleArray(yellowQuestions.map(q => q.id)),
        redDeck: shuffleArray(redQuestions.map(q => q.id)),
        greenDeck: shuffleArray(greenQuestions.map(q => q.id)),
        chanceDeck: shuffleArray(chanceCards.map(c => c.id)),
        destinyDeck: shuffleArray(destinyCards.map(c => c.id)),
      };
    }

    case 'ROLL_DICE': {
      if (state.phase !== 'rolling') return state;
      const diceValue = Math.floor(Math.random() * 6) + 1;
      return { ...state, diceValue, phase: 'moving', message: '' };
    }

    case 'MOVE_COMPLETE': {
      if (state.phase !== 'moving' || !state.diceValue) return state;

      const teamIdx = state.currentTeam === 'A' ? 0 : 1;
      const oldPos = state.teams[teamIdx].position;
      const newPos = (oldPos + state.diceValue) % 40;
      const passedStart = (oldPos + state.diceValue) >= 40 && newPos !== 0;

      const teams: [Team, Team] = [{ ...state.teams[0] }, { ...state.teams[1] }];
      teams[teamIdx].position = newPos;
      if (passedStart) {
        teams[teamIdx].score += 100;
      }

      const cell = BOARD_CELLS[newPos];
      const ownership = state.cellOwnership[newPos];

      // Determine what happens on landing
      if (cell.type === 'start') {
        // Landed on start - just +100 if didn't already get it
        if (!passedStart) teams[teamIdx].score += 100;
        return { ...state, teams, phase: 'rolling', passedStart, message: '回到起點！+100分' };
      }

      if (cell.type === 'chance' || cell.type === 'destiny') {
        // Draw a special card
        const deckKey = cell.type === 'chance' ? 'chanceDeck' : 'destinyDeck';
        const cards = cell.type === 'chance' ? chanceCards : destinyCards;
        const { cardId, newDeck } = drawFromDeck(state[deckKey], cards.length);
        const card = cards.find(c => c.id === cardId) || cards[0];

        return {
          ...state,
          teams,
          [deckKey]: newDeck,
          currentCard: card,
          currentCardType: cell.type,
          phase: 'card_display',
          passedStart,
          message: cell.type === 'chance' ? '抽到機會卡！' : '抽到命運卡！',
        };
      }

      // Question cell (yellow/red/green)
      if (ownership.owner === state.currentTeam) {
        // Own territory - can re-challenge for a house
        const deckKey = cell.type === 'yellow' ? 'yellowDeck' : cell.type === 'red' ? 'redDeck' : 'greenDeck';
        const questions = cell.type === 'yellow' ? yellowQuestions : cell.type === 'red' ? redQuestions : greenQuestions;
        const { cardId, newDeck } = drawFromDeck(state[deckKey], questions.length);
        const question = questions.find(q => q.id === cardId) || questions[0];

        return {
          ...state,
          teams,
          [deckKey]: newDeck,
          currentCard: question,
          currentCardType: cell.type,
          phase: 'card_display',
          passedStart,
          isOwnTerritory: true,
          message: '踩到自己的地盤！可再次挑戰蓋房子',
        };
      }

      if (ownership.owner !== null && ownership.owner !== state.currentTeam) {
        // Opponent territory - pay penalty
        const penalty = 100 + (ownership.houses * 100);
        teams[teamIdx].score = Math.max(0, teams[teamIdx].score - penalty);
        return {
          ...state,
          teams,
          phase: 'rolling',
          passedStart,
          message: `踩到對方地盤！-${penalty}分`,
        };
      }

      // Empty cell - draw question
      const deckKey = cell.type === 'yellow' ? 'yellowDeck' : cell.type === 'red' ? 'redDeck' : 'greenDeck';
      const questions = cell.type === 'yellow' ? yellowQuestions : cell.type === 'red' ? redQuestions : greenQuestions;
      const { cardId, newDeck } = drawFromDeck(state[deckKey], questions.length);
      const question = questions.find(q => q.id === cardId) || questions[0];

      return {
        ...state,
        teams,
        [deckKey]: newDeck,
        currentCard: question,
        currentCardType: cell.type,
        phase: 'card_display',
        passedStart,
        isOwnTerritory: false,
        message: '',
      };
    }

    case 'COMPLETE_TASK': {
      const teamIdx = state.currentTeam === 'A' ? 0 : 1;
      const cellId = state.teams[teamIdx].position;
      const teams: [Team, Team] = [{ ...state.teams[0] }, { ...state.teams[1] }];
      const ownership = [...state.cellOwnership];

      if (state.isOwnTerritory) {
        // Re-challenge success: add a house
        if (ownership[cellId].houses < 2) {
          ownership[cellId] = { ...ownership[cellId], houses: ownership[cellId].houses + 1 };
        }
        teams[teamIdx].score += 100;
        return {
          ...state, teams, cellOwnership: ownership,
          phase: 'rolling', currentCard: null, currentCardType: null,
          isOwnTerritory: false, message: '挑戰成功！蓋了一棟房子 +100分',
        };
      }

      // Normal completion: claim the cell
      ownership[cellId] = { owner: state.currentTeam, houses: 0 };
      teams[teamIdx].score += 100;
      return {
        ...state, teams, cellOwnership: ownership,
        phase: 'rolling', currentCard: null, currentCardType: null,
        message: '任務完成！佔領土地 +100分',
      };
    }

    case 'FAIL_TASK': {
      return {
        ...state,
        phase: 'rolling',
        currentCard: null,
        currentCardType: null,
        isOwnTerritory: false,
        message: '任務未完成',
      };
    }

    case 'CONFIRM_SPECIAL_CARD': {
      // Process the special card effect
      if (state.currentCard && 'effect' in state.currentCard) {
        const card = state.currentCard as SpecialCard;
        const result = processEffect(state, card.effect);
        return { ...result, currentCard: null, currentCardType: null };
      }
      return { ...state, phase: 'rolling', currentCard: null, currentCardType: null };
    }

    case 'EXECUTE_EFFECT': {
      const result = processEffect(state, action.effect);
      return { ...result, currentCard: null, currentCardType: null };
    }

    case 'CHOOSE_FORWARD_STEPS': {
      const teamIdx = state.currentTeam === 'A' ? 0 : 1;
      const teams: [Team, Team] = [{ ...state.teams[0] }, { ...state.teams[1] }];
      teams[teamIdx].position = (teams[teamIdx].position + action.steps) % 40;

      // Process remaining pending effects
      const remaining = state.pendingEffects.slice(1);
      if (remaining.length > 0) {
        return { ...state, teams, pendingEffects: remaining, phase: processEffect(state, remaining[0]).phase };
      }
      return { ...state, teams, phase: 'rolling', pendingEffects: [], message: `前進了${action.steps}步！` };
    }

    case 'ROLL_BACKWARD_COMPLETE': {
      const teamIdx = state.currentTeam === 'A' ? 0 : 1;
      const teams: [Team, Team] = [{ ...state.teams[0] }, { ...state.teams[1] }];
      teams[teamIdx].position = (teams[teamIdx].position - action.diceValue + 40) % 40;

      const remaining = state.pendingEffects.slice(1);
      if (remaining.length > 0) {
        return { ...state, teams, pendingEffects: remaining, phase: processEffect(state, remaining[0]).phase };
      }
      return { ...state, teams, phase: 'rolling', pendingEffects: [], message: `後退了${action.diceValue}步！` };
    }

    case 'SELECT_BUILDING': {
      const ownership = [...state.cellOwnership];
      const cell = ownership[action.cellId];

      if (action.action === 'upgrade' && cell.owner === state.currentTeam && cell.houses < 2) {
        ownership[action.cellId] = { ...cell, houses: cell.houses + 1 };
      } else if (action.action === 'destroy') {
        // Destroy opponent building
        const opponentId = state.currentTeam === 'A' ? 'B' : 'A';
        if (cell.owner === opponentId && cell.houses > 0) {
          ownership[action.cellId] = { ...cell, houses: cell.houses - 1 };
        }
      }

      const remaining = state.pendingEffects.slice(1);
      if (remaining.length > 0) {
        return { ...state, cellOwnership: ownership, pendingEffects: remaining, phase: processEffect(state, remaining[0]).phase };
      }
      return { ...state, cellOwnership: ownership, phase: 'rolling', pendingEffects: [], message: action.action === 'upgrade' ? '建築已升級！' : '建築已摧毀！' };
    }

    case 'SKIP_BUILDING_SELECT': {
      const remaining = state.pendingEffects.slice(1);
      if (remaining.length > 0) {
        return { ...state, pendingEffects: remaining, phase: processEffect(state, remaining[0]).phase };
      }
      return { ...state, phase: 'rolling', pendingEffects: [] };
    }

    case 'NEXT_TURN': {
      const nextTeam: TeamId = state.currentTeam === 'A' ? 'B' : 'A';
      const nextIdx = nextTeam === 'A' ? 0 : 1;
      const teams: [Team, Team] = [{ ...state.teams[0] }, { ...state.teams[1] }];

      if (teams[nextIdx].skipNextTurn) {
        teams[nextIdx].skipNextTurn = false;
        // Skip this team, back to current team
        return { ...state, teams, phase: 'rolling', diceValue: null, message: `${teams[nextIdx].name} 被暫停一回合！` };
      }

      return { ...state, teams, currentTeam: nextTeam, phase: 'rolling', diceValue: null, message: `換 ${teams[nextIdx].name} 擲骰子` };
    }

    case 'END_GAME':
      return { ...state, phase: 'game_over' };

    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const sound = useSound();

  // Animation state: during 'moving' phase, we show the token stepping cell-by-cell
  const [displayPositions, setDisplayPositions] = useState<{ A: number; B: number } | null>(null);
  const [animatingCell, setAnimatingCell] = useState<number | null>(null);
  const animCancelRef = useRef(false);

  // Step-by-step movement animation: triggered when phase becomes 'moving'
  useEffect(() => {
    if (state.phase !== 'moving' || !state.diceValue) return;

    animCancelRef.current = false;
    const teamIdx = state.currentTeam === 'A' ? 0 : 1;
    const startPos = state.teams[teamIdx].position;
    const totalSteps = state.diceValue;
    let step = 0;

    // Base display positions (static team not moving stays at their real position)
    const otherTeam = state.currentTeam === 'A' ? 'B' : 'A';
    const otherPos = state.teams[state.currentTeam === 'A' ? 1 : 0].position;

    sound.playRoll();

    const doStep = () => {
      if (animCancelRef.current) return;
      step++;
      const pos = (startPos + step) % 40;

      const newDisplayPos = {
        [state.currentTeam]: pos,
        [otherTeam]: otherPos,
      } as { A: number; B: number };

      setDisplayPositions(newDisplayPos);
      setAnimatingCell(pos);
      sound.playStep();

      if (step < totalSteps) {
        setTimeout(doStep, 330);
      } else {
        // Finished all steps — wait a beat, then trigger MOVE_COMPLETE
        setTimeout(() => {
          if (!animCancelRef.current) {
            setAnimatingCell(null);
            setDisplayPositions(null);
            dispatch({ type: 'MOVE_COMPLETE' });
          }
        }, 450);
      }
    };

    // Small delay after dice roll before starting movement
    const t = setTimeout(doStep, 350);
    return () => {
      animCancelRef.current = true;
      clearTimeout(t);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.diceValue]);

  // Play sound effects on phase/card transitions
  const prevPhaseRef = useRef(state.phase);
  useEffect(() => {
    if (prevPhaseRef.current !== state.phase) {
      prevPhaseRef.current = state.phase;
      if (state.phase === 'card_display') {
        if (state.currentCardType === 'yellow') sound.playLandYellow();
        else if (state.currentCardType === 'red') sound.playLandRed();
        else if (state.currentCardType === 'green') sound.playLandGreen();
        else if (state.currentCardType === 'chance') sound.playChance();
        else if (state.currentCardType === 'destiny') sound.playDestiny();
      }
    }
  });

  const handleStartGame = useCallback((a: string, b: string) => {
    dispatch({ type: 'START_GAME', teamAName: a, teamBName: b });
  }, []);

  // Roll dice: just dispatch; the useEffect above handles animation + MOVE_COMPLETE
  const handleRollDice = useCallback(() => {
    dispatch({ type: 'ROLL_DICE' });
  }, []);

  const handleCompleteTask = useCallback(() => {
    sound.playSuccess();
    dispatch({ type: 'COMPLETE_TASK' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFailTask = useCallback(() => {
    sound.playFail();
    dispatch({ type: 'FAIL_TASK' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfirmSpecial = useCallback(() => {
    dispatch({ type: 'CONFIRM_SPECIAL_CARD' });
  }, []);

  const handleNextTurn = useCallback(() => {
    sound.playNextTurn();
    dispatch({ type: 'NEXT_TURN' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEndGame = useCallback(() => dispatch({ type: 'END_GAME' }), []);

  const handleChooseSteps = useCallback((steps: number) => {
    dispatch({ type: 'CHOOSE_FORWARD_STEPS', steps });
  }, []);

  const handleRollBackward = useCallback(() => {
    const dv = Math.floor(Math.random() * 6) + 1;
    sound.playRoll();
    dispatch({ type: 'ROLL_BACKWARD_COMPLETE', diceValue: dv });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectBuilding = useCallback((cellId: number, action: 'upgrade' | 'destroy') => {
    if (action === 'upgrade') sound.playHouse();
    dispatch({ type: 'SELECT_BUILDING', cellId, action });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSkipBuilding = useCallback(() => dispatch({ type: 'SKIP_BUILDING_SELECT' }), []);

  if (state.phase === 'setup') {
    return <GameSetup onStartGame={handleStartGame} />;
  }

  if (state.phase === 'game_over') {
    return <GameOver teams={state.teams} onRestart={() => window.location.reload()} />;
  }

  const isSpecialCard = state.currentCardType === 'chance' || state.currentCardType === 'destiny';
  const showCardModal = state.phase === 'card_display' && state.currentCard;
  const showEffectModal =
    state.phase === 'choose_forward' ||
    state.phase === 'roll_for_backward' ||
    state.phase === 'select_building_upgrade' ||
    state.phase === 'select_building_destroy';

  // Show "next turn" button when we're back to rolling after a completed action
  const showNextTurn = state.phase === 'rolling' && state.diceValue !== null;

  return (
    <div className="w-screen h-screen bg-gray-800 flex flex-col overflow-hidden">
      {/* Game board: fills all space above the control bar */}
      <div className="flex-1 relative overflow-hidden">
        <GameBoard
          state={state}
          displayPositions={displayPositions}
          animatingCell={animatingCell}
        />
      </div>
      <ControlBar
        teams={state.teams}
        currentTeam={state.currentTeam}
        diceValue={state.diceValue}
        phase={state.phase}
        message={state.message}
        isMoving={state.phase === 'moving'}
        showNextTurn={showNextTurn}
        onRollDice={handleRollDice}
        onNextTurn={handleNextTurn}
        onEndGame={handleEndGame}
      />
      {showCardModal && (
        <CardModal
          card={state.currentCard!}
          cardType={state.currentCardType!}
          isOwnTerritory={state.isOwnTerritory}
          onComplete={isSpecialCard ? handleConfirmSpecial : handleCompleteTask}
          onFail={isSpecialCard ? handleConfirmSpecial : handleFailTask}
        />
      )}
      {showEffectModal && (
        <EffectModal
          phase={state.phase}
          ownedCells={state.cellOwnership}
          currentTeam={state.currentTeam}
          onChooseSteps={handleChooseSteps}
          onRollBackward={handleRollBackward}
          onSelectBuilding={handleSelectBuilding}
          onSkip={handleSkipBuilding}
        />
      )}
    </div>
  );
}
