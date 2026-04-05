import { useReducer, useCallback, useEffect, useRef, useState } from 'react';
import { useSound } from '@/hooks/useSound';
import type { GameState, GamePhase, TeamId, CardEffect, SpecialCard, Team } from '@/data/types';
import { BOARD_CELLS, yellowQuestions, redQuestions, greenQuestions, chanceCards, destinyCards, shuffleArray, loadExternalCards } from '@/data/questions';
import { GameSetup } from '@/components/GameSetup';
import { GameBoard } from '@/components/GameBoard';
import { ControlBar } from '@/components/ControlBar';
import { CardModal } from '@/components/CardModal';
import { EffectModal } from '@/components/EffectModal';
import { GameOver } from '@/components/GameOver';
import { CardDrawMode } from '@/components/CardDrawMode';
import { CardEditor } from '@/components/CardEditor';

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
  | { type: 'END_GAME' }
  | { type: 'ENTER_CARD_DRAW' }
  | { type: 'ENTER_CARD_EDITOR' }
  | { type: 'BACK_TO_SETUP' }
  | { type: 'EFFECT_MOVE_COMPLETE' };

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
  effectMoveData: null,
  skipTurnReturn: null,
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

    case 'move_forward':
      return { ...newState, teams, phase: 'effect_moving' as GamePhase, effectMoveData: { steps: effect.value || 0, direction: 'forward' } };

    case 'move_backward':
      return { ...newState, teams, phase: 'effect_moving' as GamePhase, effectMoveData: { steps: effect.value || 0, direction: 'backward' } };

    case 'move_to_start':
      return { ...newState, teams, phase: 'effect_moving' as GamePhase, effectMoveData: { steps: 0, direction: 'to_start' } };

    case 'skip_turn':
      teams[teamIdx].skipNextTurn = true;
      return { ...newState, teams, phase: 'rolling' as GamePhase };

    case 'extra_turn':
      // Clear diceValue so the roll button appears for the same team (not showNextTurn)
      return { ...newState, teams, phase: 'rolling' as GamePhase, diceValue: null, message: '再擲一次！' };

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
        // Interactive effects need user input → queue as pendingEffects
        const interactive = ['choose_forward', 'roll_to_move_back', 'upgrade_building', 'destroy_building'];
        // Move effects must be applied LAST so their phase ('effect_moving') isn't overridden
        // by subsequent instant effects (e.g. score_change always returns phase:'rolling')
        const moveTypes = ['move_forward', 'move_backward', 'move_to_start'];

        let result = { ...newState, teams: [...teams] as [Team, Team] };
        const pending: CardEffect[] = [];
        let deferredMove: CardEffect | null = null;

        for (const e of effect.effects) {
          if (interactive.includes(e.type)) {
            pending.push(e);
          } else if (moveTypes.includes(e.type)) {
            deferredMove = e; // apply after all other instant effects
          } else {
            result = processEffect(result, e); // instant: score_change, skip_turn, extra_turn, stay…
          }
        }

        if (pending.length > 0) {
          // Interactive effects take priority; apply deferred move first if present
          if (deferredMove) result = processEffect(result, deferredMove);
          return { ...result, pendingEffects: pending, phase: processEffect(result, pending[0]).phase };
        }
        // Apply deferred move last — its phase ('effect_moving') must not be overridden
        if (deferredMove) return processEffect(result, deferredMove);
        return result;
      }
      return { ...newState, phase: 'rolling' as GamePhase };
    }

    default:
      return { ...newState, phase: 'rolling' as GamePhase };
  }
}

