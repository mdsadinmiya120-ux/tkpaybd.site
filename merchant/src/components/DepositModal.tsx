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
  Shuffle,
  Wallet
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
  const [randomSeed, setRandomSeed] = useState(0);

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

  // Random wallet chosen for this deposit session
  const currentWallet = useMemo(() => {
    if (activeForMethod.length === 0) return null;
    if (activeForMethod.length === 1) return activeForMethod[0];
    const idx = Math.floor(Math.random() * activeForMethod.length);
    return activeForMethod[idx];
  }, [activeForMethod, randomSeed]);
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
    return `৳${val.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} BDT`;
  };

  const handleQuickSelect = (val: number) => {
    setAmount(val.toString());
    setErrorMsg('');
  };

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 100 || numAmount > 50000) {
      setErrorMsg('Amount must be between ৳100 and ৳50,000');
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
        charge: numAmount * ((commissionPayin ?? 1.5) / 100),
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
    <div className="max-w-xl mx-auto space-y-5 pb-16">
      {/* 1. TOP SUMMARY CARD */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 grid grid-cols-3 gap-2 text-center">
        <div className="p-2 border-r border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Available Balance</p>
          <p className="text-sm sm:text-base font-extrabold text-emerald-600 truncate">{formatBDT(currentBalance)}</p>
        </div>
        <div className="p-2 border-r border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">On Hold</p>
          <p className="text-sm sm:text-base font-extrabold text-amber-500 truncate">{formatBDT(onHoldAmount)}</p>
        </div>
        <div className="p-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pending Deposits</p>
          <p className="text-lg sm:text-xl font-extrabold text-amber-500">{pendingCount}</p>
        </div>
      </div>

      {successResult ? (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 space-y-4">
          <div className="flex items-center gap-3 text-emerald-600">
            <CheckCircle2 className="w-8 h-8 shrink-0" />
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Deposit Created</h3>
              <p className="text-xs text-gray-500">Transaction ID: {successResult.id}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Amount:</span>
              <span className="font-bold text-gray-900">{formatBDT(successResult.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status:</span>
              <span className="font-semibold text-amber-600">Pending</span>
            </div>
          </div>

          {successResult.link && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Payment Link</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={successResult.link}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-600 select-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleCopyLink(successResult.link!)}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition flex items-center gap-1 shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button 
              type="button"
              onClick={() => onOpenCheckout(successResult.id, successResult.amount, method, merchantId)}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>পেমেন্ট পেজে যান (Open Checkout)</span>
            </button>
            <button 
              type="button"
              onClick={() => setSuccessResult(null)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-xs transition"
            >
              Create Another Deposit
            </button>
            <button 
              type="button"
              onClick={onSuccessReturn}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-xs transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      ) : (
        /* 2. MAIN DEPOSIT CARD (Original Clean Design) */
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-5">
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-gray-900 text-lg">Add Deposit</h3>
              <p className="text-xs text-gray-500">Top-up your account balance or accept customer payments</p>
            </div>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ArrowDownLeft className="w-5 h-5" />
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleProceed} className="space-y-4">
            {/* Method Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-2.5">
                {(['bKash', 'Nagad', 'Rocket'] as const).map((m) => {
                  const isActive = method === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMethod(m)}
                      className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                        isActive 
                          ? 'bg-indigo-50/70 border-indigo-600 ring-1 ring-indigo-600 shadow-2xs' 
                          : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                        {m === 'bKash' ? (
                          <img src={BKASH_LOGO_URL} alt="bKash" className="w-full h-full object-contain" />
                        ) : m === 'Nagad' ? (
                          <img src={NAGAD_LOGO_URL} alt="Nagad" className="w-7 h-7 object-contain" />
                        ) : (
                          <img src={ROCKET_LOGO_URL} alt="Rocket" className="w-full h-full object-contain" />
                        )}
                      </div>
                      <span className={`font-bold text-xs ${isActive ? 'text-indigo-900' : 'text-gray-800'}`}>{m}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Numbers Info for Selected Method (Strict Per-Merchant Isolation) */}
              <div className="mt-3 p-3 bg-gray-50/90 rounded-xl border border-gray-100 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="text-gray-600 font-medium text-[11px] sm:text-xs">
                      {method} ওয়ালেট: <strong className="text-gray-900">{activeForMethod.length > 0 ? `${activeForMethod.length}টি সক্রিয় নম্বর` : 'কোনো নম্বর অ্যাসাইন করা নেই'}</strong>
                    </span>
                  </div>
                  {activeForMethod.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setRandomSeed(s => s + 1)}
                      className="text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md border border-indigo-200 flex items-center gap-1 cursor-pointer transition active:scale-95"
                      title="র‍্যান্ডম রোটেশন পরিবর্তন করুন"
                    >
                      <Shuffle className="w-3 h-3 text-indigo-600 animate-pulse" />
                      <span>র‍্যান্ডম পরিবর্তন</span>
                    </button>
                  )}
                </div>

                {activeForMethod.length > 1 ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-1.5 border-t border-gray-200/70">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">বাছাইকৃত ওয়ালেট:</span>
                      <span className="font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200 text-xs shadow-2xs">
                        {currentWallet?.number}
                      </span>
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                        {currentWallet?.label || 'Personal'}
                      </span>
                    </div>
                    <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-1">
                      <span>• {activeForMethod.length}টি নম্বরের মধ্যে স্বয়ংক্রিয় রেনডম রোটেশন</span>
                    </span>
                  </div>
                ) : activeForMethod.length === 1 ? (
                  <div className="flex items-center justify-between pt-1.5 border-t border-gray-200/70">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">নির্ধারিত ওয়ালেট নম্বর:</span>
                    <span className="text-xs font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-2xs">
                      {activeForMethod[0].number} ({activeForMethod[0].label || 'Personal'})
                    </span>
                  </div>
                ) : (
                  <div className="pt-1.5 border-t border-gray-200/70 text-[11px] text-amber-700 bg-amber-50/80 p-2 rounded-lg flex items-center justify-between">
                    <span>⚠️ মার্চেন্ট আইডিতে ({merchantId}) কোনো {method} নম্বর যোগ করা নেই।</span>
                    {onNavigateToSettings && (
                      <button
                        type="button"
                        onClick={onNavigateToSettings}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer shrink-0 ml-2"
                      >
                        + নম্বর যোগ করুন
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Amount Selection */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-700">Amount (BDT)</label>
                <span className="text-[11px] text-gray-400">Min ৳100 – Max ৳50,000</span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-400 font-bold">৳</span>
                <input
                  type="number"
                  min="100"
                  max="50000"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white"
                  placeholder="500"
                />
              </div>

              {/* Quick Select Chips */}
              <div className="grid grid-cols-5 gap-1.5 mt-2 text-xs">
                {[500, 1000, 2000, 5000, 10000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickSelect(val)}
                    className={`py-1.5 rounded-xl border text-center font-semibold transition cursor-pointer ${
                      parseInt(amount) === val
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    ৳{val.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Link Toggle */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 text-xs">Generate Link</p>
                <p className="text-[11px] text-gray-500">Get a shareable payment URL for users/customers</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={generateLink} 
                  onChange={(e) => setGenerateLink(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Proceed to Payment Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 text-xs cursor-pointer"
              >
                {loading ? 'Generating Payment Link...' : '💳 Proceed to Payment'}
              </button>
              <p className="text-[11px] text-center text-gray-400 mt-2">
                Users and customers can use the generated link to pay via {method}
              </p>
            </div>
          </form>
        </div>
      )}

      {/* 3. HOW IT WORKS CARD */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-600" /> How It Works for Users
        </h3>
        <div className="space-y-2.5 text-xs text-gray-600">
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
            <p>Turn on <strong>Generate Link</strong> and click Proceed to Payment</p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
            <p>Copy and <strong>share the payment link</strong> with your users/customers</p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
            <p>Users open the link on mobile or desktop and pay via <strong>bKash / Nagad / Rocket</strong></p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[10px]">4</span>
            <p>Balance is <strong>credited automatically</strong> to your dashboard upon success</p>
          </div>
        </div>
      </div>

      {/* 4. RECENT DEPOSITS TABLE */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 text-base mb-4">Recent Deposits</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Deposit ID</th>
                <th className="pb-3 font-semibold">Method</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {payinTransactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">
                    No recent deposits found.
                  </td>
                </tr>
              ) : (
                payinTransactions.map((tx) => (
                  <tr 
                    key={tx.id} 
                    onClick={() => onSelectTransaction(tx)}
                    className="hover:bg-gray-50/80 cursor-pointer transition"
                  >
                    <td className="py-3 font-mono font-medium text-gray-800">
                      {tx.transactionId}
                    </td>
                    <td className="py-3 font-semibold text-gray-700 uppercase">
                      {tx.method}
                    </td>
                    <td className="py-3 font-bold text-gray-900">
                      {formatBDT(tx.amount)}
                    </td>
                    <td className="py-3 text-right">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
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
