# 友誼大富翁 Friendship Monopoly

單機網頁互動遊戲，專為國小4–6年級設計的情感教育教案。
直接在瀏覽器開啟[友誼大富翁](https://grantyuc.github.io/friendship-monopoly/)。

---

## 遊戲目標

兩隊透過擲骰子在棋盤上行走，完成任務佔領格子、賺取積分，最後積分高者勝。

---

## 規則說明

### 棋盤結構（40格）

| 格子類型 | 數量 | 說明 |
|---------|------|------|
| 🟡 通力合作（黃） | 11格 | 合作挑戰：金字塔、開合跳、默契遊戲等 |
| 🔴 情境表演（紅） | 10格 | 挑戰情境：演出生活中不喜歡遇到的事 |
| 🟢 心情分享（綠） | 11格 | 心靈補給：分享各種情緒，練習安慰理解 |
| 🧧 機會 | 4格 | 抽機會卡，觸發隨機效果 |
| 🃏 命運 | 4格 | 抽命運卡，觸發隨機效果 |
| 🏁 起點 | 1格 | 每次經過或踩到 +100分 |

### 積分規則

- 每隊初始分數：**1500分**
- 完成任務格子 / 經過或踩到起點：**+100分**
- 踩到對手已佔領的格子：**-100分**（減少的分數同步加入對手）
- 踩到對手有房子的格子：每棟房子額外 **-100分**（1棟 → -200，2棟 → -300）
- 重複踩到己方已完成的格子：可再次挑戰，成功蓋房子（上限2棟）

### 機會/命運卡效果清單

| 效果類型 | 說明 |
|---------|------|
| `score_change` | 直接加減分 |
| `move_forward N` | 前進 N 格（觸發落地格效果） |
| `move_backward N` | 後退 N 格（觸發落地格效果） |
| `move_to_start` | 回到起點 |
| `extra_turn` | 同隊再擲一次骰子 |
| `skip_turn` | 下回合暫停（暫停時仍會觸發當前格效果） |
| `choose_forward` | 玩家自選前進 1–6 步 |
| `roll_to_move_back` | 擲骰決定後退步數 |
| `upgrade_building` | 選擇己方格子蓋房子 |
| `destroy_building` | 選擇對手格子拆房子 |
| `stay` | 原地停留，不做任何事 |
| `composite` | 組合多個效果依序執行 |

### 暫停回合機制

被暫停的那一回合不會完全跳過：暫停隊仍會觸發他們當前所站格子的完整效果（抽題目卡、付對手罰金等），之後才輪回到另一隊。

---

## 三種模式

### 1. 正常遊戲（首頁→開始遊戲）

雙隊依序擲骰、移動、完成任務的完整遊戲流程。

### 2. 抽牌模式（首頁→抽牌模式）

不需要棋盤，直接從各類別卡堆抽取題目，適合快速暖場使用。

### 3. 卡片編輯模式（設定頁→編輯卡片）

瀏覽、修改所有題目卡與機會/命運卡的內容（僅在當前 session 生效）。若需永久修改，請編輯 `cards.json`。

---

## 替換題目（cards.json）

`cards.json` 與 `index.html` 放在同一資料夾時，開啟遊戲會自動載入外部卡片（需透過 HTTP 伺服器開啟；直接雙擊 `index.html` 使用 `file://` 時因瀏覽器限制會 fallback 回內建預設）。

### JSON 格式

```json
{
  "yellow": [
    {
      "id": 1,
      "title": "卡片標題",
      "players": "2人",
      "content": "任務內容說明",
      "meaning": "存摺意義（這個任務在訓練什麼）"
    }
  ],
  "red": [
    {
      "id": 1,
      "title": "卡片標題",
      "players": "2-3人",
      "situation": "情境描述",
      "task": "要執行的任務"
    }
  ],
  "green": [
    {
      "id": 1,
      "title": "卡片標題",
      "shareContent": "分享內容提示",
      "comfortPractice": "安慰練習說明"
    }
  ],
  "chance": [
    {
      "id": 1,
      "title": "卡片標題",
      "description": "卡片描述",
      "quality": "good",
      "effect": { "type": "score_change", "value": 100 }
    }
  ],
  "destiny": []
}
```

`quality` 可填 `"good"` / `"bad"` / `"neutral"`，影響卡片顯示風格。

---

## 專案結構

```
友誼大富翁/
├── index.html              ← 單一輸出檔（366KB，可直接開啟）
├── cards.json              ← 外部可替換卡片資料
├── cards-original.json     ← 原始卡片備份
├── build.sh                ← 建置腳本
├── README.md               ← 本文件
├── PROMPTS.md              ← 開發需求歷史記錄
├── src/
│   ├── App.tsx             ← 主元件：狀態機 + 所有 reducer 邏輯
│   ├── data/
│   │   ├── types.ts        ← 所有 TypeScript 型別定義
│   │   └── questions.ts    ← 預設卡片資料 + loadExternalCards()
│   ├── hooks/
│   │   └── useSound.ts     ← Web Audio API 音效（純程式碼合成）
│   └── components/
│       ├── GameSetup.tsx   ← 首頁：輸入隊名、選擇模式
│       ├── GameBoard.tsx   ← 棋盤渲染 + 骰子動畫
│       ├── ControlBar.tsx  ← 底部控制列：分數、擲骰、下一回合
│       ├── CardModal.tsx   ← 題目卡 / 機會命運卡彈窗
│       ├── EffectModal.tsx ← 效果互動彈窗（選步數、擲後退骰、選建築）
│       ├── CardDrawMode.tsx← 抽牌模式
│       ├── CardEditor.tsx  ← 卡片編輯器
│       ├── GameOver.tsx    ← 遊戲結束畫面
│       └── ui/
│           ├── DiceFace.tsx← 共用 3D 骰子元件（GameBoard + EffectModal 共用）
│           └── button.tsx  ← shadcn/ui 元件（及其他 ui/ 元件）
├── package.json
├── vite.config.ts          ← IIFE 格式輸出（解決 file:// 限制）
└── tsconfig.*.json
```

---

## 狀態機（GamePhase）

```
setup
  └─ START_GAME ──► rolling
                      │
              ROLL_DICE│
                      ▼
                    moving  ──(動畫完)──► MOVE_COMPLETE
                                              │
                          ┌───────────────────┼──────────────────────┐
                          ▼                   ▼                      ▼
                    card_display          rolling             effect_moving
                    (抽到題目/          (踩起點/對手           (卡片效果移動)
                     機會命運卡)          領地即結算)                 │
                          │                               EFFECT_MOVE_COMPLETE
              ┌───────────┤                                          │
              ▼           ▼                                          ▼
        COMPLETE_TASK  CONFIRM_SPECIAL_CARD                   (落地判斷)
              │           │
              └─────┬─────┘
                    ▼
                  rolling
                    │
              (互動效果)
              ├─ choose_forward ──► CHOOSE_FORWARD_STEPS ──► effect_moving
              ├─ roll_for_backward ──► ROLL_BACKWARD_COMPLETE ──► effect_moving
              ├─ select_building_upgrade / select_building_destroy
              └─ NEXT_TURN ──► rolling (下一隊)
                                │ (或暫停隊觸發格子後 skipTurnReturn 自動換回)
```

---

## 重要技術細節

### IIFE 格式（解決 file:// 問題）

`vite.config.ts` 使用 `format: 'iife'`、`target: 'es2015'`，輸出為立即執行函式。CSS 由 Vite 自動注入到 JS 中（`document.createElement('style')`）。最終只有一個 `<script>` 標籤，無 `type="module"`，可在 `file://` 協議下正常執行。

### 建置流程

> **必須在 session scratchpad 建置**，因為 macOS 掛載的 workspace 資料夾在 `dist/` 清理時會出現 EPERM 錯誤。

```bash
# 1. 同步 workspace src → scratchpad src
rsync -a --delete /sessions/<id>/mnt/友誼大富翁/src/ /sessions/<id>/youyi-game/src/

# 2. 建置
cd /sessions/<id>/youyi-game && npm run build

# 3. 內聯 JS → 單一 index.html，複製到 workspace
node -e "
const fs = require('fs');
const js = fs.readFileSync('./dist/assets/index.js', 'utf8');
const html = \`<!doctype html><html lang=\"zh-TW\"><head>
  <meta charset=\"UTF-8\"/>
  <meta name=\"viewport\" content=\"width=device-width,initial-scale=1.0\"/>
  <title>友誼大富翁</title></head><body>
  <div id=\"root\"></div><script>\${js}</script></body></html>\`;
fs.writeFileSync('/sessions/<id>/mnt/友誼大富翁/index.html', html);
"
```

### composite 效果處理順序

`processEffect` 中 `composite` 類型的處理邏輯：

1. **移動效果**（`move_forward`, `move_backward`, `move_to_start`）→ 延遲到最後執行，避免被後續 `score_change` 覆蓋 phase
2. **互動效果**（`choose_forward`, `roll_to_move_back`, `upgrade_building`, `destroy_building`）→ 存入 `pendingEffects` 佇列，需要使用者互動後依序處理
3. **即時效果**（`score_change`, `skip_turn`, `extra_turn`, `stay`）→ 依序立即執行

### 暫停回合（skipTurnReturn）

`GameState.skipTurnReturn: TeamId | null` 記錄「被暫停後應換回的隊」。
`NEXT_TURN` 偵測到 `skipNextTurn` 時，切換到被跳過的隊並觸發其當前格子效果；
`gameReducer` 外層 wrapper 在 phase 回到 `'rolling'` 且 `skipTurnReturn !== null` 時，自動切換回待機隊。

### 分數轉移

踩到對手領地時，扣除的分數**同步轉入**對手帳戶（`MOVE_COMPLETE` 及 `EFFECT_MOVE_COMPLETE` 兩處均已實作）：

```ts
const deducted = Math.min(teams[teamIdx].score, penalty);
teams[teamIdx].score = Math.max(0, teams[teamIdx].score - penalty);
teams[opponentIdx].score += deducted;
```

### extra_turn 修正

`extra_turn` 效果執行時會清除 `diceValue`（設為 null），使 `showNextTurn` 條件不成立，骰子按鈕正確出現讓同隊再擲。

---

## 音效系統（useSound.ts）

全部使用 Web Audio API 程式碼合成，無外部音效檔：

| 函式 | 用途 |
|------|------|
| `playRoll` | 骰子滾動 |
| `playDiceLand` | 骰子落定 |
| `playStep` | 棋子移動每步 |
| `playSuccess / playFail` | 任務成功 / 失敗 |
| `playLandYellow/Red/Green` | 落在各色格子 |
| `playChance / playDestiny` | 抽機會 / 命運卡 |
| `playHouse / playDestroy` | 蓋房子 / 摧毀房子 |
| `playPenalty` | 踩到對手領地 |
| `playPassStart` | 經過起點 |
| `playNextTurn` | 換隊 |
| `playSkipTurn` | 暫停回合 |
| `playGameOver` | 遊戲結束 |

---

## 需要額外道具的卡片（通力合作類）

**#2 友誼指揮官** `需要：眼罩或遮眼布`
一人矇眼，其餘組員只能用「聲音指令」引導矇眼者繞過教室內的桌椅障礙物，走到指定位置。

**#3 默契畫筆** `需要：彩色筆 × 1、紙 × 1`
兩人共同握住一支彩色筆，在不能說話的情況下，於紙上合作畫出一個「完整的圓形」或「一個愛心」。

**#7 人體運輸機** `需要：長尺或長筆 × 1`
小組成員僅用「指尖」支撐一根長尺或一枝筆，合力將其從桌子一端移到另一端，期間筆不能掉落。

**#8 合力圈圈** `需要：呼拉圈 × 1（或繩子圍成圈）`
組員手牽手圍成圈，在不鬆開手的情況下，讓一個呼拉圈繞過所有人的身體回到原點。

**#11 友誼合奏團** `需要：課程自製簡易樂器`
利用剛才製作的簡易樂器，小組排練出一段10秒鐘的自創節奏曲表演給關主看。（依賴課程前段的樂器製作活動）

**#14 友誼藏寶圖** `需要：紙和筆`
組員一起想出3個「我們這組共同的興趣」，寫在紙上。

**#15 情感大合照** `需要：手機或相機`
小組共同擺出一個代表「團結」或「健康友誼」的創意 Pose 給老師拍照。

**#20 默契運球** `需要：小球或靠枕 × 1`
兩人背對背夾住一顆小球（或靠枕），在不掉下來的情況下繞題目格走一圈。

**#22 兩人三腳** `需要：繩子或布條（綁腳用）`
把兩人內側腳綁起來（或相扣），在原地轉3圈不跌倒。

**#26 合作拼圖** `需要：小積木一組`
在1分鐘內，兩人用小積木共同拼出一個愛心或簡單圖形。