function gameReducerCore(state: GameState, action: GameAction): GameState {
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
        // Opponent territory - pay penalty, transfer to opponent
        const opponentIdx = teamIdx === 0 ? 1 : 0;
        const penalty = 100 + (ownership.houses * 100);
        const deducted = Math.min(teams[teamIdx].score, penalty);
        teams[teamIdx].score = Math.max(0, teams[teamIdx].score - penalty);
        teams[opponentIdx].score += deducted;
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

    case 'CHOOSE_FORWARD_STEPS':
      // Don't move yet — trigger animation; EFFECT_MOVE_COMPLETE applies position
      return { ...state, phase: 'effect_moving', effectMoveData: { steps: action.steps, direction: 'forward' }, message: `前進了${action.steps}步！` };

    case 'ROLL_BACKWARD_COMPLETE':
      // Don't move yet — trigger animation; EFFECT_MOVE_COMPLETE applies position
      return { ...state, phase: 'effect_moving', effectMoveData: { steps: action.diceValue, direction: 'backward' }, message: `後退了${action.diceValue}步！` };

    case 'EFFECT_MOVE_COMPLETE': {
      if (!state.effectMoveData) return { ...state, phase: 'rolling' };
      const teamIdx = state.currentTeam === 'A' ? 0 : 1;
      const opponentIdx = teamIdx === 0 ? 1 : 0;
      const teams: [Team, Team] = [{ ...state.teams[0] }, { ...state.teams[1] }];
      const { steps, direction } = state.effectMoveData;

      // Calculate new position
      let newPos: number;
      if (direction === 'forward') {
        newPos = (teams[teamIdx].position + steps) % 40;
      } else if (direction === 'backward') {
        newPos = (teams[teamIdx].position - steps + 40) % 40;
      } else {
        newPos = 0; // to_start
      }
      teams[teamIdx].position = newPos;

      // Apply landing-cell logic (same rules as normal movement)
      const cell = BOARD_CELLS[newPos];
      const ownership = state.cellOwnership[newPos];
      const remaining = state.pendingEffects.slice(1);
      const baseState = { ...state, teams, effectMoveData: null, pendingEffects: [] };

      if (cell.type === 'start') {
        return { ...baseState, phase: 'rolling', message: '效果移動到起點！' };
      }

      if (cell.type === 'chance' || cell.type === 'destiny') {
        const deckKey = cell.type === 'chance' ? 'chanceDeck' : 'destinyDeck';
        const cards = cell.type === 'chance' ? chanceCards : destinyCards;
        const { cardId, newDeck } = drawFromDeck(state[deckKey], cards.length);
        const card = cards.find(c => c.id === cardId) || cards[0];
        return { ...baseState, [deckKey]: newDeck, currentCard: card, currentCardType: cell.type, phase: 'card_display', message: cell.type === 'chance' ? '抽到機會卡！' : '抽到命運卡！' };
      }

      if (ownership.owner === state.currentTeam) {
        // Own territory — re-challenge
        const deckKey = cell.type === 'yellow' ? 'yellowDeck' : cell.type === 'red' ? 'redDeck' : 'greenDeck';
        const questions = cell.type === 'yellow' ? yellowQuestions : cell.type === 'red' ? redQuestions : greenQuestions;
        const { cardId, newDeck } = drawFromDeck(state[deckKey], questions.length);
        const question = questions.find(q => q.id === cardId) || questions[0];
        return { ...baseState, [deckKey]: newDeck, currentCard: question, currentCardType: cell.type, phase: 'card_display', isOwnTerritory: true, message: '效果移動到自己地盤！可再次挑戰' };
      }

      if (ownership.owner !== null && ownership.owner !== state.currentTeam) {
        // Opponent territory — pay penalty, transfer to opponent
        const penalty = 100 + (ownership.houses * 100);
        const deducted = Math.min(teams[teamIdx].score, penalty);
        teams[teamIdx].score = Math.max(0, teams[teamIdx].score - penalty);
        teams[opponentIdx].score += deducted;
        if (remaining.length > 0) {
          const next = processEffect({ ...baseState, teams }, remaining[0]);
          return { ...next, pendingEffects: remaining };
        }
        return { ...baseState, teams, phase: 'rolling', message: `效果移動到對方地盤！-${penalty}分` };
      }

      // Unowned cell — draw question card
      const deckKey = cell.type === 'yellow' ? 'yellowDeck' : cell.type === 'red' ? 'redDeck' : 'greenDeck';
      const questions = cell.type === 'yellow' ? yellowQuestions : cell.type === 'red' ? redQuestions : greenQuestions;
      const { cardId, newDeck } = drawFromDeck(state[deckKey], questions.length);
      const question = questions.find(q => q.id === cardId) || questions[0];
      return { ...baseState, [deckKey]: newDeck, currentCard: question, currentCardType: cell.type, phase: 'card_display', isOwnTerritory: false, message: '' };
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
        // This team's turn is skipped — but they still trigger the cell they're standing on.
        // Set currentTeam = skipped team, skipTurnReturn = the waiting team.
        // The outer wrapper will auto-switch back once the cell resolves to 'rolling'.
        const skipPos = teams[nextIdx].position;
        const skipCell = BOARD_CELLS[skipPos];
        const skipOwnership = state.cellOwnership[skipPos];
        const opponentIdx = nextIdx === 0 ? 1 : 0;
        const skipBase = { ...state, teams, currentTeam: nextTeam, diceValue: null, skipTurnReturn: state.currentTeam };

        if (skipCell.type === 'start') {
          teams[nextIdx].score += 100;
          return { ...skipBase, teams, phase: 'rolling', message: `${teams[nextIdx].name} 被暫停，停在起點 +100分` };
        }

        if (skipCell.type === 'chance' || skipCell.type === 'destiny') {
          const deckKey = skipCell.type === 'chance' ? 'chanceDeck' : 'destinyDeck';
          const cards = skipCell.type === 'chance' ? chanceCards : destinyCards;
          const { cardId, newDeck } = drawFromDeck(state[deckKey], cards.length);
          const card = cards.find(c => c.id === cardId) || cards[0];
          return { ...skipBase, [deckKey]: newDeck, currentCard: card, currentCardType: skipCell.type, phase: 'card_display', message: `${teams[nextIdx].name} 被暫停，抽到${skipCell.type === 'chance' ? '機會' : '命運'}卡！` };
        }

        if (skipOwnership.owner === nextTeam) {
          const deckKey = skipCell.type === 'yellow' ? 'yellowDeck' : skipCell.type === 'red' ? 'redDeck' : 'greenDeck';
          const questions = skipCell.type === 'yellow' ? yellowQuestions : skipCell.type === 'red' ? redQuestions : greenQuestions;
          const { cardId, newDeck } = drawFromDeck(state[deckKey], questions.length);
          const question = questions.find(q => q.id === cardId) || questions[0];
          return { ...skipBase, [deckKey]: newDeck, currentCard: question, currentCardType: skipCell.type, phase: 'card_display', isOwnTerritory: true, message: `${teams[nextIdx].name} 被暫停，在自己地盤上！可再次挑戰` };
        }

        if (skipOwnership.owner !== null && skipOwnership.owner !== nextTeam) {
          const penalty = 100 + (skipOwnership.houses * 100);
          const deducted = Math.min(teams[nextIdx].score, penalty);
          teams[nextIdx].score = Math.max(0, teams[nextIdx].score - penalty);
          teams[opponentIdx].score += deducted;
          return { ...skipBase, teams, phase: 'rolling', message: `${teams[nextIdx].name} 被暫停，踩到對方地盤！-${penalty}分` };
        }

        // Unowned question cell
        const deckKey = skipCell.type === 'yellow' ? 'yellowDeck' : skipCell.type === 'red' ? 'redDeck' : 'greenDeck';
        const questions = skipCell.type === 'yellow' ? yellowQuestions : skipCell.type === 'red' ? redQuestions : greenQuestions;
        const { cardId, newDeck } = drawFromDeck(state[deckKey], questions.length);
        const question = questions.find(q => q.id === cardId) || questions[0];
        return { ...skipBase, [deckKey]: newDeck, currentCard: question, currentCardType: skipCell.type, phase: 'card_display', isOwnTerritory: false, message: `${teams[nextIdx].name} 被暫停，觸發格子！` };
      }

      return { ...state, teams, currentTeam: nextTeam, phase: 'rolling', diceValue: null, message: `換 ${teams[nextIdx].name} 擲骰子` };
    }

    case 'END_GAME':
      return { ...state, phase: 'game_over' };

    case 'ENTER_CARD_DRAW':
      return { ...state, phase: 'card_draw' };

    case 'ENTER_CARD_EDITOR':
      return { ...state, phase: 'card_editor' };

    case 'BACK_TO_SETUP':
      return { ...initialState };

    default:
      return state;
  }
}

