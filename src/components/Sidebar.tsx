import React, { useState } from 'react';
import { APP_LOGO_URL } from '../constants/logos';
import { 
  Wifi,
  LayoutDashboard, 
  ArrowDownLeft, 
  ArrowUpRight, 
  TrendingUp, 
  TrendingDown, 
  KeyRound, 
  FileText, 
  ShieldCheck, 
  User, 
  LogOut, 
  X,
  UserCheck
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingCount?: number;
  hasUnreadPending?: boolean;
  onMarkDepositsAsViewed?: () => void;
  balance: number;
  onLogout?: () => void;
  onNavigateToTransactions?: (filter: 'All' | 'Payin' | 'Payout') => void;
  isPartnerAgentApproved?: boolean;
  isAccountActive?: boolean;
  isSuperAdmin?: boolean;
  isSubAdminActive?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  activeTab, 
  setActiveTab, 
  pendingCount = 0,
  hasUnreadPending = false,
  onMarkDepositsAsViewed,
  balance = 0.00,
  onLogout,
  onNavigateToTransactions,
  isPartnerAgentApproved = false,
  isAccountActive = false,
  isSuperAdmin = false,
  isSubAdminActive = true
}) => {
  const formatBDT = (val: number) => {
    return `৳${val.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} BDT`;
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer */}
      <div className={`fixed top-0 left-0 bottom-0 w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Brand Header with Purple/Blue Gradient */}
        <div className="p-5 border-b border-indigo-100 flex items-center justify-between bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-md">
              <img 
                src={APP_LOGO_URL} 
                alt="TkpayBD Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-wide text-white flex items-center gap-1.5 -mt-1">
                <span>
                  <span className="text-white">T</span>
                  <span className="text-orange-400">K</span>
                  <span className="text-indigo-100 font-semibold ml-0.5">pay</span>
                  <span className="text-emerald-300 ml-0.5">BD</span>
                </span>
                <Wifi className="w-5 h-5 text-emerald-300" />
              </h1>
              <p className="text-[11px] text-indigo-200">Merchant Gateway</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-indigo-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 text-sm">
          {/* Dashboard */}
          <div>
            <button
              onClick={() => {
                setActiveTab('dashboard');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'dashboard' 
                  ? 'bg-indigo-50 text-indigo-700 shadow-2xs border border-indigo-100' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <LayoutDashboard className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-gray-400'}`} />
              <span>Dashboard</span>
            </button>
          </div>

          {/* MANAGEMENT (Directly below Dashboard) */}
          <div>
            <p className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Management</p>
            <div className="space-y-1">
              <button
                type="button"
                disabled={isAccountActive}
                onClick={() => {
                  if (!isAccountActive) {
                    setActiveTab('inactive');
                    onClose();
                  }
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-extrabold text-sm sm:text-base border transition-all ${
                  isAccountActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-not-allowed opacity-95'
                    : activeTab === 'inactive'
                    ? 'bg-red-100 text-red-700 border-red-300 shadow-2xs cursor-pointer'
                    : 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200 cursor-pointer'
                }`}
                title={isAccountActive ? 'Account is Active & Verified' : 'Click to apply for account verification'}
              >
                <div className="flex items-center gap-3">
                  <span>{isAccountActive ? '🟢' : '🔴'}</span>
                  <span className="tracking-wide">{isAccountActive ? 'Active' : 'Inactive'}</span>
                </div>
                {isAccountActive && (
                  <span className="text-[10px] bg-emerald-200/80 text-emerald-800 font-bold px-2 py-0.5 rounded-md">Verified</span>
                )}
              </button>

              {/* Admin Panel: Visible ONLY if account is Active and Approved */}
              {isPartnerAgentApproved && (
                <button
                  onClick={() => {
                    setActiveTab('admin');
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-medium transition-all cursor-pointer ${
                    activeTab === 'admin' 
                      ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className={`w-5 h-5 ${activeTab === 'admin' ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <span>Admin Panel</span>
                  </div>
                  {pendingCount > 0 && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {pendingCount} pending
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* FINANCE */}
          <div>
            <p className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Finance</p>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setActiveTab('deposit');
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  activeTab === 'deposit' 
                    ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <ArrowDownLeft className={`w-5 h-5 ${activeTab === 'deposit' ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span>Deposit</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('payout');
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  activeTab === 'payout' 
                    ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <ArrowUpRight className={`w-5 h-5 ${activeTab === 'payout' ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span>Withdraw</span>
              </button>
            </div>
          </div>

          {/* TRANSACTIONS */}
          <div>
            <p className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Transactions</p>
            <div className="space-y-1">
              <button
                onClick={() => {
                  if (onMarkDepositsAsViewed) onMarkDepositsAsViewed();
                  if (onNavigateToTransactions) {
                    onNavigateToTransactions('Payin');
                  } else {
                    setActiveTab('transactions');
                  }
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-medium transition-all cursor-pointer ${
                  activeTab === 'transactions' 
                    ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <TrendingUp className={`w-5 h-5 ${activeTab === 'transactions' ? 'text-indigo-600' : 'text-gray-400'}`} />
                  <span>Deposits</span>
                </div>
                {hasUnreadPending && pendingCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-xs animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                    <span>{pendingCount}</span>
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  if (onNavigateToTransactions) {
                    onNavigateToTransactions('Payout');
                  } else {
                    setActiveTab('transactions');
                  }
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all cursor-pointer"
              >
                <TrendingDown className="w-5 h-5 text-gray-400" />
                <span>Withdrawals</span>
              </button>
            </div>
          </div>

          {/* INTEGRATION */}
          <div>
            <p className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Integration</p>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setActiveTab('apikeys');
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  activeTab === 'apikeys' 
                    ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <KeyRound className={`w-5 h-5 ${activeTab === 'apikeys' ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span>API & Keys</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('documentation');
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  activeTab === 'documentation' 
                    ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <FileText className={`w-5 h-5 ${activeTab === 'documentation' ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span>Docs</span>
              </button>
            </div>
          </div>


          {/* ACCOUNT */}
          <div>
            <p className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Account</p>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setActiveTab('settings');
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  activeTab === 'settings' 
                    ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <ShieldCheck className={`w-5 h-5 ${activeTab === 'settings' ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span>Security</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('settings');
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
              >
                <User className="w-5 h-5 text-gray-400" />
                <span>Profile</span>
              </button>

              <button
                onClick={() => {
                  if (onLogout) onLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut className="w-5 h-5 text-red-500" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Bottom Available Balance Card */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 text-white shadow-md">
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200 mb-1">Available Balance</p>
            <h3 className="text-xl font-extrabold tracking-tight">{formatBDT(balance)}</h3>
          </div>
        </div>
      </div>
    </>
  );
};
