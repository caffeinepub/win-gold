import React, { useState, useEffect } from 'react';
import { ArrowLeft, Coins, TrendingUp, Zap, Target, Layers, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useActor } from '../hooks/useActor';
import { AppUser } from '../App';

interface Props {
  gameName: string;
  user: AppUser;
  onBack: () => void;
  onBalanceUpdate: () => void;
}

interface GameResult {
  outcome: string;
  profitLoss: number;
  message: string;
  win: boolean;
}

const BET_OPTIONS = [10, 20, 50, 100, 200, 500];

const GAME_CONFIGS: Record<string, { icon: React.ReactNode; color: string; description: string; image: string }> = {
  'Dragon vs Tiger': {
    icon: <Zap className="w-6 h-6" />,
    color: 'from-red-600 to-orange-500',
    description: 'Dragon ya Tiger — kiska card bada hoga?',
    image: '/assets/generated/dragon-vs-tiger.dim_400x300.png',
  },
  '7 Up Down': {
    icon: <Target className="w-6 h-6" />,
    color: 'from-blue-600 to-cyan-500',
    description: '7 se upar, neeche ya exactly 7?',
    image: '/assets/generated/seven-up-down.dim_400x300.png',
  },
  'Andar Bahar': {
    icon: <Layers className="w-6 h-6" />,
    color: 'from-green-600 to-emerald-500',
    description: 'Andar ya Bahar — card kahan aayega?',
    image: '/assets/generated/andar-bahar.dim_400x300.png',
  },
  'Ludo': {
    icon: <Coins className="w-6 h-6" />,
    color: 'from-purple-600 to-pink-500',
    description: 'Dice roll karo aur jeeto!',
    image: '/assets/generated/ludo-game.dim_400x300.png',
  },
  'Mines': {
    icon: <TrendingUp className="w-6 h-6" />,
    color: 'from-yellow-600 to-amber-500',
    description: 'Mines se bachte hue multiplier badhao!',
    image: '/assets/generated/mines-game.dim_400x300.png',
  },
  'Crash': {
    icon: <Rocket className="w-6 h-6" />,
    color: 'from-indigo-600 to-violet-500',
    description: 'Rocket crash hone se pehle cash out karo!',
    image: '/assets/generated/crash-game.dim_400x300.png',
  },
};

// --- Game Logic Helpers ---
function playDragonVsTiger(bet: number, choice: string): GameResult {
  const cards = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const dragon = cards[Math.floor(Math.random() * cards.length)];
  const tiger = cards[Math.floor(Math.random() * cards.length)];
  const dragonIdx = cards.indexOf(dragon);
  const tigerIdx = cards.indexOf(tiger);
  let win = false;
  if (choice === 'Dragon' && dragonIdx > tigerIdx) win = true;
  if (choice === 'Tiger' && tigerIdx > dragonIdx) win = true;
  if (choice === 'Tie' && dragonIdx === tigerIdx) win = true;
  const profitLoss = win ? (choice === 'Tie' ? bet * 8 : bet) : -bet;
  return {
    outcome: `Dragon: ${dragon} | Tiger: ${tiger}`,
    profitLoss,
    message: win ? `🎉 ${choice} Jeeta! +₹${Math.abs(profitLoss)}` : `😞 ${choice} Haara! -₹${Math.abs(profitLoss)}`,
    win,
  };
}

function play7UpDown(bet: number, choice: string): GameResult {
  const dice1 = Math.floor(Math.random() * 6) + 1;
  const dice2 = Math.floor(Math.random() * 6) + 1;
  const total = dice1 + dice2;
  let win = false;
  if (choice === 'Up' && total > 7) win = true;
  if (choice === 'Down' && total < 7) win = true;
  if (choice === '7' && total === 7) win = true;
  const multiplier = choice === '7' ? 4 : 1;
  const profitLoss = win ? bet * multiplier : -bet;
  return {
    outcome: `Dice: ${dice1} + ${dice2} = ${total}`,
    profitLoss,
    message: win ? `🎉 Sahi! Total ${total} — +₹${Math.abs(profitLoss)}` : `😞 Galat! Total ${total} — -₹${Math.abs(profitLoss)}`,
    win,
  };
}

function playAndarBahar(bet: number, choice: string): GameResult {
  const result = Math.random() < 0.5 ? 'Andar' : 'Bahar';
  const win = choice === result;
  const profitLoss = win ? bet : -bet;
  return {
    outcome: `Result: ${result}`,
    profitLoss,
    message: win ? `🎉 ${result} Aaya! +₹${Math.abs(profitLoss)}` : `😞 ${result} Aaya! -₹${Math.abs(profitLoss)}`,
    win,
  };
}

