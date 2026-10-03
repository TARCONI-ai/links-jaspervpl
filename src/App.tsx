import { useState } from 'react';
import PhoneFrame from './components/PhoneFrame';
import HomeScreenGrid from './components/HomeScreenGrid';
import LinksDock from './components/LinksDock';
import BookScreen from './components/projects/BookScreen';
import OpoGeniusScreen from './components/projects/OpoGeniusScreen';

type AppView = 'home' | 'opogenius' | 'book';

const INNER_SCREEN_CLASS: Record<AppView, string> = {
  home: 'bg-[#F5F0E8]',
  opogenius: 'bg-[#F5F0E8]',
  book: 'bg-[#F5F0E8]',
};

const CONTENT_OUTER_HOME =
  'pointer-events-none max-md:px-2.5 max-md:pb-24 max-md:pt-3 px-4 pb-[8.5rem] pt-4 md:pt-14';
const CONTENT_OUTER_OTHER = 'min-h-0 flex-col px-0 pb-0 pt-0 md:pt-0';

type ActiveScreenProps = {
  view: AppView;
  onOpenOpoGenius: () => void;
  onOpenBook: () => void;
  onBackHome: () => void;
};

function ActiveScreen({
  view,
  onOpenOpoGenius,
  onOpenBook,
  onBackHome,
}: Readonly<ActiveScreenProps>) {
  switch (view) {
    case 'home':
      return <HomeScreenGrid onOpenOpoGenius={onOpenOpoGenius} onOpenBook={onOpenBook} />;
    case 'opogenius':
      return <OpoGeniusScreen onBack={onBackHome} />;
    case 'book':
      return <BookScreen onBack={onBackHome} />;
    default:
      return null;
  }
}

function App() {
  const [view, setView] = useState<AppView>('home');

  const innerScreenClassName = INNER_SCREEN_CLASS[view];

  const isHome = view === 'home';
  const contentOuterClass = isHome ? CONTENT_OUTER_HOME : CONTENT_OUTER_OTHER;
  const contentInnerClass = isHome ? 'pointer-events-auto' : '';

  return (
    <main className="flex min-h-svh flex-col items-center justify-start overflow-x-hidden bg-[#1A5C5C] max-md:h-svh max-md:overflow-hidden max-md:px-0 max-md:pb-0 max-md:pt-0 md:overflow-y-auto md:px-[clamp(0.375rem,2vw,1.5rem)] md:pb-[clamp(0.75rem,2.5vw,2.25rem)] md:pt-[clamp(0.375rem,2vw,1.5rem)]">
      <PhoneFrame
        innerScreenClassName={innerScreenClassName}
        enableMobileContentScale={isHome}
      >
        {isHome ? (
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_90%_at_50%_-15%,rgba(255,255,255,0.55),transparent_52%),radial-gradient(ellipse_100%_70%_at_50%_110%,rgba(45,140,140,0.12),transparent_45%)]" />
        ) : null}
        <div
          className={`relative z-10 flex h-full min-h-0 w-full flex-1 flex-col ${contentOuterClass}`}
        >
          <div className={`relative flex h-full min-h-0 flex-1 flex-col ${contentInnerClass}`}>
            <ActiveScreen
              view={view}
              onOpenOpoGenius={() => setView('opogenius')}
              onOpenBook={() => setView('book')}
              onBackHome={() => setView('home')}
            />
          </div>
        </div>
        {isHome ? <LinksDock /> : null}
      </PhoneFrame>
    </main>
  );
}

export default App;
