'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        router.push('/dashboard');
      } else {
        setError(res.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 bg-[#f7f9fc] min-h-screen relative overflow-hidden font-sans">
      {/* Decorative Blob Background Elements from Landing Page */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />

      {/* SVG Decorative lines */}
      <svg
        width="358"
        height="483"
        viewBox="0 0 358 483"
        className="absolute top-0 left-0 pointer-events-none opacity-60 z-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#filter0_f_login)">
          <rect
            x="-86.9961"
            y="-33.114"
            width="72"
            height="541"
            rx="36"
            transform="rotate(-30.8182 -86.9961 -33.114)"
            fill="url(#paint0_linear_login)"
          />
        </g>
        <defs>
          <filter
            id="filter0_f_login"
            x="-137.641"
            y="-120.646"
            width="440.285"
            height="602.787"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="32" />
          </filter>
          <linearGradient id="paint0_linear_login" x1="-50.9961" y1="-33.114" x2="-50.9961" y2="507.886" gradientUnits="userSpaceOnUse">
            <stop stopColor="#91bbfb" />
            <stop offset="1" stopColor="#E6F1FF" />
          </linearGradient>
        </defs>
      </svg>

      <div className="w-full max-w-md z-10">
        {/* Branding header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="fill-indigo-600 w-8 h-8 animate-spin-slow"
              width="97"
              height="108"
              viewBox="0 0 97 108"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M55.5 0C61.0005 0.00109895 64.5005 2.50586 64.5 7.5V17C64.5 24.5059 68.5005 27.5 81 27.5H88C94.0005 27.5059 96.5 29.5059 96.5 37.5V98.5C96.5 106.006 95.0005 107.5 88 107.5H41.5C36.5005 107.5 32 104.506 32 98.5V88C32 84.5 28.5 80 20.5 80H8.5C3 80 0 76.5 0 71.5V6.5C0.00048844 1.50586 2.50049 0.00585937 8.5 0H55.5ZM31 20C28.7909 20 27 21.7909 27 24V74C27 76.2091 28.7909 78 31 78H58C60.2091 78 62 76.2091 62 74V24C62 21.7909 60.2091 20 58 20H31Z" />
            </svg>
            <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400 bg-clip-text text-transparent">
              TradeSim AI
            </span>
          </div>
          <p className="text-slate-500 text-sm font-semibold">
            Educational Paper Trading Simulator
          </p>
        </div>

        {/* Glassmorphic Form Card */}
        <div className="bg-white/70 backdrop-blur-xl border border-white p-8 rounded-2xl shadow-xl shadow-indigo-500/2">
          <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">
            Sign In to Your Account
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-xs font-semibold mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 outline-none transition-all placeholder:text-slate-400 text-sm"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide" htmlFor="password">
                  Password
                </label>
              </div>
              <input
                id="password"
                type="password"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 outline-none transition-all placeholder:text-slate-400 text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400 hover:from-indigo-700 hover:to-indigo-500 text-white font-extrabold text-xs transition-all shadow-md shadow-indigo-500/10 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2 cursor-pointer border border-indigo-400/20"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-6 font-semibold">
            Don't have an account?{' '}
            <Link href="/register" className="text-indigo-600 hover:text-indigo-500 font-extrabold transition-all">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
