import { useState, useEffect } from 'react';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { AppUser, Page } from '../App';
import { LogOut, Trophy, TrendingUp, TrendingDown, Clock, Phone, Star, ArrowDownToLine } from 'lucide-react';
import { toast } from 'sonner';
import type { Game } from '../backend';

interface Props {
  user: AppUser;
  onLogout: () => void;
  navigateTo: (page: Page) => void;
}

export default function Account({ user, onLogout, navigateTo }: Props) {
  const { actor } = useActor();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [history, setHistory] = useState<Game[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (!actor) return;
    const fetchHistory = async () => {
      try {
        const games = await actor.getGameHistory(user.mobile);
        setHistory(games.slice().reverse());
      } catch {
        // ignore
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [actor, user.mobile]);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    onLogout();
    toast.success('Logged out successfully');
  };

  const totalWins = history.filter((g) => g.outcome === 'win').length;
  const totalLosses = history.filter((g) => g.outcome === 'loss').length;
  const totalProfit = history.reduce((sum, g) => sum + Number(g.profitLoss), 0);

  const vipLabel = `VIP ${Math.max(1, Number(user.vipLevel))}`;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-navy-800 border-b border-gold-500/20 px-4 py-4">
        <h1 className="font-game font-bold text-gold-400 text-lg">My Account</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Profile card */}
        <div className="bg-navy-700 border border-gold-500/30 rounded-xl p-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full border-2 border-gold-500 overflow-hidden flex-shrink-0">
            <img src="/assets/generated/avatar-default.dim_128x128.png" alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-foreground text-lg">{user.name}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full gold-gradient text-navy-800 font-bold font-game">{vipLabel}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground text-sm mt-0.5">
              <Phone className="w-3 h-3" />
              <span>+91 {user.mobile}</span>
            </div>
            <div className="flex items-center gap-1 text-gold-400 text-sm mt-0.5">
              <Star className="w-3 h-3" />
              <span>Ref: {user.referralCode}</span>
            </div>
          </div>
        </div>

        {/* Balance + Withdraw button */}
        <div className="bg-navy-700 border border-gold-500/30 rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Wallet Balance</p>
          <p className="text-3xl font-black font-game gold-text mb-3">
            ₹{Number(user.balance).toLocaleString('en-IN')}
          </p>
          <button
            onClick={() => navigateTo('withdrawal')}
            className="w-full py-3 rounded-xl bg-gold-500/10 border border-gold-500/40 text-gold-400 font-bold flex items-center justify-center gap-2 hover:bg-gold-500/20 transition-colors"
          >
            <ArrowDownToLine className="w-5 h-5" />
            Withdraw
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-navy-700 border border-gold-500/20 rounded-xl p-3 text-center">
            <Trophy className="w-5 h-5 text-gold-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{totalWins}</p>
            <p className="text-xs text-muted-foreground">Wins</p>
          </div>
          <div className="bg-navy-700 border border-gold-500/20 rounded-xl p-3 text-center">
            <TrendingDown className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{totalLosses}</p>
            <p className="text-xs text-muted-foreground">Losses</p>
          </div>
          <div className="bg-navy-700 border border-gold-500/20 rounded-xl p-3 text-center">
            <TrendingUp className={`w-5 h-5 mx-auto mb-1 ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`} />
            <p className={`text-xl font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalProfit >= 0 ? '+' : ''}₹{Math.abs(totalProfit)}
            </p>
            <p className="text-xs text-muted-foreground">P&L</p>
          </div>
        </div>

        {/* Game History */}
        <div className="bg-navy-700 border border-gold-500/20 rounded-xl p-4">
          <p className="font-bold text-foreground flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-gold-400" /> Game History
          </p>
          {loadingHistory ? (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">No games played yet. Start playing!</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {history.slice(0, 20).map((game, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-navy-600 last:border-0">
                  <div>
                    <p className="text-sm font-bold text-foreground capitalize">{game.gameName.replace(/-/g, ' ')}</p>
                    <p className="text-xs text-muted-foreground">
                      Bet: ₹{Number(game.betAmount)} · {new Date(Number(game.timestamp) / 1_000_000).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${game.outcome === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                      {game.outcome === 'win' ? '+' : ''}₹{Number(game.profitLoss)}
                    </span>
                    <p className={`text-xs ${game.outcome === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                      {game.outcome.toUpperCase()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>

        {/* Footer */}
        <div className="text-center pb-4">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} WinZone · Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-400 hover:text-gold-300"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