function playLudo(bet: number, choice: string): GameResult {
  const dice = Math.floor(Math.random() * 6) + 1;
  const win = String(dice) === choice;
  const profitLoss = win ? bet * 5 : -bet;
  return {
    outcome: `Dice: ${dice}`,
    profitLoss,
    message: win ? `🎉 ${dice} Aaya! +₹${Math.abs(profitLoss)}` : `😞 ${dice} Aaya! -₹${Math.abs(profitLoss)}`,
    win,
  };
}

function playMines(bet: number, choice: string): GameResult {
  const safeCount = parseInt(choice);
  const totalCells = 25;
  const mineCount = 5;
  let safe = true;
  for (let i = 0; i < safeCount; i++) {
    if (Math.random() < mineCount / (totalCells - i)) {
      safe = false;
      break;
    }
  }
  const multiplier = safe ? 1 + safeCount * 0.3 : 0;
  const profitLoss = safe ? Math.floor(bet * multiplier) : -bet;
  return {
    outcome: safe ? `${safeCount} safe tiles!` : 'Mine mili!',
    profitLoss,
    message: safe ? `🎉 Safe! +₹${Math.abs(profitLoss)}` : `💥 Mine! -₹${Math.abs(profitLoss)}`,
    win: safe,
  };
}

function playCrash(bet: number, choice: string): GameResult {
  const cashoutAt = parseFloat(choice);
  const crashAt = 1 + Math.random() * 9;
  const win = cashoutAt <= crashAt;
  const profitLoss = win ? Math.floor(bet * (cashoutAt - 1)) : -bet;
  return {
    outcome: `Crash: ${crashAt.toFixed(2)}x`,
    profitLoss,
    message: win
      ? `🚀 Cash out ${cashoutAt}x! +₹${Math.abs(profitLoss)}`
      : `💥 Crash ${crashAt.toFixed(2)}x pe! -₹${Math.abs(profitLoss)}`,
    win,
  };
}

function playGame(name: string, bet: number, choice: string): GameResult {
  switch (name) {
    case 'Dragon vs Tiger': return playDragonVsTiger(bet, choice);
    case '7 Up Down': return play7UpDown(bet, choice);
    case 'Andar Bahar': return playAndarBahar(bet, choice);
    case 'Ludo': return playLudo(bet, choice);
    case 'Mines': return playMines(bet, choice);
    case 'Crash': return playCrash(bet, choice);
    default: return { outcome: 'Unknown', profitLoss: 0, message: 'Game not found', win: false };
  }
}

function getDefaultChoice(name: string): string {
  switch (name) {
    case 'Dragon vs Tiger': return 'Dragon';
    case '7 Up Down': return 'Up';
    case 'Andar Bahar': return 'Andar';
    case 'Ludo': return '1';
    case 'Mines': return '3';
    case 'Crash': return '2';
    default: return '';
  }
}

