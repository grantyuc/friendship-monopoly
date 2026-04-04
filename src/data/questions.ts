import type { BoardCell, YellowQuestion, RedQuestion, GreenQuestion, SpecialCard } from './types';

export const BOARD_CELLS: BoardCell[] = [
  { id: 0, type: 'start', label: '起點' },
  { id: 1, type: 'red', label: '挑戰情境' },
  { id: 2, type: 'green', label: '心靈補給' },
  { id: 3, type: 'yellow', label: '通力合作' },
  { id: 4, type: 'red', label: '挑戰情境' },
  { id: 5, type: 'yellow', label: '通力合作' },
  { id: 6, type: 'chance', label: '機會' },
  { id: 7, type: 'green', label: '心靈補給' },
  { id: 8, type: 'yellow', label: '通力合作' },
  { id: 9, type: 'red', label: '挑戰情境' },
  { id: 10, type: 'yellow', label: '通力合作' },
  { id: 11, type: 'green', label: '心靈補給' },
  { id: 12, type: 'red', label: '挑戰情境' },
  { id: 13, type: 'yellow', label: '通力合作' },
  { id: 14, type: 'destiny', label: '命運' },
  { id: 15, type: 'chance', label: '機會' },
  { id: 16, type: 'yellow', label: '通力合作' },
  { id: 17, type: 'green', label: '心靈補給' },
  { id: 18, type: 'red', label: '挑戰情境' },
  { id: 19, type: 'yellow', label: '通力合作' },
  { id: 20, type: 'destiny', label: '命運' },
  { id: 21, type: 'green', label: '心靈補給' },
  { id: 22, type: 'yellow', label: '通力合作' },
  { id: 23, type: 'red', label: '挑戰情境' },
  { id: 24, type: 'yellow', label: '通力合作' },
  { id: 25, type: 'chance', label: '機會' },
  { id: 26, type: 'green', label: '心靈補給' },
  { id: 27, type: 'red', label: '挑戰情境' },
  { id: 28, type: 'yellow', label: '通力合作' },
  { id: 29, type: 'green', label: '心靈補給' },
  { id: 30, type: 'destiny', label: '命運' },
  { id: 31, type: 'red', label: '挑戰情境' },
  { id: 32, type: 'green', label: '心靈補給' },
  { id: 33, type: 'yellow', label: '通力合作' },
  { id: 34, type: 'red', label: '挑戰情境' },
  { id: 35, type: 'chance', label: '機會' },
  { id: 36, type: 'yellow', label: '通力合作' },
  { id: 37, type: 'green', label: '心靈補給' },
  { id: 38, type: 'yellow', label: '通力合作' },
  { id: 39, type: 'red', label: '挑戰情境' },
];

