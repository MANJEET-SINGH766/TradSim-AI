'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import StockSearch from '../../components/StockSearch';
import AppLayout from '../../components/AppLayout';
import { Compass, TrendingUp, TrendingDown, Cpu, Landmark, Zap, ShoppingBag } from 'lucide-react';

interface ExploreStockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface SectorInfo {
  id: string;
  name: string;
  icon: React.ReactNode;
  symbols: string[];
}

export default function ExplorePage() {
  const { user, loading: authLoading } = useAuth();
  const [quotes, setQuotes] = useState<Record<string, ExploreStockQuote>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tradsim-ai.onrender.com/api/v1';

  const sectors: SectorInfo[] = [
    {
      id: 'tech',
      name: 'Technology Leaders',
      icon: <Cpu className="text-indigo-600" size={20} />,
      symbols: ['TCS.NS', 'INFY.NS', 'WIPRO.NS'],
    },
    {
      id: 'finance',
      name: 'Banking & Financials',
      icon: <Landmark className="text-emerald-600" size={20} />,
      symbols: ['HDFCBANK.NS', 'ICICIBANK.NS', 'SBIN.NS'],
    },
    {
      id: 'energy',
      name: 'Energy & Power Grid',
      icon: <Zap className="text-amber-500" size={20} />,
      symbols: ['RELIANCE.NS', 'ONGC.NS', 'POWERGRID.NS'],
    },
    {
      id: 'goods',
      name: 'Consumer FMCG',
      icon: <ShoppingBag className="text-pink-600" size={20} />,
      symbols: ['ITC.NS', 'HINDUNILVR.NS', 'NESTLEIND.NS'],
    },
  ];

  const fetchSectorQuotes = async () => {
    try {
      setError('');
      const allSymbols = sectors.flatMap((s) => s.symbols);
      
      const promises = allSymbols.map(async (symbol) => {
        try {
          const res = await fetch(`${API_URL}/stocks/${symbol}`, {
            credentials: 'include',
          });
          const data = await res.json();
          if (res.ok && data.success) {
            return { symbol, quote: data.data as ExploreStockQuote };
          }
        } catch (e) {
          console.error(`Explore: failed to fetch details for ${symbol}`, e);
        }
        return null;
      });

      const results = await Promise.all(promises);
      const quotesMap: Record<string, ExploreStockQuote> = {};
      results.forEach((item) => {
        if (item) {
          quotesMap[item.symbol] = item.quote;
        }
      });
      setQuotes(quotesMap);
    } catch (err) {
      setError('Failed to fetch sector index data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSectorQuotes();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center text-slate-500 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
          <p className="font-extrabold text-sm tracking-wide">Loading exploration catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 md:p-10 space-y-8 max-w-5xl mx-auto font-sans relative">
        {/* Decorative Background Blur */}
        <div className="absolute top-10 right-20 w-80 h-80 rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />

        {/* Header Search area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Compass size={28} className="text-indigo-600" />
              Explore Stocks
            </h2>
            <p className="text-slate-500 mt-1 font-semibold text-xs md:text-sm">
              Discover top Indian equities, search custom tickers, or browse leading sectors.
            </p>
          </div>
          <StockSearch />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Categories Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {sectors.map((sector) => (
            <div key={sector.id} className="bg-white/70 backdrop-blur-md border border-white p-6 rounded-2xl shadow-sm shadow-indigo-500/2 space-y-4">
              <div className="flex items-center gap-2">
                {sector.icon}
                <h3 className="text-base font-black text-slate-800 tracking-tight">
                  {sector.name}
                </h3>
              </div>
              <div className="divide-y divide-slate-100/50">
                {sector.symbols.map((symbol) => {
                  const quote = quotes[symbol];
                  if (!quote) {
                    return (
                      <div key={symbol} className="py-3 flex items-center justify-between text-xs text-slate-400 font-bold italic">
                        <span>{symbol}</span>
                        <span>Connecting quote...</span>
                      </div>
                    );
                  }

                  const isPositive = quote.change >= 0;
                  return (
                    <Link
                      key={symbol}
                      href={`/stocks/${encodeURIComponent(symbol)}`}
                      className="py-3.5 flex items-center justify-between group hover:bg-slate-50/30 rounded-lg px-2 -mx-2 transition-all"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-indigo-650 group-hover:text-indigo-500 transition-colors">
                          {quote.symbol}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold max-w-[180px] truncate mt-0.5">
                          {quote.name}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-extrabold text-slate-800">
                          ₹{quote.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        <span className={`text-[10px] font-extrabold flex items-center gap-0.5 mt-0.5 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                          {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          <span>
                            {isPositive ? '+' : ''}
                            {quote.changePercent.toFixed(2)}%
                          </span>
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
