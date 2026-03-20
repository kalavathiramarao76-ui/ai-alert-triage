'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/app', label: 'Dashboard', icon: '◈' },
  { href: '/app/triage', label: 'Triage', icon: '⚡' },
  { href: '/app/incidents', label: 'Incidents', icon: '🔥' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                AT
              </div>
              <span className="text-lg font-semibold text-white">AlertTriage</span>
            </Link>
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-zinc-800 text-green-400'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                    }`}
                  >
                    <span className="mr-1.5">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-400 font-medium">AI Online</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
