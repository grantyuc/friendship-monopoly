import type { YellowQuestion, RedQuestion, GreenQuestion, SpecialCard } from './types';
import {
  yellowQuestions as defaultYellow,
  redQuestions as defaultRed,
  greenQuestions as defaultGreen,
  chanceCards as defaultChance,
  destinyCards as defaultDestiny,
} from './questions';

const STORAGE_KEY = 'youyi-custom-cards';

export interface CardStore {
  yellow: YellowQuestion[];
  red: RedQuestion[];
  green: GreenQuestion[];
  chance: SpecialCard[];
  destiny: SpecialCard[];
}

function getDefaults(): CardStore {
  return {
    yellow: structuredClone(defaultYellow),
    red: structuredClone(defaultRed),
    green: structuredClone(defaultGreen),
    chance: structuredClone(defaultChance),
    destiny: structuredClone(defaultDestiny),
  };
}

export function loadCards(): CardStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CardStore;
      // Basic validation
      if (parsed.yellow && parsed.red && parsed.green && parsed.chance && parsed.destiny) {
        return parsed;
      }
    }
  } catch {
    // localStorage unavailable or corrupted
  }
  return getDefaults();
}

export function saveCards(store: CardStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // localStorage unavailable
  }
}

export function resetCards(): CardStore {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  return getDefaults();
}

export function exportCardsJSON(store: CardStore): string {
  return JSON.stringify(store, null, 2);
}

export function importCardsJSON(json: string): CardStore | null {
  try {
    const parsed = JSON.parse(json);
    if (parsed.yellow && parsed.red && parsed.green && parsed.chance && parsed.destiny) {
      return parsed as CardStore;
    }
  } catch {
    // invalid JSON
  }
  return null;
}
