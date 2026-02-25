import { useState, useEffect, useRef, useCallback } from 'react';
import { useActor } from '../hooks/useActor';
import { AppUser } from '../App';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  gameName: string;
  user: AppUser;
  onBack: () => void;
  onBalanceUpdate: () => void;
}

const BET_AMOUNTS = [10, 20, 50, 100, 200, 500];

// ─── Dragon vs Tiger ────────────────────────────────────────────────────────
function DragonVsTiger({ betAmount, onResult }: { betAmount: number; onResult: (win: boolean, pl: number) => void }) {
  const [choice, setChoice] = useState<'Dragon' | 'Tiger' | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);

  const play = () => {
    if (!choice) { toast.error('Pick Dragon or Tiger!'); return; }
    setAnimating(true);
    setTimeout(() => {
      const outcomes = ['Dragon', 'Tiger'];
      const outcome = outcomes[Math.floor(Math.random() * 2)];
      const win = outcome === choice;
      setResult(outcome);
      setAnimating(false);
      onResult(win, win ? betAmount : -betAmount);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {(['Dragon', 'Tiger'] as const).map((opt) => (
          <button
            key={opt}
            onClick={() => setChoice(opt)}
            className={`py-6 rounded-2xl border-2 font-bold text-lg transition-all ${
              choice === opt
                ? 'border-gold-500 bg-gold-500/20 text-gold-400 scale-105'
                : 'border-navy-500 bg-navy-700 text-foreground'
            }`}
          >
            <div className="text-4xl mb-2">{opt === 'Dragon' ? '🐉' : '🐯'}</div>
            {opt}
          </button>
        ))}
      </div>
      {result && (
        <div className={`text-center py-4 rounded-xl border ${result === choice ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-red-500 bg-red-500/10 text-red-400'}`}>
          <p className="text-2xl font-bold">{result === choice ? '🎉 YOU WIN!' : '😞 YOU LOSE'}</p>
          <p className="text-sm mt-1">Result: {result === 'Dragon' ? '🐉' : '🐯'} {result}</p>
        </div>
      )}
      <button
        onClick={play}
        disabled={animating || !choice}
        className="w-full py-4 rounded-xl gold-gradient text-navy-800 font-bold font-game text-lg disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {animating ? <><Loader2 className="w-5 h-5 animate-spin" /> Rolling...</> : '🎮 PLAY'}
      </button>
    </div>
  );
}

// ─── 7 Up Down ──────────────────────────────────────────────────────────────
function SevenUpDown({ betAmount, onResult }: { betAmount: number; onResult: (win: boolean, pl: number) => void }) {
  const [choice, setChoice] = useState<'Under 7' | 'Lucky 7' | 'Over 7' | null>(null);
  const [dice, setDice] = useState<[number, number] | null>(null);
  const [animating, setAnimating] = useState(false);

  const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

  const play = () => {
    if (!choice) { toast.error('Pick Under 7, Lucky 7, or Over 7!'); return; }
    setAnimating(true);
    setTimeout(() => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const sum = d1 + d2;
      setDice([d1, d2]);
      let win = false;
      let multiplier = 1;
      if (choice === 'Under 7' && sum < 7) { win = true; multiplier = 1; }
      else if (choice === 'Lucky 7' && sum === 7) { win = true; multiplier = 4; }
      else if (choice === 'Over 7' && sum > 7) { win = true; multiplier = 1; }
      setAnimating(false);
      onResult(win, win ? betAmount * multiplier : -betAmount);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {(['Under 7', 'Lucky 7', 'Over 7'] as const).map((opt) => (
          <button
            key={opt}
            onClick={() => setChoice(opt)}
            className={`py-4 rounded-xl border-2 font-bold text-sm transition-all ${
              choice === opt
                ? 'border-gold-500 bg-gold-500/20 text-gold-400 scale-105'
                : 'border-navy-500 bg-navy-700 text-foreground'
            }`}
          >
            <div className="text-2xl mb-1">{opt === 'Under 7' ? '⬇️' : opt === 'Lucky 7' ? '7️⃣' : '⬆️'}</div>
            {opt}
            {opt === 'Lucky 7' && <div className="text-xs text-gold-400 mt-1">4x Win!</div>}
          </button>
        ))}
      </div>
      {dice && (
        <div className="text-center">
          <div className="flex justify-center gap-4 text-5xl mb-2">
            <span>{DICE_FACES[dice[0] - 1]}</span>
            <span>{DICE_FACES[dice[1] - 1]}</span>
          </div>
          <p className="text-gold-400 font-bold">Sum: {dice[0] + dice[1]}</p>
        </div>
      )}
      <button
        onClick={play}
        disabled={animating || !choice}
        className="w-full py-4 rounded-xl gold-gradient text-navy-800 font-bold font-game text-lg disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {animating ? <><Loader2 className="w-5 h-5 animate-spin" /> Rolling...</> : '🎲 ROLL DICE'}
      </button>
    </div>
  );
}

// ─── Andar Bahar ────────────────────────────────────────────────────────────
function AndarBahar({ betAmount, onResult }: { betAmount: number; onResult: (win: boolean, pl: number) => void }) {
  const [choice, setChoice] = useState<'Andar' | 'Bahar' | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const CARDS = ['A♠', 'K♥', 'Q♦', 'J♣', '10♠', '9♥', '8♦', '7♣'];

  const play = () => {
    if (!choice) { toast.error('Pick Andar or Bahar!'); return; }
    setAnimating(true);
    setTimeout(() => {
      const outcome = Math.random() > 0.5 ? 'Andar' : 'Bahar';
      const card = CARDS[Math.floor(Math.random() * CARDS.length)];
      setResult(`${outcome} (${card})`);
      const win = outcome === choice;
      setAnimating(false);
      onResult(win, win ? betAmount : -betAmount);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {(['Andar', 'Bahar'] as const).map((opt) => (
          <button
            key={opt}
            onClick={() => setChoice(opt)}
            className={`py-6 rounded-2xl border-2 font-bold text-lg transition-all ${
              choice === opt
                ? 'border-gold-500 bg-gold-500/20 text-gold-400 scale-105'
                : 'border-navy-500 bg-navy-700 text-foreground'
            }`}
          >
            <div className="text-4xl mb-2">{opt === 'Andar' ? '🃏' : '🎴'}</div>
            {opt}
            <div className="text-xs text-muted-foreground mt-1">{opt === 'Andar' ? 'Inside' : 'Outside'}</div>
          </button>
        ))}
      </div>
      {result && (
        <div className={`text-center py-4 rounded-xl border ${result.startsWith(choice || '') ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-red-500 bg-red-500/10 text-red-400'}`}>
          <p className="text-xl font-bold">{result.startsWith(choice || '') ? '🎉 YOU WIN!' : '😞 YOU LOSE'}</p>
          <p className="text-sm mt-1">Card went to: {result}</p>
        </div>
      )}
      <button
        onClick={play}
        disabled={animating || !choice}
        className="w-full py-4 rounded-xl gold-gradient text-navy-800 font-bold font-game text-lg disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {animating ? <><Loader2 className="w-5 h-5 animate-spin" /> Dealing...</> : '🃏 DEAL CARD'}
      </button>
    </div>
  );
}

// ─── Ludo ───────────────────────────────────────────────────────────────────
function LudoGame({ betAmount, onResult }: { betAmount: number; onResult: (win: boolean, pl: number) => void }) {
  const [myPos, setMyPos] = useState(0);
  const [cpuPos, setCpuPos] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [lastRoll, setLastRoll] = useState<[number, number] | null>(null);
  const TOTAL = 20;
  const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

  const roll = () => {
    if (gameOver) return;
    setAnimating(true);
    setTimeout(() => {
      const myRoll = Math.floor(Math.random() * 6) + 1;
      const cpuRoll = Math.floor(Math.random() * 6) + 1;
      setLastRoll([myRoll, cpuRoll]);
      const newMyPos = Math.min(myPos + myRoll, TOTAL);
      const newCpuPos = Math.min(cpuPos + cpuRoll, TOTAL);
      setMyPos(newMyPos);
      setCpuPos(newCpuPos);
      setAnimating(false);
      if (newMyPos >= TOTAL) {
        setGameOver(true);
        onResult(true, betAmount);
      } else if (newCpuPos >= TOTAL) {
        setGameOver(true);
        onResult(false, -betAmount);
      }
    }, 800);
  };

  const reset = () => { setMyPos(0); setCpuPos(0); setGameOver(false); setLastRoll(null); };

  return (
    <div className="space-y-4">
      <div className="bg-navy-900 rounded-xl p-4 space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gold-400 font-bold">You 🔵</span>
            <span className="text-gold-400">{myPos}/{TOTAL}</span>
          </div>
          <div className="w-full bg-navy-700 rounded-full h-3">
            <div className="bg-gold-500 h-3 rounded-full transition-all duration-500" style={{ width: `${(myPos / TOTAL) * 100}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-red-400 font-bold">CPU 🔴</span>
            <span className="text-red-400">{cpuPos}/{TOTAL}</span>
          </div>
          <div className="w-full bg-navy-700 rounded-full h-3">
            <div className="bg-red-500 h-3 rounded-full transition-all duration-500" style={{ width: `${(cpuPos / TOTAL) * 100}%` }} />
          </div>
        </div>
      </div>
      {lastRoll && (
        <div className="flex justify-center gap-8 text-center">
          <div><p className="text-xs text-gold-400">Your Roll</p><span className="text-4xl">{DICE_FACES[lastRoll[0] - 1]}</span></div>
          <div><p className="text-xs text-red-400">CPU Roll</p><span className="text-4xl">{DICE_FACES[lastRoll[1] - 1]}</span></div>
        </div>
      )}
      {gameOver ? (
        <button onClick={reset} className="w-full py-4 rounded-xl bg-navy-600 text-foreground font-bold">🔄 Play Again</button>
      ) : (
        <button
          onClick={roll}
          disabled={animating}
          className="w-full py-4 rounded-xl gold-gradient text-navy-800 font-bold font-game text-lg disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {animating ? <><Loader2 className="w-5 h-5 animate-spin" /> Rolling...</> : '🎲 ROLL DICE'}
        </button>
      )}
    </div>
  );
}

// ─── Mines ──────────────────────────────────────────────────────────────────
function MinesGame({ betAmount, onResult }: { betAmount: number; onResult: (win: boolean, pl: number) => void }) {
  const GRID_SIZE = 16;
  const MINE_COUNT = 4;
  const [mines] = useState(() => {
    const m = new Set<number>();
    while (m.size < MINE_COUNT) m.add(Math.floor(Math.random() * GRID_SIZE));
    return m;
  });
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const gemsFound = revealed.size;
  const multiplier = 1 + gemsFound * 0.3;

  const reveal = (i: number) => {
    if (gameOver || revealed.has(i)) return;
    if (mines.has(i)) {
      setGameOver(true);
      setWon(false);
      onResult(false, -betAmount);
    } else {
      setRevealed((prev) => new Set([...prev, i]));
    }
  };

  const cashOut = () => {
    if (gemsFound === 0) { toast.error('Reveal at least one gem first!'); return; }
    setGameOver(true);
    setWon(true);
    const profit = Math.floor(betAmount * multiplier) - betAmount;
    onResult(true, profit);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-navy-900 rounded-xl px-4 py-2">
        <span className="text-sm text-muted-foreground">Gems: <span className="text-gold-400 font-bold">{gemsFound}</span></span>
        <span className="text-sm text-muted-foreground">Multiplier: <span className="text-gold-400 font-bold">{multiplier.toFixed(1)}x</span></span>
        <span className="text-sm text-muted-foreground">Win: <span className="text-gold-400 font-bold">₹{Math.floor(betAmount * multiplier)}</span></span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: GRID_SIZE }, (_, i) => {
          const isRevealed = revealed.has(i);
          const isMine = mines.has(i);
          const showMine = gameOver && isMine;
          return (
            <button
              key={i}
              onClick={() => reveal(i)}
              disabled={gameOver || isRevealed}
              className={`aspect-square rounded-xl text-2xl font-bold transition-all ${
                isRevealed
                  ? 'bg-green-500/20 border border-green-500'
                  : showMine
                  ? 'bg-red-500/20 border border-red-500'
                  : 'bg-navy-700 border border-navy-500 hover:border-gold-500/50 active:scale-95'
              }`}
            >
              {isRevealed ? '💎' : showMine ? '💣' : ''}
            </button>
          );
        })}
      </div>
      {!gameOver && (
        <button
          onClick={cashOut}
          disabled={gemsFound === 0}
          className="w-full py-3 rounded-xl bg-green-600 text-white font-bold font-game disabled:opacity-60"
        >
          💰 CASH OUT (₹{Math.floor(betAmount * multiplier)})
        </button>
      )}
      {gameOver && (
        <div className={`text-center py-3 rounded-xl border ${won ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-red-500 bg-red-500/10 text-red-400'}`}>
          {won ? `🎉 Cashed out ₹${Math.floor(betAmount * multiplier)}!` : '💣 BOOM! You hit a mine!'}
        </div>
      )}
    </div>
  );
}

// ─── Crash ──────────────────────────────────────────────────────────────────
function CrashGame({ betAmount, onResult }: { betAmount: number; onResult: (win: boolean, pl: number) => void }) {
  const [multiplier, setMultiplier] = useState(1.0);
  const [running, setRunning] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [cashOutMultiplier, setCashOutMultiplier] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const crashPointRef = useRef(0);

  const startGame = useCallback(() => {
    const crashPoint = 1 + Math.random() * 9; // 1x to 10x
    crashPointRef.current = crashPoint;
    setMultiplier(1.0);
    setCrashed(false);
    setCashedOut(false);
    setCashOutMultiplier(null);
    setRunning(true);

    intervalRef.current = setInterval(() => {
      setMultiplier((prev) => {
        const next = prev + 0.05;
        if (next >= crashPoint) {
          clearInterval(intervalRef.current!);
          setRunning(false);
          setCrashed(true);
          onResult(false, -betAmount);
          return parseFloat(crashPoint.toFixed(2));
        }
        return parseFloat(next.toFixed(2));
      });
    }, 100);
  }, [betAmount, onResult]);

  const cashOut = () => {
    if (!running || cashedOut) return;
    clearInterval(intervalRef.current!);
    setRunning(false);
    setCashedOut(true);
    setCashOutMultiplier(multiplier);
    const profit = Math.floor(betAmount * multiplier) - betAmount;
    onResult(true, profit);
  };

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return (
    <div className="space-y-4">
      <div className={`relative bg-navy-900 rounded-2xl p-8 text-center border-2 ${crashed ? 'border-red-500' : cashedOut ? 'border-green-500' : 'border-gold-500/30'}`}>
        <div className={`text-6xl font-game font-black mb-2 ${crashed ? 'text-red-400' : cashedOut ? 'text-green-400' : 'text-gold-400'}`}>
          {multiplier.toFixed(2)}x
        </div>
        <div className="text-4xl animate-rocket">🚀</div>
        {crashed && <p className="text-red-400 font-bold mt-2">💥 CRASHED!</p>}
        {cashedOut && <p className="text-green-400 font-bold mt-2">✅ Cashed Out at {cashOutMultiplier?.toFixed(2)}x!</p>}
        {running && <p className="text-gold-400 text-sm mt-2 animate-pulse">Multiplier increasing...</p>}
      </div>

      {!running && !crashed && !cashedOut && (
        <button
          onClick={startGame}
          className="w-full py-4 rounded-xl gold-gradient text-navy-800 font-bold font-game text-lg"
        >
          🚀 START GAME
        </button>
      )}
      {running && (
        <button
          onClick={cashOut}
          className="w-full py-4 rounded-xl bg-green-600 text-white font-bold font-game text-lg animate-pulse"
        >
          💰 CASH OUT (₹{Math.floor(betAmount * multiplier)})
        </button>
      )}
      {(crashed || cashedOut) && (
        <button
          onClick={startGame}
          className="w-full py-4 rounded-xl bg-navy-600 text-foreground font-bold"
        >
          🔄 Play Again
        </button>
      )}
    </div>
  );
}

// ─── Main GamePlay ───────────────────────────────────────────────────────────
const GAME_META: Record<string, { name: string; image: string; desc: string }> = {
  'dragon-vs-tiger': { name: 'Dragon vs Tiger', image: '/assets/generated/dragon-vs-tiger.dim_400x300.png', desc: 'Pick Dragon or Tiger and win 2x!' },
  '7-up-down': { name: '7 Up Down', image: '/assets/generated/seven-up-down.dim_400x300.png', desc: 'Bet on dice sum. Lucky 7 = 4x!' },
  'andar-bahar': { name: 'Andar Bahar', image: '/assets/generated/andar-bahar.dim_400x300.png', desc: 'Classic Indian card game!' },
  'ludo': { name: 'Ludo', image: '/assets/generated/ludo-game.dim_400x300.png', desc: 'Race to the finish line!' },
  'mines': { name: 'Mines', image: '/assets/generated/mines-game.dim_400x300.png', desc: 'Avoid mines, collect gems!' },
  'crash': { name: 'Crash', image: '/assets/generated/crash-game.dim_400x300.png', desc: 'Cash out before it crashes!' },
};

export default function GamePlay({ gameName, user, onBack, onBalanceUpdate }: Props) {
  const { actor } = useActor();
  const [betAmount, setBetAmount] = useState(10);
  const [gameKey, setGameKey] = useState(0);
  const [resultMsg, setResultMsg] = useState<{ win: boolean; amount: number } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  const meta = GAME_META[gameName] || { name: gameName, image: '', desc: '' };
  const balance = Number(user.balance);

  const handleResult = async (win: boolean, profitLoss: number) => {
    setResultMsg({ win, amount: Math.abs(profitLoss) });
    setHasPlayed(true);
    if (!actor) return;
    setIsRecording(true);
    try {
      await actor.recordGameRound(
        gameName,
        BigInt(betAmount),
        win ? 'win' : 'loss',
        BigInt(profitLoss)
      );
      await onBalanceUpdate();
      if (win) {
        toast.success(`🎉 You won ₹${Math.abs(profitLoss)}!`);
      } else {
        toast.error(`😞 You lost ₹${Math.abs(profitLoss)}`);
      }
    } catch (err: any) {
      if (err?.message?.includes('Insufficient balance')) {
        toast.error('Insufficient balance!');
      }
    } finally {
      setIsRecording(false);
    }
  };

  const resetGame = () => {
    setGameKey((k) => k + 1);
    setResultMsg(null);
    setHasPlayed(false);
  };

  const renderGame = () => {
    const props = { betAmount, onResult: handleResult };
    switch (gameName) {
      case 'dragon-vs-tiger': return <DragonVsTiger key={gameKey} {...props} />;
      case '7-up-down': return <SevenUpDown key={gameKey} {...props} />;
      case 'andar-bahar': return <AndarBahar key={gameKey} {...props} />;
      case 'ludo': return <LudoGame key={gameKey} {...props} />;
      case 'mines': return <MinesGame key={gameKey} {...props} />;
      case 'crash': return <CrashGame key={gameKey} {...props} />;
      default: return <div className="text-center text-muted-foreground">Game not found</div>;
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-navy-800 border-b border-gold-500/20 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl bg-navy-700 text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-game font-bold text-gold-400">{meta.name}</h1>
          <p className="text-xs text-muted-foreground">{meta.desc}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Balance</p>
          <p className="font-bold text-gold-400 font-game">₹{balance.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Game image */}
        <div className="relative rounded-xl overflow-hidden h-32">
          <img src={meta.image} alt={meta.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 to-transparent" />
        </div>

        {/* Bet selector */}
        {!hasPlayed && (
          <div className="bg-navy-700 border border-gold-500/20 rounded-xl p-4">
            <p className="text-sm font-bold text-gold-400 mb-3">Select Bet Amount</p>
            <div className="grid grid-cols-3 gap-2">
              {BET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setBetAmount(amt)}
                  disabled={amt > balance}
                  className={`py-2 rounded-lg font-bold text-sm transition-all ${
                    betAmount === amt
                      ? 'gold-gradient text-navy-800'
                      : 'bg-navy-800 border border-navy-500 text-foreground disabled:opacity-40'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">Bet: ₹{betAmount}</p>
          </div>
        )}

        {/* Game component */}
        {balance >= betAmount || hasPlayed ? (
          renderGame()
        ) : (
          <div className="text-center py-8 bg-navy-700 rounded-xl border border-red-500/30">
            <p className="text-red-400 font-bold">Insufficient Balance!</p>
            <p className="text-muted-foreground text-sm mt-1">Add cash to continue playing</p>
          </div>
        )}

        {/* Play again */}
        {hasPlayed && !isRecording && (
          <button
            onClick={resetGame}
            className="w-full py-3 rounded-xl bg-navy-600 border border-gold-500/30 text-foreground font-bold"
          >
            🔄 New Round
          </button>
        )}

        {isRecording && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Saving result...</span>
          </div>
        )}
      </div>
    </div>
  );
}
