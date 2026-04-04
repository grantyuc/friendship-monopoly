# 友誼大富翁 — 專案說明文件

> 單機網頁互動遊戲，設計用於電子白板投影播放，由老師操作，兩組學生輪流進行回合。
> 教案對象：國小 4–6 年級，主題為情感存摺與同儕關係。

---

## 快速開始

直接在瀏覽器開啟[友誼大富翁](https://grantyuc.github.io/friendship-monopoly/)。

---

## 資料夾結構

```
友誼大富翁/
├── index.html              ← 遊戲主程式（已打包的單一 HTML，約 360KB）
├── cards.json              ← 外部題庫（可獨立編輯，不需重新編譯）
├── cards-original.json     ← 原版題庫備份（15+15+15 題）
├── build.sh                ← 重新打包腳本
├── package.json            ← Node.js 相依套件
├── pnpm-lock.yaml          ← 版本鎖定檔
├── vite.config.ts          ← Vite 建置設定
├── tailwind.config.js      ← Tailwind CSS 設定
├── postcss.config.js       ← PostCSS 設定
├── tsconfig.json           ← TypeScript 根設定
├── tsconfig.app.json       ← TypeScript 應用程式設定
├── tsconfig.node.json      ← TypeScript Node 設定
├── .parcelrc               ← Parcel 打包設定（path alias 支援）
└── src/
    ├── App.tsx             ← 主遊戲邏輯（useReducer 狀態機）
    ├── main.tsx            ← React 根入口
    ├── index.css           ← 全域樣式、動畫定義
    ├── data/
    │   ├── types.ts        ← 所有 TypeScript 型別定義
    │   └── questions.ts    ← 內建預設題庫（fallback 用）
    ├── hooks/
    │   ├── useSound.ts     ← Web Audio API 音效系統
    │   └── use-toast.ts    ← Toast 通知 hook
    ├── lib/
    │   └── utils.ts        ← shadcn/ui 工具函式（cn）
    └── components/
        ├── GameBoard.tsx   ← 40 格地圖、棋子、建築渲染
        ├── GameSetup.tsx   ← 開始畫面（輸入隊名）
        ├── GameOver.tsx    ← 結算畫面
        ├── CardModal.tsx   ← 題目卡片彈出視窗
        ├── ControlBar.tsx  ← 底部控制列（骰子、分數、回合）
        ├── EffectModal.tsx ← 特殊效果互動視窗
        └── ui/             ← shadcn/ui 元件（40+ 個）
```

---

## 題庫系統（cards.json）

### 載入機制

`index.html` 啟動時執行：

```js
async function loadCards() {
  const res = await fetch('./cards.json');
  if (!res.ok) return; // 失敗則靜默使用內建題庫
  const data = await res.json();
  if (data.yellow?.length)  yellowDeck  = data.yellow;
  if (data.red?.length)     redDeck     = data.red;
  if (data.green?.length)   greenDeck   = data.green;
  if (data.chance?.length)  chanceDeck  = data.chance;
  if (data.destiny?.length) destinyDeck = data.destiny;
}
```

成功時 console 印出：`[友誼大富翁] 已從 cards.json 載入卡片資料`
失敗時 console 印出：`[友誼大富翁] 未找到 cards.json，使用內建預設卡片`

### cards.json 格式

```json
{
  "yellow": [ ... ],   // 通力合作（目前 26 題）
  "red":    [ ... ],   // 挑戰情境（目前 25 題）
  "green":  [ ... ],   // 心靈補給（目前 26 題）
  "chance": [ ... ],   // 機會卡（固定 7 張）
  "destiny":[ ... ]    // 命運卡（固定 7 張）
}
```

#### 黃色卡（yellow）欄位

```json
{
  "id": 1,
  "title": "心靈電波傳送",
  "players": "2人",
  "content": "活動內容說明...",
  "meaning": "存摺意義說明..."
}
```

#### 紅色卡（red）欄位

```json
{
  "id": 1,
  "title": "拒絕的藝術",
  "players": "2-3人",
  "situation": "情境描述...",
  "task": "演出任務..."
}
```

#### 綠色卡（green）欄位

```json
{
  "id": 1,
  "title": "考砸了的下午",
  "shareContent": "分享內容引導...",
  "comfortPractice": "安慰練習說明..."
}
```

#### 機會/命運卡（chance / destiny）欄位

```json
{
  "id": 1,
  "title": "友誼升級券",
  "description": "效果敘述...",
  "quality": "good",
  "effect": { "type": "composite", "effects": [...] }
}
```

`quality` 值：`"good"` / `"bad"` / `"neutral"`（影響卡片顯示顏色）

#### 支援的 effect.type

| type | 說明 |
|------|------|
| `score_change` | 加減分，搭配 `value`（正=加分，負=扣分） |
| `move_forward` | 前進 N 步，搭配 `value` |
| `move_backward` | 後退 N 步，搭配 `value` |
| `move_to_start` | 直接回到起點 |
| `skip_turn` | 下一回合暫停 |
| `extra_turn` | 本回合再擲一次骰子 |
| `choose_forward` | 玩家自選前進 1–6 步 |
| `roll_to_move_back` | 擲骰決定後退步數 |
| `upgrade_building` | 選擇己方一塊地升級（蓋房子） |
| `destroy_building` | 選擇對方一塊有房子的地摧毀 |
| `stay` | 原地停留 |
| `composite` | 組合效果，搭配 `effects: [...]` 陣列 |

---

## 遊戲規則

### 版圖

- 共 40 格，順時針行進
- **黃色格**（🤝 通力合作）：26 題，兩隊合作完成身體/創意挑戰
- **紅色格**（🎭 挑戰情境）：25 題，演出生活中的衝突情境
- **綠色格**（💚 心靈補給）：26 題，分享情緒、練習安慰
- **黑色格**（機會 🧧 / 命運 🃏）：各 4 格，共 8 格，隨機抽特殊事件卡

### 計分

| 事件 | 分數 |
|------|------|
| 遊戲開始 | 每隊 1500 分 |
| 完成格子任務 | +100 |
| 經過（或踩到）起點 | +100 |
| 踩到對方已佔領的空地 | −100 |
| 踩到對方有 1 棟房子的地 | −200 |
| 踩到對方有 2 棟房子的地 | −300 |

### 土地與建築

- 完成任務 → 佔領該格（顯示隊伍顏色小圓點）
- 再次踩到自己已佔領的格子 → 可再次挑戰，成功後蓋一棟小房子（最多 2 棟）
- 踩到自己格子但任務失敗 → 不蓋房子，格子保留佔領狀態

### 機會/命運卡

- 踩到黑格時自動抽取，直接套用效果（無需完成任務）
- 題庫用完後重新洗牌循環

---

## 技術架構

### 技術棧

- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS 3.4** + **shadcn/ui**（40+ 元件）
- **Web Audio API**（無外部音效檔，全部由 oscillator 合成）
- **useReducer** 狀態機管理遊戲邏輯

### 狀態機階段（GamePhase）

```
setup → rolling → moving → landed
                              ↓
                   card_display（黃/紅/綠/機會/命運）
                              ↓
                   effect_execution（特殊效果）
                              ↓
               ┌──────────────────────────────┐
               │ choose_forward               │ 玩家選步數
               │ roll_for_backward            │ 骰骰後退
               │ select_building_upgrade      │ 選擇升級建築
               │ select_building_destroy      │ 選擇摧毀建築
               └──────────────────────────────┘
                              ↓
                          rolling（換下一隊）
                              ↓
                          game_over（結算）
```

### 音效系統

`src/hooks/useSound.ts` 使用 Web Audio API 合成所有音效，無需載入任何外部音訊檔：

| 函式 | 觸發時機 |
|------|---------|
| `playRoll()` | 擲骰子 |
| `playStep()` | 棋子每步移動 |
| `playLandYellow/Red/Green()` | 落點顯示卡片 |
| `playChance/Destiny()` | 抽取特殊卡 |
| `playSuccess/Fail()` | 任務完成/失敗 |
| `playHouse()` | 蓋房子 |
| `playNextTurn()` | 換回合 |
| `playPassStart()` | 經過起點 |

---

## 重新建置

如果修改了 `src/` 下的原始碼後需要重新打包 `index.html`：

### 環境需求

- Node.js 18+
- 可用 `npx pnpm` 安裝套件（不需要全域安裝 pnpm）

### 步驟

```bash
# 1. 安裝套件（首次或 package.json 有變動時）
npx pnpm install

# 2. 開發模式（熱更新，用瀏覽器開 http://localhost:5173）
npx pnpm run dev

# 3. 打包成單一 HTML（供直接開啟或伺服器部署）
bash build.sh
# 輸出：index_bundle.html
```

`build.sh` 的流程：Parcel 打包 → html-inline 內嵌所有 JS/CSS → 輸出單一 HTML。

> **注意**：`build.sh` 輸出的 `index_bundle.html` 不包含 `cards.json` 的內容，
> 需要搭配同目錄的 `cards.json`，並透過 HTTP 伺服器開啟才能載入外部題庫。

---

## 已知事項

1. **file:// 無法載入 cards.json**：直接雙擊開啟 HTML 時，`fetch('./cards.json')` 會被 Chrome/Edge 阻擋。遊戲會靜默回退到內建預設題庫（各 15 題），功能完整但不包含擴充題目。

2. **棋子動畫**：棋子移動時每格暫停 330ms，最多 6 格約需 2 秒，設計上讓學生可以清楚看到移動過程。

3. **題庫 id 連續性**：新增 cards.json 的題目時，`id` 欄位建議從現有最大值 +1 開始，避免與洗牌邏輯中的 `drawFromDeck` 衝突。目前 drawFromDeck 使用題庫長度作為洗牌範圍，id 只用於查找，理論上不需連續，但保持連續較容易維護。

4. **分數下限**：程式碼中 `Math.max(0, score + change)` 確保分數不會低於 0。

---

## 教案背景

本遊戲搭配「情感存摺」教案，透過三種任務類型讓國小 4–6 年級學生：

- **通力合作**（黃）：練習非語言溝通、身體協作、正向表達
- **挑戰情境**（紅）：演練同儕、家庭、師生衝突的應對方式
- **心靈補給**（綠）：分享生活中的情緒，練習給予安慰與同理

機會/命運卡設計模擬真實社交事件，強化隨機性與課堂討論素材。
