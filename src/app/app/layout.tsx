import Navbar from '@/components/Navbar';
import MobileNav from '@/components/MobileNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
