'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { TimelineAnimation } from '@/components/ui/hero-financial-utils/timeline-animation';
import { EcommerceDash } from '@/components/ui/hero-financial-utils/assets-index';
import { useMediaQuery } from '@/components/ui/hero-financial-utils/use-media-query';
import MotionDrawer from '@/components/ui/hero-financial-utils/motion-drawer';

export const HeroFinancial = () => {
  const timelineRef = React.useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <section
      ref={timelineRef}
      className="min-h-screen bg-[#f7f9fc] text-[#1e293b] relative overflow-hidden flex flex-col items-center"
    >
      <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1597200381847-30ec200eeb9a?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center opacity-50" />

      <svg
        width="358"
        height="483"
        viewBox="0 0 358 483"
        className="absolute top-0 z-1 left-0 pointer-events-none"
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
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feGaussianBlur
              stdDeviation="32"
              result="effect1_foregroundBlur_0_1"
            />
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
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feGaussianBlur
              stdDeviation="32"
              result="effect1_foregroundBlur_0_1"
            />
          </filter>
          <linearGradient
            id="paint0_linear_0_1"
            x1="-50.9961"
            y1="-33.114"
            x2="-50.9961"
            y2="507.886"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#91bbfb" />
            <stop offset="1" stopColor="#E6F1FF" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_0_1"
            x1="8.04686"
            y1="-135.113"
            x2="8.04686"
            y2="405.887"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#8dbafd" />
            <stop offset="1" stopColor="#c1d9f8" />
          </linearGradient>
        </defs>
      </svg>

      {/* Soft Background Gradients */}
      <TimelineAnimation
        timelineRef={timelineRef}
        animationNum={5}
        className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-blue-50 via-blue-100 to-transparent opacity-100 pointer-events-none"
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
              <Link
                href="/login"
                className="block p-2 hover:bg-neutral-100 hover:text-black rounded-lg font-semibold"
              >
                Login to Portal
              </Link>
              <Link
                href="/register"
                className="block p-2 hover:bg-neutral-100 hover:text-black rounded-lg font-semibold"
              >
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

      {/* Header */}
      {!isMobile && (
        <header className="relative z-10 w-full max-w-7xl mx-auto p-2 mt-4">
          <TimelineAnimation
            animationNum={1}
            timelineRef={timelineRef}
            className="bg-white/80 backdrop-blur-xl p-3 px-6 rounded-xl border border-white/50 shadow-md flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <svg
                className="fill-black w-7 h-7 animate-spin-slow"
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
              className="px-6 bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-400 text-white font-extrabold text-sm rounded-xl shadow-md hover:shadow-indigo-500/10 transition py-3 border border-indigo-400 cursor-pointer"
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

      {/* Dashboard UI Frame */}
      <div className="w-full max-w-5xl mx-auto rounded-xl relative mt-4 px-4 mb-20">
        <TimelineAnimation
          animationNum={6}
          timelineRef={timelineRef}
          className="rounded-2xl bg-white/40 backdrop-blur-md p-3 border border-white/50 shadow-2xl shadow-indigo-500/5"
        >
          <TimelineAnimation
            animationNum={7}
            as="img"
            timelineRef={timelineRef}
            src={EcommerceDash?.src}
            alt="phoneMockUP"
            className="w-full relative z-4 rounded-xl border border-slate-100 shadow-sm"
          />
        </TimelineAnimation>
      </div>
    </section>
  );
};

export default HeroFinancial;
