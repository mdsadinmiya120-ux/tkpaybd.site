import React, { useState } from 'react';
import { Menu, MoreVertical, Check, Copy } from 'lucide-react';
import { MerchantProfile } from '../types';

interface HeaderProps {
  onOpenSidebar: () => void;
  merchant: MerchantProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSidebar, merchant, activeTab, setActiveTab }) => {
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(merchant.merchantId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTitle = () => {
    switch(activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'transactions': return 'Transactions';
      case 'deposit': return 'Deposit';
      case 'payout': return 'Withdraw';
      case 'apikeys': return 'API Keys';
      case 'documentation': return 'Documentation';
      case 'settings': return 'Merchant Settings';
      case 'support': return 'Support & Help';
      case 'inactive': return 'Inactive Services';
      case 'admin': return 'Main Admin Panel';
      case 'subadmin': return 'Sub Admin Panel';
      default: return 'Dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs px-4 py-3 flex items-center justify-between">
      {/* Left: Menu, Title, Merchant ID, Website Link */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap min-w-0 flex-1 py-0.5">
        <button
          onClick={onOpenSidebar}
          className="p-1.5 rounded-lg text-gray-700 hover:bg-gray-100 transition active:scale-95 lg:hidden cursor-pointer shrink-0"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-gray-900 tracking-tight shrink-0">
          {getTitle()}
        </h1>

        <span className="text-gray-300 hidden md:inline">|</span>

        {/* Merchant ID Badge */}
        <button
          onClick={handleCopyId}
          className="flex items-center gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium border border-emerald-200 transition shadow-2xs shrink-0 cursor-pointer"
          title="Click to copy Merchant ID"
        >
          <span>{merchant.merchantId}</span>
          {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-emerald-500" />}
        </button>

        {/* Website Link Badge */}
        {merchant.websiteUrl && (
          <a
            href={merchant.websiteUrl.startsWith('http') ? merchant.websiteUrl : `https://${merchant.websiteUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium border border-blue-200 transition shadow-2xs shrink-0 cursor-pointer"
            title={`Visit website: ${merchant.websiteUrl}`}
          >
            <span>{merchant.websiteUrl.replace(/https?:\/\//, '').replace(/\/$/, '')}</span>
          </a>
        )}
      </div>

      {/* Right: Options Menu */}
      <div className="flex items-center gap-2">

        {/* Options Menu */}
        <div className="relative">
          <button 
            onClick={() => setShowOptions(!showOptions)}
            className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition cursor-pointer"
            aria-label="More options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showOptions && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 text-xs">
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
              <button 
                onClick={() => { alert('Tkpaybd.site Live Secure Gateway'); setShowOptions(false); }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-emerald-600 font-semibold cursor-pointer"
              >
                System Status: Operational
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
