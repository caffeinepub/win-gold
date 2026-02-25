import { Home, Activity, Users, MessageCircle, User } from 'lucide-react';
import { Page } from '../App';

interface Props {
  currentPage: Page;
  navigateTo: (page: Page) => void;
}

const NAV_ITEMS = [
  { id: 'home' as Page, label: 'Home', icon: Home },
  { id: 'activity' as Page, label: 'Activity', icon: Activity },
  { id: 'refer' as Page, label: 'Refer', icon: Users },
  { id: 'support' as Page, label: 'Support', icon: MessageCircle },
  { id: 'account' as Page, label: 'Account', icon: User },
];

export default function BottomNav({ currentPage, navigateTo }: Props) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-navy-800 border-t border-gold-500/20 z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = currentPage === id;
          return (
            <button
              key={id}
              onClick={() => navigateTo(id)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                isActive
                  ? 'text-gold-400'
                  : 'text-navy-300 hover:text-navy-100'
              }`}
            >
              <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform`}>
                <Icon className="w-5 h-5" />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold-400" />
                )}
              </div>
              <span className={`text-xs font-bold ${isActive ? 'text-gold-400' : ''}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
