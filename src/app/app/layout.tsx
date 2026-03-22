import Navbar from '@/components/Navbar';
import MobileNav from '@/components/MobileNav';
import CommandPalette from '@/components/CommandPalette';
import OnboardingTour from '@/components/OnboardingTour';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <CommandPalette />
      <OnboardingTour />
      <main className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-10 py-6 sm:py-8">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      <MobileNav />
    </div>
  );
}
