import React, { useState, useEffect, useRef } from 'react';
import { Menu, Check, Copy, ChevronDown, User, Shield, ArrowRight } from 'lucide-react';
import { MerchantProfile } from '../types';
import { defaultMerchantsList } from '../mockData';

interface HeaderProps {
  onOpenSidebar: () => void;
  merchant: MerchantProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onUpdateMerchant?: (updated: MerchantProfile) => void;
  onSwitchMerchant?: (targetMerchant: MerchantProfile) => void;
  allMerchants?: MerchantProfile[];
  isAccountActive?: boolean;
  isCommissionActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenSidebar, 
  merchant, 
  activeTab, 
  setActiveTab, 
  onUpdateMerchant,
  onSwitchMerchant,
  allMerchants: propAllMerchants = [],
  isAccountActive: propIsAccountActive,
  isCommissionActive: propIsCommissionActive
}) => {
  const [copied, setCopied] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const effectiveIsActive = propIsAccountActive !== undefined 
    ? propIsAccountActive 
    : (
        merchant.isActive === false || 
        merchant.status === 'Inactive' || 
        merchant.accountStatus === 'Inactive'
      ) ? false : Boolean(
        merchant.isActive === true || 
        merchant.status === 'Active' || 
        merchant.accountStatus === 'Active' ||
        merchant.partnershipStatus === 'Approved' ||
        merchant.isApproved === true ||
        merchant.merchantId === 'S01926516246' ||
        merchant.merchantId === 'M20241018'
      );

  const effectiveIsCommActive = propIsCommissionActive !== undefined
    ? propIsCommissionActive
    : (merchant.isCommissionActive !== false && merchant.commissionStatus !== 'Inactive' && merchant.commissionStatus !== 'Deactive');

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowAccountDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      case 'documentation': return 'API Docs';
      case 'settings': return 'Settings';
      case 'support': return 'Support';
      case 'inactive': return 'Verification';
      case 'admin': return 'Admin Panel';
      case 'subadmin': return 'Sub Admin';
      default: return 'Dashboard';
    }
  };

  // Compile list of available accounts to switch to
  const availableAccounts: MerchantProfile[] = [];
  const addAcc = (acc: MerchantProfile) => {
    if (!acc || !acc.merchantId) return;
    const cleanId = acc.merchantId.trim().toLowerCase();
    const idx = availableAccounts.findIndex(a => a.merchantId.trim().toLowerCase() === cleanId);
    
    const isMaster = cleanId === 's01926516246' || cleanId === 'm20241018';
    
    const evaluateActive = (item: any): boolean => {
      if (isMaster) return true;
      if (!item) return false;
      if (item.isActive === false || item.status === 'Inactive' || item.accountStatus === 'Inactive') {
        return false;
      }
      if (item.isActive === true || item.status === 'Active' || item.accountStatus === 'Active') {
        return true;
      }
      return Boolean(item.partnershipStatus === 'Approved' || item.isApproved === true);
    };

    const isAct = evaluateActive(acc);

    if (idx >= 0) {
      const existing = availableAccounts[idx];
      availableAccounts[idx] = { 
        ...existing, 
        ...acc,
        isActive: isAct,
        status: isAct ? 'Active' : 'Inactive',
        accountStatus: isAct ? 'Active' : 'Inactive',
        partnershipStatus: isAct ? 'Approved' : 'Inactive',
        kycStatus: isAct ? 'Verified' : 'Unverified',
        isApproved: isAct,
        isPartnerAgent: isAct
      };
    } else {
      availableAccounts.push({
        ...acc,
        isActive: isAct,
        status: isAct ? 'Active' : 'Inactive',
        accountStatus: isAct ? 'Active' : 'Inactive',
        partnershipStatus: isAct ? 'Approved' : 'Inactive',
        kycStatus: isAct ? 'Verified' : 'Unverified',
        isApproved: isAct,
        isPartnerAgent: isAct
      });
    }
  };

  // 1. Defaults
  defaultMerchantsList.forEach(addAcc);

  // 2. LocalStorage (Authoritative from Admin Panel)
  try {
    const saved = localStorage.getItem('chaopaopay_all_merchants');
    if (saved) {
      const list = JSON.parse(saved);
      if (Array.isArray(list)) list.forEach(addAcc);
    }
  } catch (e) {}

  // 3. Props
  propAllMerchants.forEach(addAcc);

  const handleSelectAccount = (target: MerchantProfile) => {
    setShowAccountDropdown(false);
    const isMaster = target.merchantId === 'S01926516246' || target.merchantId === 'M20241018';
    const isExplicitInactive = target.isActive === false || target.status === 'Inactive' || target.accountStatus === 'Inactive';
    const pActive = isExplicitInactive ? false : (
      target.isActive === true || 
      target.status === 'Active' || 
      target.accountStatus === 'Active' || 
      target.partnershipStatus === 'Approved' ||
      target.isApproved === true ||
      isMaster
    );
    const updatedTarget: MerchantProfile = {
      ...target,
      isActive: pActive,
      status: pActive ? 'Active' : 'Inactive',
      accountStatus: pActive ? 'Active' : 'Inactive',
      partnershipStatus: pActive ? 'Approved' : 'Inactive',
      kycStatus: pActive ? 'Verified' : 'Unverified',
      isApproved: pActive,
      isPartnerAgent: pActive ? (target.isPartnerAgent !== false) : false
    };
    try {
      localStorage.setItem('chaopaopay_merchant', JSON.stringify(updatedTarget));
    } catch (e) {}
    if (onSwitchMerchant) {
      onSwitchMerchant(updatedTarget);
    } else if (onUpdateMerchant) {
      onUpdateMerchant(updatedTarget);
    }
  };

  const isMasterAdmin = merchant.merchantId === 'S01926516246' || merchant.merchantId === 'M20241018';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between min-h-[48px] sm:min-h-[56px] relative">
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

        {/* Merchant ID Badge - Full ID visible without truncation */}
        <button
          onClick={handleCopyId}
          className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border border-emerald-200/90 transition shadow-2xs shrink-0 cursor-pointer"
          title="Click to copy Merchant ID"
        >
          <span className="font-mono font-bold tracking-tight whitespace-nowrap">{merchant.merchantId}</span>
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <Copy className="w-3.5 h-3.5 text-emerald-500" />}
        </button>

        {/* Status indicator - Prominent & clean */}
        <span className={`px-2.5 py-1 rounded-lg text-xs font-black shrink-0 tracking-wide flex items-center gap-1.5 shadow-2xs ${
          effectiveIsActive ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${effectiveIsActive ? 'bg-white animate-pulse' : 'bg-white/80'}`}></span>
          <span>{effectiveIsActive ? 'Active' : 'Inactive'}</span>
        </span>

        {/* Commission indicator */}
        <span className={`px-2 py-1 rounded-lg text-xs font-extrabold shrink-0 hidden xs:inline-flex items-center gap-1 ${
          effectiveIsCommActive ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <span>Comm: {effectiveIsCommActive ? 'Active' : 'Deactive'}</span>
        </span>

        {/* Website Link Badge - Hidden on very small screens */}
        {merchant.websiteUrl && (
          <a
            href={merchant.websiteUrl.startsWith('http') ? merchant.websiteUrl : `https://${merchant.websiteUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border border-blue-200 transition shadow-2xs shrink-0 cursor-pointer"
            title={`Visit website: ${merchant.websiteUrl}`}
          >
            <span>{merchant.websiteUrl.replace(/https?:\/\//, '').replace(/\/$/, '')}</span>
          </a>
        )}
      </div>

      {/* Right: Account & Admin Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {!isMasterAdmin && (
          <button
            type="button"
            onClick={() => {
              const masterAcc = availableAccounts.find(a => a.merchantId === 'S01926516246') || defaultMerchantsList[0];
              handleSelectAccount(masterAcc);
              setActiveTab('admin');
            }}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition active:scale-95 cursor-pointer"
            title="Return to Master Admin Panel"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>এডমিন প্যানেল</span>
          </button>
        )}

        {/* User Profile Dropdown (Current Logged In User Profile) */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowAccountDropdown(!showAccountDropdown)}
            className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl font-semibold text-xs text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition cursor-pointer shadow-2xs"
            title="Profile Details"
          >
            <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="hidden md:inline font-mono font-bold">{merchant.merchantId}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {showAccountDropdown && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-3xl shadow-2xl border border-gray-200/90 p-4 z-50 text-xs animate-in fade-in duration-150 space-y-3">
              {/* User Profile Summary Header */}
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100/80 rounded-2xl">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0">
                  {merchant.name ? merchant.name.charAt(0).toUpperCase() : 'M'}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-gray-900 text-sm truncate">{merchant.name || 'Merchant User'}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono text-[11px] font-bold text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-indigo-200/80">{merchant.merchantId}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      effectiveIsActive ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {effectiveIsActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Details Box */}
              <div className="space-y-2 bg-gray-50/80 rounded-2xl p-3 border border-gray-100 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-500">ফোন নম্বর:</span>
                  <span className="font-mono font-bold text-gray-900">{merchant.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-500">ইমেইল:</span>
                  <span className="font-mono font-bold text-gray-900 truncate max-w-[150px]">{merchant.email || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-500">অ্যাকোউন্ট টাইপ:</span>
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{merchant.accountType || 'Merchant'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-500">কমিশন স্ট্যাটাস:</span>
                  <span className={`font-extrabold ${effectiveIsCommActive ? 'text-indigo-600' : 'text-red-600'}`}>
                    {effectiveIsCommActive ? 'Active' : 'Deactive'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowAccountDropdown(false);
                    setActiveTab('settings');
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>অ্যাকাউন্ট সেটিংস (Settings)</span>
                </button>

                {isMasterAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowAccountDropdown(false);
                      setActiveTab('admin');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>এডমিন প্যানেলে যান</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowAccountDropdown(false);
                    localStorage.removeItem('chaopaopay_merchant');
                    window.location.reload();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer border border-rose-200/80"
                >
                  <span>লগআউট করুন (Log Out)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
