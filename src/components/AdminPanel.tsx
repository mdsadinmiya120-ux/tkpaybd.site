import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  UserCheck, 
  Globe, 
  Save, 
  Percent,
  Check,
  X
} from 'lucide-react';
import { Transaction, MerchantProfile } from '../types';
import { BKASH_LOGO_URL, ROCKET_LOGO_URL, NAGAD_LOGO_URL } from '../constants/logos';
import { database } from '../firebase';
import { ref, set, onValue } from 'firebase/database';

interface AdminPanelProps {
  merchant: MerchantProfile;
  transactions: Transaction[];
  onApproveDeposit: (txId: string) => void;
  onRejectDeposit: (txId: string) => void;
  onApprovePayout: (txId: string) => void;
  onRejectPayout: (txId: string) => void;
  onUpdateSiteSettings?: (siteUrl: string, avatarUrl: string) => void;
  onUpdateMerchant?: (updated: MerchantProfile) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  merchant,
  transactions,
  onApproveDeposit,
  onRejectDeposit,
  onApprovePayout,
  onRejectPayout,
  onUpdateSiteSettings,
  onUpdateMerchant
}) => {
  const [filterType, setFilterType] = useState<'PendingDeposit' | 'PendingWithdrawal' | 'AllDeposit' | 'AllWithdrawal'>('PendingDeposit');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const isSuperAdmin = 
    merchant.merchantId === 'M20241018' || 
    merchant.merchantId === 'S01926516246' || 
    merchant.phone === '01926516246' ||
    merchant.phone === '+8801926516246' ||
    merchant.email === 'admin@chaopaopaybd.site' || 
    merchant.email === 'sadin@chaopaopaybd.site';

  const pendingDeposits = transactions.filter(t => t.type === 'Payin' && t.status === 'Pending' && (isSuperAdmin || t.merchantId === merchant.merchantId));
  const pendingWithdrawals = transactions.filter(t => t.type === 'Payout' && t.status === 'Pending' && (isSuperAdmin || t.merchantId === merchant.merchantId));

  const displayList = transactions.filter(tx => {
    if (!isSuperAdmin && tx.merchantId && tx.merchantId !== merchant.merchantId) return false;
    
    switch (filterType) {
      case 'PendingDeposit': return tx.type === 'Payin' && tx.status === 'Pending';
      case 'PendingWithdrawal': return tx.type === 'Payout' && tx.status === 'Pending';
      case 'AllDeposit': return tx.type === 'Payin';
      case 'AllWithdrawal': return tx.type === 'Payout';
      default: return true;
    }
  }).filter(tx => {
     const matchesSearch = tx.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (tx.customerPhone && tx.customerPhone.includes(searchTerm)) ||
                          (tx.customerName && tx.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
     return matchesSearch;
  });

  const formatBDT = (amount: number) => {
    return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} BDT`;
  };

  const handleApprove = (tx: Transaction) => {
    if (tx.type === 'Payin') {
      onApproveDeposit(tx.transactionId);
      setFeedbackMsg({
        text: `ডিপোজিট সফলভাবে অনুমোদন করা হয়েছে! ${formatBDT(tx.amount)} ব্যালেন্সে যুক্ত হয়েছে।`,
        type: 'success'
      });
    } else {
      onApprovePayout(tx.transactionId);
      setFeedbackMsg({
        text: `উত্তোলন সফলভাবে অনুমোদন করা হয়েছে!`,
        type: 'success'
      });
    }
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleReject = (tx: Transaction) => {
    if (tx.type === 'Payin') {
      onRejectDeposit(tx.transactionId);
      setFeedbackMsg({
        text: 'ডিপোজিটটি বাতিল করা হয়েছে। কোনো ব্যালেন্স যুক্ত করা হয়নি।',
        type: 'error'
      });
    } else {
      onRejectPayout(tx.transactionId);
      setFeedbackMsg({
        text: 'উত্তোলনটি বাতিল করা হয়েছে।',
        type: 'error'
      });
    }
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const [depositNumbers, setDepositNumbers] = useState<{ method: 'bKash' | 'Nagad' | 'Rocket'; number: string; limit: number }[]>(() => {
    try {
      const saved = localStorage.getItem('chaopaopay_deposit_numbers_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((item: any) => ({
          ...item,
          limit: item.limit !== undefined ? Number(item.limit) : 50000
        }));
      }
    } catch (e) {}
    return [
      { method: 'bKash', number: '12345678', limit: 50000 },
      { method: 'bKash', number: '01711223344', limit: 50000 },
      { method: 'Nagad', number: '01811223344', limit: 50000 },
      { method: 'Rocket', number: '01911223344', limit: 50000 }
    ];
  });
  const [newNumMethod, setNewNumMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [newNumVal, setNewNumVal] = useState('');
  const [newNumLimit, setNewNumLimit] = useState('50000');

  const handleAddNumber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNumVal.trim()) return;
    const limitNum = parseFloat(newNumLimit) || 50000;
    const updated = [...depositNumbers, { method: newNumMethod, number: newNumVal.trim(), limit: limitNum }];
    setDepositNumbers(updated);
    localStorage.setItem('chaopaopay_deposit_numbers_list', JSON.stringify(updated));
    setNewNumVal('');
    setNewNumLimit('50000');
    setFeedbackMsg({ text: 'নতুন ডিপোজিট নম্বর ও লিমিট সফলভাবে যোগ করা হয়েছে!', type: 'success' });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleDeleteNumber = (index: number) => {
    const updated = depositNumbers.filter((_, i) => i !== index);
    setDepositNumbers(updated);
    localStorage.setItem('chaopaopay_deposit_numbers_list', JSON.stringify(updated));
    setFeedbackMsg({ text: 'নম্বরটি মুছে ফেলা হয়েছে।', type: 'error' });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
              </span>
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                {isSuperAdmin ? 'Admin Panel (এডমিন প্যানেল)' : `Merchant Panel - ডিপোজিট/উত্তোলন কন্ট্রোল (${merchant.merchantId})`}
              </h2>
            </div>
            <p className="text-xs text-gray-500">
              {isSuperAdmin ? 'ডিপোজিট ও উত্তোলন অনুমোদন করুন।' : 'আপনার মার্চেন্ট লিংকের ডিপোজিট ও উত্তোলনসমূহ যাচাই, অনুমোদন বা বাতিল করুন।'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-xl text-center">
              <p className="text-[10px] font-bold text-amber-700 uppercase">পেন্ডিং ডিপোজিট</p>
              <p className="text-lg font-extrabold text-amber-900">{pendingDeposits.length}</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-xl text-center">
              <p className="text-[10px] font-bold text-amber-700 uppercase">পেন্ডিং উত্তোলন</p>
              <p className="text-lg font-extrabold text-amber-900">{pendingWithdrawals.length}</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-center">
              <p className="text-[10px] font-bold text-emerald-700 uppercase">কারেন্ট ব্যালেন্স</p>
              <p className="text-sm font-extrabold text-emerald-900">{formatBDT(merchant.balance)}</p>
            </div>
          </div>
        </div>

        {feedbackMsg && (
          <div className={`mt-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            feedbackMsg.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
            <span>{feedbackMsg.text}</span>
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-indigo-50/90 border border-indigo-200 rounded-2xl p-4 text-xs text-indigo-900 space-y-1 shadow-2xs">
        <p className="font-extrabold text-sm flex items-center gap-2 text-indigo-800">
          <span>🛡️</span>
          <span>ডিপোজিট ও উত্তোলন যাচাই ও অনুমোদন প্যানেল</span>
        </p>
        <p className="text-gray-700 leading-relaxed">
          আপনার মার্চেন্ট লিংক থেকে আসা ডিপোজিট বা উত্তোলনের অনুরোধসমূহ যাচাই করে <strong>Approve (অনুমোদন)</strong> অথবা <strong>Reject (বাতিল)</strong> করুন।
        </p>
      </div>

      {/* Deposit Numbers Management Section */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
        <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
          <h3 className="font-extrabold text-gray-900 text-sm">ডিপোজিট নম্বর ম্যানেজমেন্ট (অ্যাড ও র্যান্ডম শো)</h3>
          <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2 py-1 rounded-lg">মোট নম্বর: {depositNumbers.length}</span>
        </div>

        <form onSubmit={handleAddNumber} className="bg-gray-50 p-4 rounded-xl border border-gray-200/80 space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">পেমেন্ট মেথড</label>
              <select
                value={newNumMethod}
                onChange={(e) => setNewNumMethod(e.target.value as any)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-900"
              >
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
                <option value="Rocket">Rocket</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">রিসিভার নম্বর</label>
              <input
                type="text"
                required
                placeholder="যেমন: 01711223344"
                value={newNumVal}
                onChange={(e) => setNewNumVal(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-gray-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">সর্বোচ্চ লিমিট (BDT)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  required
                  placeholder="50000"
                  value={newNumLimit}
                  onChange={(e) => setNewNumLimit(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-emerald-700"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl transition cursor-pointer shrink-0"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>
        </form>

        <div className="space-y-2">
          <p className="font-bold text-xs text-gray-700">সংরক্ষিত ডিপোজিট নম্বরসমূহ ও লিমিট (৫০ হাজার বা নির্ধারিত লিমিট পূর্ণ হলে অটো বাদ যাবে):</p>
          <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden bg-white max-h-56 overflow-y-auto text-xs">
            {depositNumbers.length === 0 ? (
              <div className="p-6 text-center text-gray-400">কোনো নম্বর যোগ করা হয়নি।</div>
            ) : (
              depositNumbers.map((item, idx) => {
                // calculate used amount from transactions
                const usedAmount = transactions
                  .filter(t => t.walletNumber === item.number && (t.status === 'Success' || t.status === 'Pending'))
                  .reduce((sum, t) => sum + t.amount, 0);
                const isExceeded = usedAmount >= item.limit;

                return (
                  <div key={idx} className="p-3 flex items-center justify-between hover:bg-gray-50 transition gap-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.method === 'bKash' ? 'bg-pink-100 text-pink-700' :
                        item.method === 'Nagad' ? 'bg-orange-100 text-orange-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {item.method}
                      </span>
                      <span className="font-mono font-bold text-gray-900">{item.number}</span>
                      <span className="text-gray-500 font-semibold">Limit: ৳{item.limit.toLocaleString()}</span>
                      <span className={`font-bold ${isExceeded ? 'text-red-600' : 'text-emerald-600'}`}>
                        Used: ৳{usedAmount.toLocaleString()} {isExceeded ? '(Exceeded / Locked)' : ''}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteNumber(idx)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded-lg font-semibold transition border border-red-200 cursor-pointer text-[11px] shrink-0"
                    >
                      Delete
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setFilterType('PendingDeposit')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              filterType === 'PendingDeposit' ? 'bg-amber-500 text-white' : 'bg-gray-50 text-gray-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Deposits</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('PendingWithdrawal')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              filterType === 'PendingWithdrawal' ? 'bg-amber-500 text-white' : 'bg-gray-50 text-gray-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Withdrawals</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('AllDeposit')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              filterType === 'AllDeposit' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-700'
            }`}
          >
            <span>All Deposits</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('AllWithdrawal')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              filterType === 'AllWithdrawal' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-700'
            }`}
          >
            <span>All Withdrawals</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
          />
        </div>
      </div>

      {/* Approval List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-extrabold text-gray-900 text-sm">
            {filterType === 'PendingDeposit' ? 'Pending Deposit Requests' :
             filterType === 'PendingWithdrawal' ? 'Pending Withdrawal Requests' :
             filterType === 'AllDeposit' ? 'All Deposit History' : 'All Withdrawal History'}
             ({displayList.length})
          </h3>
        </div>

        {displayList.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="font-bold text-gray-700 text-sm">কোনো অনুরোধ নেই</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {displayList.map((tx) => {
              const isPending = tx.status === 'Pending';
              return (
                <div key={tx.id} className="p-4 sm:p-5 hover:bg-gray-50/60 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-gray-900 text-sm">
                        {tx.transactionId}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        tx.type === 'Payin' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {tx.type === 'Payin' ? 'Deposit' : 'Withdrawal'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        tx.status === 'Success' ? 'bg-emerald-100 text-emerald-800' :
                        tx.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {tx.status}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500">
                      <span>Sender: <strong className="text-gray-700">{tx.customerPhone || 'N/A'}</strong></span>
                      <span className="mx-2">•</span>
                      <span>Date: <span className="text-gray-700">{new Date(tx.createdAt).toLocaleString()}</span></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase">Amount</p>
                      <p className="text-base font-black text-emerald-700">
                        {formatBDT(tx.amount)}
                      </p>
                    </div>

                    {isPending ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleApprove(tx)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(tx)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-xl text-xs font-semibold transition border border-red-200 cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-xl ${
                        tx.status === 'Success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {tx.status === 'Success' ? '✓ Approved' : '✕ Rejected'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
