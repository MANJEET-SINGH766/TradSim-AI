'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import StockSearch from '../../components/StockSearch';
import AppLayout from '../../components/AppLayout';
import { Sparkles, TrendingUp, TrendingDown, ShieldAlert, BarChart3, ArrowUpDown, PieChart as PieIcon, BarChart2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';

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

  const [sortBy, setSortBy] = useState<'symbol' | 'value' | 'pnl'>('value');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  const handleSort = (field: 'symbol' | 'value' | 'pnl') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortedHoldings = () => {
    if (!portfolio || !portfolio.holdings) return [];
    return [...portfolio.holdings].sort((a, b) => {
      let valA: any = 0;
      let valB: any = 0;

      if (sortBy === 'symbol') {
        valA = a.symbol;
        valB = b.symbol;
      } else if (sortBy === 'value') {
        valA = a.currentValue;
        valB = b.currentValue;
      } else if (sortBy === 'pnl') {
        valA = a.unrealizedPnL;
        valB = b.unrealizedPnL;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const getSectorData = () => {
    if (!portfolio || !portfolio.holdings) return [];
    const sectorMap: Record<string, number> = {};

    portfolio.holdings.forEach((h) => {
      const sym = h.symbol.toUpperCase();
      let sector = 'Conglomerate & Others';

      if (sym.includes('RELIANCE')) {
        sector = 'Energy & Utilities';
      } else if (sym.includes('TCS') || sym.includes('INFY') || sym.includes('WIPRO')) {
        sector = 'Technology';
      } else if (sym.includes('HDFCBANK') || sym.includes('ICICIBANK') || sym.includes('SBIN')) {
        sector = 'Financial Services';
      } else if (sym.includes('TATAMOTORS') || sym.includes('M&M')) {
        sector = 'Automotive';
      } else if (sym.includes('ITC')) {
        sector = 'Consumer Goods';
      }

      sectorMap[sector] = (sectorMap[sector] || 0) + h.currentValue;
    });

    const colors = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];
    return Object.keys(sectorMap).map((sector, index) => ({
      name: sector,
      value: sectorMap[sector],
      color: colors[index % colors.length]
    }));
  };

  const getBarChartData = () => {
    if (!portfolio || !portfolio.holdings) return [];
    return portfolio.holdings.map((h) => ({
      name: h.symbol,
      Cost: h.averagePrice * h.quantity,
      Value: h.currentValue
    }));
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

        {/* Analytical Charts Grid */}
        {portfolio && portfolio.holdings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            
            {/* Sector Concentration Pie Chart */}
            <div className="bg-white/70 backdrop-blur-md border border-white p-6 rounded-2xl shadow-sm shadow-indigo-500/2 flex flex-col h-[320px]">
              <h3 className="text-sm font-bold text-slate-800 tracking-tight mb-4 flex items-center gap-2">
                <PieIcon size={16} className="text-indigo-650" />
                Sector Allocation Concentration
              </h3>
              <div className="flex-1 min-h-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getSectorData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {getSectorData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value: any) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[9px] font-bold text-slate-500 max-h-[80px] overflow-y-auto pr-1">
                {getSectorData().map((item, idx) => {
                  const totalVal = getSectorData().reduce((acc, curr) => acc + curr.value, 0);
                  const pct = totalVal > 0 ? ((item.value / totalVal) * 100).toFixed(1) : '0.0';
                  return (
                    <div key={idx} className="flex items-center gap-1 truncate">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="truncate">{item.name} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cost Basis vs Market Value Bar Chart */}
            <div className="bg-white/70 backdrop-blur-md border border-white p-6 rounded-2xl shadow-sm shadow-indigo-500/2 flex flex-col h-[320px]">
              <h3 className="text-sm font-bold text-slate-800 tracking-tight mb-4 flex items-center gap-2">
                <BarChart2 size={16} className="text-indigo-650" />
                Position Cost Basis vs Current Value
              </h3>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getBarChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 700 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 700 }} tickFormatter={(val) => `₹${val.toLocaleString('en-IN')}`} />
                    <RechartsTooltip formatter={(value: any) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`} />
                    <Legend wrapperStyle={{ fontSize: 9, fontWeight: 700, paddingTop: 10 }} />
                    <Bar dataKey="Cost" fill="#94a3b8" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Value" fill="#6366f1" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

        {/* Holdings Spreadsheet Card */}
        {portfolio && (
          <div className="bg-white/70 backdrop-blur-md border border-white rounded-2xl overflow-hidden shadow-sm shadow-indigo-500/2 relative z-10">
            {portfolio.holdings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider select-none">
                      <th className="py-4 px-6 cursor-pointer hover:text-slate-650 transition-all" onClick={() => handleSort('symbol')}>
                        <div className="flex items-center gap-1">
                          Symbol
                          <ArrowUpDown size={12} className={sortBy === 'symbol' ? 'text-indigo-600' : 'text-slate-350'} />
                        </div>
                      </th>
                      <th className="py-4 px-6 text-right">Shares</th>
                      <th className="py-4 px-6 text-right">Avg Price</th>
                      <th className="py-4 px-6 text-right">Market Price</th>
                      <th className="py-4 px-6 text-right cursor-pointer hover:text-slate-650 transition-all" onClick={() => handleSort('value')}>
                        <div className="flex items-center justify-end gap-1">
                          Current Value
                          <ArrowUpDown size={12} className={sortBy === 'value' ? 'text-indigo-600' : 'text-slate-350'} />
                        </div>
                      </th>
                      <th className="py-4 px-6 text-right cursor-pointer hover:text-slate-650 transition-all" onClick={() => handleSort('pnl')}>
                        <div className="flex items-center justify-end gap-1">
                          Unrealized P&L
                          <ArrowUpDown size={12} className={sortBy === 'pnl' ? 'text-indigo-600' : 'text-slate-350'} />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {getSortedHoldings().map((h) => {
                      const pnlPositive = h.unrealizedPnL >= 0;
                      const totalVal = portfolio.totalHoldingsValue;
                      const weight = totalVal > 0 ? ((h.currentValue / totalVal) * 100).toFixed(1) : '0.0';
                      return (
                        <tr key={h.symbol} className="hover:bg-slate-50/40 transition-all">
                          <td className="py-4 px-6">
                            <div className="flex flex-col">
                              <Link href={`/stocks/${encodeURIComponent(h.symbol)}`} className="text-indigo-650 hover:text-indigo-500 font-bold">
                                {h.symbol}
                              </Link>
                              <span className="text-[9px] text-slate-400 font-bold mt-0.5">Weight: {weight}%</span>
                            </div>
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
                  You haven't bought any stock positions yet. Use the search bar above live quotes to place your first trade.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
