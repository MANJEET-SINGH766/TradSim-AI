'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import StockSearch from '../../components/StockSearch';
import AppLayout from '../../components/AppLayout';
import { TrendingUp, TrendingDown, Star, Sparkles, BookOpen } from 'lucide-react';

interface PortfolioSummary {
  cash: number;
  totalHoldingsValue: number;
  totalCostBasis: number;
  netWorth: number;
  totalPnL: number;
  totalReturnPercent: number;
  holdings: any[];
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [watchlistQuotes, setWatchlistQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  const fetchWatchlist = async () => {
    try {
      const res = await fetch(`${API_URL}/watchlist`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const symbols: string[] = data.data.symbols;
        if (symbols.length === 0) {
          setWatchlistQuotes([]);
          return;
        }

        const quotesPromises = symbols.map(async (sym) => {
          try {
            const qRes = await fetch(`${API_URL}/stocks/${sym}`, {
              credentials: 'include',
            });
            const qData = await qRes.json();
            if (qRes.ok && qData.success) {
              return qData.data;
            }
          } catch (e) {
            console.error('Failed to fetch watchlist quote:', sym, e);
          }
          return null;
        });

        const quotes = await Promise.all(quotesPromises);
        setWatchlistQuotes(quotes.filter((q) => q !== null));
      }
    } catch (err) {
      console.error('Failed to load watchlist details:', err);
    }
  };

  const fetchPortfolio = async () => {
    try {
      const res = await fetch(`${API_URL}/portfolio`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPortfolio(data.data);
      } else {
        setError(data.error?.message || 'Failed to fetch dashboard metrics');
      }
    } catch (err) {
      setError('Connection to data network failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPortfolio();
      fetchWatchlist();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center text-slate-500 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
          <p className="font-extrabold text-sm tracking-wide">Loading workspace...</p>
        </div>
      </div>
    );
  }

  const isPositive = portfolio ? portfolio.totalPnL >= 0 : true;

  return (
    <AppLayout>
      <div className="p-6 md:p-10 space-y-8 max-w-5xl mx-auto font-sans relative">
        {/* Soft Background Blur Elements */}
        <div className="absolute top-10 right-20 w-80 h-80 rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />

        {/* Header Search area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Overview</h2>
            <p className="text-slate-500 mt-1 font-semibold text-xs md:text-sm">
              Analyze equities, verify metrics, and trade virtual assets.
            </p>
          </div>
          <StockSearch />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Portfolio valuation cards */}
        {portfolio && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            <div className="bg-white/70 backdrop-blur-md border border-white p-6 rounded-2xl shadow-sm shadow-indigo-500/2">
              <span className="text-[10px] text-slate-400 block font-bold mb-1.5 uppercase tracking-wider">TOTAL NET WORTH</span>
              <span className="text-xl md:text-2xl font-black text-slate-900">
                ₹{portfolio.netWorth.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-white/70 backdrop-blur-md border border-white p-6 rounded-2xl shadow-sm shadow-indigo-500/2">
              <span className="text-[10px] text-slate-400 block font-bold mb-1.5 uppercase tracking-wider">AVAILABLE CASH</span>
              <span className="text-xl md:text-2xl font-black text-slate-900">
                ₹{portfolio.cash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-white/70 backdrop-blur-md border border-white p-6 rounded-2xl shadow-sm shadow-indigo-500/2">
              <span className="text-[10px] text-slate-400 block font-bold mb-1.5 uppercase tracking-wider">HOLDINGS VALUE</span>
              <span className="text-xl md:text-2xl font-black text-slate-900">
                ₹{portfolio.totalHoldingsValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-white/70 backdrop-blur-md border border-white p-6 rounded-2xl shadow-sm shadow-indigo-500/2">
              <span className="text-[10px] text-slate-400 block font-bold mb-1.5 uppercase tracking-wider">TOTAL RETURN</span>
              <div className={`text-xl md:text-2xl font-black flex items-center gap-1.5 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                <span>₹{isPositive ? '+' : ''}{portfolio.totalPnL.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                <span className="text-xs font-extrabold ml-0.5">({isPositive ? '+' : ''}{portfolio.totalReturnPercent.toFixed(2)}%)</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stock suggestion cards for students */}
        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Recommended Indian Equities</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { symbol: 'RELIANCE.NS', name: 'Reliance Industries', desc: 'Energy, telecom, and retail giant.' },
              { symbol: 'TCS.NS', name: 'Tata Consultancy Services', desc: 'Global technology services and consulting.' },
              { symbol: 'INFY.NS', name: 'Infosys Limited', desc: 'Next-generation digital services provider.' },
            ].map((stock) => (
              <Link
                key={stock.symbol}
                href={`/stocks/${encodeURIComponent(stock.symbol)}`}
                className="bg-white/70 backdrop-blur-md border border-white hover:border-indigo-200 p-6 rounded-2xl transition-all hover:translate-y-[-2px] block group shadow-sm shadow-indigo-500/2"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="font-extrabold text-slate-800 group-hover:text-indigo-600 transition-all text-base">
                    {stock.symbol}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide bg-indigo-50 text-indigo-600 border border-indigo-100">
                    NSE
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-500">{stock.name}</h4>
                <p className="text-xs text-slate-400 mt-2 font-semibold leading-relaxed">{stock.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* User Watchlist Feed */}
        <div className="space-y-4 relative z-10 pt-2">
          <div className="flex items-center gap-2">
            <Star size={18} className="text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">My Watchlist</h3>
          </div>
          {watchlistQuotes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {watchlistQuotes.map((stock) => {
                const stockPositive = stock.change >= 0;
                return (
                  <Link
                    key={stock.symbol}
                    href={`/stocks/${encodeURIComponent(stock.symbol)}`}
                    className="bg-white/70 backdrop-blur-md border border-white hover:border-indigo-200 p-5 rounded-2xl transition-all hover:translate-y-[-2px] flex justify-between items-center group shadow-sm shadow-indigo-500/2"
                  >
                    <div>
                      <span className="font-extrabold text-slate-800 group-hover:text-indigo-600 transition-all text-sm block">
                        {stock.symbol}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold truncate max-w-[200px] block mt-0.5">
                        {stock.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-800 text-sm block">
                        ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <span className={`text-xs font-bold block mt-0.5 ${stockPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                        {stockPositive ? '+' : ''}{stock.change.toFixed(2)} ({stockPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-white/40 border border-dashed border-slate-200 p-8 rounded-2xl text-center text-slate-400 text-xs font-bold">
              <Star size={24} className="mx-auto mb-2 text-slate-300" />
              Your watchlist is empty. Go to a stock's page and click the star to pin it here.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