// --- Choice Selectors ---
function DragonVsTigerChoices({ choice, setChoice }: { choice: string; setChoice: (c: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {['Dragon', 'Tie', 'Tiger'].map((opt) => (
        <button
          key={opt}
          onClick={() => setChoice(opt)}
          className={`py-3 rounded-xl font-bold text-sm transition-all border-2 ${
            choice === opt
              ? 'bg-gold-500 text-navy-900 border-gold-500 scale-105'
              : 'bg-navy-700 border-navy-500 text-foreground hover:border-gold-500/50'
          }`}
        >
          {opt === 'Dragon' ? '🐉 Dragon' : opt === 'Tiger' ? '🐯 Tiger' : '🤝 Tie'}
        </button>
      ))}
    </div>
  );
}

function SevenUpDownChoices({ choice, setChoice }: { choice: string; setChoice: (c: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: '⬇️ 7 Down', value: 'Down' },
        { label: '7️⃣ Lucky 7', value: '7' },
        { label: '⬆️ 7 Up', value: 'Up' },
      ].map((opt) => (
        <button
          key={opt.value}
          onClick={() => setChoice(opt.value)}
          className={`py-3 rounded-xl font-bold text-sm transition-all border-2 ${
            choice === opt.value
              ? 'bg-gold-500 text-navy-900 border-gold-500 scale-105'
              : 'bg-navy-700 border-navy-500 text-foreground hover:border-gold-500/50'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function AndarBaharChoices({ choice, setChoice }: { choice: string; setChoice: (c: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {['Andar', 'Bahar'].map((opt) => (
        <button
          key={opt}
          onClick={() => setChoice(opt)}
          className={`py-3 rounded-xl font-bold text-sm transition-all border-2 ${
            choice === opt
              ? 'bg-gold-500 text-navy-900 border-gold-500 scale-105'
              : 'bg-navy-700 border-navy-500 text-foreground hover:border-gold-500/50'
          }`}
        >
          {opt === 'Andar' ? '🃏 Andar' : '🎴 Bahar'}
        </button>
      ))}
    </div>
  );
}

function LudoChoices({ choice, setChoice }: { choice: string; setChoice: (c: string) => void }) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {['1', '2', '3', '4', '5', '6'].map((num) => (
        <button
          key={num}
          onClick={() => setChoice(num)}
          className={`py-3 rounded-xl font-bold text-lg transition-all border-2 ${
            choice === num
              ? 'bg-gold-500 text-navy-900 border-gold-500 scale-105'
              : 'bg-navy-700 border-navy-500 text-foreground hover:border-gold-500/50'
          }`}
        >
          {['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][parseInt(num) - 1]}
        </button>
      ))}
    </div>
  );
}

function MinesChoices({ choice, setChoice }: { choice: string; setChoice: (c: string) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {['3', '5', '7', '10'].map((num) => (
        <button
          key={num}
          onClick={() => setChoice(num)}
          className={`py-3 rounded-xl font-bold text-sm transition-all border-2 ${
            choice === num
              ? 'bg-gold-500 text-navy-900 border-gold-500 scale-105'
              : 'bg-navy-700 border-navy-500 text-foreground hover:border-gold-500/50'
          }`}
        >
          {num} Tiles
        </button>
      ))}
    </div>
  );
}

function CrashChoices({ choice, setChoice }: { choice: string; setChoice: (c: string) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {['1.5', '2', '3', '5'].map((mult) => (
        <button
          key={mult}
          onClick={() => setChoice(mult)}
          className={`py-3 rounded-xl font-bold text-sm transition-all border-2 ${
            choice === mult
              ? 'bg-gold-500 text-navy-900 border-gold-500 scale-105'
              : 'bg-navy-700 border-navy-500 text-foreground hover:border-gold-500/50'
          }`}
        >
          {mult}x
        </button>
      ))}
    </div>
  );
}

function GameChoices({ gameName, choice, setChoice }: { gameName: string; choice: string; setChoice: (c: string) => void }) {
  switch (gameName) {
    case 'Dragon vs Tiger': return <DragonVsTigerChoices choice={choice} setChoice={setChoice} />;
    case '7 Up Down': return <SevenUpDownChoices choice={choice} setChoice={setChoice} />;
    case 'Andar Bahar': return <AndarBaharChoices choice={choice} setChoice={setChoice} />;
    case 'Ludo': return <LudoChoices choice={choice} setChoice={setChoice} />;
    case 'Mines': return <MinesChoices choice={choice} setChoice={setChoice} />;
    case 'Crash': return <CrashChoices choice={choice} setChoice={setChoice} />;
    default: return null;
  }
}

function GameRules({ gameName }: { gameName: string }) {
  const rules: Record<string, string[]> = {
    'Dragon vs Tiger': [
      'Dragon aur Tiger ko ek-ek card milta hai',
      'Jiska card bada hoga woh jeeta',
      'Tie pe 8x payout milta hai',
      'Dragon/Tiger pe 2x payout',
    ],
    '7 Up Down': [
      '2 dice roll hote hain',
      '7 se upar (8-12) ya neeche (2-6) bet karo',
      'Exactly 7 pe 4x payout',
      'Up/Down pe 2x payout',
    ],
    'Andar Bahar': [
      'Ek card face-up rakha jaata hai',
      'Andar ya Bahar choose karo',
      'Matching card jis side aaye woh jeeta',
      '2x payout milta hai',
    ],
    'Ludo': [
      'Ek dice roll hota hai (1-6)',
      'Sahi number choose karo',
      'Sahi hone pe 5x payout',
      'Galat hone pe bet lose',
    ],
    'Mines': [
      '25 tiles mein 5 mines hain',
      'Kitni safe tiles kholni hain choose karo',
      'Zyada tiles = zyada multiplier',
      'Mine milne pe sab kuch lose',
    ],
    'Crash': [
      'Rocket launch hota hai aur multiplier badhta hai',
      'Crash hone se pehle cash out karo',
      'Apna target multiplier choose karo',
      'Crash pehle hua toh bet lose',
    ],
  };

  const gameRules = rules[gameName] || [];
  return (
    <ul className="space-y-1">
      {gameRules.map((rule, i) => (
        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
          <span className="text-gold-400 mt-0.5">•</span>
          {rule}
        </li>
      ))}
    </ul>
  );
}

// --- Main GamePlay Component ---
export default function GamePlay({ gameName, user, onBack, onBalanceUpdate }: Props) {
  const config = GAME_CONFIGS[gameName] || GAME_CONFIGS['Dragon vs Tiger'];
  const { actor } = useActor();

  const [betAmount, setBetAmount] = useState(50);
  const [choice, setChoice] = useState(() => getDefaultChoice(gameName));
  const [isPlaying, setIsPlaying] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);
  const [balance, setBalance] = useState<number>(() => Number(user.balance));
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [totalWinnings, setTotalWinnings] = useState(0);

  // Sync balance from user prop
  useEffect(() => {
    setBalance(Number(user.balance));
  }, [user.balance]);

  // Reset choice and result when game changes
  useEffect(() => {
    setChoice(getDefaultChoice(gameName));
    setResult(null);
    setRoundsPlayed(0);
    setTotalWinnings(0);
  }, [gameName]);

  const handlePlay = async () => {
    if (isPlaying) return;
    if (balance < betAmount) {
      alert('Balance kam hai! Pehle deposit karo.');
      return;
    }

    setIsPlaying(true);
    setResult(null);

    // Simulate game animation delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const gameResult = playGame(gameName, betAmount, choice);
    setResult(gameResult);

    const newBalance = Math.max(0, balance + gameResult.profitLoss);
    setBalance(newBalance);
    setRoundsPlayed((r) => r + 1);
    if (gameResult.win) setTotalWinnings((w) => w + gameResult.profitLoss);

    // Try to record on backend (non-blocking, best-effort)
    if (actor) {
      try {
        await actor.recordGameRound(
          gameName,
          BigInt(betAmount),
          gameResult.outcome,
          BigInt(gameResult.profitLoss),
        );
        // Refresh parent balance after successful backend record
        onBalanceUpdate();
      } catch {
        // Silently ignore backend errors — game already played locally
      }
    }

    setIsPlaying(false);
  };

  return (
    <div className="min-h-full bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-navy-800/95 backdrop-blur border-b border-gold-500/20 px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-navy-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${config.color} text-white`}>
            {config.icon}
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight text-foreground">{gameName}</h1>
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-gold-500/10 border border-gold-500/30 rounded-full px-3 py-1">
          <Coins className="w-4 h-4 text-gold-400" />
          <span className="text-sm font-bold text-gold-400">
            ₹{balance.toLocaleString()}
          </span>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
        {/* Game Image */}
        <div className="relative rounded-2xl overflow-hidden shadow-lg">
          <img
            src={config.image}
            alt={gameName}
            className="w-full h-40 object-cover"
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${config.color} opacity-30`} />
          <div className="absolute bottom-3 left-3 right-3 flex justify-between text-white text-sm font-medium drop-shadow">
            <span>🎮 Rounds: {roundsPlayed}</span>
            <span>💰 Winnings: ₹{totalWinnings}</span>
          </div>
        </div>

        {/* Result Display */}
        {result && (
          <div
            className={`rounded-2xl p-4 border-2 text-center transition-all ${
              result.win
                ? 'bg-green-500/10 border-green-500/50 text-green-400'
                : 'bg-red-500/10 border-red-500/50 text-red-400'
            }`}
          >
            <p className="text-2xl font-bold mb-1">{result.message}</p>
            <p className="text-sm opacity-80">{result.outcome}</p>
          </div>
        )}

        {/* Bet Selector */}
        <div className="bg-navy-700 rounded-2xl p-4 border border-gold-500/20">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            Bet Amount
          </h3>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {BET_OPTIONS.map((amt) => (
              <button
                key={amt}
                onClick={() => setBetAmount(amt)}
                className={`py-2 rounded-xl text-sm font-bold transition-all border-2 ${
                  betAmount === amt
                    ? 'bg-gold-500 text-navy-900 border-gold-500'
                    : 'bg-navy-800 border-navy-500 text-foreground hover:border-gold-500/50'
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Custom:</span>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 1))}
              className="flex-1 bg-navy-800 border border-navy-500 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold-500"
              min={1}
            />
          </div>
        </div>

        {/* Choice Selector */}
        <div className="bg-navy-700 rounded-2xl p-4 border border-gold-500/20">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            Apna Choice Chunein
          </h3>
          <GameChoices gameName={gameName} choice={choice} setChoice={setChoice} />
        </div>

        {/* Play Button */}
        <Button
          onClick={handlePlay}
          disabled={isPlaying || !choice}
          className={`w-full py-6 text-lg font-bold rounded-2xl transition-all bg-gradient-to-r ${config.color} text-white border-0 hover:opacity-90 disabled:opacity-50`}
        >
          {isPlaying ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              Playing...
            </span>
          ) : (
            `🎮 Play ₹${betAmount}`
          )}
        </Button>

        {/* Game Rules */}
        <div className="bg-navy-700 rounded-2xl p-4 border border-gold-500/20">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            Game Rules
          </h3>
          <GameRules gameName={gameName} />
        </div>
      </div>
    </div>
  );
}