export const yellowQuestions: YellowQuestion[] = [
  { id: 1, title: '心靈電波傳送', players: '2人', content: '兩人背對背，由一人發出一個特定的「節奏」（用拍手或手作樂器），另一人要完全同步模仿出一樣的強弱與頻率。', meaning: '練習「傾聽」對方的節奏，達成同步。' },
  { id: 2, title: '友誼指揮官', players: '3-4人', content: '一人矇眼，其餘組員只能用「聲音指令」引導矇眼者繞過教室內的桌椅障礙物，走到指定位置。', meaning: '建立「信任」與清晰的溝通。' },
  { id: 3, title: '默契畫筆', players: '2人', content: '兩人共同握住一支彩色筆，在不能說話的情況下，於紙上合作畫出一個「完整的圓形」或「一個愛心」。', meaning: '練習在合作中「互相配合力道」。' },
  { id: 4, title: '數字接龍不撞車', players: '3-4人', content: '全組閉眼，隨機喊出 1 到 10。如果同時有兩個人喊出同一個數字就要重來，直到順利接完。', meaning: '培養團隊的「空間感與觀察力」。' },
  { id: 5, title: '心情解碼器', players: '2人', content: '一位組員用肢體動作演出「朋友難過時的情緒」，另一位要給予正確的「安慰動作」（如拍肩、遞衛生紙）。', meaning: '練習「同理心」與情感支持。' },
  { id: 6, title: '友誼不倒翁', players: '2人', content: '兩人背對背坐下，手臂互相勾住，在不使用手撐地的情況下同時站起來。', meaning: '體會友誼中「互為支柱」的感覺。' },
  { id: 7, title: '人體運輸機', players: '3-4人', content: '小組成員僅用「指尖」支撐一根長尺或一枝筆，合力將其從桌子的一端移到另一端，期間筆不能掉落。', meaning: '學習在團隊中「維持平衡」。' },
  { id: 8, title: '合力圈圈', players: '3-4人', content: '組員手牽手圍成圈，在不鬆開手的情況下，讓一個呼拉圈（或用繩子做的圈）繞過所有人的身體回到原點。', meaning: '練習「解決問題」與身體協調。' },
  { id: 9, title: '影子模仿秀', players: '2人', content: '一人做連續動作，另一人要像「照鏡子」一樣完全同步做出相反方向的動作，維持 30 秒。', meaning: '專注於對方的行動，達成「共鳴」。' },
  { id: 10, title: '優點大聲公', players: '2-4人', content: '小組成員輪流對另一位組員說出一件「我欣賞你的地方」，每人至少說出一個具體細節。', meaning: '累積「正向情感存款」。' },
  { id: 11, title: '友誼合奏團', players: '2-4人', content: '利用剛才製作的簡易樂器，小組排練出一段 10 秒鐘的「自創節奏曲」表演給關主看。', meaning: '展現「多元性」與團隊合作的火花。' },
  { id: 12, title: '真心話接力', players: '2人', content: '互相回答一個問題：「你覺得好朋友最重要的一個特質是什麼？」並討論出兩人的共同答案。', meaning: '深化對「價值觀」的認識。' },
  { id: 13, title: '道歉與和好小劇場', players: '2人', content: '模擬一個吵架情境（例如：弄壞對方東西），兩人合作演出如何「誠懇道歉」與「大方原諒」。', meaning: '學習「修復關係」的技巧。' },
  { id: 14, title: '友誼藏寶圖', players: '3-4人', content: '組員一起想出 3 個「我們這組共同的興趣」（例如：都喜歡玩某個遊戲、都喜歡體育課），寫在紙上。', meaning: '尋找「共同點」以增進親密度。' },
  { id: 15, title: '情感大合照', players: '2-4人', content: '小組共同擺出一個代表「團結」或「健康友誼」的創意 Pose 給老師拍照。', meaning: '創造共同的「成功紀錄」。' },
];

export const greenQuestions: GreenQuestion[] = [
  { id: 1, title: '考砸了的下午', shareContent: '分享一次努力準備卻考不好的經驗。', comfortPractice: '如果朋友考不好，你會「拍拍他的肩膀」還是「陪他去操場跑一圈」？哪種方式他更喜歡？' },
  { id: 2, title: '落選的滋味', shareContent: '想參加比賽或當幹部卻沒被選上時的心情。', comfortPractice: '練習說出一句不帶評判的安慰，例如：「我知道你很看重這個，我會陪著你」。' },
  { id: 3, title: '被潑冷水的創意', shareContent: '興高采烈分享想法，卻被同學說「這好爛」或「這很無聊」。', comfortPractice: '分享者說出希望別人怎麼回應（例如：先聽完我的想法，不要馬上批評）。' },
  { id: 4, title: '努力沒被看見', shareContent: '默默做了很多打掃或雜事，卻沒有人發現或感謝。', comfortPractice: '練習給予「具體的肯定」，如：「我有看到你把窗溝擦得很乾淨，辛苦了」。' },
  { id: 5, title: '心愛的東西壞了', shareContent: '心愛的文具或手作樂器被弄壞時的沮喪。', comfortPractice: '討論除了「再買一個就好」，還有什麼話能讓對方心裡好過一點？' },
  { id: 6, title: '被誤解的紅眼眶', shareContent: '被老師或家長誤會，當下想解釋卻說不出口的委屈。', comfortPractice: '練習當一個「垃圾桶」，只聽不說，讓對方把話說完。' },
  { id: 7, title: '被排擠的孤單', shareContent: '發現大家在聊一個你不知道的話題，覺得自己像外星人。', comfortPractice: '分享如果你看到有人落單，你會用什麼方式邀請他加入？' },
  { id: 8, title: '不公平的對待', shareContent: '覺得老師偏心或是家長比較疼愛手足時的憤怒。', comfortPractice: '練習給予「情緒認同」，如：「換作是我也會覺得很不公平」。' },
  { id: 9, title: '被開了討厭的玩笑', shareContent: '同學覺得好笑，但你一點都不覺得好笑的情境。', comfortPractice: '分享當你生氣時，你希望朋友是「幫你一起出氣」還是「帶你離開現場」？' },
  { id: 10, title: '約定被放鴿子', shareContent: '興致勃勃約好要一起玩，對方卻臨時說不行的失落與生氣。', comfortPractice: '練習如何「誠實表達失望」而不是直接冷戰。' },
  { id: 11, title: '上台前的發抖', shareContent: '要在全班面前報告或表演前的緊張感。', comfortPractice: '小組成員一起為分享者設計一個「加油口號」或「擊掌動作」。' },
  { id: 12, title: '友誼的選擇題', shareContent: '當兩個好朋友吵架，要你「選邊站」時的壓力。', comfortPractice: '討論如何保持中立，並告訴雙方：「我兩個都想當朋友」。' },
  { id: 13, title: '永遠寫不完的作業', shareContent: '補習太多、作業寫到想哭的壓力。', comfortPractice: '分享一個簡單的放鬆法（如：一起深呼吸、聽一首手作樂器的曲子）。' },
  { id: 14, title: '擔心被朋友討厭', shareContent: '怕自己說錯話或做錯事，導致朋友不再理你的擔憂。', comfortPractice: '練習給予「安全感回饋」，如：「就算你偶爾犯錯，我還是你的朋友」。' },
  { id: 15, title: '對未來的小恐懼', shareContent: '想到要升國中或面對陌生的環境時的擔憂。', comfortPractice: '彼此分享：「我也會擔心，但我們可以一起面對」。' },
];

