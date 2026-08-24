'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronRight, Sparkles, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { TimelineAnimation } from '@/components/ui/hero-financial-utils/timeline-animation';
import { useMediaQuery } from '@/components/ui/hero-financial-utils/use-media-query';
import MotionDrawer from '@/components/ui/hero-financial-utils/motion-drawer';

// Ticker mock data
const TICKER_STOCKS = [
  { symbol: 'TCS.NS', price: '₹4,120.50', change: '+1.45%', isPositive: true },
  { symbol: 'RELIANCE.NS', price: '₹2,980.20', change: '-0.32%', isPositive: false },
  { symbol: 'INFY.NS', price: '₹1,840.10', change: '+2.10%', isPositive: true },
  { symbol: 'HDFCBANK.NS', price: '₹1,650.40', change: '+0.88%', isPositive: true },
  { symbol: 'SBIN.NS', price: '₹842.15', change: '-0.15%', isPositive: false },
  { symbol: 'TATAMOTORS.NS', price: '₹985.30', change: '+3.40%', isPositive: true },
  { symbol: 'BHARTIARTL.NS', price: '₹1,420.00', change: '+0.12%', isPositive: true },
  { symbol: 'ICICIBANK.NS', price: '₹1,180.50', change: '-0.45%', isPositive: false },
];

