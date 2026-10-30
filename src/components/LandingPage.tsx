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
  Activity,
  Monitor,
  Clock,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BKASH_LOGO_URL, NAGAD_LOGO_URL, ROCKET_LOGO_URL } from '../../merchant/src/constants/logos';

export const LandingPage: React.FC = () => {
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
                <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0 shadow-xs">
                  <img src={BKASH_LOGO_URL} alt="bKash" className="w-full h-full object-contain" />
                </div>
                <span className="font-bold text-sm text-slate-200">bKash</span>
              </div>

              {/* Nagad Pill */}
              <div className="bg-[#0b1328] border border-slate-800 hover:border-orange-500/40 px-4 py-2.5 rounded-xl flex items-center gap-2.5 shadow-sm transition">
                <div className="w-6 h-6 flex items-center justify-center overflow-hidden shrink-0">
                  <img src={NAGAD_LOGO_URL} alt="Nagad" className="w-full h-full object-contain" />
                </div>
                <span className="font-bold text-sm text-slate-200">Nagad</span>
              </div>

              {/* Rocket Pill */}
              <div className="bg-[#0b1328] border border-slate-800 hover:border-purple-500/40 px-4 py-2.5 rounded-xl flex items-center gap-2.5 shadow-sm transition">
                <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0 shadow-xs">
                  <img src={ROCKET_LOGO_URL} alt="Rocket" className="w-full h-full object-contain" />
                </div>
                <span className="font-bold text-sm text-slate-200">Rocket</span>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section exactly matching screenshot */}
        <section id="features" className="py-14 sm:py-20 px-4 sm:px-6 bg-[#060a14] border-t border-slate-800/80">
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

              {/* Card 4: Merchant Dashboard (from screenshot) */}
              <div className="bg-[#0c1424] border border-[#18233c] hover:border-amber-500/40 rounded-3xl p-6 sm:p-7 transition-all shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-[#251d10] text-[#f59e0b] flex items-center justify-center mb-5 shadow-inner">
                  <Monitor className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 tracking-tight">
                  Merchant Dashboard
                </h3>
                <p className="text-slate-400 text-sm sm:text-[15px] leading-relaxed">
                  Full-featured merchant panel with balance overview, transaction history, API key management, and deposit/withdrawal controls.
                </p>
              </div>

              {/* Card 5: Fast Settlement (from screenshot) */}
              <div className="bg-[#0c1424] border border-[#18233c] hover:border-orange-500/40 rounded-3xl p-6 sm:p-7 transition-all shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-[#2a170e] text-[#f97316] flex items-center justify-center mb-5 shadow-inner">
                  <Clock className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 tracking-tight">
                  Fast Settlement
                </h3>
                <p className="text-slate-400 text-sm sm:text-[15px] leading-relaxed">
                  Payments are processed and merchant balances are updated automatically upon confirmation — no manual approval required.
                </p>
              </div>

              {/* Card 6: Secure & Reliable (from screenshot) */}
              <div className="bg-[#0c1424] border border-[#18233c] hover:border-purple-500/40 rounded-3xl p-6 sm:p-7 transition-all shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-[#221634] text-[#a855f7] flex items-center justify-center mb-5 shadow-inner">
                  <Users className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 tracking-tight">
                  Secure & Reliable
                </h3>
                <p className="text-slate-400 text-sm sm:text-[15px] leading-relaxed">
                  Built with strong encryption and real-time monitoring. Your transactions are protected and processed smoothly around the clock.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Integration Flow: How It Works Section (from screenshot) */}
        {/* Integration Flow: How It Works Section (Exact Match to User Screenshot) */}
        <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 bg-[#040813] border-t border-slate-800/80 relative">
          <div className="max-w-xl mx-auto text-center">
            {/* Header matching exact text from screenshot */}
            <div className="mb-14 sm:mb-16">
              <p className="text-xs sm:text-[13px] font-bold tracking-widest uppercase text-[#818cf8] mb-2.5">
                INTEGRATION FLOW
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
                How It Works
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Get started in four simple steps and start accepting payments from your customers.
              </p>
            </div>

            {/* Vertical Flow with Circular Badges matching screenshot */}
            <div className="space-y-12 sm:space-y-14 relative">
              {/* Step 1 */}
              <div className="flex flex-col items-center group">
                <div className="w-16 h-16 rounded-full bg-[#4f46e5] text-white text-2xl font-black flex items-center justify-center mb-5 shadow-xl shadow-indigo-600/30 ring-4 ring-[#4f46e5]/25 transition-transform group-hover:scale-105">
                  1
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2.5 tracking-tight">
                  Get API Keys
                </h3>
                <p className="text-slate-400 text-sm sm:text-[15px] leading-relaxed max-w-md mx-auto">
                  Contact us to create a merchant account and receive your API Key, Secret Key, and Merchant ID.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center group">
                <div className="w-16 h-16 rounded-full bg-[#4f46e5] text-white text-2xl font-black flex items-center justify-center mb-5 shadow-xl shadow-indigo-600/30 ring-4 ring-[#4f46e5]/25 transition-transform group-hover:scale-105">
                  2
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2.5 tracking-tight">
                  Create a Payment
                </h3>
                <p className="text-slate-400 text-sm sm:text-[15px] leading-relaxed max-w-md mx-auto">
                  Call the PayIn API with transaction details. Receive a{' '}
                  <code className="bg-[#12192d] text-indigo-300 px-2 py-0.5 rounded-md border border-slate-700/80 font-mono text-xs">payment_url</code>{' '}
                  and redirect your customer.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center group">
                <div className="w-16 h-16 rounded-full bg-[#4f46e5] text-white text-2xl font-black flex items-center justify-center mb-5 shadow-xl shadow-indigo-600/30 ring-4 ring-[#4f46e5]/25 transition-transform group-hover:scale-105">
                  3
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2.5 tracking-tight">
                  Customer Pays
                </h3>
                <p className="text-slate-400 text-sm sm:text-[15px] leading-relaxed max-w-md mx-auto">
                  Customer completes payment on the secure payment page via bKash, Nagad or Rocket.
                </p>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center group">
                <div className="w-16 h-16 rounded-full bg-[#4f46e5] text-white text-2xl font-black flex items-center justify-center mb-5 shadow-xl shadow-indigo-600/30 ring-4 ring-[#4f46e5]/25 transition-transform group-hover:scale-105">
                  4
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2.5 tracking-tight">
                  Receive Callback
                </h3>
                <p className="text-slate-400 text-sm sm:text-[15px] leading-relaxed max-w-md mx-auto">
                  We notify your webhook URL instantly. Verify the signature and update your order status.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PAYMENT METHODS: Supported Channels Section (exact match to user screenshot) */}
        <section id="channels" className="py-16 sm:py-24 px-4 sm:px-6 bg-[#040813] border-t border-slate-800/80">
          <div className="max-w-xl mx-auto">
            {/* Header */}
            <div className="text-left mb-8 sm:mb-10">
              <p className="text-xs sm:text-[13px] font-bold tracking-widest uppercase text-[#818cf8] mb-2.5">
                PAYMENT METHODS
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
                Supported Channels
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                We currently support the most widely used mobile financial services in Bangladesh.
              </p>
            </div>

            {/* Channels Stack (bKash, Nagad, Rocket) matching Screenshot */}
            <div className="space-y-4">
              {/* bKash Card */}
              <div className="bg-[#0c1424] border border-[#18233c] hover:border-pink-500/30 rounded-3xl p-5 sm:p-6 transition-all shadow-sm flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 shadow-md">
                  <img src={BKASH_LOGO_URL} alt="bKash" className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">bKash</h3>
                  <p className="text-slate-400 text-xs sm:text-sm font-mono mt-0.5">Method Code: 101</p>
                  <div className="flex items-center gap-2 mt-2.5">
                    <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold px-3 py-1 rounded-md">
                      PayIn
                    </span>
                    <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold px-3 py-1 rounded-md">
                      PayOut
                    </span>
                  </div>
                </div>
              </div>

              {/* Nagad Card */}
              <div className="bg-[#0c1424] border border-[#18233c] hover:border-orange-500/30 rounded-3xl p-5 sm:p-6 transition-all shadow-sm flex items-center gap-4">
                <div className="w-14 h-14 flex items-center justify-center shrink-0">
                  <img src={NAGAD_LOGO_URL} alt="Nagad" className="w-14 h-14 object-contain drop-shadow-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Nagad</h3>
                  <p className="text-slate-400 text-xs sm:text-sm font-mono mt-0.5">Method Code: 102</p>
                  <div className="flex items-center gap-2 mt-2.5">
                    <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold px-3 py-1 rounded-md">
                      PayIn
                    </span>
                    <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold px-3 py-1 rounded-md">
                      PayOut
                    </span>
                  </div>
                </div>
              </div>

              {/* Rocket Card */}
              <div className="bg-[#0c1424] border border-[#18233c] hover:border-purple-500/30 rounded-3xl p-5 sm:p-6 transition-all shadow-sm flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 shadow-md">
                  <img src={ROCKET_LOGO_URL} alt="Rocket" className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Rocket</h3>
                  <p className="text-slate-400 text-xs sm:text-sm font-mono mt-0.5">Method Code: 103</p>
                  <div className="flex items-center gap-2 mt-2.5">
                    <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold px-3 py-1 rounded-md">
                      PayIn
                    </span>
                    <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold px-3 py-1 rounded-md">
                      PayOut
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid: 4 Cards (exact match to Screenshot 20261030-085331) */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-12 sm:mt-14">
              {/* Card 1: Uptime */}
              <div className="bg-[#0c1424] border border-[#18233c] rounded-2xl p-5 sm:p-6 text-center hover:border-indigo-500/30 transition-all shadow-sm">
                <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  99.9<span className="text-white text-xl sm:text-2xl font-bold ml-0.5">%</span>
                </div>
                <div className="text-slate-400 text-xs sm:text-sm font-medium mt-1.5">
                  Uptime SLA
                </div>
              </div>

              {/* Card 2: Avg. Payment Redirect */}
              <div className="bg-[#0c1424] border border-[#18233c] rounded-2xl p-5 sm:p-6 text-center hover:border-indigo-500/30 transition-all shadow-sm">
                <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  &lt;3<span className="text-white text-xl sm:text-2xl font-bold ml-0.5">s</span>
                </div>
                <div className="text-slate-400 text-xs sm:text-sm font-medium mt-1.5">
                  Avg. Payment Redirect
                </div>
              </div>

              {/* Card 3: Payment Channels */}
              <div className="bg-[#0c1424] border border-[#18233c] rounded-2xl p-5 sm:p-6 text-center hover:border-indigo-500/30 transition-all shadow-sm">
                <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  3<span className="text-white text-xl sm:text-2xl font-bold ml-0.5">+</span>
                </div>
                <div className="text-slate-400 text-xs sm:text-sm font-medium mt-1.5">
                  Payment Channels
                </div>
              </div>

              {/* Card 4: System Monitoring */}
              <div className="bg-[#0c1424] border border-[#18233c] rounded-2xl p-5 sm:p-6 text-center hover:border-indigo-500/30 transition-all shadow-sm">
                <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  24<span className="text-indigo-400 text-xl sm:text-2xl font-bold ml-0.5">/7</span>
                </div>
                <div className="text-slate-400 text-xs sm:text-sm font-medium mt-1.5">
                  System Monitoring
                </div>
              </div>
            </div>

            {/* Developer First Section (exact match to Screenshot 20261030-085331) */}
            <div className="mt-12 sm:mt-16 text-left">
              <p className="text-xs sm:text-[13px] font-bold tracking-widest uppercase text-[#818cf8] mb-2.5">
                DEVELOPER FIRST
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-[1.2] mb-3">
                Simple API, <br className="sm:hidden" />Powerful Results
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6">
                One API call to create a payment. Webhook callback when done. That&apos;s it. No complex setup, no hidden steps.
              </p>

              {/* Feature Checklist */}
              <div className="space-y-3.5 mb-8">
                <div className="flex items-center gap-3 text-slate-300 text-sm sm:text-[15px]">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[2.8]" />
                  </div>
                  <span>REST API with JSON request &amp; response</span>
                </div>

                <div className="flex items-center gap-3 text-slate-300 text-sm sm:text-[15px]">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[2.8]" />
                  </div>
                  <span>SHA-256 signed webhooks for security</span>
                </div>

                <div className="flex items-center gap-3 text-slate-300 text-sm sm:text-[15px]">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[2.8]" />
                  </div>
                  <span>Supports PHP, Python, Node.js, cURL</span>
                </div>

                <div className="flex items-center gap-3 text-slate-300 text-sm sm:text-[15px]">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[2.8]" />
                  </div>
                  <span>Sandbox &amp; Live environments</span>
                </div>
              </div>

              {/* View Full Docs Action Button */}
              <div>
                <Link
                  to="/merchant/login.php"
                  className="bg-[#4f46e5] hover:bg-[#4338ca] active:scale-95 text-white font-semibold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 inline-flex items-center gap-2 transition cursor-pointer"
                >
                  <span>View Full Docs</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* REST API Code Snippet Card (exact match to Screenshot 20261030-085338) */}
              <div className="mt-8 bg-[#0c1424] border border-[#18233c] rounded-2xl overflow-hidden shadow-2xl">
                {/* Terminal Titlebar */}
                <div className="bg-[#080d19] px-4 py-3.5 border-b border-[#18233c] flex items-center">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                  </div>
                  <span className="text-xs text-slate-400 font-mono ml-4 tracking-tight">
                    POST /api/v1/payin/create
                  </span>
                </div>

                {/* Code Preview Body */}
                <div className="p-5 sm:p-6 font-mono text-xs sm:text-[13px] leading-relaxed overflow-x-auto text-slate-300">
                  <div className="text-slate-500 font-sans sm:font-mono">// Request Headers</div>
                  <div className="mt-1">
                    <span className="text-[#7dd3fc]">X-API-Key:</span>{' '}
                    <span className="text-[#34d399]">ak_live_xxxxxxxxxx</span>
                  </div>
                  <div>
                    <span className="text-[#7dd3fc]">X-Merchant-ID:</span>{' '}
                    <span className="text-[#34d399]">MCH_XXXXXXXX</span>
                  </div>

                  <div className="text-slate-500 font-sans sm:font-mono mt-5">// Request Body</div>
                  <div>{'{'}</div>
                  <div className="pl-4">
                    <span className="text-[#7dd3fc]">&quot;amount&quot;</span>: <span className="text-[#fbbf24]">500.00</span>,
                  </div>
                  <div className="pl-4">
                    <span className="text-[#7dd3fc]">&quot;method_code&quot;</span>: <span className="text-[#fbbf24]">101</span>,
                  </div>
                  <div className="pl-4">
                    <span className="text-[#7dd3fc]">&quot;trx_id&quot;</span>: <span className="text-[#34d399]">&quot;ORD-001&quot;</span>,
                  </div>
                  <div className="pl-4">
                    <span className="text-[#7dd3fc]">&quot;callback_url&quot;</span>: <span className="text-[#34d399]">&quot;https://yoursite.com/cb&quot;</span>,
                  </div>
                  <div className="pl-4">
                    <span className="text-[#7dd3fc]">&quot;return_url&quot;</span>: <span className="text-[#34d399]">&quot;https://yoursite.com/success&quot;</span>
                  </div>
                  <div>{'}'}</div>

                  <div className="text-slate-500 font-sans sm:font-mono mt-5">// Response</div>
                  <div>{'{'}</div>
                  <div className="pl-4">
                    <span className="text-[#7dd3fc]">&quot;success&quot;</span>: <span className="text-[#f87171]">true</span>,
                  </div>
                  <div className="pl-4">
                    <span className="text-[#7dd3fc]">&quot;payment_url&quot;</span>: <span className="text-[#34d399]">&quot;https://gateway.tkpaybd.site/pay/v1/p...&quot;</span>
                  </div>
                  <div>{'}'}</div>
                </div>
              </div>

              {/* FAQ Section (exact match to Screenshot 20261030-085343) */}
              <div className="mt-16 sm:mt-20">
                <div className="text-center mb-8 sm:mb-10">
                  <p className="text-xs sm:text-[13px] font-bold tracking-widest uppercase text-[#818cf8] mb-2.5">
                    FAQ
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Frequently Asked Questions
                  </h2>
                </div>

                <div className="space-y-3">
                  {/* FAQ 1: How do I get started? */}
                  <div className="bg-[#0c1424] border border-[#18233c] hover:border-slate-700/80 rounded-2xl overflow-hidden transition-all shadow-sm">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === 0 ? null : 0)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer gap-4"
                    >
                      <span className="text-sm sm:text-base font-semibold text-white">
                        How do I get started?
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                          openFaq === 0 ? 'rotate-180 text-indigo-400' : ''
                        }`}
                      />
                    </button>
                    {openFaq === 0 && (
                      <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                        Create your merchant account, get your API Key, Secret Key, and Merchant ID from the portal, and start integrating with our ready SDKs in minutes.
                      </div>
                    )}
                  </div>

                  {/* FAQ 2: What payment methods are supported? */}
                  <div className="bg-[#0c1424] border border-[#18233c] hover:border-slate-700/80 rounded-2xl overflow-hidden transition-all shadow-sm">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer gap-4"
                    >
                      <span className="text-sm sm:text-base font-semibold text-white">
                        What payment methods are supported?
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                          openFaq === 1 ? 'rotate-180 text-indigo-400' : ''
                        }`}
                      />
                    </button>
                    {openFaq === 1 && (
                      <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                        We natively support bKash (Method 101), Nagad (Method 102), and Rocket (Method 103) for automated PayIn deposits and instant PayOut disbursements.
                      </div>
                    )}
                  </div>

                  {/* FAQ 3: What are the transaction limits? */}
                  <div className="bg-[#0c1424] border border-[#18233c] hover:border-slate-700/80 rounded-2xl overflow-hidden transition-all shadow-sm">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer gap-4"
                    >
                      <span className="text-sm sm:text-base font-semibold text-white">
                        What are the transaction limits?
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                          openFaq === 2 ? 'rotate-180 text-indigo-400' : ''
                        }`}
                      />
                    </button>
                    {openFaq === 2 && (
                      <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                        Transaction limits depend on your merchant account tier. Default limits start from 50 BDT up to 50,000 BDT per transaction, with custom high-volume limits available upon business verification.
                      </div>
                    )}
                  </div>

                  {/* FAQ 4: How are fees charged? */}
                  <div className="bg-[#0c1424] border border-[#18233c] hover:border-slate-700/80 rounded-2xl overflow-hidden transition-all shadow-sm">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer gap-4"
                    >
                      <span className="text-sm sm:text-base font-semibold text-white">
                        How are fees charged?
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                          openFaq === 3 ? 'rotate-180 text-indigo-400' : ''
                        }`}
                      />
                    </button>
                    {openFaq === 3 && (
                      <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                        Transparent transaction fees apply per successful transaction. There are zero hidden setup fees, zero monthly maintenance fees, and no recurring charges.
                      </div>
                    )}
                  </div>

                  {/* FAQ 5: How quickly are payments settled? */}
                  <div className="bg-[#0c1424] border border-[#18233c] hover:border-slate-700/80 rounded-2xl overflow-hidden transition-all shadow-sm">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === 4 ? null : 4)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer gap-4"
                    >
                      <span className="text-sm sm:text-base font-semibold text-white">
                        How quickly are payments settled?
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                          openFaq === 4 ? 'rotate-180 text-indigo-400' : ''
                        }`}
                      />
                    </button>
                    {openFaq === 4 && (
                      <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                        Customer payment verification takes under 3 seconds on average, with automatic merchant balance updates and instant payout capabilities.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* PAYMENT SOLUTIONS: Popular Payment Solutions Section (exact match to Screenshot 20261030-085343) */}
              <div className="mt-16 sm:mt-20">
                <div className="text-center mb-8 sm:mb-10">
                  <p className="text-xs sm:text-[13px] font-bold tracking-widest uppercase text-[#818cf8] mb-2.5">
                    PAYMENT SOLUTIONS
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
                    Popular Payment Solutions
                  </h2>
                  <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
                    Explore our payment gateway solutions for websites and businesses in Bangladesh.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Solution 1: Payment Gateway Bangladesh */}
                  <div className="bg-[#0c1424] border border-[#18233c] hover:border-indigo-500/40 rounded-2xl p-5 sm:p-6 transition-all shadow-sm group">
                    <Link to="/merchant/login.php" className="block">
                      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight underline underline-offset-4 decoration-indigo-400/60 group-hover:decoration-indigo-300 transition">
                        Payment Gateway Bangladesh
                      </h3>
                      <p className="text-indigo-400 text-xs sm:text-sm mt-2 leading-relaxed underline underline-offset-4 decoration-indigo-500/40 group-hover:text-indigo-300 transition">
                        Accept bKash, Nagad and Rocket payments online.
                      </p>
                    </Link>
                  </div>

                  {/* Solution 2: Free Payment Gateway for Website */}
                  <div className="bg-[#0c1424] border border-[#18233c] hover:border-indigo-500/40 rounded-2xl p-5 sm:p-6 transition-all shadow-sm group">
                    <Link to="/merchant/login.php" className="block">
                      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight underline underline-offset-4 decoration-indigo-400/60 group-hover:decoration-indigo-300 transition">
                        Free Payment Gateway for Website
                      </h3>
                      <p className="text-indigo-400 text-xs sm:text-sm mt-2 leading-relaxed underline underline-offset-4 decoration-indigo-500/40 group-hover:text-indigo-300 transition">
                        Start accepting payments without upfront setup cost.
                      </p>
                    </Link>
                  </div>

                  {/* Solution 3: bKash Payment Gateway */}
                  <div className="bg-[#0c1424] border border-[#18233c] hover:border-indigo-500/40 rounded-2xl p-5 sm:p-6 transition-all shadow-sm group">
                    <Link to="/merchant/login.php" className="block">
                      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight underline underline-offset-4 decoration-indigo-400/60 group-hover:decoration-indigo-300 transition">
                        bKash Payment Gateway
                      </h3>
                      <p className="text-indigo-400 text-xs sm:text-sm mt-2 leading-relaxed underline underline-offset-4 decoration-indigo-500/40 group-hover:text-indigo-300 transition">
                        Enable bKash payments on your website.
                      </p>
                    </Link>
                  </div>

                  {/* Solution 4: Nagad Payment Gateway */}
                  <div className="bg-[#0c1424] border border-[#18233c] hover:border-indigo-500/40 rounded-2xl p-5 sm:p-6 transition-all shadow-sm group">
                    <Link to="/merchant/login.php" className="block">
                      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight underline underline-offset-4 decoration-indigo-400/60 group-hover:decoration-indigo-300 transition">
                        Nagad Payment Gateway
                      </h3>
                      <p className="text-indigo-400 text-xs sm:text-sm mt-2 leading-relaxed underline underline-offset-4 decoration-indigo-500/40 group-hover:text-indigo-300 transition">
                        Accept Nagad payments automatically.
                      </p>
                    </Link>
                  </div>

                  {/* Solution 5: Automatic Payment Gateway */}
                  <div className="bg-[#0c1424] border border-[#18233c] hover:border-indigo-500/40 rounded-2xl p-5 sm:p-6 transition-all shadow-sm group">
                    <Link to="/merchant/login.php" className="block">
                      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight underline underline-offset-4 decoration-indigo-400/60 group-hover:decoration-indigo-300 transition">
                        Automatic Payment Gateway
                      </h3>
                      <p className="text-indigo-400 text-xs sm:text-sm mt-2 leading-relaxed underline underline-offset-4 decoration-indigo-500/40 group-hover:text-indigo-300 transition">
                        Auto-verify payments with webhooks.
                      </p>
                    </Link>
                  </div>

                  {/* Solution 6: bKash & Nagad Gateway */}
                  <div className="bg-[#0c1424] border border-[#18233c] hover:border-indigo-500/40 rounded-2xl p-5 sm:p-6 transition-all shadow-sm group">
                    <Link to="/merchant/login.php" className="block">
                      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight underline underline-offset-4 decoration-indigo-400/60 group-hover:decoration-indigo-300 transition">
                        bKash &amp; Nagad Gateway
                      </h3>
                      <p className="text-indigo-400 text-xs sm:text-sm mt-2 leading-relaxed underline underline-offset-4 decoration-indigo-500/40 group-hover:text-indigo-300 transition">
                        Accept dual MFS payments with unified instant webhooks.
                      </p>
                    </Link>
                  </div>

                  {/* Solution 7: Payment Gateway for Website */}
                  <div className="bg-[#0c1424] border border-[#18233c] hover:border-indigo-500/40 rounded-2xl p-5 sm:p-6 transition-all shadow-sm group">
                    <Link to="/merchant/login.php" className="block">
                      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight underline underline-offset-4 decoration-indigo-400/60 group-hover:decoration-indigo-300 transition">
                        Payment Gateway for Website
                      </h3>
                      <p className="text-indigo-400 text-xs sm:text-sm mt-2 leading-relaxed underline underline-offset-4 decoration-indigo-500/40 group-hover:text-indigo-300 transition">
                        Integrate payments into any website.
                      </p>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Contact Section */}
              <div className="mt-20">
                <div className="text-center mb-8">
                  <p className="text-indigo-400 font-semibold tracking-widest text-xs uppercase mb-2">CONTACT</p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Get In Touch</h2>
                  <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-md mx-auto">
                    Ready to integrate or have questions? Our team is available 24/7.
                  </p>
                </div>

                <div className="space-y-4 max-w-xl mx-auto">
                  {/* Telegram Support Card */}
                  <a
                    href="https://t.me/tkpaybd12"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#0c1424] border border-[#18233c] hover:border-indigo-500/40 rounded-2xl p-5 transition-all shadow-sm flex items-center justify-between group block"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.501 1.201-.82 1.23-.697.065-1.226-.46-1.901-.902-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.429-.01-1.255-.243-1.864-.441-.747-.243-1.34-.372-1.288-.785.027-.216.324-.437.892-.664 3.498-1.524 5.831-2.529 7.001-3.014 3.332-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.14.121.099.155.232.166.326.012.095.027.311.015.48z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition">Telegram Support</h3>
                        <p className="text-slate-400 text-xs sm:text-sm mt-0.5 font-mono">@tkpaybd12</p>
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-1 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>Available 24/7</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition" />
                  </a>

                  {/* Official Channel Card */}
                  <a
                    href="https://t.me/tkpaybd12"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#0c1424] border border-[#18233c] hover:border-indigo-500/40 rounded-2xl p-5 transition-all shadow-sm flex items-center justify-between group block"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.501 1.201-.82 1.23-.697.065-1.226-.46-1.901-.902-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.429-.01-1.255-.243-1.864-.441-.747-.243-1.34-.372-1.288-.785.027-.216.324-.437.892-.664 3.498-1.524 5.831-2.529 7.001-3.014 3.332-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.14.121.099.155.232.166.326.012.095.027.311.015.48z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition">Official Channel</h3>
                        <p className="text-slate-400 text-xs sm:text-sm mt-0.5 font-mono">@tkpaybd12</p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                          <span>📢</span>
                          <span>Updates &amp; Announcements</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition" />
                  </a>
                </div>
              </div>

              {/* Get Started Today / Ready to Integrate? (Exact match to screenshot) */}
              <div className="mt-24 text-center max-w-2xl mx-auto px-4">
                <p className="text-indigo-400 font-bold tracking-widest text-xs uppercase mb-3">
                  GET STARTED TODAY
                </p>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
                  Ready to Integrate?
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto">
                  Browse our full API documentation or contact us on Telegram to create your merchant account and start accepting payments today.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-8">
                  <Link
                    to="/merchant/login.php"
                    className="w-full sm:w-auto bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold text-xs sm:text-sm py-3.5 px-6 rounded-2xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View API Docs</span>
                  </Link>

                  <a
                    href="https://t.me/tkpaybd12"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto bg-[#0c1424] hover:bg-[#131f38] text-white font-semibold text-xs sm:text-sm py-3.5 px-6 rounded-2xl border border-[#1e293b] hover:border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    <span>Contact Us</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer (Exact match to screenshot) */}
      <footer className="mt-24 bg-[#04070e] border-t border-slate-900/80 py-10 px-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-1.5 mb-5 group cursor-pointer">
            <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white flex items-center">
              <span>T</span>
              <span className="text-[#eb6a24]">K</span>
              <span className="text-slate-100 font-semibold ml-0.5">pay</span>
              <span className="text-[#10b981] font-bold ml-0.5">BD</span>
            </span>
            <div className="relative flex items-center ml-0.5 text-[#10b981]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                <circle cx="12" cy="20" r="1" fill="currentColor" />
              </svg>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-400 font-medium mb-4">
            <button onClick={() => scrollToSection('features')} className="hover:text-white transition cursor-pointer">
              Features
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition cursor-pointer">
              How It Works
            </button>
            <button onClick={() => scrollToSection('channels')} className="hover:text-white transition cursor-pointer">
              Channels
            </button>
            <Link to="/merchant/login.php" className="hover:text-white transition cursor-pointer">
              API Docs
            </Link>
          </div>

          {/* Telegram Links */}
          <div className="flex items-center justify-center gap-6 text-xs text-slate-400 font-medium mb-5">
            <a
              href="https://t.me/tkpaybd12"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition"
            >
              <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.501 1.201-.82 1.23-.697.065-1.226-.46-1.901-.902-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.429-.01-1.255-.243-1.864-.441-.747-.243-1.34-.372-1.288-.785.027-.216.324-.437.892-.664 3.498-1.524 5.831-2.529 7.001-3.014 3.332-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.14.121.099.155.232.166.326.012.095.027.311.015.48z" />
                </svg>
              </span>
              <span>Channel</span>
            </a>

            <a
              href="https://t.me/tkpaybd12"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition"
            >
              <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.501 1.201-.82 1.23-.697.065-1.226-.46-1.901-.902-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.429-.01-1.255-.243-1.864-.441-.747-.243-1.34-.372-1.288-.785.027-.216.324-.437.892-.664 3.498-1.524 5.831-2.529 7.001-3.014 3.332-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.14.121.099.155.232.166.326.012.095.027.311.015.48z" />
                </svg>
              </span>
              <span>Support</span>
            </a>
          </div>

          {/* Copyright */}
          <p className="text-slate-600 text-xs">
            © 2026 TKPayBD. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