// Outer wrapper: after any action, if a skip-turn's cell event resolved back to 'rolling',
// automatically hand control back to the team that was waiting.
function gameReducer(state: GameState, action: GameAction): GameState {
  const next = gameReducerCore(state, action);
  if (next.skipTurnReturn !== null && next.phase === 'rolling') {
    const returnTeam = next.skipTurnReturn;
    const returnIdx = returnTeam === 'A' ? 0 : 1;
    return {
      ...next,
      currentTeam: returnTeam,
      skipTurnReturn: null,
      diceValue: null,
      message: next.message || `換 ${next.teams[returnIdx].name} 擲骰子`,
    };
  }
  return next;
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const sound = useSound();
  const [cardsLoaded, setCardsLoaded] = useState(false);
  const [lastTeamNames, setLastTeamNames] = useState({ a: 'A隊', b: 'B隊' });

  // Dice animation state for roll_for_backward (in EffectModal)
  const [backwardDiceRolling, setBackwardDiceRolling] = useState(false);
  const [backwardDiceDisplay, setBackwardDiceDisplay] = useState<number | null>(null);

  // Load external cards.json on mount (before any game interaction)
  useEffect(() => {
    loadExternalCards().finally(() => setCardsLoaded(true));
  }, []);

  // Animation state
  const [displayPositions, setDisplayPositions] = useState<{ A: number; B: number } | null>(null);
  const [animatingCell, setAnimatingCell] = useState<number | null>(null);
  const [diceRolling, setDiceRolling] = useState(false);
  const [diceDisplay, setDiceDisplay] = useState<number | null>(null);
  const [diceSettled, setDiceSettled] = useState(false);
  const animCancelRef = useRef(false);

  // Dice rolling animation + pause, then step-by-step movement
  useEffect(() => {
    if (state.phase !== 'moving' || !state.diceValue) return;

    animCancelRef.current = false;
    const finalValue = state.diceValue;

    // Phase 1: Dice rolling animation (tumbling random numbers)
    setDiceRolling(true);
    setDiceSettled(false);
    sound.playRoll();
    let rollCount = 0;
    const maxRolls = 10;
    const rollInterval = setInterval(() => {
      if (animCancelRef.current) { clearInterval(rollInterval); return; }
      rollCount++;
      setDiceDisplay(Math.floor(Math.random() * 6) + 1);
      if (rollCount >= maxRolls) {
        clearInterval(rollInterval);
        // Phase 2: Show final value and pause
        setDiceDisplay(finalValue);
        setDiceRolling(false);
        setDiceSettled(true);
        sound.playDiceLand();
      }
    }, 80);

    // Phase 3: After dice settles, pause 1s, then start moving
    const moveDelay = setTimeout(() => {
      if (animCancelRef.current) return;

      const teamIdx = state.currentTeam === 'A' ? 0 : 1;
      const startPos = state.teams[teamIdx].position;
      const totalSteps = finalValue;
      let step = 0;
      const otherTeam = state.currentTeam === 'A' ? 'B' : 'A';
      const otherPos = state.teams[state.currentTeam === 'A' ? 1 : 0].position;

      const doStep = () => {
        if (animCancelRef.current) return;
        step++;
        const pos = (startPos + step) % 40;

        setDisplayPositions({
          [state.currentTeam]: pos,
          [otherTeam]: otherPos,
        } as { A: number; B: number });
        setAnimatingCell(pos);
        sound.playStep();

        if (step < totalSteps) {
          setTimeout(doStep, 330);
        } else {
          setTimeout(() => {
            if (!animCancelRef.current) {
              setAnimatingCell(null);
              setDisplayPositions(null);
              setDiceDisplay(null);
              dispatch({ type: 'MOVE_COMPLETE' });
            }
          }, 450);
        }
      };
      doStep();
    }, 80 * maxRolls + 1000); // rolling time + 1s pause

    return () => {
      animCancelRef.current = true;
      clearInterval(rollInterval);
      clearTimeout(moveDelay);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.diceValue]);

  // Card-effect movement animation (move_forward / move_backward / move_to_start / choose_forward / roll_backward)
  useEffect(() => {
    if (state.phase !== 'effect_moving' || !state.effectMoveData) return;

    animCancelRef.current = false;
    const { steps, direction } = state.effectMoveData;
    const teamIdx = state.currentTeam === 'A' ? 0 : 1;
    const startPos = state.teams[teamIdx].position;
    const otherTeam: TeamId = state.currentTeam === 'A' ? 'B' : 'A';
    const otherPos = state.teams[teamIdx === 0 ? 1 : 0].position;

    // For to_start: animate a few steps backward then warp to 0
    const animSteps = direction === 'to_start'
      ? (startPos === 0 ? 0 : Math.min(4, startPos))
      : steps;

    if (animSteps === 0) {
      dispatch({ type: 'EFFECT_MOVE_COMPLETE' });
      return;
    }

    let step = 0;
    const stepDelay = direction === 'to_start' ? 180 : 260;

    const doStep = () => {
      if (animCancelRef.current) return;
      step++;

      let pos: number;
      if (direction === 'forward') {
        pos = (startPos + step) % 40;
      } else if (direction === 'backward') {
        pos = (startPos - step + 40) % 40;
      } else {
        // to_start: animate backward then snap to 0 on last step
        pos = step >= animSteps ? 0 : (startPos - step + 40) % 40;
      }

      setDisplayPositions({ [state.currentTeam]: pos, [otherTeam]: otherPos } as { A: number; B: number });
      setAnimatingCell(pos);
      sound.playStep();

      if (step < animSteps) {
        setTimeout(doStep, stepDelay);
      } else {
        setTimeout(() => {
          if (!animCancelRef.current) {
            setAnimatingCell(null);
            setDisplayPositions(null);
            dispatch({ type: 'EFFECT_MOVE_COMPLETE' });
          }
        }, 380);
      }
    };
    doStep();

    return () => { animCancelRef.current = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.effectMoveData]);

  // Play sound effects on phase/card transitions and game events
  const prevPhaseRef = useRef(state.phase);
  const prevMsgRef = useRef(state.message);
  useEffect(() => {
    // Phase-based sounds
    if (prevPhaseRef.current !== state.phase) {
      prevPhaseRef.current = state.phase;
      if (state.phase === 'card_display') {
        if (state.currentCardType === 'yellow') sound.playLandYellow();
        else if (state.currentCardType === 'red') sound.playLandRed();
        else if (state.currentCardType === 'green') sound.playLandGreen();
        else if (state.currentCardType === 'chance') sound.playChance();
        else if (state.currentCardType === 'destiny') sound.playDestiny();
      }
      if (state.phase === 'game_over') sound.playGameOver();
    }
    // Message-based sounds
    if (prevMsgRef.current !== state.message && state.message) {
      prevMsgRef.current = state.message;
      if (state.message.includes('對方地盤')) sound.playPenalty();
      if (state.message.includes('起點')) sound.playPassStart();
      if (state.message.includes('暫停一回合')) sound.playSkipTurn();
    }
  });

  const handleStartGame = useCallback((a: string, b: string) => {
    setLastTeamNames({ a, b });
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

  const handleEndGame = useCallback(() => {
    sound.playGameOver();
    dispatch({ type: 'END_GAME' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChooseSteps = useCallback((steps: number) => {
    dispatch({ type: 'CHOOSE_FORWARD_STEPS', steps });
  }, []);

  const handleRollBackward = useCallback(() => {
    const finalValue = Math.floor(Math.random() * 6) + 1;
    sound.playRoll();
    setBackwardDiceRolling(true);
    setBackwardDiceDisplay(null);
    let rollCount = 0;
    const maxRolls = 10;
    const rollInterval = setInterval(() => {
      rollCount++;
      setBackwardDiceDisplay(Math.floor(Math.random() * 6) + 1);
      if (rollCount >= maxRolls) {
        clearInterval(rollInterval);
        setBackwardDiceDisplay(finalValue);
        setBackwardDiceRolling(false);
        // Brief pause to show final value, then dispatch
        setTimeout(() => {
          setBackwardDiceDisplay(null);
          dispatch({ type: 'ROLL_BACKWARD_COMPLETE', diceValue: finalValue });
        }, 900);
      }
    }, 80);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectBuilding = useCallback((cellId: number, action: 'upgrade' | 'destroy') => {
    if (action === 'upgrade') sound.playHouse();
    else if (action === 'destroy') sound.playDestroy();
    dispatch({ type: 'SELECT_BUILDING', cellId, action });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSkipBuilding = useCallback(() => dispatch({ type: 'SKIP_BUILDING_SELECT' }), []);

  const handleEnterCardDraw = useCallback(() => {
    dispatch({ type: 'ENTER_CARD_DRAW' });
  }, []);

  const handleEnterCardEditor = useCallback(() => {
    dispatch({ type: 'ENTER_CARD_EDITOR' });
  }, []);

  const handleBackToSetup = useCallback(() => {
    // Reload external cards in case they were edited
    loadExternalCards().then(() => dispatch({ type: 'BACK_TO_SETUP' }));
  }, []);

  // Show loading while fetching cards.json
  if (!cardsLoaded) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <p className="text-gray-400 font-bold animate-pulse" style={{ fontSize: 'clamp(18px, 3vw, 32px)' }}>
          載入卡片資料中...
        </p>
      </div>
    );
  }

  if (state.phase === 'setup') {
    return <GameSetup onStartGame={handleStartGame} onCardDrawMode={handleEnterCardDraw} onCardEditor={handleEnterCardEditor} initialTeamA={lastTeamNames.a} initialTeamB={lastTeamNames.b} />;
  }

  if (state.phase === 'card_draw') {
    return <CardDrawMode onBack={handleBackToSetup} />;
  }

  if (state.phase === 'card_editor') {
    return <CardEditor onBack={handleBackToSetup} />;
  }

  if (state.phase === 'game_over') {
    return <GameOver teams={state.teams} onRestart={() => { loadExternalCards().then(() => dispatch({ type: 'BACK_TO_SETUP' })); }} />;
  }

  const isSpecialCard = state.currentCardType === 'chance' || state.currentCardType === 'destiny';
  const showCardModal = state.phase === 'card_display' && state.currentCard;
  const showEffectModal =
    state.phase === 'choose_forward' ||
    state.phase === 'roll_for_backward' ||
    state.phase === 'select_building_upgrade' ||
    state.phase === 'select_building_destroy' ||
    backwardDiceRolling; // keep modal visible while dice animation runs

  // Show "next turn" button when we're back to rolling after a completed action
  const showNextTurn = state.phase === 'rolling' && state.diceValue !== null;

  return (
    <div className="w-screen h-screen bg-white flex flex-col overflow-hidden">
      {/* Game board: fills all space above the control bar */}
      <div className="flex-1 relative overflow-hidden">
        <GameBoard
          state={state}
          displayPositions={displayPositions}
          animatingCell={animatingCell}
          diceDisplay={diceDisplay}
          diceRolling={diceRolling}
          diceSettled={diceSettled}
        />
      </div>
      <ControlBar
        teams={state.teams}
        currentTeam={state.currentTeam}
        diceValue={state.diceValue}
        diceDisplay={diceDisplay}
        diceRolling={diceRolling}
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
          backwardDiceRolling={backwardDiceRolling}
          backwardDiceDisplay={backwardDiceDisplay}
        />
      )}
    </div>
  );
}
