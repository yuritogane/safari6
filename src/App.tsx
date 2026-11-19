import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

type Question = { animal: string; food: string; emoji: string; hint: string };

const QUESTION_BANK: Question[] = [
  { animal: "ほっきょくぐま", food: "さかな", emoji: "🐻‍❄️", hint: "氷の海で暮らす白い大きなクマ" },
  { animal: "キリン", food: "き", emoji: "🦒", hint: "木の高いところにある葉っぱが大好き" },
  { animal: "シマウマ", food: "くさ", emoji: "🦓", hint: "草原の草を食べるよ" },
  { animal: "ライオン", food: "にく", emoji: "🦁", hint: "ほかの動物のお肉を食べるよ" },
  { animal: "カバ", food: "くさ", emoji: "🦛", hint: "夜に草をたくさん食べるよ" },
  { animal: "チーター", food: "にく", emoji: "🐆", hint: "すばやく狩りをする肉食動物" },
  { animal: "ゾウ", food: "き", emoji: "🐘", hint: "木の葉や枝も食べるよ" },
  { animal: "サル", food: "ばなな", emoji: "🐒", hint: "黄色くて甘い果物" },
  { animal: "パンダ", food: "ささ", emoji: "🐼", hint: "笹をむしゃむしゃ" },
  { animal: "コアラ", food: "ゆーかり", emoji: "🐨", hint: "特別な木の葉が大好物" },
  { animal: "ウサギ", food: "にんじん", emoji: "🐰", hint: "オレンジ色の野菜" },
  { animal: "ラクダ", food: "くさ", emoji: "🐫", hint: "砂漠でも食べられる植物" },
  { animal: "フラミンゴ", food: "えび", emoji: "🦩", hint: "水辺の小さな生き物" },
  { animal: "カンガルー", food: "くさ", emoji: "🦘", hint: "草や葉を食べるよ" },
  { animal: "ペンギン", food: "さかな", emoji: "🐧", hint: "海で魚を捕まえるよ" },
  { animal: "イルカ", food: "さかな", emoji: "🐬", hint: "海の中で泳いで捕まえる" },
  { animal: "クジラ", food: "ぷらんくとん", emoji: "🐳", hint: "海に漂う小さな生き物" },
  { animal: "ハリネズミ", food: "むし", emoji: "🦔", hint: "小さな虫を探して食べる" },
  { animal: "リス", food: "どんぐり", emoji: "🐿️", hint: "秋に集める木の実" },
  { animal: "シカ", food: "はっぱ", emoji: "🦌", hint: "木の葉や草を食べる" },
  { animal: "オオカミ", food: "にく", emoji: "🐺", hint: "群れで狩りをする" },
  { animal: "キツネ", food: "ねずみ", emoji: "🦊", hint: "小さな動物を捕まえる" },
  { animal: "クマ", food: "はちみつ", emoji: "🐻", hint: "甘いものが好きなイメージ" },
  { animal: "トラ", food: "にく", emoji: "🐯", hint: "大型の肉食動物" },
  { animal: "ヒツジ", food: "くさ", emoji: "🐑", hint: "牧草を食べるよ" },
  { animal: "ヤギ", food: "はっぱ", emoji: "🐐", hint: "木の葉も食べるよ" },
  { animal: "ウシ", food: "くさ", emoji: "🐄", hint: "牧草をもぐもぐ" },
  { animal: "ブタ", food: "いも", emoji: "🐷", hint: "野菜や穀物などを食べる" },
  { animal: "カエル", food: "はえ", emoji: "🐸", hint: "飛んでいる虫を捕まえる" },
  { animal: "フクロウ", food: "ねずみ", emoji: "🦉", hint: "夜に小動物を捕まえる" },
  { animal: "カワウソ", food: "さかな", emoji: "🦦", hint: "水辺で魚を捕まえる" },
  { animal: "ビーバー", food: "き", emoji: "🦫", hint: "樹皮や木の葉を食べる" },
  { animal: "アリクイ", food: "あり", emoji: "🐜", hint: "長い舌で集める虫" },
  { animal: "ミーアキャット", food: "むし", emoji: "🦡", hint: "立ち上がって周りを見張る" },
  { animal: "ラッコ", food: "うに", emoji: "🦦", hint: "お腹の上で貝やウニをわるよ" }
];

