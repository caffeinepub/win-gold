import { useState } from 'react';
import { MessageCircle, Send, Loader2, CheckCircle, Phone, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function Support() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsSubmitting(true);
    // Simulate submission
    await new Promise((r) => setTimeout(r, 1000));
    setIsSubmitting(false);
    setSubmitted(true);
    toast.success('Support request submitted!');
  };

  const QUICK_TOPICS = [
    'Payment not credited',
    'Withdrawal issue',
    'Game result dispute',
    'Account problem',
    'Bonus not received',
  ];

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-navy-800 border-b border-gold-500/20 px-4 py-4">
        <h1 className="font-game font-bold text-gold-400 text-lg">Support</h1>
        <p className="text-xs text-muted-foreground">We're here to help 24/7</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Contact info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-navy-700 border border-gold-500/20 rounded-xl p-3 flex items-center gap-3">
            <Phone className="w-5 h-5 text-gold-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">UPI Support</p>
              <p className="text-sm font-bold text-foreground">7073791055</p>
            </div>
          </div>
          <div className="bg-navy-700 border border-gold-500/20 rounded-xl p-3 flex items-center gap-3">
            <Clock className="w-5 h-5 text-gold-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Response Time</p>
              <p className="text-sm font-bold text-foreground">~30 mins</p>
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="bg-navy-700 border border-green-500/30 rounded-xl p-6 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
            <h3 className="font-bold text-foreground text-lg">Request Submitted!</h3>
            <p className="text-muted-foreground text-sm">Our team will respond within 30 minutes.</p>
            <button
              onClick={() => { setSubmitted(false); setSubject(''); setMessage(''); }}
              className="px-6 py-2 rounded-xl gold-gradient text-navy-800 font-bold text-sm"
            >
              Submit Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quick topics */}
            <div className="bg-navy-700 border border-gold-500/20 rounded-xl p-4">
              <p className="text-sm font-bold text-foreground mb-3">Quick Topics</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setSubject(topic)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      subject === topic
                        ? 'border-gold-500 bg-gold-500/20 text-gold-400'
                        : 'border-navy-500 bg-navy-800 text-muted-foreground'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-navy-700 border border-gold-500/20 rounded-xl p-4 space-y-3">
              <div>
                <label className="text-sm font-bold text-foreground block mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What's your issue?"
                  className="w-full bg-navy-800 border border-gold-500/30 rounded-xl py-3 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold-500"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-foreground block mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  rows={4}
                  className="w-full bg-navy-800 border border-gold-500/30 rounded-xl py-3 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold-500 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl gold-gradient text-navy-800 font-bold font-game flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
                ) : (
                  <><Send className="w-5 h-5" /> SEND MESSAGE</>
                )}
              </button>
            </div>
          </form>
        )}

        {/* FAQ */}
        <div className="bg-navy-700 border border-gold-500/10 rounded-xl p-4 space-y-3">
          <p className="font-bold text-foreground flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-gold-400" /> Common Questions
          </p>
          {[
            { q: 'How long does deposit take?', a: 'Deposits are credited within 30 minutes after UTR verification.' },
            { q: 'How to withdraw?', a: 'Go to Account → Withdrawal. Minimum withdrawal is ₹100.' },
            { q: 'Referral bonus not received?', a: 'Referral bonus is credited after your friend makes their first deposit.' },
          ].map(({ q, a }) => (
            <div key={q} className="border-t border-navy-600 pt-3">
              <p className="text-sm font-bold text-gold-400">{q}</p>
              <p className="text-xs text-muted-foreground mt-1">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
