export type CellType = 'start' | 'yellow' | 'red' | 'green' | 'chance' | 'destiny';

export interface BoardCell {
  id: number;
  type: CellType;
  label: string;
}

export type TeamId = 'A' | 'B';

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
  houses: number; // 0, 1, or 2
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

export type CardEffectType =
  | 'move_forward'
  | 'move_backward'
  | 'move_to_start'
  | 'skip_turn'
  | 'extra_turn'
  | 'upgrade_building'
  | 'destroy_building'
  | 'score_change'
  | 'roll_to_move_back'
  | 'choose_forward'
  | 'stay'
  | 'move_to_start_with_score'
  | 'composite';

export interface CardEffect {
  type: CardEffectType;
  value?: number;
  effects?: CardEffect[]; // for composite
}

export interface SpecialCard {
  id: number;
  title: string;
  description: string;
  quality: 'good' | 'bad' | 'neutral';
  effect: CardEffect;
}

export type GamePhase =
  | 'setup'
  | 'rolling'
  | 'moving'
  | 'landed'
  | 'card_display'
  | 'effect_execution'
  | 'choose_forward'
  | 'roll_for_backward'
  | 'select_building_upgrade'
  | 'select_building_destroy'
  | 'game_over';

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
  isOwnTerritory: boolean; // for re-challenge
  pendingEffects: CardEffect[];
}
