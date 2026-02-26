import { useState } from 'react';
import { ArrowLeft, Wallet } from 'lucide-react';
import { AppUser } from '../App';

interface Props {
  user: AppUser;
  onBack: () => void;
}

const WITHDRAWAL_AMOUNTS = [100, 200, 500, 1000];

export default function Withdrawal({ user, onBack }: Props) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-navy-800 border-b border-gold-500/20 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl bg-navy-700">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="font-game font-bold text-gold-400">Withdrawal</h1>
          <p className="text-xs text-muted-foreground">Select amount to withdraw</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Wallet Balance */}
        <div className="bg-navy-700 border border-gold-500/30 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center flex-shrink-0">
            <Wallet className="w-5 h-5 text-navy-800" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Available Balance</p>
            <p className="text-2xl font-black font-game gold-text">
              ₹{Number(user.balance).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Amount Selection */}
        <div className="bg-navy-700 border border-gold-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full gold-gradient text-navy-800 text-xs font-bold flex items-center justify-center">
              1
            </span>
            <p className="font-bold text-foreground">Select Withdrawal Amount</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {WITHDRAWAL_AMOUNTS.map((amt) => (
              <button
                key={amt}
                onClick={() => setSelectedAmount(amt)}
                className={`py-5 rounded-xl font-bold text-xl transition-all duration-200 ${
                  selectedAmount === amt
                    ? 'gold-gradient text-navy-800 scale-105 shadow-lg shadow-gold-500/20'
                    : 'bg-navy-800 border border-navy-500 text-foreground hover:border-gold-500/50'
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>

          {selectedAmount && (
            <div className="mt-4 bg-gold-500/10 border border-gold-500/30 rounded-lg px-3 py-2">
              <p className="text-xs text-gold-400 font-bold text-center">
                ✅ ₹{selectedAmount} selected for withdrawal
              </p>
            </div>
          )}
        </div>

        {/* Info note */}
        <div className="bg-navy-700 border border-gold-500/20 rounded-xl p-4">
          <p className="text-xs text-muted-foreground text-center">
            More withdrawal options (UPI ID entry & submission) coming soon. Stay tuned!
          </p>
        </div>
      </div>
    </div>
  );
}
