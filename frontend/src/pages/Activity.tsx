import { useState } from 'react';
import { AppUser } from '../App';
import { Gift, Calendar, Flame, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  user: AppUser;
}

const DAILY_REWARDS = [5, 10, 15, 20, 25, 30, 50];

export default function Activity({ user }: Props) {
  const today = new Date().toDateString();
  const storageKey = `checkin_${user.mobile}`;
  const storedData = JSON.parse(localStorage.getItem(storageKey) || '{"lastCheckin": null, "streak": 0, "totalClaimed": 0}');

  const [lastCheckin, setLastCheckin] = useState<string | null>(storedData.lastCheckin);
  const [streak, setStreak] = useState<number>(storedData.streak);
  const [totalClaimed, setTotalClaimed] = useState<number>(storedData.totalClaimed);
  const [claimed, setClaimed] = useState(false);

  const canClaim = lastCheckin !== today;
  const todayReward = DAILY_REWARDS[Math.min(streak, DAILY_REWARDS.length - 1)];

  const handleClaim = () => {
    if (!canClaim) return;
    const newStreak = streak + 1;
    const newTotal = totalClaimed + todayReward;
    const data = { lastCheckin: today, streak: newStreak, totalClaimed: newTotal };
    localStorage.setItem(storageKey, JSON.stringify(data));
    setLastCheckin(today);
    setStreak(newStreak);
    setTotalClaimed(newTotal);
    setClaimed(true);
    toast.success(`🎁 ₹${todayReward} Daily Bonus Claimed!`);
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-navy-800 border-b border-gold-500/20 px-4 py-4">
        <h1 className="font-game font-bold text-gold-400 text-lg">Daily Activity</h1>
        <p className="text-xs text-muted-foreground">Check in every day to earn bonuses!</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Streak */}
        <div className="bg-navy-700 border border-gold-500/30 rounded-xl p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl gold-gradient flex items-center justify-center flex-shrink-0">
            <Flame className="w-7 h-7 text-navy-800" />
          </div>
          <div>
            <p className="text-2xl font-black font-game gold-text">{streak} Day Streak</p>
            <p className="text-sm text-muted-foreground">Total Earned: <span className="text-gold-400 font-bold">₹{totalClaimed}</span></p>
          </div>
        </div>

        {/* Weekly rewards */}
        <div className="bg-navy-700 border border-gold-500/20 rounded-xl p-4">
          <p className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gold-400" /> Weekly Rewards
          </p>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              const reward = DAILY_REWARDS[i];
              const isDone = i < (streak % 7);
              const isToday = i === (streak % 7);
              return (
                <div
                  key={day}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border ${
                    isDone
                      ? 'border-green-500/50 bg-green-500/10'
                      : isToday
                      ? 'border-gold-500 bg-gold-500/10'
                      : 'border-navy-500 bg-navy-800'
                  }`}
                >
                  <span className="text-xs text-muted-foreground">{day}</span>
                  {isDone ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Gift className={`w-4 h-4 ${isToday ? 'text-gold-400' : 'text-navy-400'}`} />
                  )}
                  <span className={`text-xs font-bold ${isToday ? 'text-gold-400' : isDone ? 'text-green-400' : 'text-muted-foreground'}`}>
                    ₹{reward}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Claim button */}
        <div className="bg-navy-700 border border-gold-500/20 rounded-xl p-4 text-center">
          <p className="text-muted-foreground text-sm mb-1">Today's Reward</p>
          <p className="text-4xl font-black font-game gold-text mb-4">₹{todayReward}</p>
          {canClaim && !claimed ? (
            <button
              onClick={handleClaim}
              className="w-full py-4 rounded-xl gold-gradient text-navy-800 font-bold font-game text-lg animate-pulse-glow"
            >
              🎁 CLAIM DAILY BONUS
            </button>
          ) : (
            <div className="w-full py-4 rounded-xl bg-navy-800 border border-green-500/30 text-green-400 font-bold flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {claimed ? 'Bonus Claimed! Come back tomorrow' : 'Already Claimed Today'}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="bg-navy-700 border border-gold-500/10 rounded-xl p-4 space-y-2">
          <p className="font-bold text-foreground text-sm">How it works:</p>
          <p className="text-xs text-muted-foreground">• Check in every day to maintain your streak</p>
          <p className="text-xs text-muted-foreground">• Higher streak = bigger daily bonus</p>
          <p className="text-xs text-muted-foreground">• Day 7 bonus: ₹50!</p>
          <p className="text-xs text-muted-foreground">• Missing a day resets your streak</p>
        </div>
      </div>
    </div>
  );
}
