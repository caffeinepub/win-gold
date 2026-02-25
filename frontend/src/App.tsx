import { useState, useEffect } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useActor } from './hooks/useActor';
import LoginSignup from './components/LoginSignup';
import Layout from './components/Layout';
import Home from './pages/Home';
import Payment from './pages/Payment';
import Activity from './pages/Activity';
import ReferEarn from './pages/ReferEarn';
import Support from './pages/Support';
import Account from './pages/Account';
import GamePlay from './pages/GamePlay';
import { Toaster } from '@/components/ui/sonner';

export type Page = 'home' | 'payment' | 'activity' | 'refer' | 'support' | 'account' | 'game';

export interface AppUser {
  mobile: string;
  name: string;
  balance: bigint;
  vipLevel: bigint;
  referralCode: string;
}

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();

  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentGame, setCurrentGame] = useState<string>('');
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);

  // Check if user has a profile when actor is ready
  useEffect(() => {
    if (!actor || actorFetching || profileChecked) return;

    const checkProfile = async () => {
      setIsCheckingProfile(true);
      try {
        const profile = await actor.getCallerUserProfile();
        if (profile) {
          // Has profile, fetch full user data
          try {
            const user = await actor.getUser(profile.mobile);
            setAppUser({
              mobile: user.mobile,
              name: user.name,
              balance: user.balance,
              vipLevel: user.vipLevel,
              referralCode: user.referralCode,
            });
          } catch {
            // Profile exists but user fetch failed, clear profile
            setAppUser(null);
          }
        }
      } catch {
        setAppUser(null);
      } finally {
        setIsCheckingProfile(false);
        setProfileChecked(true);
      }
    };

    checkProfile();
  }, [actor, actorFetching, profileChecked]);

  // Reset profile check when identity changes
  useEffect(() => {
    setProfileChecked(false);
    setAppUser(null);
  }, [identity?.getPrincipal().toString()]);

  const handleLoginSuccess = (user: AppUser) => {
    setAppUser(user);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setAppUser(null);
    setProfileChecked(false);
    setCurrentPage('home');
  };

  const navigateTo = (page: Page, game?: string) => {
    setCurrentPage(page);
    if (game) setCurrentGame(game);
  };

  const refreshUser = async () => {
    if (!actor || !appUser) return;
    try {
      const user = await actor.getUser(appUser.mobile);
      setAppUser({
        mobile: user.mobile,
        name: user.name,
        balance: user.balance,
        vipLevel: user.vipLevel,
        referralCode: user.referralCode,
      });
    } catch {
      // ignore
    }
  };

  const isLoading = isInitializing || actorFetching || isCheckingProfile;

  if (isLoading) {
    return (
      <div className="app-container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gold-400 font-game text-sm tracking-widest">LOADING...</p>
        </div>
      </div>
    );
  }

  if (!appUser) {
    return (
      <>
        <LoginSignup onSuccess={handleLoginSuccess} />
        <Toaster />
      </>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home user={appUser} navigateTo={navigateTo} />;
      case 'payment':
        return <Payment user={appUser} onBack={() => navigateTo('home')} onSuccess={refreshUser} />;
      case 'activity':
        return <Activity user={appUser} />;
      case 'refer':
        return <ReferEarn user={appUser} />;
      case 'support':
        return <Support />;
      case 'account':
        return <Account user={appUser} onLogout={handleLogout} />;
      case 'game':
        return <GamePlay gameName={currentGame} user={appUser} onBack={() => navigateTo('home')} onBalanceUpdate={refreshUser} />;
      default:
        return <Home user={appUser} navigateTo={navigateTo} />;
    }
  };

  return (
    <>
      <Layout user={appUser} currentPage={currentPage} navigateTo={navigateTo}>
        {renderPage()}
      </Layout>
      <Toaster />
    </>
  );
}
