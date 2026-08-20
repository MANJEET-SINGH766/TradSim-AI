'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import StockSearch from '../../components/StockSearch';
import AppLayout from '../../components/AppLayout';
import { Sparkles, TrendingUp, TrendingDown, ShieldAlert, BarChart3 } from 'lucide-react';

interface PortfolioSummary {
  cash: number;
  totalHoldingsValue: number;
  totalCostBasis: number;
  netWorth: number;
  totalPnL: number;
  totalReturnPercent: number;
  holdings: any[];
}

export default function PortfolioPage() {
  const { user, loading: authLoading } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [audit, setAudit] = useState('');
  const [auditLoading, setAuditLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  const fetchPortfolio = async () => {
    try {
      const res = await fetch(`${API_URL}/portfolio`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPortfolio(data.data);
      } else {
        setError(data.error?.message || 'Failed to fetch portfolio data');
      }
    } catch (err) {
      setError('Connection to data network failed.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAudit = async () => {
    setAuditLoading(true);
    setAudit('');
    try {
      const res = await fetch(`${API_URL}/portfolio/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAudit(data.data.audit);
      } else {
        setAudit('AI Audit service temporarily unavailable. Please retry shortly.');
      }
    } catch (err) {
      setAudit('Network connection to AI services failed.');
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPortfolio();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center text-slate-500 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
          <p className="font-extrabold text-sm tracking-wide">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  const isPositive = portfolio ? portfolio.totalPnL >= 0 : true;

  return (
    <AppLayout>
      <div className="p-6 md:p-10 space-y-8 max-w-5xl mx-auto font-sans relative">
        <div className="absolute top-10 right-20 w-80 h-80 rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />

        {/* Header Search area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">My Portfolio</h2>
            <p className="text-slate-500 mt-1 font-semibold text-xs md:text-sm">
              Track your active holdings, cost basis, and overall returns.
            </p>
          </div>
          <StockSearch />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Portfolio Stats Row */}
        {portfolio && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
            <div className="bg-white/70 backdrop-blur-md border border-white p-5 rounded-2xl shadow-sm shadow-indigo-500/2">
              <span className="text-[10px] text-slate-400 block font-bold mb-1.5 uppercase tracking-wider">TOTAL HOLDINGS VALUE</span>
              <span className="text-lg md:text-xl font-black text-slate-900">
                ₹{portfolio.totalHoldingsValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-white/70 backdrop-blur-md border border-white p-5 rounded-2xl shadow-sm shadow-indigo-500/2">
              <span className="text-[10px] text-slate-400 block font-bold mb-1.5 uppercase tracking-wider">TOTAL COST BASIS</span>
              <span className="text-lg md:text-xl font-black text-slate-900">
                ₹{portfolio.totalCostBasis.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-white/70 backdrop-blur-md border border-white p-5 rounded-2xl shadow-sm shadow-indigo-500/2">
              <span className="text-[10px] text-slate-400 block font-bold mb-1.5 uppercase tracking-wider">TOTAL GAIN/LOSS</span>
              <div className={`text-lg md:text-xl font-black flex items-center gap-1.5 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                <span>₹{isPositive ? '+' : ''}{portfolio.totalPnL.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                <span className="text-xs font-extrabold ml-0.5">({isPositive ? '+' : ''}{portfolio.totalReturnPercent.toFixed(2)}%)</span>
              </div>
            </div>
          </div>
        )}

        {/* AI Audit Action and Commentary */}
        {portfolio && (
          <div className="bg-white/70 backdrop-blur-md border border-white p-6 rounded-2xl space-y-4 relative z-10 shadow-sm shadow-indigo-500/2">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h4 className="text-base font-bold text-slate-800 flex items-center gap-2 tracking-tight">
                  <Sparkles size={16} className="text-indigo-600 animate-pulse" />
                  AI Portfolio Diversification Audit
                </h4>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  Let the AI evaluate your asset allocations and sector concentrations.
                </p>
              </div>
              <button
                onClick={fetchAudit}
                disabled={auditLoading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400 hover:from-indigo-700 hover:to-indigo-500 text-white font-extrabold text-xs transition-all active:scale-[0.98] disabled:opacity-50 shrink-0 cursor-pointer shadow-md shadow-indigo-500/10 border border-indigo-400/20"
              >
                {auditLoading ? 'Auditing Wallet...' : 'Audit Portfolio'}
              </button>
            </div>

            {audit && (
              <div className="bg-indigo-50/30 border border-indigo-100/50 p-4 rounded-xl">
                <p className="text-xs md:text-sm text-indigo-955 leading-relaxed font-semibold">
                  {audit}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Holdings Spreadsheet Card */}
        {portfolio && (
          <div className="bg-white/70 backdrop-blur-md border border-white rounded-2xl overflow-hidden shadow-sm shadow-indigo-500/2 relative z-10">
            {portfolio.holdings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      <th className="py-4 px-6">Symbol</th>
                      <th className="py-4 px-6 text-right">Shares</th>
                      <th className="py-4 px-6 text-right">Avg Price</th>
                      <th className="py-4 px-6 text-right">Market Price</th>
                      <th className="py-4 px-6 text-right">Current Value</th>
                      <th className="py-4 px-6 text-right">Unrealized P&L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {portfolio.holdings.map((h) => {
                      const pnlPositive = h.unrealizedPnL >= 0;
                      return (
                        <tr key={h.symbol} className="hover:bg-slate-50/40 transition-all">
                          <td className="py-4 px-6">
                            <Link href={`/stocks/${encodeURIComponent(h.symbol)}`} className="text-indigo-650 hover:text-indigo-500 font-bold">
                              {h.symbol}
                            </Link>
                          </td>
                          <td className="py-4 px-6 text-right text-slate-800">{h.quantity}</td>
                          <td className="py-4 px-6 text-right text-slate-500">
                            ₹{h.averagePrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-6 text-right text-slate-500">
                            ₹{h.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-6 text-right text-slate-800">
                            ₹{h.currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className={`py-4 px-6 text-right ${pnlPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                            <div className="flex flex-col items-end">
                              <span>{pnlPositive ? '+' : ''}₹{h.unrealizedPnL.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                              <span className="text-[10px] font-extrabold mt-0.5">({pnlPositive ? '+' : ''}{h.unrealizedPnLPercent.toFixed(2)}%)</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center max-w-md mx-auto">
                <BarChart3 size={32} className="mx-auto mb-4 text-slate-300" />
                <h4 className="text-sm font-bold text-slate-800">Your Portfolio is Empty</h4>
                <p className="text-slate-400 text-xs mt-1 mb-6 font-semibold leading-relaxed">
                  You haven't bought any stock positions yet. Use the search bar above to view live quotes and place your first trade.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