export const HeroFinancial = () => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Interactive playground states
  const [cash, setCash] = useState(1000000);
  const [shares, setShares] = useState(0);
  const [qty, setQty] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [tcsPrice, setTcsPrice] = useState(4120.50);

  // AI typing advisor states
  const [aiText, setAiText] = useState('');
  const [targetAiText, setTargetAiText] = useState(
    'Welcome to TradeSim! Tap BUY inside the ticket to acquire your first simulated TCS.NS position.'
  );

  // Live stock price tick fluctuation simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTcsPrice((prev) => {
        const change = (Math.random() - 0.49) * 5; // Slight bullish bias
        return parseFloat((prev + change).toFixed(2));
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Update AI target commentary dynamically when holdings update
  useEffect(() => {
    if (shares === 0) {
      setTargetAiText(
        'Welcome to TradeSim! Tap BUY inside the ticket to acquire your first simulated TCS.NS position.'
      );
    } else {
      const holdingsValue = shares * tcsPrice;
      const cashPercent = ((cash / 1000000) * 100).toFixed(1);
      setTargetAiText(
        `Gemini Audit: TCS.NS holdings of ${shares} shares acquired (₹${holdingsValue.toLocaleString('en-IN')}). Your virtual cash buffer is at ${cashPercent}%. IT sector concentration is at 100% of stock assets. Consider adding HDFCBANK.NS to diversify risk.`
      );
    }
  }, [shares, cash, tcsPrice]);

  // Character typing animation effect
  useEffect(() => {
    let index = 0;
    setAiText('');
    const interval = setInterval(() => {
      if (index < targetAiText.length) {
        setAiText((prev) => prev + targetAiText.charAt(index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 15);
    return () => clearInterval(interval);
  }, [targetAiText]);

  // Execute buy order
  const handleBuy = () => {
    const cost = qty * tcsPrice;
    if (cash >= cost) {
      setCash((prev) => parseFloat((prev - cost).toFixed(2)));
      setShares((prev) => prev + qty);
      setFeedback(`Bought ${qty} shares of TCS.NS!`);
      setTimeout(() => setFeedback(''), 3000);
    } else {
      setFeedback('Insufficient virtual cash balance!');
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  // Execute sell order
  const handleSell = () => {
    if (shares >= qty) {
      const credit = qty * tcsPrice;
      setCash((prev) => parseFloat((prev + credit).toFixed(2)));
      setShares((prev) => prev - qty);
      setFeedback(`Sold ${qty} shares of TCS.NS!`);
      setTimeout(() => setFeedback(''), 3000);
    } else {
      setFeedback('Insufficient share balance to execute Sell order!');
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  return (
    <section
      ref={timelineRef}
      className="min-h-screen bg-[#f7f9fc] text-[#1e293b] relative overflow-hidden flex flex-col items-center"
    >
      {/* Decorative Blur and SVG Elements */}
      <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1597200381847-30ec200eeb9a?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center opacity-50 pointer-events-none" />

      {/* Scrolling Ticker Tape Header */}
      <div className="w-full bg-white border-b border-slate-150 py-2 overflow-hidden sticky top-0 z-40 shadow-xs flex relative items-center pointer-events-none">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...TICKER_STOCKS, ...TICKER_STOCKS].map((stock, i) => (
            <div key={i} className="inline-flex items-center mx-6 gap-2 text-xs font-bold">
              <span className="text-slate-800">{stock.symbol}</span>
              <span className="text-slate-500">{stock.price}</span>
              <span className={stock.isPositive ? 'text-emerald-600' : 'text-red-500'}>
                {stock.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      <svg
        width="358"
        height="483"
        viewBox="0 0 358 483"
        className="absolute top-8 z-1 left-0 pointer-events-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#filter0_f_0_1)">
          <rect
            x="-86.9961"
            y="-33.114"
            width="72"
            height="541"
            rx="36"
            transform="rotate(-30.8182 -86.9961 -33.114)"
            fill="url(#paint0_linear_0_1)"
          />
        </g>
        <g filter="url(#filter1_f_0_1)">
          <rect
            x="-17"
            y="-135.113"
            width="50.0937"
            height="541"
            rx="25.0469"
            transform="rotate(-30.8182 -17 -135.113)"
            fill="url(#paint1_linear_0_1)"
          />
        </g>
        <defs>
          <filter
            id="filter0_f_0_1"
            x="-137.641"
            y="-120.646"
            width="440.285"
            height="602.787"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="32" result="effect1_foregroundBlur_0_1" />
          </filter>
          <filter
            id="filter1_f_0_1"
            x="-71.707"
            y="-215.486"
            width="429.598"
            height="599.69"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="32" result="effect1_foregroundBlur_0_1" />
          </filter>
          <linearGradient id="paint0_linear_0_1" x1="-50.9961" y1="-33.114" x2="-50.9961" y2="507.886" gradientUnits="userSpaceOnUse">
            <stop stopColor="#91bbfb" />
            <stop offset="1" stopColor="#E6F1FF" />
          </linearGradient>
          <linearGradient id="paint1_linear_0_1" x1="8.04686" y1="-135.113" x2="8.04686" y2="405.887" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8dbafd" />
            <stop offset="1" stopColor="#c1d9f8" />
          </linearGradient>
        </defs>
      </svg>

      {/* Soft Background Gradients */}
      <TimelineAnimation
        timelineRef={timelineRef}
        animationNum={5}
        className="absolute top-8 left-0 w-full h-[600px] bg-gradient-to-b from-blue-50 via-blue-100 to-transparent opacity-100 pointer-events-none"
      />

      {isMobile && (
        <div className="flex gap-4 justify-between items-center px-5 w-full pt-4 relative z-10">
          <MotionDrawer
            direction="left"
            width={300}
            backgroundColor={'#ffffff'}
            clsBtnClassName="bg-neutral-800 border-r border-neutral-900 text-white cursor-pointer"
            contentClassName="bg-white border-r border-neutral-200 text-black"
            btnClassName="bg-white text-black relative w-fit p-2 left-0 top-0 rounded-full shadow-sm border border-neutral-200 cursor-pointer"
          >
            <nav className="space-y-4">
              <div className="flex items-center gap-2 text-black mb-6">
                <svg
                  className="fill-black w-8 h-8"
                  width="97"
                  height="108"
                  viewBox="0 0 97 108"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M55.5 0C61.0005 0.00109895 64.5005 2.50586 64.5 7.5V17C64.5 24.5059 68.5005 27.5 81 27.5H88C94.0005 27.5059 96.5 29.5059 96.5 37.5V98.5C96.5 106.006 95.0005 107.5 88 107.5H41.5C36.5005 107.5 32 104.506 32 98.5V88C32 84.5 28.5 80 20.5 80H8.5C3 80 0 76.5 0 71.5V6.5C0.00048844 1.50586 2.50049 0.00585937 8.5 0H55.5ZM31 20C28.7909 20 27 21.7909 27 24V74C27 76.2091 28.7909 78 31 78H58C60.2091 78 62 76.2091 62 74V24C62 21.7909 60.2091 20 58 20H31Z" />
                </svg>
                <span className="font-extrabold text-lg">TradeSim AI</span>
              </div>
              <Link href="/login" className="block p-2 hover:bg-neutral-100 hover:text-black rounded-lg font-semibold">
                Login to Portal
              </Link>
              <Link href="/register" className="block p-2 hover:bg-neutral-100 hover:text-black rounded-lg font-semibold">
                Create Account
              </Link>
            </nav>
          </MotionDrawer>
          <Link href="/register">
            <button className="bg-neutral-900 text-white px-4 py-2.5 flex gap-1 items-center rounded-xl font-bold text-xs hover:bg-black transition shadow-[inset_2px_2px_5px_0px_rgba(0,0,0,0.3)] cursor-pointer">
              Get Started <ChevronRight size={16} />
            </button>
          </Link>
        </div>
      )}

      {/* Header Navigation */}
      {!isMobile && (
        <header className="relative z-10 w-full max-w-7xl mx-auto p-2 mt-4">
          <TimelineAnimation
            animationNum={1}
            timelineRef={timelineRef}
            className="bg-white/80 backdrop-blur-xl p-3 px-6 rounded-xl border border-white/50 shadow-md flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <svg
                className="fill-indigo-600 w-7 h-7 animate-spin-slow"
                width="97"
                height="108"
                viewBox="0 0 97 108"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M55.5 0C61.0005 0.00109895 64.5005 2.50586 64.5 7.5V17C64.5 24.5059 68.5005 27.5 81 27.5H88C94.0005 27.5059 96.5 29.5059 96.5 37.5V98.5C96.5 106.006 95.0005 107.5 88 107.5H41.5C36.5005 107.5 32 104.506 32 98.5V88C32 84.5 28.5 80 20.5 80H8.5C3 80 0 76.5 0 71.5V6.5C0.00048844 1.50586 2.50049 0.00585937 8.5 0H55.5ZM31 20C28.7909 20 27 21.7909 27 24V74C27 76.2091 28.7909 78 31 78H58C60.2091 78 62 76.2091 62 74V24C62 21.7909 60.2091 20 58 20H31Z" />
              </svg>
              <span className="text-lg font-black tracking-tight text-slate-900">
                TradeSim AI
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-neutral-500">
              <Link href="/" className="hover:text-indigo-600 transition">
                Home
              </Link>
              <Link href="/login" className="hover:text-indigo-600 transition">
                Simulator
              </Link>
              <Link href="/register" className="hover:text-indigo-600 transition">
                Sign Up
              </Link>
              <span className="text-neutral-300">|</span>
              <span className="text-[10px] uppercase bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded border border-emerald-200">
                Market Feed: Live
              </span>
            </nav>
            <Link href="/register">
              <button className="bg-neutral-900 text-white px-4 py-2 flex gap-1 items-center rounded-xl font-bold text-xs hover:bg-black transition shadow-[inset_2px_2px_5px_0px_rgba(0,0,0,0.3)] cursor-pointer">
                Get Started <ChevronRight size={16} />
              </button>
            </Link>
          </TimelineAnimation>
        </header>
      )}

      {/* Hero Content */}
      <div className="relative z-10 text-center pt-20 pb-12 px-4 flex flex-col gap-6 items-center">
        <TimelineAnimation
          animationNum={1}
          timelineRef={timelineRef}
          className="bg-white w-fit mx-auto text-black px-2.5 py-1 rounded-full inline-flex items-center gap-2 shadow-md border border-slate-100"
        >
          <span className="bg-gradient-to-br from-indigo-500 to-indigo-300 text-white px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest">
            NSE & BSE
          </span>
          <span className="text-xs font-semibold text-slate-700">
            Real-time paper trading for Indian Equities
          </span>
        </TimelineAnimation>

        <TimelineAnimation
          as="h1"
          animationNum={2}
          timelineRef={timelineRef}
          className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-neutral-900 max-w-5xl leading-[1.05]"
        >
          Make your financial <br /> operations seamless.
        </TimelineAnimation>

        <TimelineAnimation
          as="p"
          animationNum={3}
          timelineRef={timelineRef}
          className="text-base md:text-lg text-neutral-500 font-medium max-w-2xl mx-auto leading-relaxed px-4"
        >
          Take control of your trades with TradeSim, the next-generation simulation environment built to simplify, automate, and elevate your learning.
        </TimelineAnimation>

        <div className="flex gap-4 justify-center pt-2">
          <Link href="/register">
            <TimelineAnimation
              as="button"
              animationNum={4}
              timelineRef={timelineRef}
              className="px-6 bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-400 text-white font-extrabold text-sm rounded-xl shadow-md hover:shadow-indigo-500/10 transition py-3 border border-indigo-400 cursor-pointer animate-pulse"
            >
              Get Started
            </TimelineAnimation>
          </Link>
          <Link href="/login">
            <TimelineAnimation
              as="button"
              animationNum={5}
              timelineRef={timelineRef}
              className="px-6 bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200 text-neutral-800 font-extrabold text-sm rounded-xl shadow-sm hover:border-slate-400 transition py-3 border border-neutral-300 cursor-pointer"
            >
              Login to Workspace
            </TimelineAnimation>
          </Link>
        </div>
      </div>

      {/* Interactive Hero Playground Simulator Widget */}
      <div className="w-full max-w-5xl mx-auto rounded-xl relative mt-4 px-4 mb-20 z-10">
        <TimelineAnimation
          animationNum={6}
          timelineRef={timelineRef}
          className="rounded-2xl bg-white/70 backdrop-blur-xl p-6 border border-white shadow-2xl shadow-indigo-500/5 flex flex-col md:flex-row gap-6"
        >
          {/* Left Panel: Transaction Order Ticket */}
          <div className="flex-1 bg-gradient-to-br from-white/95 to-slate-50/50 border border-slate-100 p-5 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm shadow-indigo-500/2">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-wide">
                  TCS.NS (NSE)
                </span>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Activity size={14} className="text-emerald-500 animate-pulse" />
                  ₹{tcsPrice.toLocaleString('en-IN')}
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Interactive Trading Ticket</h4>
              <p className="text-[10px] text-slate-450 font-semibold mt-1">
                Simulate purchasing assets inside this demo container.
              </p>
            </div>

            <div className="space-y-3">
              <div className="bg-white border border-slate-100 p-3 rounded-lg flex justify-between items-center text-xs font-bold">
                <span className="text-slate-400">Cash Balance</span>
                <span className="text-slate-800">₹{cash.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-white border border-slate-100 p-3 rounded-lg flex justify-between items-center text-xs font-bold">
                <span className="text-slate-400">TCS.NS Holdings</span>
                <span className="text-indigo-600 font-extrabold">{shares} shares</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 bg-white border border-slate-100 p-1.5 rounded-lg">
                <button
                  onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                  className="px-2.5 py-1 text-xs font-bold rounded hover:bg-slate-50 border border-slate-100 cursor-pointer"
                >
                  -
                </button>
                <span className="text-xs font-extrabold text-slate-700">{qty} shares</span>
                <button
                  onClick={() => setQty((prev) => prev + 1)}
                  className="px-2.5 py-1 text-xs font-bold rounded hover:bg-slate-50 border border-slate-100 cursor-pointer"
                >
                  +
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleBuy}
                  className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition active:scale-95 cursor-pointer shadow-md shadow-emerald-500/10 border border-emerald-500/10"
                >
                  BUY
                </button>
                <button
                  onClick={handleSell}
                  className="flex-1 py-2 rounded-lg bg-red-650 hover:bg-red-700 text-white font-extrabold text-xs transition active:scale-95 cursor-pointer shadow-md shadow-red-500/10 border border-red-600/10"
                >
                  SELL
                </button>
              </div>
            </div>

            {feedback && (
              <div className="text-[10px] text-center font-bold bg-indigo-50 border border-indigo-100 text-indigo-600 p-1.5 rounded-lg animate-bounce mt-1">
                {feedback}
              </div>
            )}
          </div>

          {/* Middle Panel: Pulsing Price Wave Chart */}
          <div className="flex-1 bg-gradient-to-br from-white/95 to-indigo-50/10 border border-slate-150 p-5 rounded-2xl flex flex-col justify-between h-56 md:h-auto min-h-[220px] shadow-sm shadow-indigo-500/2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">Dynamic Market Trend</span>
              <span className="text-[9px] text-emerald-600 font-extrabold uppercase bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                Live Wave
              </span>
            </div>
            
            {/* Pulsing SVG line representing changing quotes */}
            <div className="flex-1 relative w-full mt-4 flex items-center justify-center">
              <svg className="w-full h-full min-h-[140px]" viewBox="0 0 100 50" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity="0.2" />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity="0" />
                  </linearGradient>
                  <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1.8" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                {/* Horizontal gridlines */}
                <line x1="0" y1="12.5" x2="100" y2="12.5" stroke="#f1f5f9" strokeWidth="0.5" />
                <line x1="0" y1="25" x2="100" y2="25" stroke="#f1f5f9" strokeWidth="0.5" />
                <line x1="0" y1="37.5" x2="100" y2="37.5" stroke="#f1f5f9" strokeWidth="0.5" />

                {/* Animated Chart Wave */}
                <path
                  d={`M 0 ${35 - (tcsPrice - 4120) * 1.5} 
                      Q 20 ${38 + (tcsPrice - 4120) * 2} 40 ${30 - (tcsPrice - 4120) * 1.2} 
                      T 80 ${25 + (tcsPrice - 4120) * 0.5} 100 ${28 - (tcsPrice - 4120) * 2}`}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2"
                  filter="url(#neon-glow)"
                  className="transition-all duration-1000 ease-in-out"
                />
                <path
                  d={`M 0 ${35 - (tcsPrice - 4120) * 1.5} 
                      Q 20 ${38 + (tcsPrice - 4120) * 2} 40 ${30 - (tcsPrice - 4120) * 1.2} 
                      T 80 ${25 + (tcsPrice - 4120) * 0.5} 100 ${28 - (tcsPrice - 4120) * 2}
                      L 100 50 L 0 50 Z`}
                  fill="url(#chartGradient)"
                  className="transition-all duration-1000 ease-in-out"
                />
              </svg>
            </div>
          </div>

          {/* Right Panel: Gemini AI Advisor Typing Card */}
          <div className="flex-1 bg-slate-950 border border-indigo-500/20 p-5 rounded-2xl flex flex-col justify-between min-h-[220px] shadow-lg shadow-indigo-950/20 text-slate-100">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center justify-between tracking-tight">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={16} className="text-indigo-400 animate-pulse" />
                  Gemini Advisory Audit
                </span>
                <span className="text-[9px] text-cyan-400 font-extrabold uppercase bg-cyan-950/60 border border-cyan-800/40 px-1.5 py-0.5 rounded-full animate-pulse">
                  Live Scan
                </span>
              </h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-1.5">
                Live mock-evaluation updating character-by-character based on your active trades.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-900/80 p-4 rounded-xl flex-1 flex items-center mt-4 text-[#a5d6ff] font-semibold text-xs min-h-[90px] shadow-inner leading-relaxed">
              <p>
                {aiText}
                <span className="inline-block w-1.5 h-3 bg-cyan-400 animate-pulse ml-0.5" />
              </p>
            </div>
          </div>
        </TimelineAnimation>
      </div>
    </section>
  );
};

export default HeroFinancial;