export const redQuestions: RedQuestion[] = [
  { id: 1, title: '拒絕的藝術', players: '2-3人', situation: '好朋友一直要借你看你的考卷答案，或是要你幫他做他不想做的打掃工作，你感到壓力很大。', task: '演出如何堅定但有禮貌地說「不」，且不破壞友誼。' },
  { id: 2, title: '傳話的小白兔', players: '3-4人', situation: '聽見朋友在背後說你的壞話，或是有人來傳話說「某某某說你很討厭」。', task: '演出你如何找當事人「直接確認真相」，而不是找人吵架。' },
  { id: 3, title: '被排擠的角落', players: '3-4人', situation: '下課時，一組朋友在聊天，當你靠近時他們突然安靜或走開。', task: '演出如何表達你的感受（例如：「你們突然走開讓我覺得有點難過」）。' },
  { id: 4, title: '玩笑開過頭', players: '2-3人', situation: '同學當眾拿你的外表或家人的名字開玩笑，大家都在笑，但你覺得很受傷。', task: '演出如何嚴肅地告訴對方：「我不喜歡這個玩笑，請你停止。」' },
  { id: 5, title: '分組的兩難', players: '3-4人', situation: '老師要求分組，你的好朋友想跟別人一組，把你落單了。', task: '演出如何處理當下的失落感，並主動詢問其他小組。' },
  { id: 6, title: '消失的隱私權', players: '2人', situation: '爸媽在沒經過你同意下，翻動你的書包或看你的日記、聊天紀錄。', task: '演出如何冷靜地跟爸媽溝通你需要「隱私與尊重」。' },
  { id: 7, title: '我的考卷不是你的面子', players: '2人', situation: '考卷發下來分數不如預期，爸媽只看分數就開始責備，不聽你的解釋。', task: '演出如何表達「我已經努力了」以及希望得到的支持方式。' },
  { id: 8, title: '手足的爭奪戰', players: '2-3人', situation: '弟弟/妹妹弄壞了你最心愛的模型或手作樂器，爸媽卻說「你是哥哥/姊姊要禮讓」。', task: '演出如何向爸媽表達公平性的重要，並與手足達成和解。' },
  { id: 9, title: '被禁止的休閒', players: '2人', situation: '你想玩遊戲或看影片放鬆，但爸媽認為你應該去讀書，雙方發生爭執。', task: '演出如何提出一個「時間分配協議」來達成雙贏。' },
  { id: 10, title: '比較後的陰影', players: '2人', situation: '爸媽拿你跟鄰居小孩或親戚比較（例如：你看人家多乖）。', task: '演出你如何說出心中的不舒服，並希望爸媽看見你的獨特性。' },
  { id: 11, title: '被誤解的真相', players: '2-3人', situation: '老師誤以為你在課堂上找人講話（其實是同學在問你問題），當眾點名責備你。', task: '演出在下課後，如何找老師冷靜地說明事情原委。' },
  { id: 12, title: '不公平的裁決', players: '3-4人', situation: '兩人在走廊碰撞，老師只處罰了其中一人（你），而另一人卻沒事。', task: '演出如何用平和語氣向老師申訴「希望標準一致」。' },
  { id: 13, title: '不敢開口提問', players: '2人', situation: '老師講課太快你聽不懂，但你怕提問會被老師覺得很笨或打斷進度。', task: '演出如何克服恐懼，舉手表達：「老師，這部分我可以再聽一次嗎？」' },
  { id: 14, title: '被沒收的物品', players: '2人', situation: '你不小心在課堂拿出不該出現的東西（如玩具或漫畫）被老師沒收，心情很沮喪。', task: '演出如何主動認錯，並詢問老師領回物品的條件（例如：表現良好一週）。' },
  { id: 15, title: '老師的偏心感', players: '3-4人', situation: '同學們覺得老師總是對某個特定學生比較好，大家心裡都不平衡。', task: '演出學生們如何集思廣益，用寫信或討論的方式向老師反映集體的感受。' },
];

