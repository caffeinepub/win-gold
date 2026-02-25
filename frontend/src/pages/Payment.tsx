import { useState } from 'react';
import { useActor } from '../hooks/useActor';
import { AppUser } from '../App';
import { ArrowLeft, Loader2, CheckCircle, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  user: AppUser;
  onBack: () => void;
  onSuccess: () => void;
}

const AMOUNTS = [100, 500, 1000];

export default function Payment({ user, onBack, onSuccess }: Props) {
  const { actor } = useActor();
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [utr, setUtr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (utr.length !== 12) {
      toast.error('Please enter a valid 12-digit UTR number');
      return;
    }
    if (!actor) return;

    setIsSubmitting(true);
    try {
      await actor.createDepositRequest({
        userId: user.mobile,
        amount: BigInt(selectedAmount),
        utrNumber: utr,
      });
      setSubmitted(true);
      onSuccess();
      toast.success('Deposit request submitted! Admin will verify shortly.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="bg-navy-800 border-b border-gold-500/20 px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl bg-navy-700">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-game font-bold text-gold-400">Add Cash</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Request Submitted!</h2>
          <p className="text-muted-foreground">Your deposit of <span className="text-gold-400 font-bold">₹{selectedAmount}</span> has been submitted.</p>
          <p className="text-muted-foreground text-sm">Admin will verify your UTR and credit your wallet within 30 minutes.</p>
          <div className="bg-navy-700 border border-gold-500/20 rounded-xl p-4 w-full text-left">
            <p className="text-xs text-muted-foreground">UTR Number</p>
            <p className="font-bold text-foreground font-game tracking-widest">{utr}</p>
          </div>
          <button
            onClick={onBack}
            className="w-full py-4 rounded-xl gold-gradient text-navy-800 font-bold font-game"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-navy-800 border-b border-gold-500/20 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl bg-navy-700">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="font-game font-bold text-gold-400">Add Cash</h1>
          <p className="text-xs text-muted-foreground">Pay via PhonePe UPI</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Step 1: Amount */}
        <div className="bg-navy-700 border border-gold-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full gold-gradient text-navy-800 text-xs font-bold flex items-center justify-center">1</span>
            <p className="font-bold text-foreground">Select Amount</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {AMOUNTS.map((amt) => (
              <button
                key={amt}
                onClick={() => setSelectedAmount(amt)}
                className={`py-3 rounded-xl font-bold text-lg transition-all ${
                  selectedAmount === amt
                    ? 'gold-gradient text-navy-800 scale-105'
                    : 'bg-navy-800 border border-navy-500 text-foreground'
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>
          {selectedAmount === 100 && (
            <div className="mt-3 bg-gold-500/10 border border-gold-500/30 rounded-lg px-3 py-2">
              <p className="text-xs text-gold-400 font-bold">🎁 OFFER: Add ₹100 → Get ₹50 EXTRA = ₹150 Total!</p>
            </div>
          )}
        </div>

        {/* Step 2: QR Code */}
        <div className="bg-navy-700 border border-gold-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full gold-gradient text-navy-800 text-xs font-bold flex items-center justify-center">2</span>
            <p className="font-bold text-foreground">Pay via PhonePe</p>
          </div>
          <div className="bg-white rounded-xl p-4 flex flex-col items-center gap-3">
            {/* The user's uploaded QR code */}
            <img
              src="/assets/Screenshot_20260225-124254.jpg"
              alt="PhonePe QR Code"
              className="w-48 h-48 object-contain"
            />
            <div className="text-center">
              <p className="text-navy-800 font-bold text-sm">Pay to Merchant</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-navy-900 font-game font-black text-lg tracking-widest">7073791055</p>
                <button
                  onClick={() => { navigator.clipboard.writeText('7073791055'); toast.success('Number copied!'); }}
                  className="p-1 rounded bg-navy-100"
                >
                  <Copy className="w-3 h-3 text-navy-600" />
                </button>
              </div>
              <p className="text-navy-600 text-xs mt-1">Amount: <span className="font-bold text-navy-800">₹{selectedAmount}</span></p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Scan QR or pay to UPI: <span className="text-gold-400">7073791055@phonepe</span>
          </p>
        </div>

        {/* Step 3: UTR */}
        <div className="bg-navy-700 border border-gold-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full gold-gradient text-navy-800 text-xs font-bold flex items-center justify-center">3</span>
            <p className="font-bold text-foreground">Enter UTR Number</p>
          </div>
          <input
            type="text"
            maxLength={12}
            value={utr}
            onChange={(e) => setUtr(e.target.value.replace(/\D/g, ''))}
            placeholder="12-digit UTR number"
            className="w-full bg-navy-800 border border-gold-500/30 rounded-xl py-4 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold-500 text-lg tracking-widest font-game"
          />
          <p className="text-xs text-muted-foreground mt-2">
            After paying, find the 12-digit UTR/Reference number in your payment app
          </p>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted-foreground">{utr.length}/12 digits</span>
            {utr.length === 12 && <span className="text-xs text-green-400">✓ Valid</span>}
          </div>
        </div>

        {/* Step 4: Submit */}
        <div className="bg-navy-700 border border-gold-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full gold-gradient text-navy-800 text-xs font-bold flex items-center justify-center">4</span>
            <p className="font-bold text-foreground">Submit Request</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || utr.length !== 12}
            className="w-full py-4 rounded-xl gold-gradient text-navy-800 font-bold font-game text-lg disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
            ) : (
              <>✅ SUBMIT DEPOSIT REQUEST</>
            )}
          </button>
        </div>

        <div className="text-center pb-4">
          <p className="text-xs text-muted-foreground">
            Deposits are verified within 30 minutes. For help, contact Support.
          </p>
        </div>
      </div>
    </div>
  );
}
