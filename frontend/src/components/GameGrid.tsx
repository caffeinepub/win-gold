import { Page } from '../App';

interface Props {
  navigateTo: (page: Page, game?: string) => void;
}

const MULTIPLAYER_GAMES = [
  {
    id: 'dragon-vs-tiger',
    name: 'Dragon vs Tiger',
    desc: 'Most Popular',
    image: '/assets/generated/dragon-vs-tiger.dim_400x300.png',
    badge: '🔥 HOT',
    badgeColor: 'bg-red-500',
  },
  {
    id: '7-up-down',
    name: '7 Up Down',
    desc: 'Dice Game',
    image: '/assets/generated/seven-up-down.dim_400x300.png',
    badge: '🎲 DICE',
    badgeColor: 'bg-blue-600',
  },
  {
    id: 'andar-bahar',
    name: 'Andar Bahar',
    desc: 'Classic Card Game',
    image: '/assets/generated/andar-bahar.dim_400x300.png',
    badge: '🃏 CARDS',
    badgeColor: 'bg-purple-600',
  },
];

const SKILL_GAMES = [
  {
    id: 'ludo',
    name: 'Ludo',
    desc: 'Play with Friends',
    image: '/assets/generated/ludo-game.dim_400x300.png',
    badge: '🎯 SKILL',
    badgeColor: 'bg-green-600',
  },
  {
    id: 'mines',
    name: 'Mines',
    desc: 'Avoid the Mines',
    image: '/assets/generated/mines-game.dim_400x300.png',
    badge: '💣 MINES',
    badgeColor: 'bg-orange-600',
  },
  {
    id: 'crash',
    name: 'Crash',
    desc: 'Cash Out in Time',
    image: '/assets/generated/crash-game.dim_400x300.png',
    badge: '🚀 CRASH',
    badgeColor: 'bg-pink-600',
  },
];

interface GameCardProps {
  game: typeof MULTIPLAYER_GAMES[0];
  onClick: () => void;
}

function GameCard({ game, onClick }: GameCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-navy-700 border border-gold-500/20 rounded-xl overflow-hidden cursor-pointer active:scale-95 transition-all hover:border-gold-500/50 card-glow"
    >
      <div className="relative">
        <img
          src={game.image}
          alt={game.name}
          className="w-full h-28 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent" />
        <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full text-white ${game.badgeColor}`}>
          {game.badge}
        </span>
      </div>
      <div className="p-3">
        <h3 className="font-bold text-foreground text-sm leading-tight">{game.name}</h3>
        <p className="text-muted-foreground text-xs mt-0.5">{game.desc}</p>
        <button className="mt-2 w-full py-1.5 rounded-lg gold-gradient text-navy-800 text-xs font-bold font-game tracking-wide active:scale-95 transition-transform">
          PLAY NOW
        </button>
      </div>
    </div>
  );
}

export default function GameGrid({ navigateTo }: Props) {
  return (
    <div className="px-4 py-4 space-y-5">
      {/* Multiplayer Games */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 rounded-full bg-gold-500" />
          <h2 className="font-game font-bold text-gold-400 text-sm tracking-wider">MULTIPLAYER GAMES</h2>
          <span className="text-xs text-muted-foreground">(Badi Jeet)</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {MULTIPLAYER_GAMES.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onClick={() => navigateTo('game', game.id)}
            />
          ))}
        </div>
      </section>

      {/* Skill & Strategy */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 rounded-full bg-gold-500" />
          <h2 className="font-game font-bold text-gold-400 text-sm tracking-wider">SKILL & STRATEGY</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {SKILL_GAMES.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onClick={() => navigateTo('game', game.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
