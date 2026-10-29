import React from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Plug, 
  BookOpen, 
  ShieldCheck, 
  Settings as SettingsIcon, 
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Banknote,
  Percent
} from 'lucide-react';
import { MerchantProfile, Transaction } from '../types';

interface DashboardHomeProps {
  merchant: MerchantProfile;
  transactions: Transaction[];
  setActiveTab: (tab: string) => void;
  onSelectTransaction: (tx: Transaction) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  merchant,
  transactions,
  setActiveTab,
  onSelectTransaction,
}) => {
  const formatBDT = (amount: number) => {
    return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} BDT`;
  };

  const isCommissionActive = (merchant.isCommissionActive === false || merchant.commissionStatus === 'Inactive' || merchant.commissionStatus === 'Deactive') ? false : true;

  // Filter transactions to only show those belonging to the current merchant
  const merchantTransactions = transactions.filter(t => t.merchantId === merchant.merchantId);

  const payinTransactions = merchantTransactions.filter(t => t.type === 'Payin' && t.status === 'Success');
  const payoutTransactions = merchantTransactions.filter(t => t.type === 'Payout' && t.status === 'Success');

  const showTotals = !(merchant.isPartnerAgent && merchant.partnershipStatus !== 'Approved');

  const totalMerchantDeposits = showTotals 
    ? payinTransactions.reduce((sum, t) => sum + t.amount, 0)
    : 0;

  const totalMerchantWithdrawals = showTotals
    ? payoutTransactions.reduce((sum, t) => sum + t.amount, 0)
    : 0;

  const todayPayins = payinTransactions
    .filter(t => new Date(t.createdAt).toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + t.amount, 0);

  const todayPayouts = payoutTransactions
    .filter(t => new Date(t.createdAt).toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + t.amount, 0);

  const recentTransactions = merchantTransactions.slice(0, 3);

  return (
    <div className="space-y-2 sm:space-y-3 pb-4">
      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
        {/* 1. AVAILABLE BALANCE CARD */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 shadow-sm border border-gray-100 hover:shadow-md transition relative overflow-hidden flex flex-col justify-between min-h-[90px]">
          <div>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center mb-2 shadow-2xs">
              <CreditCard className="w-4 h-4" />
            </div>
            <p className="text-[9px] font-bold text-gray-400 tracking-wider uppercase mb-0.5">
              Available Balance
            </p>
            <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
              {formatBDT(merchant.balance)}
            </h2>
          </div>
          <div className="absolute top-0 right-0 p-2 opacity-5">
             <CreditCard className="w-12 h-12" />
          </div>
        </div>

        {/* 2. TOTAL DEPOSITS CARD */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 shadow-sm border border-gray-100 hover:shadow-md transition relative overflow-hidden flex flex-col justify-between min-h-[90px]">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
                <DollarSign className="w-4 h-4" />
              </div>
              <button
                onClick={() => setActiveTab('deposit')}
                className="text-[9px] sm:text-[10px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-lg transition"
              >
                Deposit <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[9px] font-bold text-gray-400 tracking-wider uppercase mb-0.5">
              Total Deposits
            </p>
            <h2 className="text-base sm:text-lg font-black text-gray-900 tracking-tight mb-1">
              {formatBDT(totalMerchantDeposits)}
            </h2>
            <div className="flex items-center gap-2.5 text-[9px] sm:text-[10px]">
              <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md">
                {payinTransactions.length} TXs
              </span>
              <span className="text-gray-500">
                Today: <strong className="text-gray-800">{formatBDT(todayPayins)}</strong>
              </span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between">
             <p className={`text-[9px] font-bold flex items-center gap-1 ${
               isCommissionActive ? 'text-indigo-600' : 'text-gray-400'
             }`}>
                <Percent className="w-2.5 h-2.5" />
                <span>{isCommissionActive ? `Payin: ${Number(merchant.commissionPayin ?? 0).toFixed(2)}% ${merchant.feeType || 'Fee'}` : 'Payin Fee: 0.00% (Deactive)'}</span>
             </p>
             <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider ${
               isCommissionActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'
             }`}>
               {isCommissionActive ? 'Active' : 'Deactive'}
             </span>
          </div>
        </div>

        {/* 3. TOTAL WITHDRAWALS CARD */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 shadow-sm border border-gray-100 hover:shadow-md transition relative overflow-hidden flex flex-col justify-between min-h-[90px] sm:col-span-2 lg:col-span-1">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs">
                <Banknote className="w-4 h-4" />
              </div>
              <button
                onClick={() => setActiveTab('payout')}
                className="text-[9px] sm:text-[10px] text-amber-600 hover:text-amber-700 font-bold flex items-center gap-0.5 bg-amber-50 px-2 py-0.5 rounded-lg transition"
              >
                Withdraw <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[9px] font-bold text-gray-400 tracking-wider uppercase mb-0.5">
              Total Withdrawals
            </p>
            <h2 className="text-base sm:text-lg font-black text-gray-900 tracking-tight mb-1">
              {formatBDT(totalMerchantWithdrawals)}
            </h2>
            <div className="flex items-center gap-2.5 text-[9px] sm:text-[10px]">
              <span className="text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded-md">
                {payoutTransactions.length} TXs
              </span>
              <span className="text-gray-500">
                Today: <strong className="text-gray-800">{formatBDT(todayPayouts)}</strong>
              </span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between">
             <p className={`text-[9px] font-bold flex items-center gap-1 ${
               isCommissionActive ? 'text-indigo-600' : 'text-gray-400'
             }`}>
                <Percent className="w-2.5 h-2.5" />
                <span>{isCommissionActive ? `Payout: ${Number(merchant.commissionPayout ?? 0).toFixed(2)}% ${merchant.feeType || 'Fee'}` : 'Payout Fee: 0.00% (Deactive)'}</span>
             </p>
             <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider ${
               isCommissionActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'
             }`}>
               {isCommissionActive ? 'Active' : 'Deactive'}
             </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* RECENT TRANSACTIONS SECTION */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 text-xs sm:text-sm flex items-center gap-2">
               <Clock className="w-3.5 h-3.5 text-indigo-500" />
               Recent Transactions
            </h3>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-[9px] sm:text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 px-2.5 py-1 rounded-xl transition border border-indigo-100"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto -mx-5 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-5 sm:px-0">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <th className="pb-3 px-2">ID</th>
                    <th className="pb-3 px-2">Type</th>
                    <th className="pb-3 px-2">Amount</th>
                    <th className="pb-3 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-[11px] sm:text-xs">
                  {recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-gray-400 italic">
                        No recent transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    recentTransactions.map((tx) => {
                      const isPayin = tx.type === 'Payin';
                      return (
                        <tr 
                          key={tx.id} 
                          onClick={() => onSelectTransaction(tx)}
                          className="hover:bg-gray-50/80 cursor-pointer transition"
                        >
                          <td className="py-3 px-2 font-mono font-bold text-gray-900">
                            {tx.transactionId}
                          </td>
                          <td className="py-3 px-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                              isPayin ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                            }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-3 px-2 font-black text-gray-900">
                            {formatBDT(tx.amount)}
                          </td>
                          <td className="py-3 px-2 text-right">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${
                              tx.status === 'Success' ? 'bg-emerald-50 text-emerald-700' :
                              tx.status === 'Pending' ? 'bg-amber-50 text-amber-700' :
                              'bg-red-50 text-red-700'
                            }`}>
                              {tx.status === 'Success' && <CheckCircle2 className="w-2.5 h-2.5" />}
                              {tx.status === 'Pending' && <Clock className="w-2.5 h-2.5" />}
                              {tx.status === 'Failed' && <XCircle className="w-2.5 h-2.5" />}
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS SECTION */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col">
          <h3 className="font-bold text-gray-900 text-sm mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 flex-1">
            {/* API Keys */}
            <button
              onClick={() => setActiveTab('apikeys')}
              className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-emerald-50/40 hover:border-emerald-200 transition text-left group flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-white shadow-2xs flex items-center justify-center text-gray-600 group-hover:scale-110 transition shrink-0">
                <Plug className="w-4.5 h-4.5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-gray-900">API Keys</h4>
                <p className="text-[10px] text-gray-500 truncate">Credentials</p>
              </div>
            </button>

            {/* Documentation */}
            <button
              onClick={() => setActiveTab('documentation')}
              className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-blue-50/40 hover:border-blue-200 transition text-left group flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-white shadow-2xs flex items-center justify-center text-blue-600 group-hover:scale-110 transition shrink-0">
                <BookOpen className="w-4.5 h-4.5 text-blue-500" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-gray-900">API Docs</h4>
                <p className="text-[10px] text-gray-500 truncate">Guide</p>
              </div>
            </button>

            {/* Security */}
            <button
              onClick={() => setActiveTab('settings')}
              className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-amber-50/40 hover:border-amber-200 transition text-left group flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-white shadow-2xs flex items-center justify-center text-amber-600 group-hover:scale-110 transition shrink-0">
                <ShieldCheck className="w-4.5 h-4.5 text-amber-500" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-gray-900">Security</h4>
                <p className="text-[10px] text-gray-500 truncate">2FA</p>
              </div>
            </button>

            {/* Settings */}
            <button
              onClick={() => setActiveTab('settings')}
              className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-purple-50/40 hover:border-purple-200 transition text-left group flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-white shadow-2xs flex items-center justify-center text-purple-600 group-hover:scale-110 transition shrink-0">
                <SettingsIcon className="w-4.5 h-4.5 text-purple-500" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-gray-900">Settings</h4>
                <p className="text-[10px] text-gray-500 truncate">Profile</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
