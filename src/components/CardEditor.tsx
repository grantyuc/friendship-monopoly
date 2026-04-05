import { useState, useRef, useCallback } from 'react';
import type { YellowQuestion, RedQuestion, GreenQuestion, SpecialCard, CardEffect } from '@/data/types';
import { loadCards, saveCards, resetCards, exportCardsJSON, importCardsJSON, type CardStore } from '@/data/cardStore';

type TabKey = 'yellow' | 'red' | 'green' | 'chance' | 'destiny';

const TABS: { key: TabKey; emoji: string; label: string; color: string; bg: string }[] = [
  { key: 'yellow', emoji: '🤝', label: '合作卡', color: '#D97706', bg: '#FEF3C7' },
  { key: 'red',    emoji: '🎭', label: '情境卡', color: '#DC2626', bg: '#FEE2E2' },
  { key: 'green',  emoji: '💚', label: '心情卡', color: '#16A34A', bg: '#DCFCE7' },
  { key: 'chance', emoji: '🧧', label: '機會卡', color: '#2563EB', bg: '#DBEAFE' },
  { key: 'destiny',emoji: '🃏', label: '命運卡', color: '#7C3AED', bg: '#EDE9FE' },
];

// Simple effect presets for chance/destiny cards
const EFFECT_PRESETS: { label: string; effect: CardEffect }[] = [
  { label: '+100 分', effect: { type: 'score_change', value: 100 } },
  { label: '-100 分', effect: { type: 'score_change', value: -100 } },
  { label: '+200 分', effect: { type: 'score_change', value: 200 } },
  { label: '-200 分', effect: { type: 'score_change', value: -200 } },
  { label: '前進 2 步', effect: { type: 'move_forward', value: 2 } },
  { label: '前進 3 步', effect: { type: 'move_forward', value: 3 } },
  { label: '後退 2 步', effect: { type: 'move_backward', value: 2 } },
  { label: '後退 3 步', effect: { type: 'move_backward', value: 3 } },
  { label: '回到起點', effect: { type: 'move_to_start' } },
  { label: '暫停一回合', effect: { type: 'skip_turn' } },
  { label: '再擲一次', effect: { type: 'extra_turn' } },
  { label: '選擇前進 1~6 步', effect: { type: 'choose_forward' } },
  { label: '擲骰決定後退', effect: { type: 'roll_to_move_back' } },
  { label: '升級己方建築', effect: { type: 'upgrade_building' } },
  { label: '摧毀對方建築', effect: { type: 'destroy_building' } },
  { label: '原地停留', effect: { type: 'stay' } },
];

function describeEffect(effect: CardEffect): string {
  switch (effect.type) {
    case 'score_change': return effect.value > 0 ? `+${effect.value} 分` : `${effect.value} 分`;
    case 'move_forward': return `前進 ${effect.value} 步`;
    case 'move_backward': return `後退 ${effect.value} 步`;
    case 'move_to_start': return '回到起點';
    case 'skip_turn': return '暫停一回合';
    case 'extra_turn': return '再擲一次';
    case 'choose_forward': return '選擇前進 1~6 步';
    case 'roll_to_move_back': return '擲骰決定後退';
    case 'upgrade_building': return '升級己方建築';
    case 'destroy_building': return '摧毀對方建築';
    case 'stay': return '原地停留';
    case 'composite': return effect.effects.map(describeEffect).join(' + ');
    default: return '';
  }
}

interface CardEditorProps {
  onBack: () => void;
}

