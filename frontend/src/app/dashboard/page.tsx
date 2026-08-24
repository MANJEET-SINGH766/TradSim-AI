'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import StockSearch from '../../components/StockSearch';
import AppLayout from '../../components/AppLayout';
import { TrendingUp, TrendingDown, Star, Sparkles, BookOpen, Clock, ArrowUpRight, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

interface PortfolioSummary {
  cash: number;
  totalHoldingsValue: number;
  totalCostBasis: number;
  netWorth: number;
  totalPnL: number;
  totalReturnPercent: number;
  holdings: any[];
}

interface PendingOrder {
  _id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  orderType: 'LIMIT' | 'STOP_LOSS';
  quantity: number;
  triggerPrice: number;
  createdAt: string;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [watchlistQuotes, setWatchlistQuotes] = useState<any[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [aiAudit, setAiAudit] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [recentLoading, setRecentLoading] = useState(true);
  const [aiAuditLoading, setAiAuditLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  const getChartData = () => {
    if (!portfolio) return [];
    const data = [
      { name: 'Cash', value: portfolio.cash, color: '#6366f1' }
    ];
    const colors = ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444'];
    portfolio.holdings.forEach((h: any, index: number) => {
      const val = h.quantity * (h.currentPrice || h.averagePrice);
      if (val > 0) {
        data.push({
          name: h.symbol,
          value: val,
          color: colors[index % colors.length]
        });
      }
    });
    return data;
  };

  const fetchRecentTransactions = async () => {
    try {
      const res = await fetch(`${API_URL}/transactions`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRecentTransactions(data.data.slice(0, 4));
      }
    } catch (err) {
      console.error('Failed to load recent activity:', err);
    } finally {
      setRecentLoading(false);
    }
  };

  const fetchAiAudit = async () => {
    try {
      const res = await fetch(`${API_URL}/portfolio/audit`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAiAudit(data.data.audit);
      }
    } catch (err) {
      console.error('Failed to load AI portfolio insights:', err);
    } finally {
      setAiAuditLoading(false);
    }
  };

  const fetchPendingOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders/pending`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPendingOrders(data.data);
      }
    } catch (err) {
      console.error('Failed to load pending orders:', err);
    } finally {
      setPendingLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/pending/${orderId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPendingOrders(prev => prev.filter(o => o._id !== orderId));
      } else {
        alert(data.error?.message || 'Failed to cancel order.');
      }
    } catch (err) {
      console.error('Failed to cancel order:', err);
    }
  };

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
      fetchPendingOrders();
      fetchRecentTransactions();
      fetchAiAudit();
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 relative z-10">
            <div className="bg-white/70 backdrop-blur-md border border-white p-4 rounded-2xl shadow-sm shadow-indigo-500/2">
              <span className="text-[9px] text-slate-400 block font-bold mb-1 uppercase tracking-wider">TOTAL NET WORTH</span>
              <span className="text-lg font-black text-slate-900">
                ₹{portfolio.netWorth.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-white/70 backdrop-blur-md border border-white p-4 rounded-2xl shadow-sm shadow-indigo-500/2">
              <span className="text-[9px] text-slate-400 block font-bold mb-1 uppercase tracking-wider">AVAILABLE CASH</span>
              <span className="text-lg font-black text-slate-900">
                ₹{portfolio.cash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-white/70 backdrop-blur-md border border-white p-4 rounded-2xl shadow-sm shadow-indigo-500/2">
              <span className="text-[9px] text-slate-400 block font-bold mb-1 uppercase tracking-wider">HOLDINGS VALUE</span>
              <span className="text-lg font-black text-slate-900">
                ₹{portfolio.totalHoldingsValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-white/70 backdrop-blur-md border border-white p-4 rounded-2xl shadow-sm shadow-indigo-500/2">
              <span className="text-[9px] text-slate-400 block font-bold mb-1 uppercase tracking-wider">TOTAL COST BASIS</span>
              <span className="text-lg font-black text-slate-900">
                ₹{portfolio.totalCostBasis.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-white/70 backdrop-blur-md border border-white p-4 rounded-2xl shadow-sm shadow-indigo-500/2">
              <span className="text-[9px] text-slate-400 block font-bold mb-1 uppercase tracking-wider">ASSETS OWNED</span>
              <span className="text-lg font-black text-slate-900">
                {portfolio.holdings.length}
              </span>
            </div>
            <div className="bg-white/70 backdrop-blur-md border border-white p-4 rounded-2xl shadow-sm shadow-indigo-500/2">
              <span className="text-[9px] text-slate-400 block font-bold mb-1 uppercase tracking-wider">TOTAL RETURN</span>
              <div className={`text-lg font-black flex items-center gap-1 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>₹{isPositive ? '+' : ''}{portfolio.totalPnL.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                <span className="text-[10px] font-extrabold">({isPositive ? '+' : ''}{portfolio.totalReturnPercent.toFixed(1)}%)</span>
              </div>
            </div>
          </div>
        )}

        {/* 2-Column Split Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          
          {/* Left Column (2/3 width) - Sugestions, Watchlist, Pending Orders */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Stock suggestion cards for students */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Recommended Indian Equities</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', desc: 'Energy, telecom, and retail giant.' },
                  { symbol: 'TCS.NS', name: 'Tata Consultancy Services', desc: 'Global technology services and consulting.' },
                  { symbol: 'INFY.NS', name: 'Infosys Limited', desc: 'Next-generation digital services provider.' },
                ].map((stock) => (
                  <Link
                    key={stock.symbol}
                    href={`/stocks/${encodeURIComponent(stock.symbol)}`}
                    className="bg-white/70 backdrop-blur-md border border-white hover:border-indigo-200 p-5 rounded-2xl transition-all hover:translate-y-[-2px] block group shadow-sm shadow-indigo-500/2"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-extrabold text-slate-800 group-hover:text-indigo-600 transition-all text-sm">
                        {stock.symbol}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide bg-indigo-50 text-indigo-600 border border-indigo-100">
                        NSE
                      </span>
                    </div>
                    <h4 className="font-bold text-[10px] text-slate-500">{stock.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-2 font-semibold leading-normal">{stock.desc}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* User Watchlist Feed */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <Star size={18} className="text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">My Watchlist</h3>
              </div>
              {watchlistQuotes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {watchlistQuotes.map((stock) => {
                    const stockPositive = stock.change >= 0;
                    return (
                      <Link
                        key={stock.symbol}
                        href={`/stocks/${encodeURIComponent(stock.symbol)}`}
                        className="bg-white/70 backdrop-blur-md border border-white hover:border-indigo-200 p-4 rounded-2xl transition-all hover:translate-y-[-2px] flex justify-between items-center group shadow-sm shadow-indigo-500/2"
                      >
                        <div>
                          <span className="font-extrabold text-slate-800 group-hover:text-indigo-600 transition-all text-xs block">
                            {stock.symbol}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold truncate max-w-[160px] block mt-0.5">
                            {stock.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-800 text-xs block">
                            ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                          <span className={`text-[10px] font-bold block mt-0.5 ${stockPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                            {stockPositive ? '+' : ''}{stock.change.toFixed(2)} ({stockPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white/40 border border-dashed border-slate-200 p-6 rounded-2xl text-center text-slate-400 text-xs font-bold">
                  <Star size={20} className="mx-auto mb-2 text-slate-300" />
                  Your watchlist is empty. Go to a stock's page and click the star to pin it here.
                </div>
              )}
            </div>

            {/* User Pending Orders Feed */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Active Pending Orders</h3>
              </div>
              {pendingLoading ? (
                <div className="py-4 flex flex-col items-center gap-2 text-slate-400 font-bold text-[10px]">
                  <div className="w-4 h-4 border border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                  Loading pending orders...
                </div>
              ) : pendingOrders.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pendingOrders.map((order) => (
                    <div
                      key={order._id}
                      className="bg-white/70 backdrop-blur-md border border-white p-4 rounded-2xl flex justify-between items-center group shadow-sm shadow-indigo-500/2"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-slate-800 text-xs block">
                            {order.symbol}
                          </span>
                          <span className={`px-1 py-0.5 rounded text-[8px] font-black uppercase ${
                            order.type === 'BUY' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-655 border border-red-100'
                          }`}>
                            {order.type}
                          </span>
                          <span className="px-1 py-0.5 rounded text-[8px] font-black uppercase bg-slate-100 text-slate-500 border border-slate-200">
                            {order.orderType}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-1">
                          Qty: {order.quantity} shares &bull; Trigger: ₹{order.triggerPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="px-2.5 py-1 rounded-lg border border-red-200 hover:bg-red-50 text-red-650 hover:text-red-700 text-[9px] font-extrabold transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/40 border border-dashed border-slate-200 p-6 rounded-2xl text-center text-slate-400 text-xs font-bold">
                  <TrendingUp size={20} className="mx-auto mb-2 text-slate-350" />
                  No active pending orders. Set Limit or Stop-Loss orders on the stock details page.
                </div>
              )}
            </div>

          </div>

          {/* Right Column (1/3 width) - Allocation, Activity, AI Summary */}
          <div className="space-y-6">
            
            {/* Asset Allocation (Donut Chart) */}
            {portfolio && (
              <div className="bg-white/70 backdrop-blur-md border border-white p-5 rounded-2xl shadow-sm shadow-indigo-500/2">
                <h3 className="text-sm font-bold text-slate-800 tracking-tight mb-4 flex items-center gap-2">
                  <Activity size={16} className="text-indigo-600" />
                  Asset Allocation
                </h3>
                <div className="h-[180px] w-full relative">
                  {getChartData().length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getChartData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {getChartData().map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          formatter={(value: any) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs font-bold text-slate-450">
                      Allocation details currently unavailable.
                    </div>
                  )}
                </div>
                {/* Legends list */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500 max-h-[100px] overflow-y-auto pr-1">
                  {getChartData().map((item, idx) => {
                    const totalVal = getChartData().reduce((acc, curr) => acc + curr.value, 0);
                    const pct = totalVal > 0 ? ((item.value / totalVal) * 100).toFixed(1) : '0.0';
                    return (
                      <div key={idx} className="flex items-center gap-1.5 truncate">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="truncate">{item.name} ({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white/70 backdrop-blur-md border border-white p-5 rounded-2xl shadow-sm shadow-indigo-500/2">
              <h3 className="text-sm font-bold text-slate-800 tracking-tight mb-4 flex items-center gap-2">
                <Clock size={16} className="text-indigo-600" />
                Recent Activity
              </h3>
              {recentLoading ? (
                <div className="py-4 flex flex-col items-center gap-2 text-slate-400 font-bold text-[10px]">
                  <div className="w-4 h-4 border border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                  Syncing ledger...
                </div>
              ) : recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {recentTransactions.map((tx) => {
                    const txPositive = tx.type === 'BUY';
                    return (
                      <div key={tx._id} className="flex justify-between items-center text-[10px] border-b border-slate-100/50 pb-2 last:border-0 last:pb-0">
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-extrabold text-slate-800">{tx.symbol}</span>
                            <span className={`px-1 py-0.5 rounded text-[8px] font-black uppercase ${
                              txPositive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-655 border border-red-100'
                            }`}>
                              {tx.type}
                            </span>
                          </div>
                          <span className="text-[8px] text-slate-400 font-semibold block mt-0.5">
                            {new Date(tx.executedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-slate-700 block">
                            {tx.quantity} shrs @ ₹{tx.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[8px] text-slate-450 block mt-0.5">
                            Val: ₹{tx.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-[10px] text-slate-400 font-bold italic text-center py-4">
                  No transactions recorded.
                </div>
              )}
            </div>

            {/* AI Portfolio Audit Review */}
            <div className="bg-white/70 backdrop-blur-md border border-white p-5 rounded-2xl shadow-sm shadow-indigo-500/2">
              <h3 className="text-sm font-bold text-slate-800 tracking-tight mb-3 flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-650 animate-pulse" />
                AI Portfolio Insights
              </h3>
              {aiAuditLoading ? (
                <div className="py-4 flex flex-col items-center gap-2 text-slate-400 font-bold text-[10px]">
                  <div className="w-4 h-4 border border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                  Running audit checks...
                </div>
              ) : aiAudit ? (
                <div className="bg-indigo-50/20 border border-indigo-100/50 p-4 rounded-xl max-h-[220px] overflow-y-auto scrollbar-thin">
                  <p className="text-[10px] text-indigo-955 leading-relaxed font-semibold">
                    {aiAudit}
                  </p>
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 font-bold italic text-center py-4">
                  Insights temporarily unavailable.
                </p>
              )}
            </div>

          </div>

        </div>
      </div>
    </AppLayout>
  );
}