const KANA = [
  ["あ","い","う","え","お"],["か","き","く","け","こ"],["さ","し","す","せ","そ"],
  ["た","ち","つ","て","と"],["な","に","ぬ","ね","の"],["は","ひ","ふ","へ","ほ"],
  ["ま","み","む","め","も"],["や","（）","ゆ","（）","よ"],["ら","り","る","れ","ろ"],
  ["わ","を","ん","ー","。"],["が","ぎ","ぐ","げ","ご"],["ざ","じ","ず","ぜ","ぞ"],
  ["だ","ぢ","づ","で","ど"],["ば","び","ぶ","べ","ぼ"],["ぱ","ぴ","ぷ","ぺ","ぽ"]
];

const animals = ["🦒","🦓","🦁","🐘","🦛"];
const QUESTION_SECONDS = 10;

function shuffle<T>(items: T[]) { return [...items].sort(() => Math.random() - 0.5); }
function toHiragana(text: string) { return text.replace(/[ァ-ン]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60)); }

function normalizeKana(text: string) {
  const normMap: Record<string, string> = {
    'っ': 'つ', 'ゃ': 'や', 'ゅ': 'ゆ', 'ょ': 'よ',
    'ぁ': 'あ', 'ぃ': 'い', 'ぅ': 'う', 'ぇ': 'え', 'ぉ': 'お'
  };
  return toHiragana(text).split("").map(c => normMap[c] || c).join("");
}

function toggleSmallOrVoiced(text: string): string {
  if (!text) return text;
  const last = text.slice(-1);
  const rest = text.slice(0, -1);
  const toggleMap: Record<string, string> = {
    'つ': 'っ', 'っ': 'つ',
    'よ': 'ょ', 'ょ': 'よ',
    'や': 'ゃ', 'ゃ': 'や',
    'ゆ': 'ゅ', 'ゅ': 'ゆ',
    'あ': 'ぁ', 'ぁ': 'あ',
    'い': 'ぃ', 'ぃ': 'い',
    'う': 'ぅ', 'ぅ': 'う',
    'え': 'ぇ', 'ぇ': 'え',
    'お': 'ぉ', 'ぉ': 'お',
    'か': 'が', 'が': 'か', 'き': 'ぎ', 'ぎ': 'き', 'く': 'ぐ', 'ぐ': 'く', 'け': 'げ', 'げ': 'け', 'こ': 'ご', 'ご': 'こ',
    'は': 'ば', 'ば': 'ぱ', 'ぱ': 'は'
  };
  return rest + (toggleMap[last] || last);
}

