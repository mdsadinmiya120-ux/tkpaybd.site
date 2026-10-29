import React, { useState, useEffect } from 'react';
import { Settings, ShieldCheck, Check, Wallet, Plus, Trash2, Shuffle, CheckCircle2, Copy } from 'lucide-react';
import { MerchantProfile, DepositWalletNumber } from '../types';
import { BKASH_LOGO_URL, NAGAD_LOGO_URL, ROCKET_LOGO_URL } from '../constants/logos';
import { getMerchantDepositNumbers, saveMerchantDepositNumbers } from '../utils/wallet';

interface SettingsTabProps {
  merchant: MerchantProfile;
  onUpdateMerchant: (updated: MerchantProfile) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ merchant, onUpdateMerchant }) => {
  const [name, setName] = useState(merchant.name);
  const [email, setEmail] = useState(merchant.email);
  const [phone, setPhone] = useState(merchant.phone);
  const [saved, setSaved] = useState(false);

  // Merchant-specific deposit numbers state
  const [myNumbers, setMyNumbers] = useState<DepositWalletNumber[]>(() => {
    return getMerchantDepositNumbers(merchant.merchantId);
  });

  const [newMethod, setNewMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [newLabel, setNewLabel] = useState<'Personal' | 'Agent'>('Personal');
  const [newNumber, setNewNumber] = useState('');
  const [newLimit, setNewLimit] = useState('50000');
  const [numberFeedback, setNumberFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const refreshNumbers = () => {
      setMyNumbers(getMerchantDepositNumbers(merchant.merchantId));
    };
    refreshNumbers();
    window.addEventListener('depositNumbersUpdated', refreshNumbers);
    window.addEventListener('storage', refreshNumbers);
    return () => {
      window.removeEventListener('depositNumbersUpdated', refreshNumbers);
      window.removeEventListener('storage', refreshNumbers);
    };
  }, [merchant.merchantId]);

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

  const handleAddNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = newNumber.trim();
    if (!cleanNum || cleanNum.length < 10) {
      setNumberFeedback({ text: 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)', type: 'error' });
      return;
    }

    // Check duplicate
    if (myNumbers.some(n => n.number === cleanNum && n.method === newMethod)) {
      setNumberFeedback({ text: 'এই নম্বরটি ইতিমধ্যে যোগ করা আছে!', type: 'error' });
      return;
    }

    const newEntry: DepositWalletNumber = {
      id: 'num_' + Date.now(),
      merchantId: merchant.merchantId,
      method: newMethod,
      label: newLabel,
      number: cleanNum,
      limit: parseFloat(newLimit) || 50000,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    const updated = [newEntry, ...myNumbers];
    setMyNumbers(updated);
    await saveMerchantDepositNumbers(merchant.merchantId, updated);

    setNewNumber('');
    setNumberFeedback({ 
      text: `নতুন ${newMethod} (${newLabel}) নম্বর সফলভাবে যোগ করা হয়েছে! এটি ডিপোজিট লিংকে দেখাবে।`, 
      type: 'success' 
    });
    setTimeout(() => setNumberFeedback(null), 3500);
  };

  const handleDeleteNumber = async (id: string) => {
    const updated = myNumbers.filter(n => n.id !== id);
    setMyNumbers(updated);
    await saveMerchantDepositNumbers(merchant.merchantId, updated);
    setNumberFeedback({ text: 'নম্বরটি মুছে ফেলা হয়েছে।', type: 'error' });
    setTimeout(() => setNumberFeedback(null), 3000);
  };

  const handleCopy = (num: string, id: string) => {
    navigator.clipboard.writeText(num);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const bkashCount = myNumbers.filter(n => n.method === 'bKash').length;
  const nagadCount = myNumbers.filter(n => n.method === 'Nagad').length;
  const rocketCount = myNumbers.filter(n => n.method === 'Rocket').length;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      {/* 1. MERCHANT PROFILE CARD */}
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
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md transition cursor-pointer"
            >
              Save Profile Updates
            </button>
          </div>
        </form>
      </div>

      {/* 2. DEDICATED MERCHANT WALLET & DEPOSIT NUMBERS MANAGEMENT */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-base sm:text-lg">ডিপোজিট ওয়ালেট নম্বর (Deposit Numbers)</h3>
              <p className="text-xs text-gray-500">আপনার নিজস্ব বিকাশ, নগদ ও রকেট ডিপোজিট নম্বর যুক্ত ও পরিচালনা করুন</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-xl border border-indigo-100 flex items-center gap-1.5">
              <Shuffle className="w-3.5 h-3.5 text-indigo-500" />
              <span>র‍্যান্ডম রোটেশন সক্রিয়</span>
            </span>
          </div>
        </div>

        {/* Informative Banner */}
        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-1.5 leading-relaxed">
          <p className="font-bold flex items-center gap-1.5 text-blue-950">
            <span>💡 নম্বর ব্যবস্থাপনা নির্দেশনা:</span>
          </p>
          <p className="text-gray-700">
            এখানে যুক্ত করা বিকাশ, নগদ ও রকেট নম্বরগুলো সরাসরি আপনার <strong>ডিপোজিট ফরম</strong> এবং <strong>কাস্টমার পেমেন্ট লিংকে</strong> প্রদর্শিত হবে। কোনো মেথডে (যেমন বিকাশ) একাধিক নম্বর থাকলে সিস্টেম প্রতিবার <strong>র‍্যান্ডম (Random)</strong> ভাবে নম্বর বেছে নিয়ে গ্রাহককে দেখাবে।
          </p>
        </div>

        {numberFeedback && (
          <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
            numberFeedback.type === 'success' 
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <CheckCircle2 className="w-4 h-4" />
            <span>{numberFeedback.text}</span>
          </div>
        )}

        {/* Add Number Form */}
        <form onSubmit={handleAddNumber} className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-200/90 space-y-4">
          <h4 className="font-bold text-gray-900 text-xs sm:text-sm flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>নতুন ডিপোজিট নম্বর যোগ করুন</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Method */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-gray-600 uppercase">পেমেন্ট মেথড</label>
              <select
                value={newMethod}
                onChange={(e) => setNewMethod(e.target.value as any)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-800 focus:outline-none focus:border-indigo-600"
              >
                <option value="bKash">bKash (বিকাশ)</option>
                <option value="Nagad">Nagad (নগদ)</option>
                <option value="Rocket">Rocket (রকেট)</option>
              </select>
            </div>

            {/* Label */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-gray-600 uppercase">অ্যাকাউন্ট টাইপ</label>
              <select
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value as any)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-800 focus:outline-none focus:border-indigo-600"
              >
                <option value="Personal">Personal (সেন্ড মানি)</option>
                <option value="Agent">Agent (ক্যাশ আউট)</option>
              </select>
            </div>

            {/* Number Input */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-gray-600 uppercase">মোবাইল নম্বর</label>
              <input
                type="tel"
                required
                placeholder="01XXXXXXXXX"
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-indigo-600 placeholder-gray-400"
              />
            </div>

            {/* Limit & Submit */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-gray-600 uppercase">দৈনিক লিমিট (BDT)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="50000"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:border-indigo-600"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl transition text-xs shrink-0 cursor-pointer shadow-sm active:scale-95"
                >
                  যোগ করুন
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Numbers Summary Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-gray-500">মোট নম্বর:</span>
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-pink-50 text-pink-700 border border-pink-200">
            বিকাশ: {bkashCount}টি
          </span>
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
            নগদ: {nagadCount}টি
          </span>
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            রকেট: {rocketCount}টি
          </span>
        </div>

        {/* Numbers List */}
        <div className="space-y-2.5 pt-2">
          {myNumbers.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 text-xs italic">
              এখনও কোনো ডিপোজিট নম্বর যোগ করা হয়নি। উপরের ফরম থেকে বিকাশ, নগদ বা রকেট নম্বর যোগ করুন।
            </div>
          ) : (
            myNumbers.map((item) => {
              const isBkash = item.method === 'bKash';
              const isNagad = item.method === 'Nagad';
              const isRocket = item.method === 'Rocket';

              return (
                <div 
                  key={item.id} 
                  className="p-3.5 sm:p-4 rounded-2xl border border-gray-200/90 bg-white hover:border-indigo-200 hover:shadow-xs transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center p-1 shrink-0 ${
                      isBkash ? 'bg-pink-50' : isNagad ? 'bg-orange-50' : 'bg-purple-50'
                    }`}>
                      <img 
                        src={isBkash ? BKASH_LOGO_URL : isNagad ? NAGAD_LOGO_URL : ROCKET_LOGO_URL} 
                        alt={item.method} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-black text-sm sm:text-base text-gray-900 tracking-wider">
                          {item.number}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          item.label === 'Agent' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {item.label}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          লিমিট: ৳{Number(item.limit || 50000).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        গ্রাহক পেমেন্ট পেজে এটি <strong className="text-gray-700">{item.label === 'Agent' ? 'ক্যাশ আউট' : 'সেন্ড মানি'}</strong> হিসেবে দেখাবে
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy(item.number, item.id)}
                      className="p-2 rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                      title="Copy Number"
                    >
                      {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteNumber(item.id)}
                      className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      title="Delete Number"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
