import { useState, useEffect } from 'react';
import { Gift, TrendingUp, Zap } from 'lucide-react';

const SLIDES = [
  {
    icon: <Gift className="w-5 h-5 text-gold-400 flex-shrink-0" />,
    text: '🎁 Welcome Bonus ₹50 Credited! Start Playing Now',
    bg: 'from-navy-700 to-navy-800',
  },
  {
    icon: <TrendingUp className="w-5 h-5 text-gold-400 flex-shrink-0" />,
    text: '💰 DEPOSIT OFFER: Add ₹100 & Get ₹50 EXTRA! (₹250 Signup = ₹200)',
    bg: 'from-navy-800 to-navy-700',
  },
  {
    icon: <Zap className="w-5 h-5 text-gold-400 flex-shrink-0" />,
    text: '⚡ Withdraw your winnings instantly to UPI!',
    bg: 'from-navy-700 to-navy-800',
  },
];

export default function Banner() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % SLIDES.length);
        setAnimating(false);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const slide = SLIDES[current];

  return (
    <div className={`bg-gradient-to-r ${slide.bg} border-b border-gold-500/20 px-4 py-2.5`}>
      <div
        className={`flex items-center gap-3 transition-all duration-300 ${animating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}
      >
        {slide.icon}
        <p className="text-sm font-semibold text-gold-300 flex-1">{slide.text}</p>
        <div className="flex gap-1 flex-shrink-0">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-gold-400 w-3' : 'bg-navy-400'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
