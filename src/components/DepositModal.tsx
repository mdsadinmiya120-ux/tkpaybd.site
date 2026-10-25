import React, { useState } from 'react';
import { 
  ArrowDownLeft, 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle, 
  Copy,
  Check,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { Transaction } from '../types';
import { BKASH_LOGO_URL, ROCKET_LOGO_URL, NAGAD_LOGO_URL } from '../constants/logos';
import { getValidRandomWalletNumber } from '../utils/wallet';

interface DepositModalProps {
  merchantId: string;
  currentBalance: number;
  commissionPayin: number;
  transactions: Transaction[];
  onAddTransaction: (tx: Transaction) => void;
  onSuccessReturn: () => void;
  onSelectTransaction: (tx: Transaction) => void;
  onOpenCheckout: (txId: string, amount: number, method: 'bKash' | 'Nagad' | 'Rocket') => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ 
  merchantId,
  currentBalance, 
  commissionPayin,
  transactions, 
  onAddTransaction, 
  onSuccessReturn,
  onSelectTransaction,
  onOpenCheckout
}) => {
  const [amount, setAmount] = useState('500');
  const [method, setMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [generateLink, setGenerateLink] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
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
        customerPhone: '12345678',
        customerName: 'Merchant Deposit',
        createdAt: new Date().toISOString(),
        charge: numAmount * ((commissionPayin ?? 1.5) / 100),
        walletNumber: getValidRandomWalletNumber(method),
      };

      onAddTransaction(newTx);
      setLoading(false);

      if (generateLink) {
        setSuccessResult({
          id: randomId,
          amount: numAmount,
          link: `https://tkpaybd.site${window.location.pathname}?pay=${randomId}`
        });
      } else {
        // Directly open the cashier screen
        onOpenCheckout(randomId, numAmount, method);
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

          <div className="pt-2 flex gap-3">
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
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs overflow-hidden ${
                        m === 'bKash' ? 'bg-pink-50' :
                        m === 'Nagad' ? 'bg-orange-50' :
                        'bg-purple-50'
                      }`}>
                        {m === 'bKash' ? (
                          <img src={BKASH_LOGO_URL} alt="bKash" className="w-full h-full object-contain p-0.5 rounded-full" />
                        ) : m === 'Nagad' ? (
                          <img src={NAGAD_LOGO_URL} alt="Nagad" className="w-full h-full object-contain p-0.5 rounded-full" />
                        ) : (
                          <img src={ROCKET_LOGO_URL} alt="Rocket" className="w-full h-full object-contain p-0.5" />
                        )}
                      </div>
                      <span className={`font-bold text-xs ${isActive ? 'text-indigo-900' : 'text-gray-800'}`}>{m}</span>
                    </button>
                  );
                })}
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
