import React, { useState } from 'react';
import { 
  FileText, 
  ChevronDown, 
  ShieldCheck, 
  Zap, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Cpu, 
  RefreshCw, 
  MessageSquare,
  LogIn,
  Layers,
  Code2,
  Check,
  Shield,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BKASH_LOGO_URL, NAGAD_LOGO_URL, ROCKET_LOGO_URL } from '../../merchant/src/constants/logos';

export const LandingPage: React.FC = () => {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#070b16] text-white font-sans selection:bg-indigo-500/30 selection:text-indigo-200 flex flex-col justify-between relative overflow-x-hidden">
      {/* Background radial gradient glow for premium dark fintech look */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] sm:w-[900px] h-[450px] bg-gradient-to-b from-indigo-600/15 via-blue-600/10 to-transparent blur-[120px] pointer-events-none -z-10" />

      <div>
        {/* Navigation Bar */}
        <header className="border-b border-slate-800/80 bg-[#070b16]/90 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-1.5 group cursor-pointer">
              <span className="font-extrabold text-2xl sm:text-3xl tracking-tight text-white flex items-center">
                <span>T</span>
                <span className="text-[#eb6a24]">K</span>
                <span className="text-slate-100 font-semibold ml-0.5">pay</span>
                <span className="text-[#10b981] font-bold ml-0.5">BD</span>
              </span>
              {/* Signal / Wifi waves icon */}
              <div className="relative flex items-center ml-0.5 text-[#10b981]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                  <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                  <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                  <circle cx="12" cy="20" r="1" fill="currentColor" />
                </svg>
              </div>
            </Link>

            {/* Nav Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/merchant/login.php"
                className="hidden xs:inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-xl transition"
              >
                <LogIn className="w-4 h-4 text-slate-400" />
                <span>Merchant Login</span>
              </Link>

              <Link
                to="/merchant/login.php"
                className="inline-flex items-center gap-2 bg-[#4f46e5] hover:bg-[#4338ca] active:scale-95 text-white text-xs sm:text-sm font-bold px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer border border-indigo-400/20"
              >
                <FileText className="w-4 h-4 text-indigo-100" />
                <span>API Docs</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="pt-10 sm:pt-16 pb-14 sm:pb-20 px-4 sm:px-6 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0d162a] border border-slate-700/60 text-slate-300 text-xs sm:text-[13px] font-medium mb-7 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Trusted Payment Infrastructure · Bangladesh</span>
          </div>

          {/* Headline exactly matching the screenshot */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.12] mb-6">
            <span>Fast & Secure</span> <br />
            <span className="bg-gradient-to-r from-[#6366f1] via-[#60a5fa] to-[#38bdf8] text-transparent bg-clip-text">
              Payment Gateway
            </span> <br />
            <span>for Your Business</span>
          </h1>

          {/* Description text */}
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-normal mb-8 sm:mb-10 text-slate-300/90">
            <strong className="text-white font-semibold">TKPayBD</strong> provides a powerful automatic payment gateway solution — enabling businesses to accept and send payments through <span className="text-slate-100 font-semibold">bKash</span>, <span className="text-slate-100 font-semibold">Nagad</span> and <span className="text-slate-100 font-semibold">Rocket</span> with a simple API integration.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col items-center gap-3 w-full max-w-md mx-auto">
            <Link
              to="/merchant/login.php"
              className="w-full bg-[#4f46e5] hover:bg-[#4338ca] active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-2xl shadow-xl shadow-indigo-600/35 transition flex items-center justify-center gap-2 border border-indigo-400/30 text-sm sm:text-base"
            >
              <FileText className="w-4 h-4 text-indigo-100" />
              <span>View API Documentation</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setShowHowItWorks(!showHowItWorks);
                scrollToSection('how-it-works');
              }}
              className="w-full bg-[#0b1329]/80 hover:bg-[#111c38] active:scale-[0.99] text-slate-300 hover:text-white font-semibold py-3 px-6 rounded-2xl border border-slate-800 transition flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
            >
              <span>How It Works</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${showHowItWorks ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Supported Channels Section */}
          <div className="mt-14 sm:mt-16 pt-8 border-t border-slate-800/60">
            <p className="text-[11px] font-bold tracking-widest uppercase text-slate-400 mb-4">
              SUPPORTED CHANNELS
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {/* bKash Pill */}
              <div className="bg-[#0b1328] border border-slate-800 hover:border-pink-500/40 px-4 py-2.5 rounded-xl flex items-center gap-2.5 shadow-sm transition">
                <div className="w-6 h-6 rounded-lg bg-[#E2136E] flex items-center justify-center overflow-hidden shrink-0 p-0.5">
                  <img src={BKASH_LOGO_URL} alt="bKash" className="w-full h-full object-contain" />
                </div>
                <span className="font-bold text-sm text-slate-200">bKash</span>
              </div>

              {/* Nagad Pill */}
              <div className="bg-[#0b1328] border border-slate-800 hover:border-orange-500/40 px-4 py-2.5 rounded-xl flex items-center gap-2.5 shadow-sm transition">
                <div className="w-6 h-6 rounded-lg bg-[#F7931E] flex items-center justify-center overflow-hidden shrink-0 p-0.5">
                  <img src={NAGAD_LOGO_URL} alt="Nagad" className="w-full h-full object-contain" />
                </div>
                <span className="font-bold text-sm text-slate-200">Nagad</span>
              </div>

              {/* Rocket Pill */}
              <div className="bg-[#0b1328] border border-slate-800 hover:border-purple-500/40 px-4 py-2.5 rounded-xl flex items-center gap-2.5 shadow-sm transition">
                <div className="w-6 h-6 rounded-lg bg-[#8C3494] flex items-center justify-center overflow-hidden shrink-0 p-0.5">
                  <img src={ROCKET_LOGO_URL} alt="Rocket" className="w-full h-full object-contain" />
                </div>
                <span className="font-bold text-sm text-slate-200">Rocket</span>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section exactly matching screenshot */}
        <section id="how-it-works" className="py-14 sm:py-20 px-4 sm:px-6 bg-[#060a14] border-t border-slate-800/80">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-left mb-8 sm:mb-10">
              <p className="text-xs sm:text-[13px] font-bold tracking-widest uppercase text-[#818cf8] mb-2.5">
                WHY CHOOSE US
              </p>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
                Built for Developers & Businesses
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Everything you need to process payments reliably — from a clean API to real-time callbacks and merchant dashboards.
              </p>
            </div>

            {/* Feature Cards Stack - Exactly matching the screenshot */}
            <div className="space-y-4 sm:space-y-5">
              {/* Card 1: Instant API Integration */}
              <div className="bg-[#0c1424] border border-[#18233c] hover:border-indigo-500/40 rounded-3xl p-6 sm:p-7 transition-all shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-[#181f3d] text-[#818cf8] flex items-center justify-center mb-5 shadow-inner">
                  <Zap className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 tracking-tight">
                  Instant API Integration
                </h3>
                <p className="text-slate-400 text-sm sm:text-[15px] leading-relaxed">
                  Simple REST API with clear documentation. Integrate PayIn and PayOut into your system in minutes with PHP, Python, or any language.
                </p>
              </div>

              {/* Card 2: Secure & Reliable */}
              <div className="bg-[#0c1424] border border-[#18233c] hover:border-emerald-500/40 rounded-3xl p-6 sm:p-7 transition-all shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-[#0f2828] text-[#2dd4bf] flex items-center justify-center mb-5 shadow-inner">
                  <Shield className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 tracking-tight">
                  Secure & Reliable
                </h3>
                <p className="text-slate-400 text-sm sm:text-[15px] leading-relaxed">
                  Every transaction is signed and verified using SHA-256 signatures. IP whitelisting, 2FA, and encrypted credentials protect your account.
                </p>
              </div>

              {/* Card 3: Real-time Callbacks */}
              <div className="bg-[#0c1424] border border-[#18233c] hover:border-cyan-500/40 rounded-3xl p-6 sm:p-7 transition-all shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-[#0f2438] text-[#22d3ee] flex items-center justify-center mb-5 shadow-inner">
                  <Activity className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 tracking-tight">
                  Real-time Callbacks
                </h3>
                <p className="text-slate-400 text-sm sm:text-[15px] leading-relaxed">
                  Receive instant webhook notifications when transactions complete. Automatic retries ensure you never miss a payment event.
                </p>
              </div>
            </div>

            {/* Quick Action to Portal */}
            <div className="mt-8 bg-gradient-to-r from-[#0d162e] via-[#091124] to-[#0d162e] border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h4 className="text-base sm:text-lg font-bold text-white">Ready to start collecting payments?</h4>
                <p className="text-slate-400 text-xs sm:text-sm">Sign in to your Merchant Portal to get your live API keys today.</p>
              </div>

              <Link
                to="/merchant/login.php"
                className="bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold text-xs sm:text-sm py-3 px-6 rounded-xl shadow-md transition flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <span>Enter Merchant Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-[#04070e] border-t border-slate-800/80 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-lg tracking-tight text-white">
              <span>T</span>
              <span className="text-[#eb6a24]">K</span>
              <span className="text-slate-200 font-semibold ml-0.5">pay</span>
              <span className="text-[#10b981] font-bold ml-0.5">BD</span>
            </span>
            <span className="text-slate-600 text-xs ml-2">|</span>
            <span className="text-slate-400 text-xs ml-2">Trusted Payment Gateway</span>
          </div>

          <p className="text-slate-500 text-xs">
            © 2026 TKPayBD. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <a
              href="https://t.me/tkpaybd12"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>@tkpaybd12 Support</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
