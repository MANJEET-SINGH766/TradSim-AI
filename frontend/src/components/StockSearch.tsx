'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

interface StockResult {
  symbol: string;
  name: string;
  exchange: string;
}

export default function StockSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StockResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://trad-sim-ai-backend.vercel.app/api/v1';

  // Close dropdown when clicking outside the component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debouncing search handler
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    setShowDropdown(true);

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/stocks?query=${encodeURIComponent(query)}`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setResults(data.data);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error('Stock search query failed:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce interval

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelectStock = (symbol: string) => {
    setQuery('');
    setShowDropdown(false);
    router.push(`/stocks/${encodeURIComponent(symbol)}`);
  };

  return (
    <div className="relative w-full max-w-md font-sans" ref={dropdownRef}>
      {/* Search Input field */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Indian stocks (e.g. RELIANCE, TCS)..."
          className="w-full px-4 py-2.5 pl-10 rounded-xl bg-white/80 border border-slate-200 text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all placeholder:text-slate-400 shadow-sm shadow-indigo-500/2"
        />
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        {loading && (
          <div className="absolute right-3.5 top-3">
            <div className="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Floating Results dropdown list */}
      {showDropdown && (results.length > 0 || !loading) && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden z-30 max-h-60 overflow-y-auto">
          {results.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {results.map((stock) => (
                <li key={stock.symbol}>
                  <button
                    onClick={() => handleSelectStock(stock.symbol)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 flex justify-between items-center transition-all group cursor-pointer"
                  >
                    <div>
                      <span className="font-bold text-slate-800 group-hover:text-indigo-600 transition-all text-sm block">
                        {stock.symbol}
                      </span>
                      <span className="text-xs text-slate-400 block truncate max-w-[280px] font-semibold mt-0.5">
                        {stock.name}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-indigo-50 text-indigo-600 border border-indigo-100">
                      {stock.exchange}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-slate-400 text-xs font-semibold">
              No matching Indian tickers found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
