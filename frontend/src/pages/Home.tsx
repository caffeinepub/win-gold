import Header from '../components/Header';
import Banner from '../components/Banner';
import GameGrid from '../components/GameGrid';
import { AppUser, Page } from '../App';

interface Props {
  user: AppUser;
  navigateTo: (page: Page, game?: string) => void;
}

export default function Home({ user, navigateTo }: Props) {
  return (
    <div className="flex flex-col min-h-full">
      <Header user={user} navigateTo={navigateTo} />
      <Banner />
      <div className="flex-1 overflow-y-auto">
        <GameGrid navigateTo={navigateTo} />
      </div>
      {/* Footer */}
      <div className="text-center py-4 px-4 border-t border-gold-500/10">
        <p className="text-muted-foreground text-xs">
          © {new Date().getFullYear()} WinZone · Built with ❤️ using{' '}
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
