import { AppUser, Page } from '../App';
import { Wallet, PlusCircle } from 'lucide-react';

interface Props {
  user: AppUser;
  navigateTo: (page: Page) => void;
}

const VIP_LABELS: Record<number, string> = {
  0: 'VIP 1',
  1: 'VIP 1',
  2: 'VIP 2',
  3: 'VIP 3',
  4: 'VIP 4',
  5: 'VIP 5',
};

export default function Header({ user, navigateTo }: Props) {
  const vipLabel = VIP_LABELS[Number(user.vipLevel)] || 'VIP 1';

  return (
    <header className="bg-navy-800 border-b border-gold-500/20 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Avatar + VIP */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className="w-12 h-12 rounded-full border-2 border-gold-500 overflow-hidden">
            <img
              src="/assets/generated/avatar-default.dim_128x128.png"
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full gold-gradient text-navy-800 font-game">
            {vipLabel}
          </span>
          <span className="text-xs text-navy-200 truncate max-w-[60px]">{user.name}</span>
        </div>

        {/* Center: Wallet */}
        <div className="flex-1 mx-2">
          <div className="bg-navy-900 border border-gold-500/40 rounded-xl px-4 py-2 animate-pulse-glow relative overflow-hidden">
            <div className="absolute inset-0 animate-shimmer opacity-30 pointer-events-none" />
            <div className="relative z-10 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-gold-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-navy-200 leading-none">Wallet Balance</p>
                <p className="text-xl font-bold font-game gold-text leading-tight">
                  ₹{Number(user.balance).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Add Cash */}
        <button
          onClick={() => navigateTo('payment')}
          className="flex-shrink-0 flex flex-col items-center gap-1 bg-gold-500 text-navy-800 rounded-xl px-3 py-2 font-bold text-xs animate-blink-gold active:scale-95 transition-transform"
        >
          <PlusCircle className="w-5 h-5" />
          <span className="font-game tracking-wide">ADD CASH</span>
        </button>
      </div>
    </header>
  );
}
