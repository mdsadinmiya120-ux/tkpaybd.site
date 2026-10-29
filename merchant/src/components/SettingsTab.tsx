import React, { useState } from 'react';
import { Settings, ShieldCheck, Check } from 'lucide-react';
import { MerchantProfile } from '../types';

interface SettingsTabProps {
  merchant: MerchantProfile;
  onUpdateMerchant: (updated: MerchantProfile) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ merchant, onUpdateMerchant }) => {
  const [name, setName] = useState(merchant.name);
  const [email, setEmail] = useState(merchant.email);
  const [phone, setPhone] = useState(merchant.phone);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateMerchant({
      ...merchant,
      name,
      email,
      phone,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto space-y-5 pb-12">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Merchant Profile Settings</h3>
            <p className="text-xs text-gray-500">Manage account information and KYC verification</p>
          </div>
        </div>

        {saved && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" /> Merchant profile updated successfully!
          </div>
        )}

        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md overflow-hidden">
            {merchant.avatar && (merchant.avatar.startsWith('http') || merchant.avatar.startsWith('/')) ? (
              <img src={merchant.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : merchant.websiteUrl ? (
              <img 
                src={`https://www.google.com/s2/favicons?domain=${merchant.websiteUrl.replace(/https?:\/\//, '').split('/')[0]}&sz=64`} 
                alt="Site Icon" 
                className="w-8 h-8 object-contain"
              />
            ) : (
              <span>{merchant.avatar || 'M'}</span>
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 text-base">{merchant.name}</h4>
            <p className="text-xs text-gray-500 font-mono">Merchant ID: {merchant.merchantId}</p>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full font-semibold w-fit">
              <ShieldCheck className="w-3.5 h-3.5" /> KYC Verified Merchant
            </div>
          </div>
        </div>

        {/* Live Account Rates & Balance Overview */}
        {(() => {
          const isCommAct = (merchant.isCommissionActive === false || merchant.commissionStatus === 'Inactive' || merchant.commissionStatus === 'Deactive') ? false : true;
          return (
            <div className="grid grid-cols-3 gap-2 p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 mb-6 text-center text-xs">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase">Available Balance</p>
                <p className="font-extrabold text-emerald-700 text-sm mt-0.5">
                  ৳{Number(merchant.balance || 0).toLocaleString('en-BD', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="border-x border-indigo-100">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Payin ({isCommAct ? 'Active' : 'Deactive'})</p>
                <p className={`font-extrabold text-sm mt-0.5 ${isCommAct ? 'text-indigo-700' : 'text-gray-400'}`}>
                  {isCommAct ? `${Number(merchant.commissionPayin ?? 0).toFixed(2)}%` : '0.00%'}
                </p>
                <span className={`text-[9px] font-bold ${isCommAct ? 'text-indigo-600' : 'text-red-600'}`}>
                  {isCommAct ? (merchant.feeType || 'Commission') : 'নিষ্ক্রিয়'}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase">Payout ({isCommAct ? 'Active' : 'Deactive'})</p>
                <p className={`font-extrabold text-sm mt-0.5 ${isCommAct ? 'text-indigo-700' : 'text-gray-400'}`}>
                  {isCommAct ? `${Number(merchant.commissionPayout ?? 0).toFixed(2)}%` : '0.00%'}
                </p>
                <span className={`text-[9px] font-bold ${isCommAct ? 'text-indigo-600' : 'text-red-600'}`}>
                  {isCommAct ? (merchant.feeType || 'Commission') : 'নিষ্ক্রিয়'}
                </span>
              </div>
            </div>
          );
        })()}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1.5">Business Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1.5">Phone Number</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition font-mono"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md transition"
            >
              Save Profile Updates
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
