'use client';

  import React, { useState } from 'react';
  import Link from 'next/link';
  import { usePathname } from 'next/navigation';
  import { useAuth } from '../context/AuthContext';
  import { Menu, X, LayoutDashboard, Briefcase, History, LogOut } from 'lucide-react';

  interface AppLayoutProps {
    children: React.ReactNode;
  }

  export default function AppLayout({ children }: AppLayoutProps) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
      { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
      { href: '/portfolio', label: 'My Portfolio', icon: Briefcase },
      { href: '/transactions', label: 'Transactions', icon: History },
    ];

    return (
      <div className="min-h-screen bg-[#f7f9fc] flex flex-col md:flex-row text-slate-800 antialiased font-sans">
        
        {/* Mobile Navigation Header */}
        <header className="md:hidden w-full bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm shadow-indigo-500/2">
          <div className="flex items-center gap-2">
            <svg
              className="fill-indigo-600 w-6 h-6 animate-spin-slow"
              width="97"
              height="108"
              viewBox="0 0 97 108"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M55.5 0C61.0005 0.00109895 64.5005 2.50586 64.5 7.5V17C64.5 24.5059 68.5005 27.5 81 27.5H88C94.0005 27.5059 96.5 29.5059 96.5 37.5V98.5C96.5 106.006 95.0005 107.5 88 107.5H41.5C36.5005 107.5 32 104.506 32 98.5V88C32 84.5 28.5 80 20.5 80H8.5C3 80 0 76.5 0 71.5V6.5C0.00048844 1.50586 2.50049 0.00585937 8.5 0H55.5ZM31 20C28.7909 20 27 21.7909 27 24V74C27 76.2091 28.7909 78 31 78H58C60.2091 78 62 76.2091 62 74V24C62 21.7909 60.2091 20 58 20H31Z" />
            </svg>
            <span className="font-extrabold text-slate-900 tracking-tight">TradeSim AI</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-all cursor-pointer"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {/* Mobile Navigation Drawer Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-20 bg-slate-900/10 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        {/* Mobile Navigation Drawer */}
        <aside
          className={`md:hidden fixed top-[65px] left-0 bottom-0 w-64 bg-white border-r border-slate-100 z-25 p-6 flex flex-col justify-between transform transition-transform duration-300 ease-in-out shadow-xl shadow-indigo-500/2 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="space-y-6">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold flex items-center gap-3 text-xs border transition-all ${
                      isActive
                        ? 'bg-indigo-50/70 border-indigo-100 text-indigo-600 shadow-xs'
                        : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                  >
                    <IconComponent size={16} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Signed In As</span>
              <span className="text-xs font-extrabold text-slate-700 truncate block mt-0.5">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="w-full py-2 px-4 rounded-xl hover:bg-red-50/60 hover:text-red-600 hover:border-red-100 border border-transparent text-slate-400 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut size={14} />
              Log Out
            </button>
          </div>
        </aside>

        {/* Desktop Sidebar Navigation */}
        <aside className="hidden md:flex w-64 bg-white/80 backdrop-blur-xl border-r border-slate-100/80 p-6 flex-col justify-between shrink-0 h-screen sticky top-0 shadow-lg shadow-indigo-500/2">
          <div className="space-y-8">
            <div className="flex items-center gap-2 px-2">
              <svg
                className="fill-indigo-600 w-7 h-7 animate-spin-slow"
                width="97"
                height="108"
                viewBox="0 0 97 108"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M55.5 0C61.0005 0.00109895 64.5005 2.50586 64.5 7.5V17C64.5 24.5059 68.5005 27.5 81 27.5H88C94.0005 27.5059 96.5 29.5059 96.5 37.5V98.5C96.5 106.006 95.0005 107.5 88 107.5H41.5C36.5005 107.5 32 104.506 32 98.5V88C32 84.5 28.5 80 20.5 80H8.5C3 80 0 76.5 0 71.5V6.5C0.00048844 1.50586 2.50049 0.00585937 8.5 0H55.5ZM31 20C28.7909 20 27 21.7909 27 24V74C27 76.2091 28.7909 78 31 78H58C60.2091 78 62 76.2091 62 74V24C62 21.7909 60.2091 20 58 20H31Z" />
              </svg>
              <div>
                <h1 className="text-lg font-black bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400 bg-clip-text text-transparent">
                  TradeSim AI
                </h1>
                <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-widest mt-0.5">
                  Simulator Workspace
                </span>
              </div>
            </div>

            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold flex items-center gap-3 text-xs border transition-all ${
                      isActive
                        ? 'bg-indigo-50/70 border-indigo-100 text-indigo-600 shadow-xs'
                        : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                  >
                    <IconComponent size={15} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="px-2">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Signed In As</span>
              <span className="text-xs font-extrabold text-slate-700 truncate block mt-0.5" title={user?.name}>
                {user?.name}
              </span>
            </div>
            <button
              onClick={logout}
              className="w-full py-2.5 px-4 rounded-xl hover:bg-red-50/60 hover:text-red-600 hover:border-red-100 border border-transparent text-slate-400 font-bold text-xs transition-all flex items-center gap-3 cursor-pointer"
            >
              <LogOut size={14} />
              Log Out
            </button>
          </div>
        </aside>

        {/* Workspace Main Panel */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    );
  }
