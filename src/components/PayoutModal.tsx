import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle, 
  Eye, 
  EyeOff, 
  Clock, 
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Transaction, PaymentMethod } from '../types';
import { BKASH_LOGO_URL, ROCKET_LOGO_URL, NAGAD_LOGO_URL } from '../constants/logos';

interface PayoutModalProps {
  merchantId: string;
  currentBalance: number;
  commissionPayout: number;
  transactions: Transaction[];
  onAddTransaction: (tx: Transaction) => void;
  onSuccessReturn: () => void;
  onSelectTransaction: (tx: Transaction) => void;
}

export const PayoutModal: React.FC<PayoutModalProps> = ({ 
  merchantId,
  currentBalance, 
  commissionPayout,
  transactions, 
  onAddTransaction, 
  onSuccessReturn,
  onSelectTransaction 
}) => {
  const [amount, setAmount] = useState('1000');
  const [method, setMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [note, setNote] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successResult, setSuccessResult] = useState<{ id: string; netAmount: number } | null>(null);

  const payoutTransactions = transactions.filter(t => t.type === 'Payout');
  const pendingPayouts = payoutTransactions.filter(t => t.status === 'Pending' || t.status === 'Processing');
  const onHoldAmount = pendingPayouts.reduce((sum, t) => sum + t.amount, 0);

  const formatBDT = (val: number) => {
    return `৳${val.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} BDT`;
  };

  const numAmount = parseFloat(amount) || 0;
  const payoutRate = (commissionPayout ?? 6) / 100;
  const fee = numAmount * payoutRate;
  const netReceived = Math.max(0, numAmount - fee);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (numAmount < 100) {
      setErrorMsg('Minimum withdrawal amount is ৳100');
      return;
    }
    if (numAmount > currentBalance) {
      setErrorMsg('Insufficient available balance for this withdrawal.');
      return;
    }
    if (!accountNumber || accountNumber.length < 10) {
      setErrorMsg('Please enter a valid mobile account number.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your withdrawal password.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const randomId = 'WIT' + new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14) + Math.random().toString(36).substring(2, 6).toUpperCase();
      const newTx: Transaction = {
        id: 'tx_' + Date.now(),
        transactionId: randomId,
        merchantId: merchantId,
        type: 'Payout',
        amount: numAmount,
        currency: 'BDT',
        status: 'Pending',
        method,
        customerPhone: accountNumber,
        customerName: accountName || 'Merchant Account',
        createdAt: new Date().toISOString(),
        charge: fee,
      };

      onAddTransaction(newTx);
      setLoading(false);
      setSuccessResult({
        id: randomId,
        netAmount: netReceived
      });
    }, 1000);
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
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Available to Withdraw</p>
          <p className="text-sm sm:text-base font-extrabold text-gray-900 truncate">{formatBDT(Math.max(0, currentBalance - onHoldAmount))}</p>
        </div>
      </div>

      {successResult ? (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 space-y-4">
          <div className="flex items-center gap-3 text-emerald-600">
            <CheckCircle2 className="w-8 h-8 shrink-0" />
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Withdrawal Request Submitted</h3>
              <p className="text-xs text-gray-500">Transaction ID: {successResult.id}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Net Amount to Receive:</span>
              <span className="font-bold text-emerald-600">{formatBDT(successResult.netAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status:</span>
              <span className="font-semibold text-amber-600">Pending Review</span>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button 
              type="button"
              onClick={() => setSuccessResult(null)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-xs transition"
            >
              Submit Another
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
        /* 2. MAIN WITHDRAWAL FORM */
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-5">
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-gray-900 text-lg">Withdraw Funds</h3>
              <p className="text-xs text-gray-500">Transfer balance to your mobile financial service account</p>
            </div>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <ArrowUpRight className="w-5 h-5" />
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Method Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Select Method</label>
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

            {/* Account Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="01XXXXXXXXX"
                  value={accountNumber}
                  onChange={(e) => {
                    setAccountNumber(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 font-mono focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  placeholder="Optional"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white"
                />
              </div>
            </div>

            {/* Amount */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-700">Withdrawal Amount (BDT)</label>
                <span className="text-[11px] text-gray-400">Available: {formatBDT(currentBalance)}</span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-400 font-bold">৳</span>
                <input
                  type="number"
                  min="100"
                  max={Math.max(100, currentBalance)}
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white"
                  placeholder="1000"
                />
              </div>

              {/* Quick Select Buttons */}
              <div className="grid grid-cols-4 gap-1.5 mt-2 text-xs">
                {[500, 1000, 2000, 5000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setAmount(val.toString());
                      setErrorMsg('');
                    }}
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

            {/* Fee Breakdown Notice */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium">Fee ({commissionPayout.toFixed(2)}%): <strong className="text-gray-700">{formatBDT(fee)}</strong></span>
              <span className="text-gray-500 font-medium">You will receive: <strong className="text-emerald-600 font-bold">{formatBDT(netReceived)}</strong></span>
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Reference / Note
              </label>
              <input
                type="text"
                placeholder="e.g., Weekly settlement (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Password Confirmation <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter withdrawal password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full border border-gray-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 text-xs cursor-pointer"
              >
                {loading ? 'Processing Withdrawal...' : 'Submit Withdrawal'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. WITHDRAWAL INFO CARD */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-600" /> Withdrawal Information
        </h3>
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex items-center justify-between py-1 border-b border-gray-50">
            <span className="text-gray-500">Minimum withdrawal:</span>
            <span className="font-bold text-gray-900">৳100</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-gray-50">
            <span className="text-gray-500">Fee:</span>
            <span className="font-bold text-gray-900">{commissionPayout.toFixed(2)}% of amount</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-gray-50">
            <span className="text-gray-500">Processing time:</span>
            <span className="font-bold text-gray-900">Instant – 24 hours</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-gray-50">
            <span className="text-gray-500">Supported:</span>
            <span className="font-bold text-gray-900">bKash, Nagad, Rocket</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-500">Available balance:</span>
            <span className="font-bold text-emerald-600">{formatBDT(currentBalance)}</span>
          </div>
        </div>
      </div>

      {/* 4. STATUS GUIDE CARD */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Status Guide
        </h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-xl">
            <span className="bg-amber-100 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full text-[11px]">Pending</span>
            <span className="text-gray-600">Submitted, awaiting processing</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-xl">
            <span className="bg-sky-100 text-sky-800 font-semibold px-2.5 py-0.5 rounded-full text-[11px]">Processing</span>
            <span className="text-gray-600">Being processed by gateway</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-xl">
            <span className="bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full text-[11px]">Completed</span>
            <span className="text-gray-600">Successfully transferred</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-xl">
            <span className="bg-red-100 text-red-800 font-semibold px-2.5 py-0.5 rounded-full text-[11px]">Failed</span>
            <span className="text-gray-600">Balance refunded automatically</span>
          </div>
        </div>
      </div>

      {/* 5. RECENT WITHDRAWALS TABLE */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 text-base mb-4">Recent Withdrawals</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Transaction ID</th>
                <th className="pb-3 font-semibold">Method</th>
                <th className="pb-3 font-semibold">Account</th>
                <th className="pb-3 font-semibold">Received</th>
                <th className="pb-3 font-semibold text-right">Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {payoutTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2 text-gray-400 font-bold text-lg">
                      $
                    </div>
                    <p className="font-semibold text-gray-700">No withdrawals yet</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Submit your first withdrawal above</p>
                  </td>
                </tr>
              ) : (
                payoutTransactions.map((tx) => (
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
                    <td className="py-3 font-mono text-gray-600">
                      {tx.customerPhone}
                    </td>
                    <td className="py-3 font-bold text-gray-900">
                      {formatBDT(tx.amount - tx.charge)}
                    </td>
                    <td className="py-3 text-right font-semibold text-gray-600">
                      {formatBDT(tx.charge)}
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
