import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { AppUser } from '../App';
import { toast } from 'sonner';
import { Loader2, Gamepad2, Smartphone, User, Gift, ShieldCheck, RefreshCw } from 'lucide-react';

interface Props {
  onSuccess: (user: AppUser) => void;
}

interface OtpState {
  code: string;
  generatedAt: number; // timestamp in ms
  attempts: number;
}

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 3;

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function LoginSignup({ onSuccess }: Props) {
  const { login, identity, isLoggingIn, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();

  const [step, setStep] = useState<'auth' | 'mobile' | 'otp' | 'name'>('auth');
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // OTP state
  const [otpState, setOtpState] = useState<OtpState | null>(null);
  const [otpInput, setOtpInput] = useState('');

  const handleLogin = () => {
    login();
  };

  const sendOtp = () => {
    const code = generateOTP();
    setOtpState({ code, generatedAt: Date.now(), attempts: 0 });
    setOtpInput('');
    setErrorMsg('');
  };

  // When identity is available, move to OTP step
  const handleContinueWithMobile = async () => {
    setErrorMsg('');
    if (!mobile || mobile.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!actor) {
      setErrorMsg('Please wait, connecting...');
      return;
    }
    sendOtp();
    setStep('otp');
  };

  const handleResendOtp = () => {
    sendOtp();
    toast.success('New OTP generated!');
  };

  const handleVerifyOtp = async () => {
    setErrorMsg('');

    if (!otpState) {
      setErrorMsg('OTP not generated. Please go back and try again.');
      return;
    }

    // Check expiry
    if (Date.now() - otpState.generatedAt > OTP_EXPIRY_MS) {
      setErrorMsg('OTP expired. Please resend.');
      return;
    }

    // Check attempts
    if (otpState.attempts >= MAX_ATTEMPTS) {
      setErrorMsg('Too many failed attempts. Please restart.');
      return;
    }

    if (otpInput.trim() !== otpState.code) {
      const newAttempts = otpState.attempts + 1;
      setOtpState({ ...otpState, attempts: newAttempts });

      if (newAttempts >= MAX_ATTEMPTS) {
        setErrorMsg('Too many failed attempts. Please go back and restart.');
        setOtpState(null);
      } else {
        setErrorMsg(`Incorrect OTP. Please try again. (${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts === 1 ? '' : 's'} left)`);
      }
      return;
    }

    // OTP verified — clear OTP state and proceed
    setOtpState(null);
    setOtpInput('');
    setErrorMsg('');

    if (!actor) {
      setErrorMsg('Please wait, connecting...');
      return;
    }

    setIsSubmitting(true);
    try {
      try {
        const user = await actor.loginUser(mobile);
        onSuccess({
          mobile: user.mobile,
          name: user.name,
          balance: user.balance,
          vipLevel: user.vipLevel,
          referralCode: user.referralCode,
        });
        toast.success(`Welcome back, ${user.name}! 🎮`);
      } catch {
        // User not found, go to registration
        setIsNewUser(true);
        setStep('name');
      }
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async () => {
    setErrorMsg('');
    if (!name.trim()) {
      setErrorMsg('Please enter your name');
      return;
    }
    if (!actor) {
      setErrorMsg('Please wait, connecting...');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await actor.registerUser(mobile, name.trim(), referralCode.trim() || '');

      if (result.__kind__ === 'success') {
        const user = result.success;
        onSuccess({
          mobile: user.mobile,
          name: user.name,
          balance: user.balance,
          vipLevel: user.vipLevel,
          referralCode: user.referralCode,
        });
        toast.success('🎉 Welcome! ₹50 bonus credited to your wallet!');
      } else if (result.__kind__ === 'mobileAlreadyExists') {
        setErrorMsg('This mobile number is already registered. Please login instead.');
        setIsNewUser(false);
        setStep('mobile');
        toast.error('Mobile number already registered. Please login.');
      } else if (result.__kind__ === 'invalidMobileFormat') {
        setErrorMsg('Invalid mobile number format. Please enter a valid 10-digit number.');
        setStep('mobile');
      } else if (result.__kind__ === 'invalidReferralCode') {
        setErrorMsg('Invalid referral code. Please check and try again, or leave it empty.');
        setReferralCode('');
      } else if (result.__kind__ === 'badRequest') {
        setErrorMsg('Invalid request. Please check your details and try again.');
      } else if (result.__kind__ === 'internalError') {
        setErrorMsg('Server error. Please try again later.');
      } else {
        setErrorMsg('Registration failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMsg('Registration failed. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isActorReady = !!actor && !actorFetching;
  const isAuthenticated = !!identity;

  const isOtpExpired = otpState ? Date.now() - otpState.generatedAt > OTP_EXPIRY_MS : false;
  const isOtpLocked = otpState ? otpState.attempts >= MAX_ATTEMPTS : false;

  return (
    <div className="app-container flex flex-col min-h-screen relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gold-500/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gold-500/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-navy-700/50 blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex flex-col items-center pt-16 pb-8 px-6">
        <div className="w-20 h-20 rounded-2xl gold-gradient flex items-center justify-center mb-4 animate-pulse-glow">
          <Gamepad2 className="w-10 h-10 text-navy-800" />
        </div>
        <h1 className="font-game text-3xl font-bold gold-text tracking-wider">WINZONE</h1>
        <p className="text-navy-200 text-sm mt-1 tracking-widest">GAMING WALLET</p>
      </div>

      {/* Card */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 pb-8">
        <div className="bg-navy-700 border border-gold-500/30 rounded-2xl p-6 card-glow">

          {/* Step: Auth */}
          {step === 'auth' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground mb-1">Get Started</h2>
                <p className="text-muted-foreground text-sm">Login to play & win real money</p>
              </div>

              <div className="bg-gold-500/10 border border-gold-500/30 rounded-xl p-4 flex items-center gap-3">
                <Gift className="w-8 h-8 text-gold-400 flex-shrink-0" />
                <div>
                  <p className="text-gold-400 font-bold text-sm">NEW USER BONUS</p>
                  <p className="text-foreground text-xs">Get ₹50 FREE on signup!</p>
                </div>
              </div>

              {!isAuthenticated ? (
                <button
                  onClick={handleLogin}
                  disabled={isLoggingIn || isInitializing}
                  className="w-full py-4 rounded-xl font-bold text-lg gold-gradient text-navy-800 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
                >
                  {isLoggingIn ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Connecting...</>
                  ) : (
                    <>🔐 Login / Sign Up</>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setStep('mobile')}
                  disabled={!isActorReady}
                  className="w-full py-4 rounded-xl font-bold text-lg gold-gradient text-navy-800 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
                >
                  {!isActorReady ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Loading...</>
                  ) : (
                    <>Continue with Mobile →</>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Step: Mobile */}
          {step === 'mobile' && (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground mb-1">Enter Mobile Number</h2>
                <p className="text-muted-foreground text-sm">We'll send an OTP to verify your number</p>
              </div>

              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-gold-400" />
                  <span className="text-gold-400 font-bold">+91</span>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => {
                    setMobile(e.target.value.replace(/\D/g, ''));
                    setErrorMsg('');
                  }}
                  placeholder="10-digit mobile number"
                  className="w-full bg-navy-800 border border-gold-500/30 rounded-xl py-4 pl-20 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold-500 text-lg tracking-widest"
                />
              </div>

              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                  {errorMsg}
                </div>
              )}

              <button
                onClick={handleContinueWithMobile}
                disabled={isSubmitting || mobile.length !== 10}
                className="w-full py-4 rounded-xl font-bold text-lg gold-gradient text-navy-800 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Sending OTP...</>
                ) : (
                  <>Send OTP →</>
                )}
              </button>

              <button
                onClick={() => { setStep('auth'); setErrorMsg(''); }}
                className="w-full text-muted-foreground text-sm py-2"
              >
                ← Back
              </button>
            </div>
          )}

          {/* Step: OTP Verification */}
          {step === 'otp' && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-7 h-7 text-gold-400" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-1">OTP Verification</h2>
                <p className="text-muted-foreground text-sm">
                  Verify your number{' '}
                  <span className="text-gold-400 font-semibold">+91 {mobile}</span>
                </p>
              </div>

              {/* OTP Display Box (simulation) */}
              {otpState && !isOtpExpired && !isOtpLocked && (
                <div className="bg-gold-500/10 border border-gold-500/40 rounded-xl p-4 text-center">
                  <p className="text-gold-300 text-xs font-semibold uppercase tracking-widest mb-1">
                    🔔 Demo OTP (Simulation)
                  </p>
                  <p className="text-gold-400 text-3xl font-bold tracking-[0.3em] font-mono">
                    {otpState.code}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">Valid for 5 minutes</p>
                </div>
              )}

              {/* OTP Input */}
              <div>
                <label className="block text-muted-foreground text-sm mb-2">Enter 6-digit OTP</label>
                <input
                  type="tel"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => {
                    setOtpInput(e.target.value.replace(/\D/g, ''));
                    setErrorMsg('');
                  }}
                  placeholder="• • • • • •"
                  disabled={isOtpExpired || isOtpLocked}
                  className="w-full bg-navy-800 border border-gold-500/30 rounded-xl py-4 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold-500 text-2xl tracking-[0.4em] text-center font-mono disabled:opacity-50"
                />
              </div>

              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm text-center">
                  {errorMsg}
                </div>
              )}

              {/* Verify Button */}
              {!isOtpLocked && (
                <button
                  onClick={handleVerifyOtp}
                  disabled={isSubmitting || otpInput.length !== 6 || isOtpExpired}
                  className="w-full py-4 rounded-xl font-bold text-lg gold-gradient text-navy-800 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
                  ) : (
                    <>✓ Verify OTP</>
                  )}
                </button>
              )}

              {/* Resend OTP */}
              <button
                onClick={handleResendOtp}
                className="w-full flex items-center justify-center gap-2 text-gold-400 hover:text-gold-300 text-sm py-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Resend OTP
              </button>

              {/* Back */}
              <button
                onClick={() => {
                  setStep('mobile');
                  setOtpState(null);
                  setOtpInput('');
                  setErrorMsg('');
                }}
                className="w-full text-muted-foreground text-sm py-2"
              >
                ← Change Number
              </button>
            </div>
          )}

          {/* Step: Name (New User) */}
          {step === 'name' && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="text-3xl mb-2">🎉</div>
                <h2 className="text-xl font-bold text-foreground mb-1">Create Account</h2>
                <p className="text-muted-foreground text-sm">Enter your name to get ₹50 bonus!</p>
              </div>

              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <User className="w-4 h-4 text-gold-400" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrorMsg(''); }}
                  placeholder="Your full name"
                  className="w-full bg-navy-800 border border-gold-500/30 rounded-xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold-500 text-lg"
                />
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => { setReferralCode(e.target.value.toUpperCase()); setErrorMsg(''); }}
                  placeholder="Referral code (optional)"
                  className="w-full bg-navy-800 border border-gold-500/30 rounded-xl py-3 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold-500"
                />
              </div>

              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                  {errorMsg}
                </div>
              )}

              <button
                onClick={handleRegister}
                disabled={isSubmitting || !name.trim()}
                className="w-full py-4 rounded-xl font-bold text-lg gold-gradient text-navy-800 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Creating Account...</>
                ) : (
                  <>🎮 Start Playing & Get ₹50</>
                )}
              </button>

              <button
                onClick={() => { setStep('mobile'); setErrorMsg(''); }}
                className="w-full text-muted-foreground text-sm py-2"
              >
                ← Back
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center pb-6 px-6">
        <p className="text-muted-foreground text-xs">
          Built with ❤️ using{' '}
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
  );
}
