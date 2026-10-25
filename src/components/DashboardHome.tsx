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
  Banknote
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
    <div className="space-y-2.5 pb-4">
      {/* Top 3 Cards Grid (Responsive: 1 col on mobile, 3 cols on desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* 1. AVAILABLE BALANCE CARD */}
        <div className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-100 hover:shadow-md transition relative overflow-hidden md:col-span-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="w-7 h-7 rounded-md bg-sky-50 text-sky-500 flex items-center justify-center mb-1 shadow-2xs">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
              <p className="text-[9px] font-bold text-gray-400 tracking-wider uppercase mb-0.5">
                Available Balance
              </p>
              <h2 className="text-base lg:text-lg font-extrabold text-gray-900 tracking-tight">
                {formatBDT(merchant.balance)}
              </h2>
            </div>
          </div>
        </div>

        {/* 2. TOTAL DEPOSITS CARD */}
        <div className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-100 hover:shadow-md transition relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm sm:text-base font-black text-red-600 tracking-tight">
                  {`Payin (Deposit) ${Number(merchant.commissionPayin ?? 0).toFixed(2)}% ${merchant.feeType || (merchant.accountType === 'Payment Gateway Use' ? 'Charge' : 'Commission')}`}
                </span>
              </div>
              <p className="text-[9px] font-bold text-gray-400 tracking-wider uppercase mb-0.5">
                Total Deposits
              </p>
              <h2 className="text-sm lg:text-base font-extrabold text-gray-900 tracking-tight mb-0.5">
                {formatBDT(totalMerchantDeposits)}
              </h2>
              <div className="space-y-0 text-[10px]">
                <p className="text-emerald-600 font-medium">
                  {payinTransactions.length} transactions
                </p>
                <p className="text-gray-500">
                  Today: <strong className="text-gray-800">{formatBDT(todayPayins)}</strong>
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('deposit')}
              className="text-[10px] text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded transition"
            >
              Deposit <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 3. TOTAL WITHDRAWALS CARD */}
        <div className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-100 hover:shadow-md transition relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs">
                  <Banknote className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm sm:text-base font-black text-red-600 tracking-tight">
                  {`Payout (Withdraw) ${Number(merchant.commissionPayout ?? 0).toFixed(2)}% ${merchant.feeType || (merchant.accountType === 'Payment Gateway Use' ? 'Charge' : 'Commission')}`}
                </span>
              </div>
              <p className="text-[9px] font-bold text-gray-400 tracking-wider uppercase mb-0.5">
                Total Withdrawals
              </p>
              <h2 className="text-sm lg:text-base font-extrabold text-gray-900 tracking-tight mb-0.5">
                {formatBDT(totalMerchantWithdrawals)}
              </h2>
              <div className="space-y-0 text-[10px]">
                <p className="text-gray-600 font-medium">
                  {payoutTransactions.length} transactions
                </p>
                <p className="text-gray-500">
                  Today: <strong className="text-gray-800">{formatBDT(todayPayouts)}</strong>
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('payout')}
              className="text-[10px] text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-0.5 bg-amber-50 px-2 py-0.5 rounded transition"
            >
              Withdraw <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. RECENT TRANSACTIONS SECTION */}
      <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-gray-900 text-xs">Recent Transactions</h3>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-[10px] font-semibold text-gray-700 hover:bg-gray-100 px-2 py-0.5 rounded transition border border-gray-200"
          >
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Transaction ID</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">
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
                      <td className="py-3 font-mono font-medium text-gray-800">
                        {tx.transactionId}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${
                          isPayin ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-gray-900">
                        {formatBDT(tx.amount)}
                      </td>
                      <td className="py-3 text-right">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          tx.status === 'Success' ? 'bg-emerald-100 text-emerald-800' :
                          tx.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {tx.status === 'Success' && <CheckCircle2 className="w-3 h-3" />}
                          {tx.status === 'Pending' && <Clock className="w-3 h-3" />}
                          {tx.status === 'Failed' && <XCircle className="w-3 h-3" />}
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

      {/* 5. QUICK ACTIONS SECTION (Responsive grid: 2 cols on mobile, 4 cols on desktop) */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 text-base mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* API Keys */}
          <button
            onClick={() => setActiveTab('apikeys')}
            className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-emerald-50/40 hover:border-emerald-200 transition text-left group flex flex-col justify-between"
          >
            <div className="w-11 h-11 rounded-xl bg-gray-100 shadow-2xs flex items-center justify-center text-gray-600 mb-3 group-hover:scale-110 transition">
              <Plug className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-gray-900">API Keys</h4>
              <p className="text-[11px] text-gray-500 mt-0.5 truncate">View your credentials</p>
            </div>
          </button>

          {/* Documentation */}
          <button
            onClick={() => setActiveTab('documentation')}
            className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-blue-50/40 hover:border-blue-200 transition text-left group flex flex-col justify-between"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-50 shadow-2xs flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition">
              <BookOpen className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-gray-900">Documentation</h4>
              <p className="text-[11px] text-gray-500 mt-0.5 truncate">Integration guide</p>
            </div>
          </button>

          {/* Security */}
          <button
            onClick={() => setActiveTab('settings')}
            className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-amber-50/40 hover:border-amber-200 transition text-left group flex flex-col justify-between"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-50 shadow-2xs flex items-center justify-center text-amber-600 mb-3 group-hover:scale-110 transition">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-gray-900">Security</h4>
              <p className="text-[11px] text-gray-500 mt-0.5 truncate">2FA & passwords</p>
            </div>
          </button>

          {/* Settings */}
          <button
            onClick={() => setActiveTab('settings')}
            className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-purple-50/40 hover:border-purple-200 transition text-left group flex flex-col justify-between"
          >
            <div className="w-11 h-11 rounded-xl bg-purple-50 shadow-2xs flex items-center justify-center text-purple-600 mb-3 group-hover:scale-110 transition">
              <SettingsIcon className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-gray-900">Settings</h4>
              <p className="text-[11px] text-gray-500 mt-0.5 truncate">More settings</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
