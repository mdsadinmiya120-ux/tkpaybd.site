import React, { useState } from 'react';
import { Menu, MoreVertical, Check, Copy, UserCheck, Shield } from 'lucide-react';
import { MerchantProfile } from '../types';
import { masterAdminMerchant, initialMerchant } from '../mockData';

interface HeaderProps {
  onOpenSidebar: () => void;
  merchant: MerchantProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onUpdateMerchant?: (updated: MerchantProfile) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSidebar, merchant, activeTab, setActiveTab, onUpdateMerchant }) => {
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(merchant.merchantId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isMasterAdmin = 
    merchant.merchantId === 'S01926516246' || 
    merchant.merchantId === 'M20241018' || 
    merchant.phone === '01926516246';

  const handleSwitchRole = (target: MerchantProfile) => {
    if (onUpdateMerchant) {
      onUpdateMerchant(target);
    }
    try {
      localStorage.setItem('chaopaopay_merchant', JSON.stringify(target));
    } catch (e) {}
    setShowOptions(false);
    window.dispatchEvent(new Event('merchantUpdated'));
  };

  const getTitle = () => {
    switch(activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'transactions': return 'Transactions';
      case 'deposit': return 'Deposit';
      case 'payout': return 'Withdraw';
      case 'apikeys': return 'API Keys';
      case 'documentation': return 'API Docs';
      case 'settings': return 'Settings';
      case 'support': return 'Support';
      case 'inactive': return 'Verification';
      case 'admin': return 'Admin Panel';
      case 'subadmin': return 'Sub Admin';
      default: return 'Dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between min-h-[48px] sm:min-h-[56px]">
      {/* Left: Menu, Title, Merchant ID, Website Link */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <button
          onClick={onOpenSidebar}
          className="p-1 rounded-lg text-gray-700 hover:bg-gray-100 transition active:scale-95 lg:hidden cursor-pointer shrink-0"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <h1 className="text-sm sm:text-base lg:text-lg font-extrabold text-gray-900 tracking-tight shrink-0 truncate max-w-[100px] xs:max-w-none">
          {getTitle()}
        </h1>

        <span className="text-gray-300 hidden sm:inline">|</span>

        {/* Merchant ID Badge */}
        <button
          onClick={handleCopyId}
          className="flex items-center gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-mono font-medium border border-emerald-200 transition shadow-2xs shrink-0 cursor-pointer max-w-[80px] xs:max-w-none truncate"
          title="Click to copy Merchant ID"
        >
          <span className="truncate">{merchant.merchantId}</span>
          {copied ? <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600" /> : <Copy className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-500" />}
        </button>

        {/* Status indicator */}
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
          merchant.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
        }`}>
          {merchant.isActive ? 'Active' : 'Inactive'}
        </span>

        {/* Website Link Badge - Hidden on very small screens */}
        {merchant.websiteUrl && (
          <a
            href={merchant.websiteUrl.startsWith('http') ? merchant.websiteUrl : `https://${merchant.websiteUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium border border-blue-200 transition shadow-2xs shrink-0 cursor-pointer"
            title={`Visit website: ${merchant.websiteUrl}`}
          >
            <span>{merchant.websiteUrl.replace(/https?:\/\//, '').replace(/\/$/, '')}</span>
          </a>
        )}
      </div>

      {/* Right: Options Menu */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <div className="relative">
          <button 
            onClick={() => setShowOptions(!showOptions)}
            className="p-1.5 sm:p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition cursor-pointer"
            aria-label="More options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showOptions && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setShowOptions(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                <button 
                  onClick={() => { setActiveTab('dashboard'); setShowOptions(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium cursor-pointer"
                >
                  Dashboard Overview
                </button>
                <button 
                  onClick={() => { setActiveTab('transactions'); setShowOptions(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium cursor-pointer"
                >
                  All Transactions
                </button>
                <button 
                  onClick={() => { setActiveTab('apikeys'); setShowOptions(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium cursor-pointer"
                >
                  API Credentials
                </button>

                <div className="border-t border-gray-100 my-1"></div>

                {/* Quick Account Switcher for testing Inactive vs Master Admin */}
                <div className="px-3 py-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Account Role Switcher</p>
                  {isMasterAdmin ? (
                    <button
                      onClick={() => handleSwitchRole(initialMerchant)}
                      className="w-full text-left px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <span>🔴 Inactive Merchant (M20261019)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSwitchRole(masterAdminMerchant)}
                      className="w-full text-left px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <span>👑 Master Admin (S01926516246)</span>
                    </button>
                  )}
                </div>

                <div className="border-t border-gray-100 my-1"></div>
                <button 
                  onClick={() => { alert('Tkpaybd.site Live Secure Gateway'); setShowOptions(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-emerald-600 font-semibold cursor-pointer"
                >
                  System Status: Operational
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
