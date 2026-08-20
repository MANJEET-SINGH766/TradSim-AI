'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import StockSearch from '../../components/StockSearch';
import AppLayout from '../../components/AppLayout';
import { History } from 'lucide-react';

interface TransactionItem {
  _id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  totalValue: number;
  realizedPnL: number;
  executedAt: string;
}

export default function TransactionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`${API_URL}/transactions`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTransactions(data.data);
      } else {
        setError(data.error?.message || 'Failed to fetch transaction logs');
      }
    } catch (err) {
      setError('Connection to data network failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center text-slate-500 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
          <p className="font-extrabold text-sm tracking-wide">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 md:p-10 space-y-8 max-w-5xl mx-auto font-sans relative">
        <div className="absolute top-10 right-20 w-80 h-80 rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />

        {/* Header Search area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Transactions</h2>
            <p className="text-slate-500 mt-1 font-semibold text-xs md:text-sm">
              Verify your immutable simulated order execution ledger history.
            </p>
          </div>
          <StockSearch />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Transactions ledger card */}
        <div className="bg-white/70 backdrop-blur-md border border-white rounded-2xl overflow-hidden shadow-sm shadow-indigo-500/2 relative z-10">
          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Timestamp</th>
                    <th className="py-4 px-6">Symbol</th>
                    <th className="py-4 px-6 text-center">Type</th>
                    <th className="py-4 px-6 text-right">Shares</th>
                    <th className="py-4 px-6 text-right">Price</th>
                    <th className="py-4 px-6 text-right">Total Value</th>
                    <th className="py-4 px-6 text-right">Realized P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {transactions.map((tx) => {
                    const isBuy = tx.type === 'BUY';
                    const pnlPositive = tx.realizedPnL >= 0;
                    return (
                      <tr key={tx._id} className="hover:bg-slate-50/40 transition-all">
                        <td className="py-4 px-6 text-slate-400 font-semibold">
                          {new Date(tx.executedAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-4 px-6">
                          <Link href={`/stocks/${encodeURIComponent(tx.symbol)}`} className="text-indigo-650 font-bold hover:text-indigo-500">
                            {tx.symbol}
                          </Link>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${
                            isBuy 
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                              : 'bg-red-50 border-red-100 text-red-600'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right text-slate-800">{tx.quantity}</td>
                        <td className="py-4 px-6 text-right text-slate-500">
                          ₹{tx.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-6 text-right font-extrabold text-slate-800">
                          ₹{tx.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {!isBuy && tx.realizedPnL !== 0 ? (
                            <span className={`font-bold ${pnlPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                              {pnlPositive ? '+' : ''}₹{tx.realizedPnL.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-bold">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center max-w-md mx-auto">
              <History size={32} className="mx-auto mb-4 text-slate-300" />
              <h4 className="text-sm font-bold text-slate-800">No Transaction Records Found</h4>
              <p className="text-slate-400 text-xs mt-1 mb-6 font-semibold leading-relaxed">
                You haven't executed any market trades yet. Search for a stock ticker above and make your first buy order to establish your record files.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
