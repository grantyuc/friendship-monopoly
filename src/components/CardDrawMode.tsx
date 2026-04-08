import { useState, useCallback, useEffect, useRef } from 'react';
import { useSound } from '@/hooks/useSound';
import { yellowQuestions, redQuestions, greenQuestions, chanceCards, destinyCards, shuffleArray } from '@/data/questions';
import type { CellType, YellowQuestion, RedQuestion, GreenQuestion, SpecialCard } from '@/data/types';
import { CardModal } from './CardModal';
import { DiceFace } from '@/components/ui/DiceFace';

const DICE_SIZE = 90;

type DeckType = 'yellow' | 'red' | 'green' | 'chance' | 'destiny';

const DECK_CONFIG: { type: DeckType; emoji: string; label: string; color: string; shadow: string; bgGrad: string }[] = [
  { type: 'yellow', emoji: '🤝', label: '合作卡', color: '#F59E0B', shadow: 'rgba(245,158,11,0.5)', bgGrad: 'linear-gradient(145deg, #FDE68A, #F59E0B)' },
  { type: 'red',    emoji: '🎭', label: '情境卡', color: '#EF4444', shadow: 'rgba(239,68,68,0.5)',  bgGrad: 'linear-gradient(145deg, #FCA5A5, #EF4444)' },
  { type: 'green',  emoji: '💚', label: '心情卡', color: '#22C55E', shadow: 'rgba(34,197,94,0.5)',  bgGrad: 'linear-gradient(145deg, #86EFAC, #22C55E)' },
  { type: 'chance', emoji: '🧧', label: '機會卡', color: '#3B82F6', shadow: 'rgba(59,130,246,0.5)', bgGrad: 'linear-gradient(145deg, #93C5FD, #3B82F6)' },
  { type: 'destiny',emoji: '🃏', label: '命運卡', color: '#8B5CF6', shadow: 'rgba(139,92,246,0.5)', bgGrad: 'linear-gradient(145deg, #C4B5FD, #8B5CF6)' },
];

interface CardDrawModeProps {
  onBack: () => void;
}

