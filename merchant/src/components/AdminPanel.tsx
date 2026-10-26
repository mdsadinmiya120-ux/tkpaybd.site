import React, { useState, useEffect } from 'react';
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
  X,
  Users,
  UserX,
  Power,
  RefreshCw,
  FileText,
  Copy
} from 'lucide-react';
import { Transaction, MerchantProfile, VerificationRequest } from '../types';
import { BKASH_LOGO_URL, ROCKET_LOGO_URL, NAGAD_LOGO_URL } from '../constants/logos';
import { database } from '../firebase';
import { ref, set, onValue } from 'firebase/database';
import { getVerificationRequests } from '../utils/verificationService';
import { defaultMerchantsList } from '../mockData';

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
    merchant.email === 'admin@tkpaybd.site' || 
    merchant.email === 'sadin@tkpaybd.site' ||
    merchant.email === 'admin@chaopaopaybd.site' || 
    merchant.email === 'sadin@chaopaopaybd.site';

  // Master Admin Account Status Control State & Listeners
  const [allAccounts, setAllAccounts] = useState<MerchantProfile[]>(() => {
    try {
      const saved = localStorage.getItem('chaopaopay_all_merchants');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return defaultMerchantsList;
  });
  const [accountSearch, setAccountSearch] = useState('');

  // Verification Requests State (TrxID, NID, 1350 BDT, Partner applications)
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>(() => {
    return getVerificationRequests();
  });

  useEffect(() => {
    // 1. Local listener
    const loadRequests = () => {
      setVerificationRequests(getVerificationRequests());
    };
    loadRequests();
    window.addEventListener('verificationRequestSubmitted', loadRequests);
    window.addEventListener('storage', loadRequests);

    // 2. Realtime listener from Firebase
    if (database) {
      try {
        const vrRef = ref(database, 'verification_requests');
        const unsub = onValue(vrRef, (snapshot) => {
          if (snapshot.exists()) {
            const val = snapshot.val();
            const list = Object.values(val) as VerificationRequest[];
            list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
            setVerificationRequests(list);
            try {
              localStorage.setItem('chaopaopay_verification_requests', JSON.stringify(list));
            } catch (e) {}
          }
        });
        return () => {
          unsub();
          window.removeEventListener('verificationRequestSubmitted', loadRequests);
          window.removeEventListener('storage', loadRequests);
        };
      } catch (e) {}
    }

    return () => {
      window.removeEventListener('verificationRequestSubmitted', loadRequests);
      window.removeEventListener('storage', loadRequests);
    };
  }, [database]);

  useEffect(() => {
    if (!database || !isSuperAdmin) return;
    try {
      const dirRef = ref(database, 'merchants_directory');
      const unsub = onValue(dirRef, (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          const list = Object.values(val) as MerchantProfile[];
          setAllAccounts(list);
        } else {
          try {
            const saved = localStorage.getItem('chaopaopay_all_merchants');
            if (saved) setAllAccounts(JSON.parse(saved));
            else setAllAccounts(defaultMerchantsList);
          } catch (e) {}
        }
      });
      return () => unsub();
    } catch (e) {
      console.warn('Error loading merchant directory:', e);
    }
  }, [database, isSuperAdmin]);

  const handleToggleAccountStatus = async (target: MerchantProfile, shouldActivate: boolean) => {
    const updatedAcc: MerchantProfile = {
      ...target,
      isPartnerAgent: shouldActivate,
      partnershipStatus: shouldActivate ? 'Approved' : 'Inactive',
      isActive: shouldActivate,
      isApproved: shouldActivate,
      kycStatus: shouldActivate ? 'Verified' : 'Unverified',
      status: shouldActivate ? 'Active' : 'Inactive',
      accountType: shouldActivate ? 'Partnership Agent' : (target.accountType || 'Merchant')
    };

    // 1. Firebase Realtime DB Updates
    if (database) {
      try {
        await set(ref(database, `merchants_directory/${target.merchantId}`), updatedAcc);
        await set(ref(database, `merchants/${target.merchantId}/profile`), updatedAcc);
        await set(ref(database, `merchants/${target.merchantId}`), updatedAcc);
      } catch (e) {
        console.warn('Firebase status update error:', e);
      }
    }

    // 2. localStorage Updates
    try {
      const saved = localStorage.getItem('chaopaopay_all_merchants');
      let list: MerchantProfile[] = saved ? JSON.parse(saved) : [];
      const idx = list.findIndex(m => m.merchantId.trim().toLowerCase() === target.merchantId.trim().toLowerCase());
      if (idx >= 0) {
        list[idx] = updatedAcc;
      } else {
        list.push(updatedAcc);
      }
      localStorage.setItem('chaopaopay_all_merchants', JSON.stringify(list));
      try {
        const curSaved = localStorage.getItem('chaopaopay_merchant');
        if (curSaved) {
          const curM = JSON.parse(curSaved);
          if (curM.merchantId && curM.merchantId.trim().toLowerCase() === target.merchantId.trim().toLowerCase()) {
            localStorage.setItem('chaopaopay_merchant', JSON.stringify(updatedAcc));
          }
        }
      } catch (e) {}
      window.dispatchEvent(new Event('merchantUpdated'));
    } catch (e) {}

    if (onUpdateMerchant && target.merchantId.trim().toLowerCase() === merchant.merchantId.trim().toLowerCase()) {
      onUpdateMerchant(updatedAcc);
    }

    // Local state optimistic update
    setAllAccounts(prev => prev.map(a => a.merchantId === target.merchantId ? updatedAcc : a));

    setFeedbackMsg({
      text: shouldActivate 
        ? `অ্যাকাউন্ট (${target.merchantId}) সফলভাবে একটিভ করা হয়েছে! পার্টনার এজেন্ট এখন এডমিন প্যানেল দেখতে পারবে।`
        : `অ্যাকাউন্ট (${target.merchantId}) ইনঅ্যাক্টিভ করা হয়েছে। এজেন্টের এডমিন প্যানেল দেখতে পাওয়ার ক্ষমতা বন্ধ করা হয়েছে।`,
      type: shouldActivate ? 'success' : 'error'
    });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleApproveVerification = async (req: VerificationRequest) => {
    const updatedReq: VerificationRequest = { ...req, status: 'Approved' };
    const updatedList = verificationRequests.map(r => r.id === req.id ? updatedReq : r);
    setVerificationRequests(updatedList);
    try {
      localStorage.setItem('chaopaopay_verification_requests', JSON.stringify(updatedList));
    } catch (e) {}

    if (database) {
      try {
        await set(ref(database, `verification_requests/${req.id}`), updatedReq);
      } catch (e) {}
    }

    const targetId = req.merchantId.trim().toLowerCase();
    let target = allAccounts.find(a => a.merchantId && a.merchantId.trim().toLowerCase() === targetId);
    if (!target) {
      target = {
        merchantId: req.merchantId,
        name: req.merchantName || 'Merchant',
        email: `${req.merchantId.toLowerCase()}@tkpaybd.site`,
        phone: req.phone || '',
        avatar: 'M',
        balance: 0,
        totalDeposits: 0,
        depositCount: 0,
        todayDeposits: 0,
        totalWithdrawals: 0,
        withdrawalCount: 0,
        todayWithdrawals: 0,
        kycStatus: 'Verified',
        isActive: false
      };
    }

    await handleToggleAccountStatus(target, true);

    setFeedbackMsg({
      text: `ভেরিফিকেশন সফলভাবে অনুমোদন করা হয়েছে! মার্চেন্ট (${req.merchantId}) এখন সক্রিয় এবং এডমিন প্যানেল আনলক হয়েছে।`,
      type: 'success'
    });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleRejectVerification = async (req: VerificationRequest) => {
    const updatedReq: VerificationRequest = { ...req, status: 'Rejected' };
    const updatedList = verificationRequests.map(r => r.id === req.id ? updatedReq : r);
    setVerificationRequests(updatedList);
    try {
      localStorage.setItem('chaopaopay_verification_requests', JSON.stringify(updatedList));
    } catch (e) {}

    if (database) {
      try {
        await set(ref(database, `verification_requests/${req.id}`), updatedReq);
      } catch (e) {}
    }

    setFeedbackMsg({
      text: `ভেরিফিকেশন রিকোয়েস্ট বাতিল করা হয়েছে।`,
      type: 'error'
    });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

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
        if (Array.isArray(parsed)) {
          const cleaned = parsed
            .filter((item: any) => 
              item.number !== '01711223344' && 
              item.number !== '01811223344' && 
              item.number !== '01911223344' && 
              item.number !== '12345678' && 
              item.number !== '1234'
            )
            .map((item: any) => ({
              ...item,
              limit: item.limit !== undefined ? Number(item.limit) : 50000
            }));
          if (cleaned.length > 0) return cleaned;
        }
      }
    } catch (e) {}
    return [
      { method: 'bKash', number: '123455', limit: 50000 }
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
    <div className="space-y-3 sm:space-y-4 pb-16">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
                <ShieldCheck className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight">
                {isSuperAdmin ? 'Admin Control Center' : 'Merchant Dashboard Control'}
              </h2>
            </div>
            <p className="text-[10px] text-gray-500 font-medium">
              {isSuperAdmin ? 'Global system management and approval portal.' : 'Manage your gateway deposits and withdrawals.'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full lg:w-auto">
            <div className="bg-amber-50/50 border border-amber-100 p-2 sm:p-2.5 rounded-2xl text-center">
              <p className="text-[8px] font-bold text-amber-700 uppercase tracking-wider mb-0.5">Pending Deposits</p>
              <p className="text-base font-black text-amber-900">{pendingDeposits.length}</p>
            </div>
            <div className="bg-amber-50/50 border border-amber-100 p-2 sm:p-2.5 rounded-2xl text-center">
              <p className="text-[8px] font-bold text-amber-700 uppercase tracking-wider mb-0.5">Pending Payouts</p>
              <p className="text-base font-black text-amber-900">{pendingWithdrawals.length}</p>
            </div>
            <div className="bg-purple-50/50 border border-purple-100 p-2 sm:p-2.5 rounded-2xl text-center">
              <p className="text-[8px] font-bold text-purple-700 uppercase tracking-wider mb-0.5">Verifications</p>
              <p className="text-base font-black text-purple-900">
                {verificationRequests.filter(r => r.status === 'Pending').length}
              </p>
            </div>
            <div className="bg-emerald-50/50 border border-emerald-100 p-2 sm:p-2.5 rounded-2xl text-center">
              <p className="text-[8px] font-bold text-emerald-700 uppercase tracking-wider mb-0.5">System Balance</p>
              <p className="text-[11px] font-black text-emerald-900 truncate px-1">{formatBDT(merchant.balance)}</p>
            </div>
          </div>
        </div>

        {feedbackMsg && (
          <div className={`mt-3 p-2.5 rounded-2xl text-[11px] font-bold flex items-center gap-2 animate-in slide-in-from-top-2 duration-200 ${
            feedbackMsg.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs' 
              : 'bg-red-50 text-red-800 border border-red-200 shadow-xs'
          }`}>
            {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
            <span className="leading-tight">{feedbackMsg.text}</span>
          </div>
        )}
      </div>

      {/* Verification & Partner Requests (Pending Submissions) */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                <span>ভেরিফিকেশন ও পার্টনার রিকোয়েস্ট</span>
                {verificationRequests.filter(r => r.status === 'Pending').length > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                    {verificationRequests.filter(r => r.status === 'Pending').length} Pending
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                মার্চেন্ট কর্তৃক সাবমিট করা ১৩৫০ টাকা পেমেন্ট ও পার্টনার এজেন্ট আবেদন তথ্য
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200/60">
            মোট রিকোয়েস্ট: {verificationRequests.length}
          </span>
        </div>

        {verificationRequests.length === 0 ? (
          <div className="p-8 text-center text-gray-400 font-medium italic text-xs bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            এখনও কোনো ভেরিফিকেশন রিকোয়েস্ট জমা পড়েনি। মার্চেন্ট ইন-এক্টিভ পেজ থেকে সাবমিট করলে এখানে দেখতে পাবেন।
          </div>
        ) : (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
            {verificationRequests.map((req) => {
              const isPending = req.status === 'Pending';
              return (
                <div 
                  key={req.id} 
                  className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isPending 
                      ? 'bg-amber-50/40 border-amber-200 shadow-xs' 
                      : req.status === 'Approved'
                      ? 'bg-emerald-50/20 border-emerald-100'
                      : 'bg-gray-50/60 border-gray-100'
                  }`}
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-gray-900 text-xs bg-white px-2 py-0.5 rounded-lg border border-gray-200">
                        {req.merchantId}
                      </span>
                      <span className="font-bold text-gray-800 text-xs sm:text-sm">
                        {req.merchantName}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tight ${
                        req.type === 'GATEWAY_1350' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {req.type === 'GATEWAY_1350' ? 'Gateway 1350 BDT' : 'Partner Agent'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                        isPending 
                          ? 'bg-amber-100 text-amber-800 animate-pulse' 
                          : req.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-[11px] text-gray-600">
                      {req.phone && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400">📞 Phone:</span>
                          <span className="font-mono font-bold text-gray-900">{req.phone}</span>
                        </div>
                      )}
                      {req.trxId && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400">💳 TrxID:</span>
                          <span className="font-mono font-black text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-indigo-100 select-all">
                            {req.trxId}
                          </span>
                        </div>
                      )}
                      {req.amount && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400">💰 Fee:</span>
                          <span className="font-black text-emerald-700">{req.amount} {req.currency || 'BDT'}</span>
                        </div>
                      )}
                      {req.nidNumber && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400">🆔 NID:</span>
                          <span className="font-mono text-gray-800">{req.nidNumber}</span>
                        </div>
                      )}
                      {req.whatsapp && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400">💬 WhatsApp:</span>
                          <span className="text-gray-800">{req.whatsapp}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <span>🕒 {new Date(req.submittedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isPending ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApproveVerification(req)}
                          className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>অনুমোদন ও এক্টিভ করুন</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectVerification(req)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-2 rounded-xl text-xs transition border border-red-200 cursor-pointer"
                        >
                          বাতিল
                        </button>
                      </>
                    ) : req.status === 'Approved' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-bold bg-emerald-100/70 px-3 py-1.5 rounded-xl">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>সক্রিয় অনুমোদিত</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-700 text-xs font-bold bg-red-100/70 px-3 py-1.5 rounded-xl">
                        <XCircle className="w-4 h-4" />
                        <span>বাতিলকৃত</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Master Admin: Account Control */}
      {isSuperAdmin && (
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-50 pb-4">
            <div>
              <h3 className="font-extrabold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                <Users className="w-4.5 h-4.5 text-indigo-600" />
                <span>Account Management</span>
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Control partner agent access and status.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="ID, Name, or Phone..."
                value={accountSearch}
                onChange={(e) => setAccountSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-indigo-600 focus:bg-white font-medium transition"
              />
            </div>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
            {allAccounts.filter(acc => {
              if (!accountSearch.trim()) return true;
              const term = accountSearch.toLowerCase();
              return (
                (acc.merchantId && acc.merchantId.toLowerCase().includes(term)) ||
                (acc.name && acc.name.toLowerCase().includes(term)) ||
                (acc.phone && acc.phone.includes(term)) ||
                (acc.email && acc.email.toLowerCase().includes(term))
              );
            }).length === 0 ? (
              <div className="p-10 text-center text-gray-400 font-medium italic text-xs">
                No accounts found matching your search.
              </div>
            ) : (
              allAccounts
                .filter(acc => {
                  if (!accountSearch.trim()) return true;
                  const term = accountSearch.toLowerCase();
                  return (
                    (acc.merchantId && acc.merchantId.toLowerCase().includes(term)) ||
                    (acc.name && acc.name.toLowerCase().includes(term)) ||
                    (acc.phone && acc.phone.includes(term)) ||
                    (acc.email && acc.email.toLowerCase().includes(term))
                  );
                })
                .map((acc) => {
                  const isAccountMaster = acc.merchantId === 'S01926516246' || acc.merchantId === 'M20241018' || acc.phone === '01926516246';
                  const isActive = Boolean(
                    isAccountMaster || (
                      acc.isActive !== false &&
                      acc.partnershipStatus !== 'Inactive' &&
                      acc.partnershipStatus !== 'Rejected' &&
                      (acc.isPartnerAgent === true || acc.partnershipStatus === 'Approved')
                    )
                  );

                  return (
                    <div key={acc.merchantId} className="p-4 border border-gray-50 rounded-2xl bg-gray-50/30 hover:bg-gray-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-black text-gray-900 text-xs sm:text-sm bg-white px-2 py-0.5 rounded-lg border border-gray-100">
                            {acc.merchantId}
                          </span>
                          <span className="font-bold text-gray-800 truncate max-w-[120px] sm:max-w-none">
                            {acc.name || 'Merchant'}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tight ${
                            isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:flex sm:items-center gap-y-1 gap-x-4 text-[10px] sm:text-[11px] text-gray-500 font-medium">
                          <span className="truncate">📞 <span className="text-gray-700">{acc.phone || 'N/A'}</span></span>
                          <span className="truncate hidden md:inline">📧 <span className="text-gray-700">{acc.email || 'N/A'}</span></span>
                          <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">In: {acc.commissionPayin ?? 0}%</span>
                          <span className="text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">Out: {acc.commissionPayout ?? 0}%</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isAccountMaster ? (
                          <span className="text-[10px] font-black bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1.5 rounded-xl shadow-sm">
                            Master Admin
                          </span>
                        ) : (
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={() => handleToggleAccountStatus(acc, true)}
                              disabled={isActive}
                              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold text-[11px] transition flex items-center justify-center gap-1.5 ${
                                isActive
                                  ? 'bg-gray-100 text-gray-400 border border-gray-100 cursor-not-allowed'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200'
                              }`}
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Active</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleAccountStatus(acc, false)}
                              disabled={!isActive}
                              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold text-[11px] transition flex items-center justify-center gap-1.5 ${
                                !isActive
                                  ? 'bg-gray-100 text-gray-400 border border-gray-100 cursor-not-allowed'
                                  : 'bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-200'
                              }`}
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span>Inactive</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* Deposit Numbers Management */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-5">
        <div className="flex items-center justify-between border-b border-gray-50 pb-4">
          <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">Wallet Management</h3>
          <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-xl">Count: {depositNumbers.length}</span>
        </div>

        <form onSubmit={handleAddNumber} className="bg-gray-50/50 p-4 sm:p-5 rounded-2xl border border-gray-200/80 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider ml-1">Method</label>
              <select
                value={newNumMethod}
                onChange={(e) => setNewNumMethod(e.target.value as any)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              >
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
                <option value="Rocket">Rocket</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider ml-1">Wallet Number</label>
              <input
                type="text"
                required
                placeholder="e.g. 017XXXXXXXX"
                value={newNumVal}
                onChange={(e) => setNewNumVal(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider ml-1">Max Limit (BDT)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  required
                  placeholder="50000"
                  value={newNumLimit}
                  onChange={(e) => setNewNumLimit(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-md shadow-indigo-100 active:scale-95 shrink-0 text-xs"
                >
                  Add Wallet
                </button>
              </div>
            </div>
          </div>
        </form>

        <div className="space-y-3">
          <p className="font-bold text-[11px] text-gray-400 uppercase tracking-widest px-1">Active Wallets</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
            {depositNumbers.length === 0 ? (
              <div className="col-span-2 p-10 text-center text-gray-400 font-medium italic text-xs">No wallets configured.</div>
            ) : (
              depositNumbers.map((item, idx) => {
                const usedAmount = transactions
                  .filter(t => t.walletNumber === item.number && (t.status === 'Success' || t.status === 'Pending'))
                  .reduce((sum, t) => sum + t.amount, 0);
                const isExceeded = usedAmount >= item.limit;

                return (
                  <div key={idx} className="p-4 border border-gray-100 rounded-2xl bg-white hover:border-indigo-100 transition group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                            item.method === 'bKash' ? 'bg-pink-100 text-pink-700' :
                            item.method === 'Nagad' ? 'bg-orange-100 text-orange-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {item.method}
                          </span>
                          <span className="font-mono font-bold text-gray-900 text-sm">{item.number}</span>
                        </div>
                        <div className="space-y-1">
                           <div className="flex items-center justify-between text-[10px] font-bold text-gray-500">
                             <span>Progress</span>
                             <span className={isExceeded ? 'text-red-600' : 'text-emerald-600'}>
                                {Math.round((usedAmount / item.limit) * 100)}%
                             </span>
                           </div>
                           <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${isExceeded ? 'bg-red-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(100, (usedAmount / item.limit) * 100)}%` }}
                              ></div>
                           </div>
                           <p className="text-[10px] text-gray-400 font-medium">
                              Used: <span className="text-gray-700">৳{usedAmount.toLocaleString()}</span> / ৳{item.limit.toLocaleString()}
                           </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteNumber(idx)}
                        className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* List Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 -mx-1 px-1 custom-scrollbar">
          <button
            onClick={() => setFilterType('PendingDeposit')}
            className={`px-3.5 py-2 rounded-xl text-[10px] sm:text-xs font-black transition whitespace-nowrap ${
              filterType === 'PendingDeposit' ? 'bg-amber-500 text-white shadow-md shadow-amber-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            Pending Deposits
          </button>
          <button
            onClick={() => setFilterType('PendingWithdrawal')}
            className={`px-3.5 py-2 rounded-xl text-[10px] sm:text-xs font-black transition whitespace-nowrap ${
              filterType === 'PendingWithdrawal' ? 'bg-amber-500 text-white shadow-md shadow-amber-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            Pending Payouts
          </button>
          <button
            onClick={() => setFilterType('AllDeposit')}
            className={`px-3.5 py-2 rounded-xl text-[10px] sm:text-xs font-black transition whitespace-nowrap ${
              filterType === 'AllDeposit' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            All Deposits
          </button>
          <button
            onClick={() => setFilterType('AllWithdrawal')}
            className={`px-3.5 py-2 rounded-xl text-[10px] sm:text-xs font-black transition whitespace-nowrap ${
              filterType === 'AllWithdrawal' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            All Payouts
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-indigo-600 focus:bg-white transition font-medium"
          />
        </div>
      </div>

      {/* Approval List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <h3 className="font-black text-gray-900 text-xs sm:text-sm tracking-tight">
            Transaction Requests ({displayList.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-50">
          {displayList.length === 0 ? (
            <div className="p-16 text-center text-gray-400 font-medium italic text-xs bg-white">
              No transactions found in this view.
            </div>
          ) : (
            displayList.map((tx) => {
              const isPending = tx.status === 'Pending';
              return (
                <div key={tx.id} className="p-4 sm:p-6 hover:bg-gray-50/60 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                  <div className="space-y-2 flex-1 min-w-0 w-full sm:w-auto">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono font-black text-gray-900 text-[10px] sm:text-xs bg-white px-1.5 py-0.5 rounded-lg border border-gray-100">
                        {tx.transactionId}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tight ${
                        tx.type === 'Payin' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {tx.type === 'Payin' ? 'Deposit' : 'Payout'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                        tx.status === 'Success' ? 'bg-emerald-50 text-emerald-700' :
                        tx.status === 'Pending' ? 'bg-amber-50 text-amber-700 animate-pulse' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {tx.status}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-y-1 gap-x-3 text-[10px] text-gray-500 font-medium">
                      <span className="flex items-center gap-1 truncate">
                         <span className="text-gray-400">👤</span>
                         <span className="text-gray-700 font-bold truncate max-w-[120px]">{tx.customerPhone || 'Unknown'}</span>
                      </span>
                      <span className="flex items-center gap-1">
                         <span className="text-gray-400">📅</span>
                         <span className="text-gray-700">{new Date(tx.createdAt).toLocaleString()}</span>
                      </span>
                      {tx.method && (
                        <span className="flex items-center gap-1">
                          <span className="text-gray-400">💳</span>
                          <span className="text-gray-700 font-bold">{tx.method}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-50">
                    <div className="text-left sm:text-right">
                      <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Amount</p>
                      <p className="text-base font-black text-emerald-700">
                        {formatBDT(tx.amount)}
                      </p>
                    </div>

                    {isPending ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleApprove(tx)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-[10px] font-black transition shadow-md shadow-emerald-100 active:scale-95 cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(tx)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-xl text-[10px] font-bold transition border border-red-100 cursor-pointer active:scale-95"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-xl font-black text-[9px] uppercase tracking-tight ${
                        tx.status === 'Success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {tx.status === 'Success' ? (
                          <>
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Approved</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-2.5 h-2.5" />
                            <span>Rejected</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
