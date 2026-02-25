import { useState } from 'react';
import { AppUser } from '../App';
import { Copy, Share2, Users, Gift, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  user: AppUser;
}

export default function ReferEarn({ user }: Props) {
  const [copied, setCopied] = useState(false);
  const referralLink = `${window.location.origin}?ref=${user.referralCode}`;

  const copyCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    setCopied(true);
    toast.success('Referral code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied!');
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join WinZone Gaming!',
        text: `Use my referral code ${user.referralCode} and get ₹50 bonus! Join WinZone Gaming now.`,
        url: referralLink,
      });
    } else {
      copyLink();
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-navy-800 border-b border-gold-500/20 px-4 py-4">
        <h1 className="font-game font-bold text-gold-400 text-lg">Refer & Earn</h1>
        <p className="text-xs text-muted-foreground">Invite friends and earn rewards!</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Hero */}
        <div className="bg-gradient-to-br from-navy-700 to-navy-800 border border-gold-500/30 rounded-2xl p-6 text-center">
          <div className="text-5xl mb-3">🎁</div>
          <h2 className="font-game font-bold text-2xl gold-text">Earn ₹50 Per Referral!</h2>
          <p className="text-muted-foreground text-sm mt-2">Your friend also gets ₹50 welcome bonus</p>
        </div>

        {/* Referral Code */}
        <div className="bg-navy-700 border border-gold-500/30 rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-2">Your Referral Code</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-navy-900 border border-gold-500/40 rounded-xl px-4 py-3">
              <p className="font-game font-black text-xl gold-text tracking-widest">{user.referralCode}</p>
            </div>
            <button
              onClick={copyCode}
              className={`p-3 rounded-xl transition-all ${copied ? 'bg-green-500/20 border border-green-500' : 'bg-gold-500/20 border border-gold-500/40'}`}
            >
              {copied ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-gold-400" />}
            </button>
          </div>
        </div>

        {/* Share buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={copyLink}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-navy-700 border border-gold-500/20 text-foreground font-bold"
          >
            <Copy className="w-4 h-4 text-gold-400" />
            Copy Link
          </button>
          <button
            onClick={shareLink}
            className="flex items-center justify-center gap-2 py-3 rounded-xl gold-gradient text-navy-800 font-bold"
          >
            <Share2 className="w-4 h-4" />
            Share Now
          </button>
        </div>

        {/* How it works */}
        <div className="bg-navy-700 border border-gold-500/20 rounded-xl p-4 space-y-3">
          <p className="font-bold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-gold-400" /> How it works
          </p>
          {[
            { step: '1', text: 'Share your referral code with friends', icon: '📤' },
            { step: '2', text: 'Friend signs up using your code', icon: '👤' },
            { step: '3', text: 'Friend gets ₹50 welcome bonus', icon: '🎁' },
            { step: '4', text: 'You earn ₹50 referral bonus!', icon: '💰' },
          ].map(({ step, text, icon }) => (
            <div key={step} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full gold-gradient text-navy-800 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {step}
              </div>
              <span className="text-sm text-foreground">{icon} {text}</span>
            </div>
          ))}
        </div>

        {/* Rewards info */}
        <div className="bg-gold-500/10 border border-gold-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-4 h-4 text-gold-400" />
            <p className="font-bold text-gold-400 text-sm">Referral Rewards</p>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Per successful referral</span>
              <span className="text-gold-400 font-bold">₹50</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Friend's welcome bonus</span>
              <span className="text-gold-400 font-bold">₹50</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">No limit on referrals</span>
              <span className="text-green-400 font-bold">Unlimited</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
