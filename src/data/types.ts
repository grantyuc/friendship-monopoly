export type CellType = 'start' | 'yellow' | 'red' | 'green' | 'chance' | 'destiny';
export type TeamId = 'A' | 'B';

export type GamePhase =
  | 'setup'
  | 'card_draw'
  | 'card_editor'
  | 'rolling'
  | 'moving'
  | 'effect_moving'       // card-effect-triggered piece movement animation
  | 'card_display'
  | 'choose_forward'
  | 'roll_for_backward'
  | 'select_building_upgrade'
  | 'select_building_destroy'
  | 'game_over';

export interface BoardCell {
  id: number;
  type: CellType;
  label: string;
}

export interface Team {
  id: TeamId;
  name: string;
  score: number;
  position: number;
  color: string;
  skipNextTurn: boolean;
}

export interface CellOwnership {
  owner: TeamId | null;
  houses: number;
}

export interface YellowQuestion {
  id: number;
  title: string;
  players: string;
  content: string;
  meaning: string;
}

export interface RedQuestion {
  id: number;
  title: string;
  players: string;
  situation: string;
  task: string;
}

export interface GreenQuestion {
  id: number;
  title: string;
  shareContent: string;
  comfortPractice: string;
}

export type CardEffect =
  | { type: 'score_change'; value: number }
  | { type: 'move_forward'; value: number }
  | { type: 'move_backward'; value: number }
  | { type: 'move_to_start' }
  | { type: 'skip_turn' }
  | { type: 'extra_turn' }
  | { type: 'choose_forward' }
  | { type: 'roll_to_move_back' }
  | { type: 'upgrade_building' }
  | { type: 'destroy_building' }
  | { type: 'stay' }
  | { type: 'composite'; effects: CardEffect[] };

export interface SpecialCard {
  id: number;
  title: string;
  description: string;
  quality: 'good' | 'bad' | 'neutral';
  effect: CardEffect;
}

export interface GameState {
  phase: GamePhase;
  teams: [Team, Team];
  currentTeam: TeamId;
  cellOwnership: CellOwnership[];
  diceValue: number | null;
  currentCard: YellowQuestion | RedQuestion | GreenQuestion | SpecialCard | null;
  currentCardType: CellType | null;
  yellowDeck: number[];
  redDeck: number[];
  greenDeck: number[];
  chanceDeck: number[];
  destinyDeck: number[];
  message: string;
  passedStart: boolean;
  isOwnTerritory: boolean;
  pendingEffects: CardEffect[];
  effectMoveData: { steps: number; direction: 'forward' | 'backward' | 'to_start' } | null;
  // When a team's turn is skipped, store who should play after the skip-turn cell resolves
  skipTurnReturn: TeamId | null;
}
