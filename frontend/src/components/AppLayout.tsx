'use client';

  import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LayoutDashboard, Briefcase, History, LogOut, Star, ArrowUpRight, Compass } from 'lucide-react';

  interface AppLayoutProps {
    children: React.ReactNode;
  }

  export default function AppLayout({ children }: AppLayoutProps) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [watchlist, setWatchlist] = useState<string[]>([]);
    const [loadingWatchlist, setLoadingWatchlist] = useState(true);
    const [netWorth, setNetWorth] = useState<number | null>(null);
    const [totalPnL, setTotalPnL] = useState<number | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

    const fetchWatchlist = async () => {
      try {
        const res = await fetch(`${API_URL}/watchlist`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setWatchlist(data.data.symbols);
        }
      } catch (err) {
        console.error('Failed to fetch sidebar watchlist:', err);
      } finally {
        setLoadingWatchlist(false);
      }
    };

    const fetchPortfolioData = async () => {
      try {
        const res = await fetch(`${API_URL}/portfolio`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setNetWorth(data.data.netWorth);
          setTotalPnL(data.data.totalPnL);
        }
      } catch (err) {
        console.error('Failed to fetch sidebar portfolio data:', err);
      }
    };

    useEffect(() => {
      if (user) {
        fetchWatchlist();
        fetchPortfolioData();
      }
    }, [user]);

    const navItems = [
      { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
      { href: '/portfolio', label: 'My Portfolio', icon: Briefcase },
      { href: '/explore', label: 'Explore Stocks', icon: Compass },
      { href: '/watchlist', label: 'Watchlist', icon: Star },
      { href: '/transactions', label: 'Transactions', icon: History },
    ];

    return (
      <div className="min-h-screen bg-[#f7f9fc] flex flex-col md:flex-row text-slate-800 antialiased font-sans">
        
        {/* Mobile Navigation Header */}
        <header className="md:hidden w-full bg-white/90 border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm shadow-indigo-500/2">
          <div className="flex items-center gap-2">
            <svg
              className="fill-indigo-650 w-6 h-6 animate-spin-slow"
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
            className="p-1.5 rounded-lg border border-slate-200 text-slate-650 bg-white hover:bg-slate-50 transition-all cursor-pointer"
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
          className={`md:hidden fixed top-[65px] left-0 bottom-0 w-64 bg-white border-r border-slate-150 z-25 p-6 flex flex-col justify-between transform transition-transform duration-300 ease-in-out shadow-xl ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="space-y-6">
            {/* Quick Balance Status */}
            {user && (
              <div className="bg-indigo-50/40 border border-indigo-100/50 p-3 rounded-xl">
                <span className="text-[8px] text-indigo-650 font-bold block uppercase tracking-wider mb-0.5">Free Cash</span>
                <span className="text-sm font-black text-slate-900 block">
                  ₹{user.virtualBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`w-full py-2 px-3 rounded-lg font-bold flex items-center gap-3 text-xs border transition-all ${
                      isActive
                        ? 'bg-indigo-50/70 border-indigo-100 text-indigo-600 shadow-xs'
                        : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <IconComponent size={14} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Watchlist Section */}
            {user && (
              <div className="space-y-2 pt-2 border-t border-slate-100/50">
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider px-3 flex items-center gap-1.5 select-none">
                  <Star size={11} className="text-slate-400" />
                  Watchlist
                </span>
                {loadingWatchlist ? (
                  <span className="text-[9px] text-slate-400 font-bold italic px-3 block">
                    Loading watchlist...
                  </span>
                ) : watchlist.length > 0 ? (
                  <div className="space-y-0.5 max-h-[140px] overflow-y-auto pr-1">
                    {watchlist.map((symbol) => (
                      <Link
                        key={symbol}
                        href={`/stocks/${encodeURIComponent(symbol)}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`w-full py-1.5 px-3 rounded-lg font-bold flex items-center justify-between text-[11px] border border-transparent hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-all ${
                          pathname === `/stocks/${symbol}` ? 'bg-indigo-50/60 border-indigo-100/50 text-indigo-650 font-extrabold' : ''
                        }`}
                      >
                        <span>{symbol}</span>
                        <ArrowUpRight size={10} />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <span className="text-[9px] text-slate-400 font-bold italic px-3 block">
                    No pinned stocks.
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Signed In As</span>
              <span className="text-xs font-extrabold text-slate-700 truncate block mt-0.5">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="w-full py-2 px-4 rounded-xl hover:bg-red-50/60 hover:text-red-600 hover:border-red-100 border border-transparent text-slate-450 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut size={14} />
              Log Out
            </button>
          </div>
        </aside>

        {/* Desktop Sidebar Navigation */}
        <aside className="hidden md:flex w-64 bg-white border-r border-slate-150 p-5 flex-col justify-between shrink-0 h-screen sticky top-0 shadow-md">
          <div className="space-y-6">
            
            {/* Branding Header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <svg
                  className="fill-indigo-650 w-7 h-7 animate-spin-slow"
                  width="97"
                  height="108"
                  viewBox="0 0 97 108"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M55.5 0C61.0005 0.00109895 64.5005 2.50586 64.5 7.5V17C64.5 24.5059 68.5005 27.5 81 27.5H88C94.0005 27.5059 96.5 29.5059 96.5 37.5V98.5C96.5 106.006 95.0005 107.5 88 107.5H41.5C36.5005 107.5 32 104.506 32 98.5V88C32 84.5 28.5 80 20.5 80H8.5C3 80 0 76.5 0 71.5V6.5C0.00048844 1.50586 2.50049 0.00585937 8.5 0H55.5ZM31 20C28.7909 20 27 21.7909 27 24V74C27 76.2091 28.7909 78 31 78H58C60.2091 78 62 76.2091 62 74V24C62 21.7909 60.2091 20 58 20H31Z" />
                </svg>
                <div>
                  <h1 className="text-base font-black bg-gradient-to-r from-indigo-650 to-indigo-500 bg-clip-text text-transparent tracking-tight">
                    TradeSim AI
                  </h1>
                  <span className="text-[8px] text-slate-400 font-black block uppercase tracking-widest mt-0.5">
                    WORKSPACE
                  </span>
                </div>
              </div>

              {/* Pulse status indicator */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-md text-[8px] font-black text-emerald-600 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE
              </div>
            </div>

            {/* Premium Wallet Dashboard Card */}
            {user && (
              <div className="bg-gradient-to-br from-indigo-50/40 via-white to-slate-50 border border-indigo-100 p-4 rounded-xl shadow-lg relative overflow-hidden group select-none shadow-indigo-500/2">
                <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-indigo-500/5 blur-xl pointer-events-none group-hover:scale-125 transition-all duration-500" />
                <span className="text-[9px] text-indigo-600 font-bold block uppercase tracking-wider mb-1">Portfolio Balance</span>
                <span className="text-base font-black text-slate-900 block">
                  ₹{netWorth !== null ? netWorth.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : 'Loading...'}
                </span>
                <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold">
                  <div>
                    <span className="text-slate-450 block text-[8px] uppercase tracking-wider">Free Cash</span>
                    <span className="text-slate-700">
                      ₹{user.virtualBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {totalPnL !== null && (
                    <div className="text-right">
                      <span className="text-slate-450 block text-[8px] uppercase tracking-wider">Total Return</span>
                      <span className={totalPnL >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                        {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`w-full py-2 px-3.5 rounded-xl font-bold flex items-center gap-3 text-xs border transition-all ${
                      isActive
                        ? 'bg-indigo-50/70 border-indigo-100 text-indigo-600 shadow-xs'
                        : 'bg-transparent border-transparent text-slate-550 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <IconComponent size={14} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Watchlist Section */}
            {user && (
              <div className="space-y-2 pt-2 border-t border-slate-100/50">
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider px-2 flex items-center gap-1.5 select-none">
                  <Star size={11} className="text-slate-400" />
                  Watchlist
                </span>
                {loadingWatchlist ? (
                  <span className="text-[9px] text-slate-400 font-bold italic px-2 block">
                    Loading watchlist...
                  </span>
                ) : watchlist.length > 0 ? (
                  <div className="space-y-0.5 max-h-[160px] overflow-y-auto pr-1">
                    {watchlist.map((symbol) => (
                      <Link
                        key={symbol}
                        href={`/stocks/${encodeURIComponent(symbol)}`}
                        className={`w-full py-1.5 px-3 rounded-lg font-bold flex items-center justify-between text-[11px] border border-transparent hover:bg-slate-50 text-slate-550 hover:text-slate-800 transition-all ${
                          pathname === `/stocks/${symbol}` ? 'bg-indigo-50/60 border-indigo-100/50 text-indigo-650 font-extrabold' : ''
                        }`}
                      >
                        <span>{symbol}</span>
                        <ArrowUpRight size={10} />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <span className="text-[9px] text-slate-400 font-bold italic px-2 block">
                    No pinned stocks.
                  </span>
                )}
              </div>
            )}
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
              className="w-full py-2 px-3.5 rounded-xl hover:bg-red-50/60 hover:text-red-600 hover:border-red-100 border border-transparent text-slate-450 font-bold text-xs transition-all flex items-center gap-3 cursor-pointer"
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