export function CardEditor({ onBack }: CardEditorProps) {
  const [store, setStore] = useState<CardStore>(() => loadCards());
  const [tab, setTab] = useState<TabKey>('yellow');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const save = useCallback((newStore: CardStore) => {
    setStore(newStore);
    saveCards(newStore);
  }, []);

  // ─── Yellow ───
  const updateYellow = (id: number, field: keyof YellowQuestion, value: string) => {
    const updated = store.yellow.map(q => q.id === id ? { ...q, [field]: value } : q);
    save({ ...store, yellow: updated });
  };
  const addYellow = () => {
    const maxId = store.yellow.reduce((m, q) => Math.max(m, q.id), 0);
    const newCard: YellowQuestion = { id: maxId + 1, title: '新合作卡', players: '2人', content: '', meaning: '' };
    save({ ...store, yellow: [...store.yellow, newCard] });
    setEditingId(newCard.id);
    showToast('已新增合作卡');
  };
  const deleteYellow = (id: number) => {
    save({ ...store, yellow: store.yellow.filter(q => q.id !== id) });
    if (editingId === id) setEditingId(null);
    showToast('已刪除');
  };

  // ─── Red ───
  const updateRed = (id: number, field: keyof RedQuestion, value: string) => {
    const updated = store.red.map(q => q.id === id ? { ...q, [field]: value } : q);
    save({ ...store, red: updated });
  };
  const addRed = () => {
    const maxId = store.red.reduce((m, q) => Math.max(m, q.id), 0);
    const newCard: RedQuestion = { id: maxId + 1, title: '新情境卡', players: '2人', situation: '', task: '' };
    save({ ...store, red: [...store.red, newCard] });
    setEditingId(newCard.id);
    showToast('已新增情境卡');
  };
  const deleteRed = (id: number) => {
    save({ ...store, red: store.red.filter(q => q.id !== id) });
    if (editingId === id) setEditingId(null);
    showToast('已刪除');
  };

  // ─── Green ───
  const updateGreen = (id: number, field: keyof GreenQuestion, value: string) => {
    const updated = store.green.map(q => q.id === id ? { ...q, [field]: value } : q);
    save({ ...store, green: updated });
  };
  const addGreen = () => {
    const maxId = store.green.reduce((m, q) => Math.max(m, q.id), 0);
    const newCard: GreenQuestion = { id: maxId + 1, title: '新心情卡', shareContent: '', comfortPractice: '' };
    save({ ...store, green: [...store.green, newCard] });
    setEditingId(newCard.id);
    showToast('已新增心情卡');
  };
  const deleteGreen = (id: number) => {
    save({ ...store, green: store.green.filter(q => q.id !== id) });
    if (editingId === id) setEditingId(null);
    showToast('已刪除');
  };

  // ─── Chance / Destiny ───
  const updateSpecial = (deckKey: 'chance' | 'destiny', id: number, field: string, value: string) => {
    const updated = store[deckKey].map(c => c.id === id ? { ...c, [field]: value } : c);
    save({ ...store, [deckKey]: updated });
  };
  const toggleEffect = (deckKey: 'chance' | 'destiny', cardId: number, preset: CardEffect) => {
    const card = store[deckKey].find(c => c.id === cardId);
    if (!card) return;

    // Get current effects list
    let effects: CardEffect[] = [];
    if (card.effect.type === 'composite') {
      effects = [...card.effect.effects];
    } else if (card.effect.type !== 'stay' || describeEffect(card.effect) !== '') {
      effects = [card.effect];
    }

    // Check if this preset is already in the list
    const presetStr = JSON.stringify(preset);
    const idx = effects.findIndex(e => JSON.stringify(e) === presetStr);
    if (idx >= 0) {
      effects.splice(idx, 1);
    } else {
      effects.push(preset);
    }

    // Build final effect
    let finalEffect: CardEffect;
    if (effects.length === 0) finalEffect = { type: 'stay' };
    else if (effects.length === 1) finalEffect = effects[0];
    else finalEffect = { type: 'composite', effects };

    const updated = store[deckKey].map(c => c.id === cardId ? { ...c, effect: finalEffect } : c);
    save({ ...store, [deckKey]: updated });
  };
  const addSpecial = (deckKey: 'chance' | 'destiny') => {
    const maxId = store[deckKey].reduce((m, c) => Math.max(m, c.id), 0);
    const newCard: SpecialCard = {
      id: maxId + 1,
      title: deckKey === 'chance' ? '新機會卡' : '新命運卡',
      description: '',
      quality: 'neutral',
      effect: { type: 'stay' },
    };
    save({ ...store, [deckKey]: [...store[deckKey], newCard] });
    setEditingId(newCard.id);
    showToast(deckKey === 'chance' ? '已新增機會卡' : '已新增命運卡');
  };
  const deleteSpecial = (deckKey: 'chance' | 'destiny', id: number) => {
    save({ ...store, [deckKey]: store[deckKey].filter(c => c.id !== id) });
    if (editingId === id) setEditingId(null);
    showToast('已刪除');
  };

  // ─── Export / Import ───
  const handleExport = () => {
    const json = exportCardsJSON(store);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '友誼大富翁-卡片資料.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('已匯出 JSON 檔案');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = importCardsJSON(reader.result as string);
      if (result) {
        save(result);
        setEditingId(null);
        showToast(`匯入成功！黃${result.yellow.length} 紅${result.red.length} 綠${result.green.length} 機會${result.chance.length} 命運${result.destiny.length}`);
      } else {
        showToast('匯入失敗：JSON 格式不正確');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    if (confirm('確定要還原所有卡片為預設內容嗎？自訂內容將會遺失。')) {
      const defaults = resetCards();
      setStore(defaults);
      setEditingId(null);
      showToast('已還原為預設卡片');
    }
  };

  const tabInfo = TABS.find(t => t.key === tab)!;
  const fs = (min: number, vw: number, max: number) => `clamp(${min}px, ${vw}vw, ${max}px)`;

  // Shared input style
  const inputStyle: React.CSSProperties = {
    fontSize: fs(13, 1.4, 18),
    padding: '6px 10px',
    borderRadius: '8px',
    border: `2px solid ${tabInfo.color}33`,
    width: '100%',
    outline: 'none',
    fontFamily: '"Noto Sans TC", sans-serif',
  };
  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: '60px',
    resize: 'vertical' as const,
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-50 overflow-hidden" style={{ fontFamily: '"Noto Sans TC", sans-serif' }}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b shadow-sm" style={{ minHeight: '52px' }}>
        <button
          onClick={onBack}
          className="font-bold text-gray-500 hover:text-gray-700 transition-colors"
          style={{ fontSize: fs(13, 1.5, 20) }}
        >
          ← 返回主選單
        </button>
        <h1 className="font-black" style={{ fontSize: fs(18, 2.5, 32), color: '#4F46E5' }}>
          📝 卡片管理
        </h1>
        <div className="flex gap-2">
          <button onClick={handleExport} className="bg-emerald-500 text-white font-bold rounded-lg px-3 py-1 text-sm hover:bg-emerald-600 transition-colors" style={{ fontSize: fs(11, 1.2, 15) }}>
            匯出 JSON
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="bg-blue-500 text-white font-bold rounded-lg px-3 py-1 text-sm hover:bg-blue-600 transition-colors" style={{ fontSize: fs(11, 1.2, 15) }}>
            匯入 JSON
          </button>
          <button onClick={handleReset} className="bg-gray-400 text-white font-bold rounded-lg px-3 py-1 text-sm hover:bg-gray-500 transition-colors" style={{ fontSize: fs(11, 1.2, 15) }}>
            還原預設
          </button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-white">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setEditingId(null); }}
            className="flex-1 py-2 font-bold transition-colors relative"
            style={{
              fontSize: fs(13, 1.5, 20),
              color: tab === t.key ? t.color : '#9CA3AF',
              background: tab === t.key ? t.bg : 'transparent',
              borderBottom: tab === t.key ? `3px solid ${t.color}` : '3px solid transparent',
            }}
          >
            {t.emoji} {t.label}
            <span className="ml-1 text-xs opacity-60">
              ({tab === t.key ? (t.key === 'chance' || t.key === 'destiny' ? store[t.key].length : store[t.key].length) : ''})
            </span>
          </button>
        ))}
      </div>

      {/* Card list */}
      <div className="flex-1 overflow-y-auto p-4" style={{ background: tabInfo.bg + '66' }}>
        <div className="max-w-4xl mx-auto flex flex-col gap-3">
          {/* YELLOW */}
          {tab === 'yellow' && store.yellow.map(card => (
            <div key={card.id} className="bg-white rounded-xl border-2 shadow-sm overflow-hidden" style={{ borderColor: editingId === card.id ? tabInfo.color : '#E5E7EB' }}>
              <div className="flex items-center justify-between px-4 py-2 cursor-pointer" style={{ background: tabInfo.bg }} onClick={() => setEditingId(editingId === card.id ? null : card.id)}>
                <span className="font-bold" style={{ fontSize: fs(14, 1.6, 22), color: tabInfo.color }}>
                  #{card.id} {card.title}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">{card.players}</span>
                  <span style={{ fontSize: '18px' }}>{editingId === card.id ? '▲' : '▼'}</span>
                </div>
              </div>
              {editingId === card.id && (
                <div className="p-4 flex flex-col gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-gray-500">標題</span>
                    <input style={inputStyle} value={card.title} onChange={e => updateYellow(card.id, 'title', e.target.value)} />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-gray-500">人數</span>
                    <input style={inputStyle} value={card.players} onChange={e => updateYellow(card.id, 'players', e.target.value)} />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-gray-500">內容</span>
                    <textarea style={textareaStyle} value={card.content} onChange={e => updateYellow(card.id, 'content', e.target.value)} />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-gray-500">存摺意義</span>
                    <textarea style={textareaStyle} value={card.meaning} onChange={e => updateYellow(card.id, 'meaning', e.target.value)} />
                  </label>
                  <button onClick={() => deleteYellow(card.id)} className="self-end text-red-500 text-sm font-bold hover:text-red-700">🗑 刪除此卡</button>
                </div>
              )}
            </div>
          ))}

          {/* RED */}
          {tab === 'red' && store.red.map(card => (
            <div key={card.id} className="bg-white rounded-xl border-2 shadow-sm overflow-hidden" style={{ borderColor: editingId === card.id ? tabInfo.color : '#E5E7EB' }}>
              <div className="flex items-center justify-between px-4 py-2 cursor-pointer" style={{ background: tabInfo.bg }} onClick={() => setEditingId(editingId === card.id ? null : card.id)}>
                <span className="font-bold" style={{ fontSize: fs(14, 1.6, 22), color: tabInfo.color }}>
                  #{card.id} {card.title}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">{card.players}</span>
                  <span style={{ fontSize: '18px' }}>{editingId === card.id ? '▲' : '▼'}</span>
                </div>
              </div>
              {editingId === card.id && (
                <div className="p-4 flex flex-col gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-gray-500">標題</span>
                    <input style={inputStyle} value={card.title} onChange={e => updateRed(card.id, 'title', e.target.value)} />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-gray-500">人數</span>
                    <input style={inputStyle} value={card.players} onChange={e => updateRed(card.id, 'players', e.target.value)} />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-gray-500">情境</span>
                    <textarea style={textareaStyle} value={card.situation} onChange={e => updateRed(card.id, 'situation', e.target.value)} />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-gray-500">任務</span>
                    <textarea style={textareaStyle} value={card.task} onChange={e => updateRed(card.id, 'task', e.target.value)} />
                  </label>
                  <button onClick={() => deleteRed(card.id)} className="self-end text-red-500 text-sm font-bold hover:text-red-700">🗑 刪除此卡</button>
                </div>
              )}
            </div>
          ))}

          {/* GREEN */}
          {tab === 'green' && store.green.map(card => (
            <div key={card.id} className="bg-white rounded-xl border-2 shadow-sm overflow-hidden" style={{ borderColor: editingId === card.id ? tabInfo.color : '#E5E7EB' }}>
              <div className="flex items-center justify-between px-4 py-2 cursor-pointer" style={{ background: tabInfo.bg }} onClick={() => setEditingId(editingId === card.id ? null : card.id)}>
                <span className="font-bold" style={{ fontSize: fs(14, 1.6, 22), color: tabInfo.color }}>
                  #{card.id} {card.title}
                </span>
                <span style={{ fontSize: '18px' }}>{editingId === card.id ? '▲' : '▼'}</span>
              </div>
              {editingId === card.id && (
                <div className="p-4 flex flex-col gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-gray-500">標題</span>
                    <input style={inputStyle} value={card.title} onChange={e => updateGreen(card.id, 'title', e.target.value)} />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-gray-500">分享內容</span>
                    <textarea style={textareaStyle} value={card.shareContent} onChange={e => updateGreen(card.id, 'shareContent', e.target.value)} />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-gray-500">安慰練習</span>
                    <textarea style={textareaStyle} value={card.comfortPractice} onChange={e => updateGreen(card.id, 'comfortPractice', e.target.value)} />
                  </label>
                  <button onClick={() => deleteGreen(card.id)} className="self-end text-red-500 text-sm font-bold hover:text-red-700">🗑 刪除此卡</button>
                </div>
              )}
            </div>
          ))}

          {/* CHANCE / DESTINY */}
          {(tab === 'chance' || tab === 'destiny') && store[tab].map(card => {
            // Collect active effects for toggle highlighting
            const activeEffects: string[] = [];
            if (card.effect.type === 'composite') {
              card.effect.effects.forEach(e => activeEffects.push(JSON.stringify(e)));
            } else {
              activeEffects.push(JSON.stringify(card.effect));
            }

            return (
              <div key={card.id} className="bg-white rounded-xl border-2 shadow-sm overflow-hidden" style={{ borderColor: editingId === card.id ? tabInfo.color : '#E5E7EB' }}>
                <div className="flex items-center justify-between px-4 py-2 cursor-pointer" style={{ background: tabInfo.bg }} onClick={() => setEditingId(editingId === card.id ? null : card.id)}>
                  <span className="font-bold" style={{ fontSize: fs(14, 1.6, 22), color: tabInfo.color }}>
                    #{card.id} {card.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs">{describeEffect(card.effect)}</span>
                    <span style={{ fontSize: '18px' }}>{editingId === card.id ? '▲' : '▼'}</span>
                  </div>
                </div>
                {editingId === card.id && (
                  <div className="p-4 flex flex-col gap-3">
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-gray-500">標題</span>
                      <input style={inputStyle} value={card.title} onChange={e => updateSpecial(tab, card.id, 'title', e.target.value)} />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-gray-500">描述</span>
                      <textarea style={textareaStyle} value={card.description} onChange={e => updateSpecial(tab, card.id, 'description', e.target.value)} />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-gray-500">品質</span>
                      <select
                        style={{ ...inputStyle, cursor: 'pointer' }}
                        value={card.quality}
                        onChange={e => {
                          const updated = store[tab].map(c => c.id === card.id ? { ...c, quality: e.target.value as 'good' | 'bad' | 'neutral' } : c);
                          save({ ...store, [tab]: updated });
                        }}
                      >
                        <option value="good">✨ 好運</option>
                        <option value="bad">💔 不利</option>
                        <option value="neutral">🔄 中立</option>
                      </select>
                    </label>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-gray-500">效果（點擊切換，可多選組合）</span>
                      <div className="flex flex-wrap gap-2">
                        {EFFECT_PRESETS.map((p, i) => {
                          const isActive = activeEffects.includes(JSON.stringify(p.effect));
                          return (
                            <button
                              key={i}
                              onClick={() => toggleEffect(tab, card.id, p.effect)}
                              className="font-bold rounded-lg px-2 py-1 transition-all border-2"
                              style={{
                                fontSize: fs(11, 1.1, 14),
                                background: isActive ? tabInfo.color : 'white',
                                color: isActive ? 'white' : tabInfo.color,
                                borderColor: tabInfo.color,
                              }}
                            >
                              {p.label}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        目前效果：{describeEffect(card.effect) || '（無）'}
                      </p>
                    </div>
                    <button onClick={() => deleteSpecial(tab, card.id)} className="self-end text-red-500 text-sm font-bold hover:text-red-700">🗑 刪除此卡</button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Add button */}
          <button
            onClick={() => {
              if (tab === 'yellow') addYellow();
              else if (tab === 'red') addRed();
              else if (tab === 'green') addGreen();
              else addSpecial(tab);
            }}
            className="w-full border-2 border-dashed rounded-xl py-3 font-bold transition-colors hover:border-solid"
            style={{ borderColor: tabInfo.color, color: tabInfo.color, fontSize: fs(14, 1.6, 22) }}
          >
            + 新增{TABS.find(t => t.key === tab)!.label}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white font-bold px-6 py-3 rounded-xl shadow-2xl animate-slide-up z-50" style={{ fontSize: fs(14, 1.6, 20) }}>
          {toast}
        </div>
      )}
    </div>
  );
}
