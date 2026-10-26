import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import RealMerchantApp from '../merchant/src/App';

const DemoPortal = () => {
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-[#0f172a] border border-slate-800 p-8 rounded-[32px] shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center space-y-3 mb-8">
           <span className="text-3xl font-black tracking-tighter italic">
             <span className="text-white">T</span><span className="text-[#eb6a24]">K</span>pay<span className="text-emerald-500 ml-0.5">BD</span>
           </span>
           <h2 className="text-xl font-bold text-white">Merchant Login (Demo)</h2>
           <p className="text-sm text-slate-400">Experience our dashboard in a risk-free environment.</p>
        </div>

        <form className="space-y-5">
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Username</label>
            <input type="text" className="w-full bg-[#020617] border border-slate-800 rounded-2xl px-5 py-3.5 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="demo_user" />
          </div>
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
            <input type="password" title="password" className="w-full bg-[#020617] border border-slate-800 rounded-2xl px-5 py-3.5 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="••••••••" />
          </div>
          <button className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
            Login to Sandbox
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <Link to="/" className="text-xs text-slate-500 hover:text-white transition">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

import { BookOpen, FileText, ChevronDown, Rocket, Smartphone, ShieldCheck, Zap } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans antialiased selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="flex items-center gap-2.5">
             <span className="text-xl sm:text-2xl font-black tracking-tighter italic">
               <span className="text-white">T</span><span className="text-[#eb6a24]">K</span>pay<span className="text-emerald-500 ml-0.5">BD</span>
             </span>
             <div className="flex flex-col gap-0.5 mt-1">
               <div className="w-4 sm:w-5 h-0.5 bg-[#10b981] rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
               <div className="w-2.5 sm:w-3 h-0.5 bg-[#10b981]/60 rounded-full ml-1"></div>
             </div>
           </div>
        </div>
        <Link to="/demo" className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
          <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span>API Docs</span>
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-16 sm:pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[10px] sm:text-[11px] font-semibold text-slate-300 mb-6 sm:mb-8 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
          Trusted Payment Infrastructure · BD
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4 sm:mb-6 leading-[1.1] sm:leading-[1.15] md:leading-[1.1]">
          Fast & Secure <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">Payment Gateway</span> <br className="hidden sm:block" />
          for Your Business
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
          TKPayBD provides a powerful automatic payment gateway solution — enabling businesses to accept and send payments through bKash, Nagad and Rocket with a simple API integration.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 sm:mb-16">
          <Link to="/demo" className="w-full sm:w-auto bg-[#4f46e5] hover:bg-[#4338ca] text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] shadow-xl shadow-indigo-500/25 active:scale-98 text-sm sm:text-base">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" /> View API Documentation
          </Link>
          <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl border border-slate-800 bg-slate-900/30 hover:bg-slate-900 text-slate-300 font-bold flex items-center justify-center gap-2 transition backdrop-blur-xs text-sm sm:text-base">
            How It Works <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Supported Channels */}
        <div className="space-y-4 sm:space-y-6">
          <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-[0.25em]">Supported Channels</p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
             <div className="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#D12053]/10 border border-[#D12053]/20 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 transition-all duration-300 group cursor-pointer hover:bg-[#D12053]/20 hover:border-[#D12053]/40">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[#D12053] flex items-center justify-center text-white font-black italic text-xs sm:text-base shadow-lg shadow-[#D12053]/20">b</div>
                <span className="font-bold text-slate-200 group-hover:text-white transition text-xs sm:text-sm">bKash</span>
             </div>
             <div className="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#F7941D]/10 border border-[#F7941D]/20 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 transition-all duration-300 group cursor-pointer hover:bg-[#F7941D]/20 hover:border-[#F7941D]/40">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[#F7941D] flex items-center justify-center text-white font-black italic text-[10px] sm:text-sm shadow-lg shadow-[#F7941D]/20">N</div>
                <span className="font-bold text-slate-200 group-hover:text-white transition text-xs sm:text-sm">Nagad</span>
             </div>
             <div className="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#8C3494]/10 border border-[#8C3494]/20 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 transition-all duration-300 group cursor-pointer hover:bg-[#8C3494]/20 hover:border-[#8C3494]/40">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[#8C3494] flex items-center justify-center text-white font-black italic text-[8px] sm:text-xs shadow-lg shadow-[#8C3494]/20">R</div>
                <span className="font-bold text-slate-200 group-hover:text-white transition text-xs sm:text-sm">Rocket</span>
             </div>
          </div>
        </div>
      </main>

      {/* Why Choose Us Section Preview */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
        <div className="text-left border-t border-slate-900 pt-10 sm:pt-16">
          <p className="text-xs sm:text-sm font-bold text-indigo-400 uppercase tracking-widest mb-3 sm:mb-4">Why Choose Us</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4 sm:mb-6 tracking-tight">Built for Developers & Businesses</h2>
          <p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl leading-relaxed mb-8 sm:mb-10">
            Everything you need to process payments reliably — from a clean API to real-time callbacks and a comprehensive merchant dashboard.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="space-y-3 sm:space-y-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-bold text-base sm:text-lg">Instant Callbacks</h3>
              <p className="text-xs sm:text-sm text-slate-500">Real-time webhooks ensure your system is notified the moment a payment is confirmed.</p>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-bold text-base sm:text-lg">Enterprise Security</h3>
              <p className="text-xs sm:text-sm text-slate-500">Military-grade encryption and IP whitelisting to keep your transactions and data safe.</p>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                <Rocket className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-bold text-base sm:text-lg">Easy Integration</h3>
              <p className="text-xs sm:text-sm text-slate-500">Documentation and SDKs designed to get you live in under an hour.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-500 text-[11px] sm:text-sm">
        <p>© 2026 TKPayBD. All rights reserved.</p>
        <div className="flex items-center gap-4 sm:gap-8 font-medium">
          <a href="#" className="hover:text-white transition">Terms of Service</a>
          <a href="#" className="hover:text-white transition">Privacy Policy</a>
          <a href="https://t.me/tkpaybd12" target="_blank" className="hover:text-white transition">Support</a>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/merchant/login" element={<RealMerchantApp />} />
        <Route path="/merchant/login.php" element={<RealMerchantApp />} />
        <Route path="/demo" element={<DemoPortal />} />
      </Routes>
    </BrowserRouter>
  );
}
