'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import StockSearch from '../../../components/StockSearch';
import AppLayout from '../../../components/AppLayout';
import { Star, Sparkles, TrendingUp, TrendingDown, ChevronLeft, Award } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface StockQuote {
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

interface ChartPoint {
  date: string;
  close: number;
}

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const symbol = typeof params.symbol === 'string' ? decodeURIComponent(params.symbol) : '';

  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [history, setHistory] = useState<ChartPoint[]>([]);
  const [range, setRange] = useState<'1W' | '1M' | '1Y'>('1M');
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiLoading, setAiLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchAnalysis = async () => {
    setAiLoading(true);
    try {
      const res = await fetch(`${API_URL}/stocks/${symbol}/analysis`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAiAnalysis(data.data.analysis);
      }
    } catch (err) {
      console.error('Failed to load AI commentary:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const fetchWatchlist = async () => {
    try {
      const res = await fetch(`${API_URL}/watchlist`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsWatchlisted(data.data.symbols.includes(symbol));
      }
    } catch (err) {
      console.error('Failed to load watchlist status:', err);
    }
  };

  const toggleWatchlist = async () => {
    try {
      const method = isWatchlisted ? 'DELETE' : 'POST';
      const url = isWatchlisted
        ? `${API_URL}/watchlist/${encodeURIComponent(symbol)}`
        : `${API_URL}/watchlist`;
      
      const options: RequestInit = {
        method,
        credentials: 'include',
      };

      if (!isWatchlisted) {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify({ symbol });
      }

      const res = await fetch(url, options);
      if (res.ok) {
        setIsWatchlisted(!isWatchlisted);
      }
    } catch (err) {
      console.error('Failed to toggle watchlist:', err);
    }
  };

  const fetchQuote = async () => {
    try {
      const res = await fetch(`${API_URL}/stocks/${symbol}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setQuote(data.data);
      } else {
        setError(data.error?.message || 'Stock profile not found.');
      }
    } catch (err) {
      setError('Connection to server failed.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setChartLoading(true);
    try {
      const res = await fetch(`${API_URL}/stocks/${symbol}/history?range=${range}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setHistory(data.data);
      }
    } catch (err) {
      console.error('Failed to load chart history:', err);
    } finally {
      setChartLoading(false);
    }
  };

  useEffect(() => {
    if (symbol) {
      fetchQuote();
      fetchWatchlist();
      fetchAnalysis();
    }
  }, [symbol]);

  useEffect(() => {
    if (symbol) {
      fetchHistory();
    }
  }, [symbol, range]);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center text-slate-500 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
          <p className="font-extrabold text-sm tracking-wide">Loading stock metrics...</p>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-white/80 border border-slate-100 p-8 rounded-2xl max-w-md w-full text-center shadow-lg shadow-indigo-500/2">
          <h2 className="text-xl font-bold text-red-650 mb-2">Error</h2>
          <p className="text-slate-450 text-xs font-semibold mb-6">{error || 'Stock profile not found.'}</p>
          <Link href="/dashboard" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400 hover:from-indigo-700 hover:to-indigo-500 text-white font-extrabold text-xs transition-all shadow-md shadow-indigo-500/10 active:scale-[0.98] cursor-pointer">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isPositive = quote.change >= 0;

  return (
    <AppLayout>
      <div className="p-6 md:p-10 space-y-6 max-w-5xl mx-auto font-sans relative">
        <div className="absolute top-10 right-20 w-80 h-80 rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />
        
        {/* Header Breadcrumb navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3 text-xs md:text-sm font-bold text-slate-400">
            <Link href="/dashboard" className="text-slate-500 hover:text-indigo-650 transition-all flex items-center gap-1">
              <ChevronLeft size={16} />
              Dashboard
            </Link>
            <span className="text-slate-350">/</span>
            <span className="text-slate-700">{quote.symbol}</span>
          </div>
          <div className="text-xs md:text-sm text-slate-550 font-bold">
            Virtual Capital: <span className="text-emerald-650">₹{user?.virtualBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Dynamic content grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          {/* Left Columns - Ticker metrics and charts */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stock Metadata Card */}
            <div className="bg-white/70 backdrop-blur-md border border-white p-6 rounded-2xl shadow-sm shadow-indigo-500/2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{quote.symbol}</h2>
                    <button
                      onClick={toggleWatchlist}
                      className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                        isWatchlisted
                          ? 'bg-amber-50 border-amber-200 text-amber-550 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                      }`}
                      title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
                    >
                      <Star size={16} fill={isWatchlisted ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <h3 className="text-slate-450 mt-1 font-semibold text-xs md:text-sm">{quote.name}</h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl md:text-3xl font-black text-slate-900">
                    ₹{quote.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className={`flex items-center justify-end mt-1 font-bold text-xs md:text-sm ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                    {isPositive ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                    <span>
                      {isPositive ? '+' : ''}
                      {quote.change.toFixed(2)} ({isPositive ? '+' : ''}
                      {quote.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Chart Card */}
            <div className="bg-white/70 backdrop-blur-md border border-white p-6 rounded-2xl flex flex-col h-[380px] shadow-sm shadow-indigo-500/2">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-sm font-bold text-slate-800 tracking-tight">Price Performance</h4>
                
                {/* Range Filters */}
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
                  {(['1W', '1M', '1Y'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRange(r)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                        range === r 
                          ? 'bg-indigo-600 text-white shadow-xs' 
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart Area */}
              <div className="flex-1 w-full relative">
                {chartLoading && (
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-xs z-10 flex items-center justify-center text-xs font-bold text-slate-450">
                    Refreshing chart...
                  </div>
                )}
                {history.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0.15} />
                          <stop offset="95%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }}
                        tickFormatter={(str) => {
                          const date = new Date(str);
                          if (range === '1W') return date.toLocaleDateString('en-IN', { weekday: 'short' });
                          if (range === '1M') return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                          return date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
                        }}
                      />
                      <YAxis
                        domain={['auto', 'auto']}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }}
                        tickFormatter={(val) => `₹${val.toLocaleString('en-IN')}`}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload as ChartPoint;
                            return (
                              <div className="bg-white border border-slate-100 p-3 rounded-xl shadow-lg text-[10px] font-bold text-slate-800">
                                <p className="text-slate-400">
                                  {new Date(data.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </p>
                                <p className="text-indigo-600 text-xs font-black mt-1">
                                  Price: ₹{data.close.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="close"
                        stroke={isPositive ? '#10b981' : '#f43f5e'}
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs font-bold text-slate-400">
                    Historical chart data temporarily unavailable.
                  </div>
                )}
              </div>
            </div>

            {/* Fundamentals Details Grid */}
            <div className="bg-white/70 backdrop-blur-md border border-white p-6 rounded-2xl shadow-sm shadow-indigo-500/2">
              <h4 className="text-sm font-bold text-slate-800 tracking-tight mb-4">Stock Fundamentals</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 border border-slate-100/50 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-bold mb-1 uppercase tracking-wider">OPEN</span>
                  <span className="text-xs md:text-sm font-extrabold text-slate-800">
                    ₹{quote.open.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-100/50 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-bold mb-1 uppercase tracking-wider">TODAY'S HIGH</span>
                  <span className="text-xs md:text-sm font-extrabold text-slate-800">
                    ₹{quote.high.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-100/50 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-bold mb-1 uppercase tracking-wider">TODAY'S LOW</span>
                  <span className="text-xs md:text-sm font-extrabold text-slate-800">
                    ₹{quote.low.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-100/50 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-bold mb-1 uppercase tracking-wider">VOLUME</span>
                  <span className="text-xs md:text-sm font-extrabold text-slate-800">
                    {quote.volume.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Commentary Card */}
            <div className="bg-white/70 backdrop-blur-md border border-white p-6 rounded-2xl shadow-sm shadow-indigo-500/2">
              <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2 tracking-tight">
                <Sparkles size={16} className="text-indigo-650 animate-pulse" />
                AI Market Commentary
              </h4>
              {aiLoading ? (
                <div className="py-4 flex flex-col items-center gap-2 text-slate-400 font-bold text-[10px]">
                  <div className="w-5 h-5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                  Querying advisor intelligence...
                </div>
              ) : aiAnalysis ? (
                <div className="bg-indigo-50/30 border border-indigo-100/50 p-4 rounded-xl">
                  <p className="text-xs md:text-sm text-indigo-955 leading-relaxed font-semibold">
                    {aiAnalysis}
                  </p>
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 font-bold italic text-center py-4">
                  Commentary updates unavailable at this time.
                </p>
              )}
            </div>

          </div>

          {/* Right Column - Interactive Order Ticket */}
          <div className="space-y-6">
            <OrderTicket quote={quote} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function OrderTicket({ quote }: { quote: StockQuote }) {
  const { user, updateBalance } = useAuth();
  const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'STOP_LOSS'>('MARKET');
  const [triggerPrice, setTriggerPrice] = useState<string>(quote.price.toString());
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
  
  const price = quote.price;
  const targetPrice = orderType === 'MARKET' ? price : (parseFloat(triggerPrice) || price);
  const estimatedValue = targetPrice * quantity;
  const virtualBalance = user?.virtualBalance || 0;
  
  const canSubmit = type === 'BUY' ? virtualBalance >= estimatedValue : true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const bodyPayload: any = {
        symbol: quote.symbol,
        quantity,
        type,
        orderType,
      };

      if (orderType !== 'MARKET') {
        const parsedTrigger = parseFloat(triggerPrice);
        if (isNaN(parsedTrigger) || parsedTrigger <= 0) {
          setError('Please enter a valid trigger price.');
          setLoading(false);
          return;
        }
        bodyPayload.triggerPrice = parsedTrigger;
      }

      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (orderType === 'MARKET') {
          setSuccess(`Successfully ${type === 'BUY' ? 'bought' : 'sold'} ${quantity} shares of ${quote.symbol}!`);
          updateBalance(data.data.newBalance);
        } else {
          setSuccess(`Placed ${orderType} order to ${type} ${quantity} shares of ${quote.symbol} at trigger price ₹${parseFloat(triggerPrice).toFixed(2)}!`);
        }
        setQuantity(1);
      } else {
        setError(data.error?.message || 'Order failed to execute.');
      }
    } catch (err) {
      setError('Connection to trading network failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-md border border-white p-6 rounded-2xl flex flex-col justify-between shadow-sm shadow-indigo-500/2 font-sans">
      <div>
        <h4 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <Award size={16} className="text-indigo-600" />
          Order Ticket
        </h4>
        <p className="text-[11px] text-slate-400 font-semibold mt-1 mb-6">
          Execute virtual trades inside your educational wallet.
        </p>

        {success && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-3 rounded-xl text-xs font-semibold mb-4 text-center">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-xs font-semibold mb-4 text-center">
            {error}
          </div>
        )}

        {/* Order Toggler */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50 mb-6">
          <button
            type="button"
            onClick={() => { setType('BUY'); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
              type === 'BUY' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            BUY
          </button>
          <button
            type="button"
            onClick={() => { setType('SELL'); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
              type === 'SELL' 
                ? 'bg-red-600 text-white shadow-xs' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            SELL
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5" htmlFor="orderType">
              ORDER TYPE
            </label>
            <select
              id="orderType"
              value={orderType}
              onChange={(e) => {
                setOrderType(e.target.value as any);
                setTriggerPrice(quote.price.toString());
                setError('');
                setSuccess('');
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-white/85 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 outline-none transition-all text-xs font-bold"
            >
              <option value="MARKET">MARKET</option>
              <option value="LIMIT">LIMIT</option>
              <option value="STOP_LOSS">STOP LOSS</option>
            </select>
          </div>

          {orderType !== 'MARKET' && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5" htmlFor="triggerPrice">
                TRIGGER PRICE (₹)
              </label>
              <input
                id="triggerPrice"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={triggerPrice}
                onChange={(e) => setTriggerPrice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/85 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 outline-none transition-all text-xs font-bold"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5" htmlFor="qty">
              QUANTITY
            </label>
            <input
              id="qty"
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-full px-4 py-2.5 rounded-xl bg-white/85 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 outline-none transition-all text-xs font-bold"
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
              <span>{orderType === 'MARKET' ? 'EST. SHARE PRICE' : 'TRIGGER PRICE'}</span>
              <span className="text-slate-700">₹{targetPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-455">
              <span>{type === 'BUY' ? 'EST. TOTAL COST' : 'EST. TOTAL CREDIT'}</span>
              <span className="text-slate-900 font-extrabold">₹{estimatedValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {type === 'BUY' && !canSubmit && (
            <div className="text-[10px] font-bold text-red-600 text-center">
              Insufficient cash balance in your wallet.
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (type === 'BUY' && !canSubmit)}
            className={`w-full py-3 px-4 rounded-xl text-white font-extrabold text-xs transition-all active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none mt-2 shadow-md cursor-pointer border ${
              type === 'BUY' 
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/5 border-emerald-500/20' 
                : 'bg-red-650 hover:bg-red-700 shadow-red-500/5 border-red-600/20'
            }`}
          >
            {loading ? 'Processing Order...' : `${type} ${quote.symbol}`}
          </button>
        </form>
      </div>
    </div>
  );
}