export default function App() {
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(60);
  const [questionTimer, setQuestionTimer] = useState(QUESTION_SECONDS);
  const [revealingAnswer, setRevealingAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [question, setQuestion] = useState<Question>(QUESTION_BANK[0]);
  const [typed, setTyped] = useState("");
  const [message, setMessage] = useState("スタートボタンを押してね！");
  const [finished, setFinished] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const timerRef = useRef<number | null>(null);
  const questionTimerRef = useRef<number | null>(null);
  const advanceTimeoutRef = useRef<number | null>(null);
  const questionDeck = useRef<Question[]>([]);
  const deckIndex = useRef(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const clearAdvanceTimeout = () => {
    if (advanceTimeoutRef.current !== null) {
      window.clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
  };

  const nextQuestion = useCallback(() => {
    clearAdvanceTimeout();
    const deck = questionDeck.current;
    if (deckIndex.current >= deck.length) {
      questionDeck.current = shuffle(QUESTION_BANK);
      deckIndex.current = 0;
    }
    const q = questionDeck.current[deckIndex.current++];
    setQuestion(q);
    setTyped("");
    setRevealingAnswer(false);
    setQuestionTimer(QUESTION_SECONDS);
    setMessage("動物の名前をフリック入力しよう！（10秒以内に答えてね）");
  }, []);

  const startGame = () => {
    clearAdvanceTimeout();
    questionDeck.current = shuffle(QUESTION_BANK);
    deckIndex.current = 0;
    setScore(0);
    setCorrect(0);
    setTime(60);
    setFinished(false);
    setCelebrate(false);
    setRevealingAnswer(false);
    setQuestionTimer(QUESTION_SECONDS);
    setPlaying(true);
    nextQuestion();
  };

  useEffect(() => {
    if (!playing) return;
    timerRef.current = window.setInterval(() => {
      setTime(t => {
        if (t <= 1) {
          setPlaying(false);
          setFinished(true);
          clearAdvanceTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [playing]);

  // 1問あたり10秒カウントダウン：0になったら次の問題へ進む直前に正解を表示
  useEffect(() => {
    if (!playing || revealingAnswer || finished) return;
    questionTimerRef.current = window.setInterval(() => {
      setQuestionTimer(prev => {
        if (prev <= 1) {
          setRevealingAnswer(true);
          const answerHiragana = toHiragana(question.animal);
          setTyped(answerHiragana);
          setMessage(`時間切れ！ 正解は「${answerHiragana}」(${question.emoji}${question.animal}) だったよ！`);
          advanceTimeoutRef.current = window.setTimeout(() => {
            nextQuestion();
          }, 1500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (questionTimerRef.current) window.clearInterval(questionTimerRef.current);
    };
  }, [playing, revealingAnswer, finished, question, nextQuestion]);

  useEffect(() => {
    return () => {
      clearAdvanceTimeout();
    };
  }, []);

  const checkAnswer = (inputStr: string) => {
    if (revealingAnswer) return;
    const target = toHiragana(question.animal);
    if (inputStr === target || normalizeKana(inputStr) === normalizeKana(target)) {
      setTyped(target);
      setRevealingAnswer(true);
      setScore(s => s + 10);
      const nextCorrect = correct + 1;
      setCorrect(nextCorrect);
      setMessage(`せいかい！ ${question.emoji} ${question.animal}もよろこんでいるよ！`);
      if (nextCorrect >= 10) {
        setPlaying(false);
        setFinished(true);
        setCelebrate(true);
        return;
      }
      advanceTimeoutRef.current = window.setTimeout(() => {
        nextQuestion();
      }, 650);
    } else if (!normalizeKana(target).startsWith(normalizeKana(inputStr))) {
      setMessage("ちがう文字みたい！「けす」や「小゛゜」で直してみよう");
    } else {
      setMessage("いい調子！ あと少しだよ！");
    }
  };

  const addKana = (kana: string) => {
    if (!playing || revealingAnswer || kana === "（）") return;
    const next = typed + kana;
    setTyped(next);
    checkAnswer(next);
  };

  const handleToggleSmall = () => {
    if (!playing || revealingAnswer || !typed) return;
    const updated = toggleSmallOrVoiced(typed);
    setTyped(updated);
    checkAnswer(updated);
  };

  const swipeKana = (e: React.PointerEvent<HTMLButtonElement>, row: string[]) => {
    if (!touchStart.current) return;
    const dx = e.clientX - touchStart.current.x, dy = e.clientY - touchStart.current.y;
    const threshold = 20;
    let index = 0;
    if (Math.abs(dx) > Math.abs(dy)) { index = dx > threshold ? 3 : dx < -threshold ? 1 : 0; }
    else { index = dy > threshold ? 4 : dy < -threshold ? 2 : 0; }
    addKana(row[index]);
    touchStart.current = null;
  };

  const handleKeyPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    touchStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleKeyPointerUp = (e: React.PointerEvent<HTMLButtonElement>, row: string[]) => {
    e.preventDefault();
    swipeKana(e, row);
  };

  const animalsMoving = useMemo(() => animals.map((emoji, i) => ({ emoji, i })), []);

  return (
    <main className="game-shell">
      <div className="sun"></div>
      <div className="cloud cloud-one">☁</div>
      <div className="cloud cloud-two">☁</div>

      <header className="game-header">
        <div className="brand">
          <span>🌞</span>
          <div>
            <small>SAFARI FLICK</small>
            <h1>どうぶつフリック！</h1>
          </div>
        </div>
        <div className="stats">
          <div className="stat timer"><small>のこり時間</small><strong>⏱ {time}<small>秒</small></strong></div>
          <div className="stat q-timer"><small>この問題</small><strong>⏳ {questionTimer}<small>秒</small></strong></div>
          <div className="stat score"><small>スコア</small><strong>⭐ {score}<small>点</small></strong></div>
          <div className="stat count"><small>せいかい</small><strong>{correct}<small>/10</small></strong></div>
        </div>
      </header>

      <section className="savanna">
        <div className="mountains"></div>
        <div className="tree tree-left">🌳</div>
        <div className="tree tree-right">🌳</div>

        <div className="question-card">
          <div className="question-title">この動物の名前は？</div>
          <div className="animal-big">{question.emoji}</div>
          <div className="answer-slots">
            {toHiragana(question.animal).split("").map((_, i) => (
              <span key={i} className={typed[i] ? (revealingAnswer ? "filled reveal" : "filled") : ""}>
                {typed[i] || "＿"}
              </span>
            ))}
          </div>
          <div className="hint">💡 {question.hint}</div>
        </div>

        {/* 重ならないように単独レーン＆時間差で足を動かして歩く動物たち */}
        <div className="animal-runners">
          {animalsMoving.map(({ emoji, i }) => (
            <div key={i} className={`runner-lane runner-lane-${i}`}>
              <span className={`runner runner-${i}`}>{emoji}</span>
            </div>
          ))}
        </div>

        <div className="ground"></div>
        <div className="message">{message}</div>
      </section>

      <section className="keyboard-area">
        <div className="keyboard-heading">
          <span className="keyboard-label">👆 フリックして文字を入力</span>
          <div className="keyboard-tools">
            <button
              className="tool-btn"
              onClick={handleToggleSmall}
              disabled={!playing || revealingAnswer || !typed}
            >
              小 ゛ ゜
            </button>
            <button
              className="tool-btn"
              onClick={() => {
                if (!revealingAnswer) setTyped(t => t.slice(0, -1));
              }}
              disabled={!playing || revealingAnswer || !typed}
            >
              ⌫ 1文字けす
            </button>
          </div>
        </div>

        <div className="kana-grid">
          {KANA.map((row, i) => (
            <button
              className="kana-key"
              key={i}
              onPointerDown={handleKeyPointerDown}
              onPointerUp={e => handleKeyPointerUp(e, row)}
              onPointerCancel={() => { touchStart.current = null; }}
            >
              {row[0]}
              <small>↑{row[2]} ←{row[1]} →{row[3]} ↓{row[4]}</small>
            </button>
          ))}
        </div>

        <div className="bottom-actions">
          {!playing ? (
            <button className="start-button" onClick={startGame}>
              {finished ? "🔄 もう一度挑戦！" : "▶ ゲームスタート！"}
            </button>
          ) : (
            <button
              className="giveup-button"
              onClick={() => {
                clearAdvanceTimeout();
                setPlaying(false);
                setFinished(true);
              }}
            >
              ゲーム終了
            </button>
          )}
        </div>
      </section>

      {finished && (
        <div className="result-overlay">
          <div className="result-card">
            {celebrate ? (
              <>
                <div className="confetti">🎊🎉🎊</div>
                <div className="kusudama">🎊</div>
                <h2>やったね！</h2>
                <h3>動物博士！ 天才！</h3>
                <p>10問ぜんぶ正解！すごいね！</p>
              </>
            ) : (
              <>
                <h2>ゲーム終了！</h2>
                <p>よくがんばったね！</p>
              </>
            )}
            <div className="final-score">⭐ {score} 点 <span>{correct}/10問</span></div>
            <button className="start-button" onClick={startGame}>🔁 もう一度挑戦する</button>
          </div>
        </div>
      )}

      <footer>🌿 どうぶつたちと楽しくフリック！ 🌿</footer>
    </main>
  );
}
