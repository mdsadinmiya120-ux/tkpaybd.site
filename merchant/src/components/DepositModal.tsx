import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowDownLeft, 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle, 
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Transaction, DepositWalletNumber } from '../types';
import { BKASH_LOGO_URL, ROCKET_LOGO_URL, NAGAD_LOGO_URL } from '../constants/logos';
import { getValidRandomWalletNumber, getMerchantDepositNumbers } from '../utils/wallet';

interface DepositModalProps {
  merchantId: string;
  currentBalance: number;
  commissionPayin: number;
  transactions: Transaction[];
  onAddTransaction: (tx: Transaction) => void;
  onSuccessReturn: () => void;
  onSelectTransaction: (tx: Transaction) => void;
  onOpenCheckout: (txId: string, amount: number, method: 'bKash' | 'Nagad' | 'Rocket', merchantId?: string) => void;
  onNavigateToSettings?: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ 
  merchantId,
  currentBalance, 
  commissionPayin, 
  transactions, 
  onAddTransaction, 
  onSuccessReturn,
  onSelectTransaction,
  onOpenCheckout,
  onNavigateToSettings
}) => {
  const [amount, setAmount] = useState('500');
  const [method, setMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [generateLink, setGenerateLink] = useState(false);
  const [merchantNumbers, setMerchantNumbers] = useState(() => getMerchantDepositNumbers(merchantId));

  useEffect(() => {
    const refresh = () => setMerchantNumbers(getMerchantDepositNumbers(merchantId));
    refresh();
    window.addEventListener('depositNumbersUpdated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('depositNumbersUpdated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [merchantId]);

  // Active numbers strictly for this merchant and selected method
  const activeForMethod = useMemo(() => {
    return merchantNumbers.filter((n: DepositWalletNumber) => n.method === method && n.isActive !== false);
  }, [merchantNumbers, method]);

  // Random wallet chosen behind the scenes (invisible to regular users as requested)
  const currentWallet = useMemo(() => {
    if (activeForMethod.length === 0) return null;
    if (activeForMethod.length === 1) return activeForMethod[0];
    const idx = Math.floor(Math.random() * activeForMethod.length);
    return activeForMethod[idx];
  }, [activeForMethod, method]);

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState<{ id: string; amount: number; link?: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const payinTransactions = transactions.filter(t => t.type === 'Payin');
  const pendingCount = payinTransactions.filter(t => t.status === 'Pending').length;
  const onHoldAmount = payinTransactions
    .filter(t => t.status === 'Pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const formatBDT = (val: number) => {
    return `৳${val.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleQuickSelect = (val: number) => {
    setAmount(val.toString());
    setErrorMsg('');
  };

  const numAmount = parseFloat(amount) || 0;
  const commissionRate = Number(commissionPayin ?? 0);
  const commissionEarned = (numAmount * commissionRate) / 100;

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!numAmount || numAmount < 100 || numAmount > 50000) {
      setErrorMsg('ডিপোজিটের পরিমাণ সর্বনিম্ন ৳১০০ এবং সর্বোচ্চ ৳৫০,০০০ হতে হবে');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const randomId = 'DEP' + new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14) + Math.random().toString(36).substring(2, 6).toUpperCase();
      const newTx: Transaction = {
        id: 'tx_' + Date.now(),
        transactionId: randomId,
        merchantId: merchantId,
        type: 'Payin',
        amount: numAmount,
        currency: 'BDT',
        status: 'Pending',
        method,
        customerPhone: '123455',
        customerName: 'Merchant Deposit',
        createdAt: new Date().toISOString(),
        charge: commissionEarned,
        walletNumber: currentWallet ? currentWallet.number : getValidRandomWalletNumber(method, merchantId),
      };

      onAddTransaction(newTx);
      setLoading(false);

      if (generateLink) {
        const originUrl = window.location.origin || 'https://tkpaybd.site';
        const targetPath = window.location.pathname || '/merchant/login.php';
        setSuccessResult({
          id: randomId,
          amount: numAmount,
          link: `${originUrl}${targetPath}?pay=${randomId}&m=${encodeURIComponent(merchantId)}`
        });
      } else {
        // Directly open the cashier screen
        onOpenCheckout(randomId, numAmount, method, merchantId);
      }
    }, 600);
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-16">
      {/* 1. TOP STATS BAR */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 grid grid-cols-3 gap-2 sm:gap-4 text-center">
        <div className="p-2 sm:p-3 border-r border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">বর্তমান ব্যালেন্স</p>
          <p className="text-sm sm:text-lg font-extrabold text-emerald-600 truncate">{formatBDT(currentBalance)}</p>
        </div>
        <div className="p-2 sm:p-3 border-r border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">অন-হোল্ড ব্যালেন্স</p>
          <p className="text-sm sm:text-lg font-extrabold text-amber-500 truncate">{formatBDT(onHoldAmount)}</p>
        </div>
        <div className="p-2 sm:p-3">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">অপেক্ষমান ডিপোজিট</p>
          <p className="text-base sm:text-xl font-extrabold text-amber-500">{pendingCount}</p>
        </div>
      </div>

      {successResult ? (
        /* SUCCESS / GENERATED LINK VIEW */
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-emerald-100 space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3 text-emerald-600">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-lg">ডিপোজিট সফলভাবে তৈরি হয়েছে</h3>
                <p className="text-xs text-gray-500 font-mono">ট্রানজেকশন আইডি: {successResult.id}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onSuccessReturn}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-emerald-50/40 p-4 rounded-2xl border border-gray-100 space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-gray-200/50">
              <span className="text-gray-500">টাকার পরিমাণ:</span>
              <span className="font-extrabold text-gray-900 text-sm">{formatBDT(successResult.amount)}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-200/50">
              <span className="text-gray-500">পেমেন্ট মেথড:</span>
              <span className="font-bold text-gray-800 uppercase">{method}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-500">বর্তমান স্ট্যাটাস:</span>
              <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                Pending (যাচাই অপেক্ষমান)
              </span>
            </div>
          </div>

          {successResult.link && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700">শেয়ারযোগ্য পেমেন্ট লিংক</label>
                <span className="text-[11px] text-gray-400">এই লিংকে গ্রাহকরা সরাসরি পে করতে পারবে</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={successResult.link}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-700 select-all font-mono focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleCopyLink(successResult.link!)}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer active:scale-95"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons with Clear Cancel Option */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button 
              type="button"
              onClick={() => onOpenCheckout(successResult.id, successResult.amount, method, merchantId)}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>পেমেন্ট পেজে যান (Open Cashier)</span>
            </button>
            <button 
              type="button"
              onClick={() => setSuccessResult(null)}
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              নতুন ডিপোজিট
            </button>
            <button 
              type="button"
              onClick={onSuccessReturn}
              className="px-4 py-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>বাতিল / ড্যাশবোর্ডে ফিরুন</span>
            </button>
          </div>
        </div>
      ) : (
        /* 2. MAIN DEPOSIT CARD */
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-gray-100 space-y-6">
          {/* Card Header with Title and explicit Cancel (বাতিল) button */}
          <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-base sm:text-lg">অ্যাকাউন্টে ডিপোজিট করুন</h3>
                <p className="text-xs text-gray-500">bKash, Nagad অথবা Rocket দিয়ে ব্যালেন্স টপ-আপ করুন</p>
              </div>
            </div>

            {/* Header Cancel Button */}
            <button
              type="button"
              onClick={onSuccessReturn}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95"
              title="ডিপোজিট বাতিল করে ড্যাশবোর্ডে ফিরে যান"
            >
              <X className="w-3.5 h-3.5 text-gray-500" />
              <span>বাতিল (Cancel)</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleProceed} className="space-y-5">
            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-2.5">
                ১. পেমেন্ট মেথড নির্বাচন করুন (Select Method)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['bKash', 'Nagad', 'Rocket'] as const).map((m) => {
                  const isActive = method === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMethod(m)}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 cursor-pointer relative overflow-hidden ${
                        isActive 
                          ? m === 'bKash' 
                            ? 'bg-pink-50/70 border-[#E2136E] ring-2 ring-[#E2136E]/30 shadow-xs'
                            : m === 'Nagad'
                            ? 'bg-orange-50/70 border-[#F7941D] ring-2 ring-[#F7941D]/30 shadow-xs'
                            : 'bg-purple-50/70 border-[#8C3494] ring-2 ring-[#8C3494]/30 shadow-xs'
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/60 text-gray-700 shadow-2xs'
                      }`}
                    >
                      {isActive && (
                        <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                          m === 'bKash' ? 'bg-[#E2136E]' : m === 'Nagad' ? 'bg-[#F7941D]' : 'bg-[#8C3494]'
                        }`}></span>
                      )}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                        {m === 'bKash' ? (
                          <img src={BKASH_LOGO_URL} alt="bKash" className="w-full h-full object-contain" />
                        ) : m === 'Nagad' ? (
                          <img src={NAGAD_LOGO_URL} alt="Nagad" className="w-8 h-8 object-contain" />
                        ) : (
                          <img src={ROCKET_LOGO_URL} alt="Rocket" className="w-full h-full object-contain" />
                        )}
                      </div>
                      <span className={`font-black text-xs ${
                        isActive 
                          ? m === 'bKash' ? 'text-[#E2136E]' : m === 'Nagad' ? 'text-[#ea580c]' : 'text-[#8C3494]'
                          : 'text-gray-800'
                      }`}>
                        {m}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Friendly notification if merchant has no numbers configured for this method */}
              {activeForMethod.length === 0 && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                  <span>⚠️ এই মেথডের জন্য কোনো সক্রিয় নম্বর সেট করা নেই।</span>
                  {onNavigateToSettings && (
                    <button
                      type="button"
                      onClick={onNavigateToSettings}
                      className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer ml-2 shrink-0"
                    >
                      + নম্বর যোগ করুন
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Amount Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-gray-800">
                  ২. জমার পরিমাণ লিখুন (Amount in BDT)
                </label>
                <span className="text-[11px] font-medium text-gray-400">সর্বনিম্ন ৳১০০ – সর্বোচ্চ ৳৫০,০০০</span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-3 text-lg font-black text-gray-400">৳</span>
                <input
                  type="number"
                  min="100"
                  max="50000"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full border-2 border-gray-200 hover:border-gray-300 focus:border-indigo-600 rounded-2xl pl-10 pr-4 py-3 text-base font-extrabold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white transition"
                  placeholder="500"
                />
              </div>

              {/* Quick Select Chips */}
              <div className="grid grid-cols-6 gap-1.5 mt-2.5 text-xs">
                {[500, 1000, 2000, 5000, 10000, 20000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickSelect(val)}
                    className={`py-2 rounded-xl border text-center font-bold text-[11px] transition cursor-pointer active:scale-95 ${
                      parseInt(amount) === val
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                    }`}
                  >
                    ৳{val.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Commission Reward Box */}
              {numAmount > 0 && (
                <div className="mt-3 p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50 border border-emerald-200/90 rounded-2xl flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center text-lg shrink-0">
                      🎁
                    </div>
                    <div>
                      <p className="text-xs sm:text-[13px] font-black text-emerald-950">
                        আপনি {formatBDT(commissionEarned)} কমিশন পাবেন
                      </p>
                      <p className="text-[11px] text-emerald-700 font-medium">
                        {commissionRate > 0 
                          ? `কমিশন রেট: ${commissionRate}% (ডিপোজিট সফল হলে জমা হবে)` 
                          : 'ডিপোজিটের সম্পূর্ণ টাকা আপনার ব্যালেন্সে যোগ হবে'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-black shadow-2xs font-mono">
                      +{formatBDT(commissionEarned)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Generate Link Toggle */}
            <div className="p-3.5 bg-gray-50/90 rounded-2xl border border-gray-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900 text-xs">শেয়ারযোগ্য পেমেন্ট লিংক তৈরি করুন (Generate Link)</p>
                <p className="text-[11px] text-gray-500">গ্রাহকদের পাঠানোর জন্য একটি নির্দিষ্ট পেমেন্ট লিংক পাবেন</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                <input 
                  type="checkbox" 
                  checked={generateLink} 
                  onChange={(e) => setGenerateLink(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Dual Action Buttons: Proceed and Cancel */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 text-xs sm:text-sm cursor-pointer active:scale-98"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    প্রসেস করা হচ্ছে...
                  </span>
                ) : (
                  <>
                    <span>💳 পেমেন্টে এগিয়ে যান (Proceed)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Clear Cancel Button */}
              <button
                type="button"
                onClick={onSuccessReturn}
                className="sm:w-36 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 border border-gray-200 hover:border-red-200 font-bold py-3.5 px-4 rounded-2xl transition flex items-center justify-center gap-1.5 text-xs sm:text-sm cursor-pointer active:scale-95"
              >
                <X className="w-4 h-4" />
                <span>বাতিল (Cancel)</span>
              </button>
            </div>

            <p className="text-[11px] text-center text-gray-400">
              নিরাপদ পেমেন্ট প্রসেসিং • ইনস্ট্যান্ট ব্যালেন্স আপডেট
            </p>
          </form>
        </div>
      )}

      {/* 3. HOW IT WORKS CARD */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 space-y-3.5">
        <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-600" /> ডিপোজিট যেভাবে কাজ করে
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600">
          <div className="p-3 bg-gray-50/70 rounded-2xl border border-gray-100 flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-xl bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center shrink-0 text-xs">১</span>
            <div>
              <p className="font-bold text-gray-900">মেথড ও পরিমাণ নির্বাচন</p>
              <p className="text-[11px] text-gray-500 mt-0.5">bKash, Nagad বা Rocket সিলেক্ট করে টাকার অংক দিন।</p>
            </div>
          </div>
          <div className="p-3 bg-gray-50/70 rounded-2xl border border-gray-100 flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-xl bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center shrink-0 text-xs">২</span>
            <div>
              <p className="font-bold text-gray-900">ক্যাশআউট / সেন্ড মানি</p>
              <p className="text-[11px] text-gray-500 mt-0.5">প্রদর্শিত নির্দিষ্ট নম্বরে সঠিক পরিমাণ টাকা পাঠান।</p>
            </div>
          </div>
          <div className="p-3 bg-gray-50/70 rounded-2xl border border-gray-100 flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-xl bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center shrink-0 text-xs">৩</span>
            <div>
              <p className="font-bold text-gray-900">TrxID সাবমিট করুন</p>
              <p className="text-[11px] text-gray-500 mt-0.5">পেমেন্ট শেষে পাওয়া TrxID বক্সে লিখে নিশ্চিত করুন।</p>
            </div>
          </div>
          <div className="p-3 bg-gray-50/70 rounded-2xl border border-gray-100 flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-xl bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center shrink-0 text-xs">৪</span>
            <div>
              <p className="font-bold text-emerald-900">স্বয়ংক্রিয় ব্যালেন্স যোগ</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">যাচাইয়ের পর মুহূর্তেই আপনার একাউন্টে ব্যালেন্স যুক্ত হবে।</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. RECENT DEPOSITS TABLE */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">সাম্প্রতিক ডিপোজিট তালিকা</h3>
          <span className="text-[11px] text-gray-400 font-semibold">{payinTransactions.length}টি লেনদেন</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">ট্রানজেকশন আইডি</th>
                <th className="pb-3 font-semibold">মেথড</th>
                <th className="pb-3 font-semibold">পরিমাণ</th>
                <th className="pb-3 font-semibold text-right">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {payinTransactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">
                    এখনও কোনো ডিপোজিট সম্পন্ন হয়নি।
                  </td>
                </tr>
              ) : (
                payinTransactions.slice(0, 10).map((tx) => (
                  <tr 
                    key={tx.id} 
                    onClick={() => onSelectTransaction(tx)}
                    className="hover:bg-gray-50/80 cursor-pointer transition"
                  >
                    <td className="py-3 font-mono font-bold text-gray-800">
                      {tx.transactionId}
                    </td>
                    <td className="py-3 font-bold text-gray-700 uppercase">
                      {tx.method}
                    </td>
                    <td className="py-3 font-extrabold text-gray-900">
                      {formatBDT(tx.amount)}
                    </td>
                    <td className="py-3 text-right">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        tx.status === 'Success' ? 'bg-emerald-100 text-emerald-800' :
                        tx.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
