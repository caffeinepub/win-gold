import { ReactNode } from 'react';
import BottomNav from './BottomNav';
import { AppUser, Page } from '../App';

interface Props {
  children: ReactNode;
  user: AppUser;
  currentPage: Page;
  navigateTo: (page: Page, game?: string) => void;
}

export default function Layout({ children, user, currentPage, navigateTo }: Props) {
  const showBottomNav = currentPage !== 'payment' && currentPage !== 'game';

  return (
    <div className="app-container flex flex-col min-h-screen">
      <main className={`flex-1 overflow-y-auto ${showBottomNav ? 'pb-20' : ''}`}>
        {children}
      </main>
      {showBottomNav && (
        <BottomNav currentPage={currentPage} navigateTo={navigateTo} />
      )}
    </div>
  );
}
