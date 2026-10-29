import React from 'react';
import { ArrowRight, ShieldCheck, Zap, Globe, MessageSquare, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tight">
                <span className="text-[#143d6b]">T</span><span className="text-[#eb6a24]">K</span><span className="text-[#1e293b] font-semibold ml-0.5">pay</span><span className="text-[#10b981] font-bold ml-0.5">BD</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                to="/merchant/login.php" 
                className="text-sm font-bold text-gray-600 hover:text-gray-900 px-4 py-2 transition"
              >
                Sign In
              </Link>
              <Link 
                to="/merchant/login.php" 
                className="bg-[#6366f1] text-white text-sm font-bold px-6 py-2.5 rounded-2xl shadow-lg shadow-indigo-100 hover:bg-[#5558eb] transition"
              >
                Merchant Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#10b981] text-[10px] font-bold uppercase tracking-wider mb-6 border border-emerald-100 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
            Advanced Payment Solutions for Bangladesh
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-[#1e293b] tracking-tight leading-[1.1] mb-6">
            Grow Your Business with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#4f46e5]">TKPayBD Gateway</span>
          </h1>
          <p className="text-base text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed font-medium">
            Join thousands of merchants using our automated payment gateway for bKash, Nagad, and Rocket. Fast, secure, and reliable.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/merchant/login.php" 
              className="w-full sm:w-auto bg-[#1e293b] text-white font-bold py-4 px-10 rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 group"
            >
              Get Started Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-[#f8fafc] border border-gray-100 space-y-4">
              <div className="w-12 h-12 bg-indigo-50 text-[#6366f1] rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1e293b]">Safe & Secure</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Enterprise-grade security with multi-layer encryption to protect your merchant data.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-[#f8fafc] border border-gray-100 space-y-4">
              <div className="w-12 h-12 bg-emerald-50 text-[#10b981] rounded-2xl flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1e293b]">Instant Activation</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Start accepting payments within minutes with our streamlined onboarding process.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-[#f8fafc] border border-gray-100 space-y-4">
              <div className="w-12 h-12 bg-orange-50 text-[#eb6a24] rounded-2xl flex items-center justify-center">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1e293b]">MFS Integration</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Full support for bKash, Nagad, Rocket, and Rocket for seamless transactions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="font-extrabold text-xl tracking-tight">
              <span className="text-[#143d6b]">T</span><span className="text-[#eb6a24]">K</span><span className="text-[#1e293b] font-semibold ml-0.5">pay</span><span className="text-[#10b981] font-bold ml-0.5">BD</span>
            </span>
          </div>
          <p className="text-gray-400 text-xs font-bold mb-8">© 2026 TKPayBD. All rights reserved.</p>
          <div className="flex justify-center gap-6">
            <a href="https://t.me/tkpaybd12" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-600 transition">
              <MessageSquare className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
