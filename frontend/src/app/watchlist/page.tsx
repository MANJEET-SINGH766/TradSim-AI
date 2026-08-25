'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import StockSearch from '../../components/StockSearch';
import AppLayout from '../../components/AppLayout';
import { Star, TrendingUp, TrendingDown, Trash2, ShieldAlert } from 'lucide-react';

interface WatchlistStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

export default function WatchlistPage() {
  const { user, loading: authLoading } = useAuth();
  const [watchlistStocks, setWatchlistStocks] = useState<WatchlistStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tradsim-ai.onrender.com/api/v1';

  const fetchWatchlistData = async () => {
    try {
      setError('');
      // 1. Fetch watchlist symbols
      const res = await fetch(`${API_URL}/watchlist`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to fetch watchlist symbols.');
      }

      const symbols: string[] = data.data.symbols;
      if (symbols.length === 0) {
        setWatchlistStocks([]);
        setLoading(false);
        return;
      }

      // 2. Fetch live quotes for each watchlisted symbol in parallel
      const quotesPromises = symbols.map(async (symbol) => {
        try {
          const qRes = await fetch(`${API_URL}/stocks/${symbol}`, {
            credentials: 'include',
          });
          const qData = await qRes.json();
          if (qRes.ok && qData.success) {
            return qData.data as WatchlistStock;
          }
        } catch (e) {
          console.error(`Failed to load details for watchlist symbol: ${symbol}`, e);
        }
        return null;
      });

      const results = await Promise.all(quotesPromises);
      setWatchlistStocks(results.filter((s): s is WatchlistStock => s !== null));
    } catch (err: any) {
      setError(err.message || 'Connection to trading network failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (symbol: string) => {
    try {
      const res = await fetch(`${API_URL}/watchlist/${encodeURIComponent(symbol)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWatchlistStocks((prev) => prev.filter((s) => s.symbol !== symbol));
      } else {
        alert(data.error?.message || 'Failed to remove stock from watchlist.');
      }
    } catch (err) {
      console.error('Failed to remove from watchlist:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWatchlistData();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center text-slate-500 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
          <p className="font-extrabold text-sm tracking-wide">Loading watchlist...</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 md:p-10 space-y-8 max-w-5xl mx-auto font-sans relative">
        {/* Decorative Background Blur */}
        <div className="absolute top-10 right-20 w-80 h-80 rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Watchlist</h2>
            <p className="text-slate-500 mt-1 font-semibold text-xs md:text-sm">
              Monitor live stock prices and remove tracked equities.
            </p>
          </div>
          <StockSearch />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Watchlist Grid / Content Section */}
        <div className="bg-white/70 backdrop-blur-md border border-white rounded-2xl overflow-hidden shadow-sm shadow-indigo-500/2 relative z-10">
          {watchlistStocks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Symbol</th>
                    <th className="py-4 px-6 text-right">Market Price</th>
                    <th className="py-4 px-6 text-right">Today's Change</th>
                    <th className="py-4 px-6 text-right">Day High</th>
                    <th className="py-4 px-6 text-right">Day Low</th>
                    <th className="py-4 px-6 text-right">Volume</th>
                    <th className="py-4 px-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {watchlistStocks.map((stock) => {
                    const isPositive = stock.change >= 0;
                    return (
                      <tr key={stock.symbol} className="hover:bg-slate-50/40 transition-all">
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <Link href={`/stocks/${encodeURIComponent(stock.symbol)}`} className="text-indigo-650 hover:text-indigo-500 font-bold">
                              {stock.symbol}
                            </Link>
                            <span className="text-[10px] text-slate-400 font-bold mt-0.5 truncate max-w-[180px]">
                              {stock.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right text-slate-800 font-bold">
                          ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className={`py-4 px-6 text-right ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                          <div className="flex items-center justify-end gap-1 font-bold">
                            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            <span>
                              {isPositive ? '+' : ''}
                              {stock.change.toFixed(2)} ({isPositive ? '+' : ''}
                              {stock.changePercent.toFixed(2)}%)
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right text-slate-500">
                          ₹{stock.high.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-6 text-right text-slate-500">
                          ₹{stock.low.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-6 text-right text-slate-500">
                          {stock.volume.toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => handleRemove(stock.symbol)}
                            className="p-2 rounded-lg border border-red-100 hover:bg-red-50 text-red-650 hover:text-red-700 transition-all cursor-pointer inline-flex items-center justify-center"
                            title="Remove from watchlist"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center max-w-sm mx-auto">
              <Star size={32} className="mx-auto mb-4 text-slate-300" />
              <h4 className="text-sm font-bold text-slate-800">Your Watchlist is Empty</h4>
              <p className="text-slate-400 text-xs mt-1 mb-6 font-semibold leading-relaxed">
                You aren't tracking any stock tickers yet. Search for symbol tickers above and tap the star to follow them here.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
