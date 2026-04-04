import { Button } from '@/components/ui/button';
import type { CellType, YellowQuestion, RedQuestion, GreenQuestion, SpecialCard } from '@/data/types';

interface CardModalProps {
  card: YellowQuestion | RedQuestion | GreenQuestion | SpecialCard;
  cardType: CellType;
  isOwnTerritory?: boolean;
  onComplete: () => void;
  onFail: () => void;
}

export function CardModal({ card, cardType, isOwnTerritory, onComplete, onFail }: CardModalProps) {
  const isSpecial = cardType === 'chance' || cardType === 'destiny';

  const theme = {
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-400', title: 'text-yellow-700', accent: 'bg-yellow-100 border-yellow-300', btn: 'bg-yellow-500 hover:bg-yellow-600', label: '🤝 通力合作', headerBg: 'bg-yellow-400' },
    red: { bg: 'bg-red-50', border: 'border-red-400', title: 'text-red-700', accent: 'bg-red-100 border-red-300', btn: 'bg-red-500 hover:bg-red-600', label: '🎭 挑戰情境', headerBg: 'bg-red-400' },
    green: { bg: 'bg-green-50', border: 'border-green-400', title: 'text-green-700', accent: 'bg-green-100 border-green-300', btn: 'bg-green-500 hover:bg-green-600', label: '💚 心靈補給', headerBg: 'bg-green-400' },
    chance: { bg: 'bg-blue-50', border: 'border-blue-400', title: 'text-blue-700', accent: 'bg-blue-100 border-blue-300', btn: 'bg-blue-500 hover:bg-blue-600', label: '🧧 機會', headerBg: 'bg-blue-500' },
    destiny: { bg: 'bg-purple-50', border: 'border-purple-400', title: 'text-purple-700', accent: 'bg-purple-100 border-purple-300', btn: 'bg-purple-500 hover:bg-purple-600', label: '🃏 命運', headerBg: 'bg-purple-500' },
    start: { bg: 'bg-gray-50', border: 'border-gray-400', title: 'text-gray-700', accent: 'bg-gray-100 border-gray-300', btn: 'bg-gray-500 hover:bg-gray-600', label: '起點', headerBg: 'bg-gray-400' },
  }[cardType];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className={`${theme.bg} border-4 ${theme.border} rounded-2xl shadow-2xl max-w-2xl w-full animate-slide-up overflow-hidden`}>
        {/* Header */}
        <div className={`${theme.headerBg} text-white px-6 py-3 flex items-center justify-between`}>
          <span className="font-bold text-lg">{theme.label}</span>
          {isOwnTerritory && <span className="bg-white/30 px-3 py-1 rounded-full text-sm font-bold">再次挑戰！蓋房子</span>}
        </div>

        <div className="p-6">
          {/* Title */}
          <h2 className={`text-3xl font-bold ${theme.title} mb-4`}>
            {'title' in card ? card.title : ''}
          </h2>

          {/* Yellow card content */}
          {cardType === 'yellow' && 'content' in card && (
            <>
              <p className="font-bold text-gray-500 mb-3" style={{ fontSize: 'clamp(14px, 1.6vw, 22px)' }}>
                👥 參與人數：{(card as YellowQuestion).players}
              </p>
              <p className="text-gray-800 mb-5 leading-relaxed" style={{ fontSize: 'clamp(16px, 2vw, 28px)' }}>
                {(card as YellowQuestion).content}
              </p>
              <div className={`${theme.accent} border-2 rounded-xl p-4`}>
                <p className="text-gray-700" style={{ fontSize: 'clamp(14px, 1.7vw, 24px)' }}>
                  <span className="font-bold">📝 存摺意義：</span>{(card as YellowQuestion).meaning}
                </p>
              </div>
            </>
          )}

          {/* Red card content */}
          {cardType === 'red' && 'situation' in card && (
            <>
              <p className="font-bold text-gray-500 mb-3" style={{ fontSize: 'clamp(14px, 1.6vw, 22px)' }}>
                👥 參與人數：{(card as RedQuestion).players}
              </p>
              <div className={`${theme.accent} border-2 rounded-xl p-4 mb-5`}>
                <p className="text-gray-800 leading-relaxed" style={{ fontSize: 'clamp(15px, 1.8vw, 26px)' }}>
                  <span className="font-bold">📋 情境：</span>{(card as RedQuestion).situation}
                </p>
              </div>
              <p className="text-gray-800 leading-relaxed" style={{ fontSize: 'clamp(16px, 2vw, 28px)' }}>
                <span className="font-bold">🎬 任務：</span>{(card as RedQuestion).task}
              </p>
            </>
          )}

          {/* Green card content */}
          {cardType === 'green' && 'shareContent' in card && (
            <>
              <div className="mb-5">
                <p className="text-gray-800 leading-relaxed" style={{ fontSize: 'clamp(16px, 2vw, 28px)' }}>
                  <span className="font-bold">💬 分享內容：</span>{(card as GreenQuestion).shareContent}
                </p>
              </div>
              <div className={`${theme.accent} border-2 rounded-xl p-4`}>
                <p className="text-gray-800 leading-relaxed" style={{ fontSize: 'clamp(15px, 1.8vw, 26px)' }}>
                  <span className="font-bold">🤗 安慰練習：</span>{(card as GreenQuestion).comfortPractice}
                </p>
              </div>
            </>
          )}

          {/* Special card content */}
          {isSpecial && 'description' in card && (
            <>
              <p className="text-gray-800 mb-5 leading-relaxed" style={{ fontSize: 'clamp(18px, 2.2vw, 32px)' }}>
                {(card as SpecialCard).description}
              </p>
              <div className={`${theme.accent} border-2 rounded-xl p-4`}>
                <p className="font-bold" style={{ fontSize: 'clamp(14px, 1.7vw, 24px)', color: '#374151' }}>
                  {(card as SpecialCard).quality === 'good' ? '✨ 好運效果，按確認套用' : (card as SpecialCard).quality === 'bad' ? '💔 不利效果，按確認套用' : '🔄 中立效果，按確認套用'}
                </p>
              </div>
            </>
          )}

          {/* Action buttons */}
          <div className="flex gap-4 mt-7">
            {!isSpecial ? (
              <>
                <button
                  onClick={onComplete}
                  className="flex-1 text-white font-black rounded-2xl transition-all active:scale-95 shadow-xl hover:brightness-110"
                  style={{
                    background: cardType === 'yellow' ? '#D97706' : cardType === 'red' ? '#DC2626' : '#16A34A',
                    fontSize: 'clamp(16px, 2.2vw, 32px)',
                    padding: 'clamp(12px, 1.5vh, 22px)',
                  }}
                >
                  ✅ 完成任務
                </button>
                <button
                  onClick={onFail}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-black rounded-2xl transition-all active:scale-95 shadow"
                  style={{
                    fontSize: 'clamp(16px, 2.2vw, 32px)',
                    padding: 'clamp(12px, 1.5vh, 22px)',
                  }}
                >
                  ❌ 未完成
                </button>
              </>
            ) : (
              <button
                onClick={onComplete}
                className="w-full text-white font-black rounded-2xl transition-all active:scale-95 shadow-xl hover:brightness-110"
                style={{
                  background: cardType === 'chance' ? '#2563EB' : '#7C3AED',
                  fontSize: 'clamp(18px, 2.4vw, 36px)',
                  padding: 'clamp(14px, 1.8vh, 24px)',
                }}
              >
                確認套用效果 →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