export function CardDrawMode({ onBack }: CardDrawModeProps) {
  const sound = useSound();
  const [drawnCard, setDrawnCard] = useState<YellowQuestion | RedQuestion | GreenQuestion | SpecialCard | null>(null);
  const [drawnType, setDrawnType] = useState<CellType | null>(null);
  const [flippingDeck, setFlippingDeck] = useState<DeckType | null>(null);

  // Dice state
  const [diceRolling, setDiceRolling] = useState(false);
  const [diceDisplay, setDiceDisplay] = useState<number | null>(null);
  const [diceAngle, setDiceAngle] = useState(0);
  const rafRef = useRef<number | null>(null);

  // Dice animation loop
  useEffect(() => {
    if (!diceRolling) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setDiceAngle(0);
      return;
    }
    let angle = 0;
    const spin = () => {
      angle += 25;
      setDiceAngle(angle);
      setDiceDisplay(Math.ceil(Math.random() * 6));
      rafRef.current = requestAnimationFrame(spin);
    };
    rafRef.current = requestAnimationFrame(spin);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [diceRolling]);

  const handleRollDice = useCallback(() => {
    if (diceRolling) return;
    const result = Math.ceil(Math.random() * 6);
    setDiceRolling(true);
    sound.playRoll();
    setTimeout(() => {
      setDiceRolling(false);
      setDiceDisplay(result);
    }, 900);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diceRolling]);

  const handleDraw = useCallback((deckType: DeckType) => {
    // Play sound based on deck type
    if (deckType === 'yellow') sound.playLandYellow();
    else if (deckType === 'red') sound.playLandRed();
    else if (deckType === 'green') sound.playLandGreen();
    else if (deckType === 'chance') sound.playChance();
    else if (deckType === 'destiny') sound.playDestiny();

    // Flip animation
    setFlippingDeck(deckType);
    setTimeout(() => {
      // Pick a random card from the deck
      let card: YellowQuestion | RedQuestion | GreenQuestion | SpecialCard;
      switch (deckType) {
        case 'yellow': {
          const shuffled = shuffleArray(yellowQuestions);
          card = shuffled[0];
          break;
        }
        case 'red': {
          const shuffled = shuffleArray(redQuestions);
          card = shuffled[0];
          break;
        }
        case 'green': {
          const shuffled = shuffleArray(greenQuestions);
          card = shuffled[0];
          break;
        }
        case 'chance': {
          const shuffled = shuffleArray(chanceCards);
          card = shuffled[0];
          break;
        }
        case 'destiny': {
          const shuffled = shuffleArray(destinyCards);
          card = shuffled[0];
          break;
        }
      }

      setDrawnCard(card);
      setDrawnType(deckType as CellType);
      setFlippingDeck(null);
    }, 400);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDismiss = useCallback(() => {
    setDrawnCard(null);
    setDrawnType(null);
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-pink-50 overflow-hidden">
      {/* Title */}
      <h1
        className="font-black text-transparent bg-clip-text mb-2"
        style={{
          fontSize: 'clamp(36px, 6vw, 72px)',
          fontFamily: '"Noto Sans TC", sans-serif',
          backgroundImage: 'linear-gradient(135deg, #6366F1, #EC4899)',
        }}
      >
        抽牌模式
      </h1>
      <p className="text-gray-500 mb-8" style={{ fontSize: 'clamp(14px, 2vw, 22px)' }}>
        點擊牌堆抽出一張卡片，抽後自動洗回牌堆
      </p>

      {/* 5 Card Decks */}
      <div
        className="flex gap-4 justify-center items-center flex-wrap px-4"
        style={{ gap: 'clamp(12px, 2vw, 32px)' }}
      >
        {DECK_CONFIG.map(deck => {
          const isFlipping = flippingDeck === deck.type;
          return (
            <button
              key={deck.type}
              onClick={() => handleDraw(deck.type)}
              disabled={flippingDeck !== null}
              className="relative flex flex-col items-center justify-center rounded-2xl border-4 transition-all active:scale-95 cursor-pointer select-none"
              style={{
                width: 'clamp(100px, 15vw, 180px)',
                height: 'clamp(140px, 22vw, 260px)',
                background: deck.bgGrad,
                borderColor: deck.color,
                boxShadow: `0 8px 24px ${deck.shadow}, 0 2px 8px rgba(0,0,0,0.1)`,
                transform: isFlipping ? 'rotateY(90deg) scale(0.9)' : 'rotateY(0deg) scale(1)',
                transition: 'transform 0.4s ease-in-out, box-shadow 0.2s',
                opacity: flippingDeck !== null && !isFlipping ? 0.6 : 1,
              }}
            >
              {/* Card back pattern */}
              <div
                className="absolute inset-2 rounded-xl border-2 border-white/40"
                style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.15) 8px, rgba(255,255,255,0.15) 16px)' }}
              />
              {/* Emoji */}
              <span
                className="relative z-10 drop-shadow-lg"
                style={{ fontSize: 'clamp(36px, 6vw, 72px)' }}
              >
                {deck.emoji}
              </span>
              {/* Label */}
              <span
                className="relative z-10 font-black text-white drop-shadow-md mt-1"
                style={{ fontSize: 'clamp(14px, 2vw, 24px)' }}
              >
                {deck.label}
              </span>
              {/* Card count badge */}
              <span
                className="absolute top-2 right-2 bg-white/80 text-gray-700 font-bold rounded-full flex items-center justify-center"
                style={{
                  width: 'clamp(22px, 3vw, 36px)',
                  height: 'clamp(22px, 3vw, 36px)',
                  fontSize: 'clamp(10px, 1.3vw, 16px)',
                }}
              >
                {deck.type === 'yellow' ? yellowQuestions.length : deck.type === 'red' ? redQuestions.length : deck.type === 'green' ? greenQuestions.length : deck.type === 'chance' ? chanceCards.length : destinyCards.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dice section */}
      <div className="mt-8 flex flex-col items-center gap-4">
        <div className="flex items-center gap-6">
          {/* Dice display */}
          <div
            style={{
              width: DICE_SIZE + 16,
              height: DICE_SIZE + 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {diceDisplay !== null && (
              <div
                style={{
                  transform: diceRolling
                    ? `rotate(${diceAngle}deg) scale(${0.8 + Math.sin(diceAngle * 0.05) * 0.3})`
                    : 'rotate(0deg) scale(1.15)',
                  transition: diceRolling ? 'none' : 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                  filter: diceRolling ? 'blur(1.5px)' : 'none',
                }}
              >
                <DiceFace value={diceDisplay} size={DICE_SIZE} />
              </div>
            )}
          </div>

          {/* Roll button */}
          <button
            onClick={handleRollDice}
            disabled={diceRolling}
            className="flex flex-col items-center justify-center rounded-2xl font-black text-white shadow-lg active:scale-95 transition-all select-none"
            style={{
              width: 'clamp(90px, 12vw, 150px)',
              height: 'clamp(60px, 8vw, 90px)',
              fontSize: 'clamp(16px, 2.5vw, 28px)',
              background: diceRolling
                ? 'linear-gradient(135deg, #94a3b8, #64748b)'
                : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              boxShadow: diceRolling
                ? '0 4px 12px rgba(0,0,0,0.15)'
                : '0 8px 24px rgba(99,102,241,0.5)',
              cursor: diceRolling ? 'not-allowed' : 'pointer',
            }}
          >
            <span style={{ fontSize: 'clamp(22px, 3.5vw, 40px)' }}>🎲</span>
            擲骰子
          </button>
        </div>

        {/* Result label */}
        {diceDisplay !== null && !diceRolling && (
          <p
            className="font-black text-transparent bg-clip-text"
            style={{
              fontSize: 'clamp(16px, 2.5vw, 28px)',
              backgroundImage: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            }}
          >
            結果：{diceDisplay} 點
          </p>
        )}
      </div>

      {/* Back button */}
      <button
        onClick={onBack}
        className="mt-6 font-bold text-gray-500 hover:text-gray-700 transition-colors bg-white/70 rounded-xl px-6 py-3 shadow hover:shadow-md"
        style={{ fontSize: 'clamp(14px, 2vw, 22px)' }}
      >
        ← 返回主選單
      </button>

      {/* Card display modal - reuse CardModal but with dismiss-only behavior */}
      {drawnCard && drawnType && (
        <CardModal
          card={drawnCard}
          cardType={drawnType}
          dismissOnly
          onComplete={handleDismiss}
          onFail={handleDismiss}
        />
      )}
    </div>
  );
}