export const chanceCards: SpecialCard[] = [
  { id: 1, title: '友誼升級券', description: '主動觀察到朋友的需要並給予幫助。', quality: 'good', effect: { type: 'composite', effects: [{ type: 'score_change', value: 100 }, { type: 'upgrade_building' }] } },
  { id: 2, title: '心靈導航儀', description: '學會了精準的溝通技巧，避開了不必要的誤會。', quality: 'good', effect: { type: 'choose_forward' } },
  { id: 3, title: '勇氣大聲公', description: '勇敢地向誤會的朋友道歉，雙方重修舊好。', quality: 'good', effect: { type: 'composite', effects: [{ type: 'move_forward', value: 2 }, { type: 'score_change', value: 100 }] } },
  { id: 4, title: '心碎的發火', description: '在沒弄清楚真相前就對朋友發脾氣。', quality: 'bad', effect: { type: 'composite', effects: [{ type: 'destroy_building' }, { type: 'score_change', value: -100 }] } },
  { id: 5, title: '隱私紅線', description: '不小心翻看了朋友的私人物品（日記或手機）。', quality: 'bad', effect: { type: 'roll_to_move_back' } },
  { id: 6, title: '關係重新整理', description: '覺得最近和大家的關係有點亂，決定清空偏見重新認識。', quality: 'neutral', effect: { type: 'move_to_start' } },
  { id: 7, title: '換位思考', description: '嘗試站在對方的立場想事情，心情變平靜了。', quality: 'neutral', effect: { type: 'stay' } },
];

export const destinyCards: SpecialCard[] = [
  { id: 1, title: '天使隊友現身', description: '心情低落時，朋友主動留了一張加油紙條。', quality: 'good', effect: { type: 'composite', effects: [{ type: 'score_change', value: 100 }, { type: 'extra_turn' }] } },
  { id: 2, title: '誤會冰釋', description: '之前的冷戰因為一個小契機意外和好了。', quality: 'good', effect: { type: 'upgrade_building' } },
  { id: 3, title: '幸運的轉角', description: '老師今天分組剛好把你跟最有默契的朋友湊在一起。', quality: 'good', effect: { type: 'choose_forward' } },
  { id: 4, title: '流言蜚語', description: '班上出現了一些關於你的不實傳聞，讓你心情低落。', quality: 'bad', effect: { type: 'composite', effects: [{ type: 'move_to_start' }, { type: 'score_change', value: -100 }] } },
  { id: 5, title: '突發的冷戰', description: '因為一個小意外，你和朋友陷入了尷尬的沉默。', quality: 'bad', effect: { type: 'composite', effects: [{ type: 'skip_turn' }, { type: 'move_backward', value: 3 }] } },
  { id: 6, title: '社交退潮期', description: '最近感到社交疲勞，想自己一個人靜一靜。', quality: 'neutral', effect: { type: 'roll_to_move_back' } },
  { id: 7, title: '大風吹', description: '班級位置調整，你換到了全新的鄰居旁邊。', quality: 'neutral', effect: { type: 'composite', effects: [{ type: 'move_to_start' }, { type: 'score_change', value: 100 }] } },
];

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getQuestionById(
  type: 'yellow' | 'red' | 'green',
  id: number
): YellowQuestion | RedQuestion | GreenQuestion | null {
  if (type === 'yellow') {
    return yellowQuestions.find((q) => q.id === id) || null;
  } else if (type === 'red') {
    return redQuestions.find((q) => q.id === id) || null;
  } else {
    return greenQuestions.find((q) => q.id === id) || null;
  }
}

export function getCardById(
  type: 'chance' | 'destiny',
  id: number
): SpecialCard | null {
  const deck = type === 'chance' ? chanceCards : destinyCards;
  return deck.find((card) => card.id === id) || null;
}
