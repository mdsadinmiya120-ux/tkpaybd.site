import React, { useState } from 'react';
import { Wifi, ShieldAlert, Lock, ShieldCheck } from 'lucide-react';
import { MerchantProfile } from '../types';
import { database } from '../firebase';
import { ref, get } from 'firebase/database';

interface LoginViewProps {
  onLoginSuccess: (customMerchant?: MerchantProfile) => void;
  onNavigateToRegister?: () => void;
  onNavigateToForgot?: () => void;
}

// Master Agent authorized accounts (No demo amounts - real balances start at 0.00)
const defaultPreseededAccounts = [
  {
    merchantId: 'S01926516246',
    name: 'Sadin Master Agent',
    email: 'sadin@tkpaybd.site',
    phone: '01926516246',
    password: 'Sadin120',
    balance: 0.00,
    isAdminAgent: true,
    isPartnerAgent: true,
    isMasterAgent: true,
    partnershipStatus: 'Approved',
    accountType: 'Partnership Agent',
    commissionPayin: 0.00,
    commissionPayout: 0.00,
    createdAt: new Date().toISOString()
  },
  {
    merchantId: 'M20241018',
    name: 'System Master Admin',
    email: 'admin@tkpaybd.site',
    phone: '01700000000',
    password: 'admin123',
    balance: 0.00,
    isAdminAgent: true,
    isPartnerAgent: true,
    isMasterAgent: true,
    partnershipStatus: 'Approved',
    accountType: 'Partnership Agent',
    commissionPayin: 0.00,
    commissionPayout: 0.00,
    createdAt: new Date().toISOString()
  }
];

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
  onNavigateToForgot
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotDialog, setShowForgotDialog] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const cleanIdentifier = identifier.trim();
      const cleanPassword = password.trim();

      if (!cleanIdentifier || !cleanPassword) {
        setLoading(false);
        setError('মার্চেন্ট আইডি/ফোন নম্বর এবং পাসওয়ার্ড প্রদান করুন।');
        return;
      }

      // Helper to match an account by ID, phone, or email
      const isAccountMatch = (m: any, query: string) => {
        if (!m) return false;
        const qLower = query.toLowerCase();
        const mId = String(m.merchantId || '').trim().toLowerCase();
        const mEmail = String(m.email || '').trim().toLowerCase();
        const mPhone = String(m.phone || '').trim();

        if (mId === qLower) return true;
        if (mEmail && mEmail === qLower) return true;
        if (mPhone && mPhone.toLowerCase() === qLower) return true;

        // Clean digits comparison for phone numbers (e.g., 01926516246 vs +8801926516246)
        const qDigits = query.replace(/\D/g, '');
        const mDigits = mPhone.replace(/\D/g, '');
        if (qDigits && mDigits) {
          if (qDigits === mDigits) return true;
          if (qDigits.length >= 10 && mDigits.length >= 10) {
            if (qDigits.endsWith(mDigits) || mDigits.endsWith(qDigits)) return true;
          }
        }
        return false;
      };

      // 1. First check local Master Agent merchant storage
      const savedMerchantsStr = localStorage.getItem('chaopaopay_all_merchants');
      let storedMerchants: any[] = [];
      try {
        if (savedMerchantsStr) storedMerchants = JSON.parse(savedMerchantsStr);
      } catch (e) {}

      // Combine defaults with stored merchants
      const allSearchMerchants: any[] = defaultPreseededAccounts.map(defAcc => {
        const storedMatch = storedMerchants.find(s => isAccountMatch(s, defAcc.merchantId));
        return storedMatch ? { ...defAcc, ...storedMatch } : defAcc;
      });

      storedMerchants.forEach(m => {
        if (m && m.merchantId && !allSearchMerchants.some(a => isAccountMatch(a, m.merchantId))) {
          allSearchMerchants.push(m);
        }
      });

      let match = allSearchMerchants.find(m => isAccountMatch(m, cleanIdentifier));

      // 2. Real-time Firebase Directory Verification
      if (database) {
        try {
          const targetId = match?.merchantId || cleanIdentifier;
          let remoteData: any = null;

          // Check direct key in merchants_directory
          let snap = await get(ref(database, `merchants_directory/${targetId}`));
          if (!snap.exists()) {
            snap = await get(ref(database, `merchants_directory/${targetId.toUpperCase()}`));
          }
          if (snap.exists()) {
            remoteData = snap.val();
          }

          // Check merchants/${targetId}/profile
          let profileSnap = await get(ref(database, `merchants/${targetId}/profile`));
          if (!profileSnap.exists()) {
            profileSnap = await get(ref(database, `merchants/${targetId.toUpperCase()}/profile`));
          }
          if (profileSnap.exists()) {
            remoteData = { ...(remoteData || {}), ...profileSnap.val() };
          }

          // If still not found by direct ID, scan merchants_directory
          if (!remoteData) {
            const allDirSnap = await get(ref(database, 'merchants_directory'));
            if (allDirSnap.exists()) {
              const allMerchants = Object.values(allDirSnap.val()) as any[];
              const fbMatch = allMerchants.find(m => isAccountMatch(m, cleanIdentifier));
              if (fbMatch) {
                remoteData = fbMatch;
              }
            }
          }

          if (remoteData) {
            match = match ? { ...match, ...remoteData } : remoteData;
          }
        } catch (e) {
          console.warn('Firebase directory check warning:', e);
        }
      }

      // HIGH SECURITY CHECK: Account Must Exist
      if (!match || !match.merchantId) {
        setLoading(false);
        setError('⛔ অননুমোদিত অ্যাক্সেস! শুধুমাত্র tkpaybd এজেন্ট যখন অ্যাকাউন্ট খুলে দেবে, কেবল তখনই সেই অথরাইজড অ্যাকাউন্ট দিয়ে লগইন করা সম্ভব। অন্য কোনো অ্যাকাউন্ট দিয়ে প্রবেশ সম্পূর্ণ নিষিদ্ধ। তাই দয়া করে কাস্টমার সার্ভিসের সাথে যোগাযোগ করুন');
        return;
      }

      // HIGH SECURITY CHECK: Must be Master Agent OR Created/Approved by Master Agent
      const isMasterAgent = Boolean(
        match.merchantId === 'S01926516246' ||
        match.merchantId === 'M20241018' ||
        match.phone === '01926516246' ||
        match.phone === '+8801926516246' ||
        match.email === 'sadin@tkpaybd.site' ||
        match.email === 'admin@tkpaybd.site'
      );

      const isAuthorizedByMasterAgent = Boolean(
        isMasterAgent || (
          match.isActive !== false &&
          match.partnershipStatus !== 'Inactive' &&
          match.partnershipStatus !== 'Rejected' &&
          (match.isMasterAgent || match.isPartnerAgent || match.isAdminAgent || match.createdByMasterAgent || match.partnershipStatus === 'Approved' || match.isApproved === true)
        )
      );

      if (!isAuthorizedByMasterAgent) {
        setLoading(false);
        setError('⛔ অননুমোদিত অ্যাক্সেস! শুধুমাত্র tkpaybd এজেন্ট যখন অ্যাকাউন্ট খুলে দেবে, কেবল তখনই সেই অথরাইজড অ্যাকাউন্ট দিয়ে লগইন করা সম্ভব। অন্য কোনো অ্যাকাউন্ট দিয়ে প্রবেশ সম্পূর্ণ নিষিদ্ধ। তাই দয়া করে কাস্টমার সার্ভিসের সাথে যোগাযোগ করুন');
        return;
      }

      // Strict Password Verification
      const accountPassword = match.password !== undefined && match.password !== null && String(match.password).trim() !== ''
        ? String(match.password).trim()
        : (isMasterAgent ? (match.merchantId === 'M20241018' ? 'admin123' : 'Sadin120') : '');

      if (!accountPassword || cleanPassword !== accountPassword) {
        setLoading(false);
        setError('পাসওয়ার্ড ভুল হয়েছে! মাস্টার এজেন্ট কর্তৃক নির্ধারিত সঠিক পাসওয়ার্ড দিয়ে চেষ্টা করুন।');
        return;
      }

      // Cache match in localStorage
      const updatedMerchants = [match, ...storedMerchants.filter(m => m.merchantId !== match.merchantId)];
      try {
        localStorage.setItem('chaopaopay_all_merchants', JSON.stringify(updatedMerchants));
      } catch (e) {}

      // REAL BALANCE ONLY - STRICTLY NO DEMO AMOUNTS (Starts at 0.00 unless explicitly loaded)
      const realBalance = (match.balance !== undefined && match.balance !== null && !isNaN(Number(match.balance))) ? Number(match.balance) : 0.00;
      const rawPayin = match.commissionPayin !== undefined ? match.commissionPayin : (match.payinFeePercent !== undefined ? match.payinFeePercent : (match.commission !== undefined ? match.commission : 0));
      const realPayin = !isNaN(Number(rawPayin)) ? Number(rawPayin) : 0.00;

      const rawPayout = match.commissionPayout !== undefined ? match.commissionPayout : (match.payoutFeePercent !== undefined ? match.payoutFeePercent : 0);
      const realPayout = !isNaN(Number(rawPayout)) ? Number(rawPayout) : 0.00;

      const foundMerchant: MerchantProfile = {
        merchantId: match.merchantId,
        name: match.name || (isMasterAgent ? 'Master Agent' : 'Merchant Agent'),
        email: match.email || `${match.merchantId.toLowerCase()}@tkpaybd.site`,
        phone: match.phone || cleanIdentifier,
        password: accountPassword,
        avatar: isMasterAgent ? '👑' : 'M',
        balance: realBalance,
        totalDeposits: typeof match.totalDeposits === 'number' ? match.totalDeposits : 0.00,
        depositCount: typeof match.depositCount === 'number' ? match.depositCount : 0,
        todayDeposits: typeof match.todayDeposits === 'number' ? match.todayDeposits : 0.00,
        totalWithdrawals: typeof match.totalWithdrawals === 'number' ? match.totalWithdrawals : 0.00,
        withdrawalCount: typeof match.withdrawalCount === 'number' ? match.withdrawalCount : 0,
        todayWithdrawals: typeof match.todayWithdrawals === 'number' ? match.todayWithdrawals : 0.00,
        kycStatus: 'Verified',
        isAdminAgent: isMasterAgent || Boolean(match.isAdminAgent),
        isPartnerAgent: isMasterAgent || Boolean(match.isPartnerAgent),
        partnershipStatus: 'Approved',
        accountType: match.accountType || (isMasterAgent ? 'Partnership Agent' : 'Payment Gateway Use'),
        feeType: match.feeType || (match.accountType === 'Payment Gateway Use' ? 'Charge' : 'Commission'),
        commissionPayin: realPayin,
        commissionPayout: realPayout
      };

      try {
        localStorage.setItem('chaopaopay_merchant', JSON.stringify(foundMerchant));
      } catch (e) {}

      setLoading(false);
      onLoginSuccess(foundMerchant);
    } catch (err: any) {
      console.warn('Login security warning:', err?.message);
      setLoading(false);
      setError('লগইন প্রক্রিয়ায় সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between font-sans text-gray-900">
      {/* Main Container */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:px-6">
        <div className="max-w-[420px] w-full mx-auto space-y-8">
          
          {/* Logo & Header */}
          <div className="text-center space-y-4">
            {/* Logo matching exact style: TK uppercase, T in navy blue #143d6b, K in orange #eb6a24 */}
            <div className="flex items-center justify-center gap-2">
              <span className="font-extrabold text-3xl tracking-tight">
                <span className="text-[#143d6b]">T</span>
                <span className="text-[#eb6a24]">K</span>
                <span className="text-[#1e293b] font-bold ml-0.5">pay</span>
              </span>
                <div className="relative flex items-center">
                  <span className="font-bold text-3xl text-[#10b981] tracking-tight">
                    BD
                  </span>
                  {/* Signal / wifi arcs */}
                  <div className="absolute -top-3.5 -right-5 flex items-end">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                      <circle cx="12" cy="20" r="1" fill="#10b981" />
                    </svg>
                  </div>
                </div>
              </div>

            <div className="space-y-1.5 pt-1">
              <h1 className="text-2xl sm:text-[28px] font-bold text-gray-900 tracking-tight">
                Merchant Login
              </h1>
              <p className="text-sm text-gray-500 font-normal">
                Sign in to access your merchant dashboard
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium flex items-start gap-2.5 shadow-2xs animate-in fade-in">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 tracking-wider uppercase">
                MERCHANT ID OR PHONE
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter Merchant ID (e.g. M2024XXXX) or Phone"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-2xs transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 tracking-wider uppercase">
                PASSWORD
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-2xs transition"
              />
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6366f1] hover:bg-[#5558eb] active:scale-[0.99] text-white font-semibold py-3.5 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 mt-2"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <div className="flex items-center gap-0.5 border border-white/40 rounded px-1 py-0.5 text-xs font-mono">
                    <span>→</span>
                    <span>]</span>
                  </div>
                  <span>Sign In</span>
                </>
              )}
            </button>

            </form>

            {/* Links outside form */}
            <div className="flex items-center justify-between text-sm pt-2 relative z-50">
              <button
                type="button"
                onClick={() => {
                  setShowForgotDialog(true);
                  if (onNavigateToForgot) onNavigateToForgot();
                }}
                className="text-gray-500 hover:text-gray-800 font-normal transition px-3 py-2 -ml-3 cursor-pointer"
              >
                Forgot password?
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = 'https://tkpaybd.site/merchant/login.php';
                }}
                className="text-[#6366f1] hover:text-[#5254cc] font-medium transition px-3 py-2 -mr-3 cursor-pointer"
              >
                Create account
              </button>
            </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="py-5 bg-gray-50/80 border-t border-gray-100 text-center text-xs text-gray-500 font-normal">
        © 2026 TkpayBD. All rights reserved.
      </footer>

      {/* Custom Alert Dialog matching uploaded screenshot */}
      {showForgotDialog && (
        <div 
          className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-6 backdrop-blur-[0.5px]"
          onClick={() => setShowForgotDialog(false)}
        >
          <div 
            className="bg-white rounded-[28px] p-6 sm:p-7 max-w-[360px] w-full shadow-2xl transition-all select-none animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-normal text-gray-900 mb-4 tracking-tight">
              TkpayBD says
            </h3>
            <p className="text-gray-700 text-sm sm:text-[15px] leading-relaxed mb-6">
              Please contact admin to reset your password
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotDialog(false)}
                className="px-4 py-1.5 text-blue-600 hover:text-blue-700 font-semibold text-sm sm:text-base tracking-wide rounded-lg hover:bg-blue-50/60 transition cursor-pointer active:scale-95"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
