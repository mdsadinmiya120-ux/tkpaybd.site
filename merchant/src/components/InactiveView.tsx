import React, { useState } from 'react';
import { ShieldAlert, Users, Server, ArrowRight, X, AlertTriangle, Headphones, ArrowLeft, MessageSquare, ExternalLink, CheckCircle2, ShieldCheck, Check, RotateCcw } from 'lucide-react';
import { PartnershipForm } from './PartnershipForm';
import { MerchantProfile, VerificationRequest } from '../types';
import { saveVerificationRequest } from '../utils/verificationService';

interface InactiveViewProps {
  setActiveTab: (tab: string) => void;
  merchantId?: string;
  merchant: MerchantProfile;
  onUpdateMerchant?: (updated: MerchantProfile) => void;
}

export const InactiveView: React.FC<InactiveViewProps> = ({ 
  setActiveTab, 
  merchantId, 
  merchant, 
  onUpdateMerchant 
}) => {
  const isMasterAdmin = merchant.merchantId === 'S01926516246' || merchant.merchantId === 'M20241018';

  const isAccountActive = isMasterAdmin || Boolean(
    merchant.isActive === true && 
    (merchant.status === 'Active' || merchant.accountStatus === 'Active') && 
    merchant.partnershipStatus === 'Approved' &&
    merchant.isApproved === true
  );

  const isPartnerApproved = isMasterAdmin || Boolean(
    merchant.partnershipStatus === 'Approved' && merchant.isApproved === true && merchant.isActive === true
  );

  const isGatewayActive = isMasterAdmin || Boolean(
    isAccountActive && (merchant.accountType === 'Payment Gateway Use' || merchant.accountType === 'Partnership Agent')
  );

  const isPartnerPending = merchant.partnershipStatus === 'Pending Verification';
  const [showPartnershipForm, setShowPartnershipForm] = useState(false);
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [gatewayView, setGatewayView] = useState<'STATUS' | 'BDT_SUPPORT'>('STATUS');
  const [bdtPhone, setBdtPhone] = useState('');
  const [bdtTrxId, setBdtTrxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const openGatewayModal = () => {
    if (isGatewayActive) return; // Cannot open modal if already active
    setGatewayView('STATUS');
    setIsSubmitted(false);
    setBdtPhone('');
    setBdtTrxId('');
    setShowGatewayModal(true);
  };

  const handleBdtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bdtTrxId) return;
    setIsSubmitting(true);

    const targetMerchantId = merchant.merchantId || merchantId || 'UNKNOWN';
    const newReq: VerificationRequest = {
      id: 'VR-GW-' + Date.now(),
      merchantId: targetMerchantId,
      merchantName: merchant.name || 'Merchant User',
      type: 'GATEWAY_600',
      title: 'Payment Gateway Activation (600 BDT)',
      phone: bdtPhone,
      trxId: bdtTrxId.trim().toUpperCase(),
      amount: 600,
      currency: 'BDT',
      paymentMethod: 'bKash/Nagad',
      status: 'Pending',
      submittedAt: new Date().toISOString()
    };

    saveVerificationRequest(newReq);

    const updated: MerchantProfile = {
      ...merchant,
      partnershipStatus: 'Pending Verification'
    };
    if (onUpdateMerchant) {
      onUpdateMerchant(updated);
    }
    try {
      localStorage.setItem('chaopaopay_merchant', JSON.stringify(updated));
    } catch (e) {}

    setTimeout(() => {
      setIsSubmitted(true);
      setIsSubmitting(false);
    }, 700);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Partnership Request Modal */}
      {showPartnershipForm && (
        <PartnershipForm 
          merchantId={merchant.merchantId || merchantId || 'UNKNOWN'} 
          onClose={() => setShowPartnershipForm(false)} 
          onSubmit={(data) => {
            const targetMerchantId = merchant.merchantId || merchantId || 'UNKNOWN';
            const newReq: VerificationRequest = {
              id: 'VR-PA-' + Date.now(),
              merchantId: targetMerchantId,
              merchantName: data.name || merchant.name || 'Merchant User',
              type: 'PARTNER_AGENT',
              title: 'Partner Agent Verification Request',
              phone: data.phone || data.bdtPhone || '',
              whatsapp: data.whatsapp || '',
              nidNumber: data.nidNumber || '',
              trxId: (data.bdtTrxId || data.txHash || '').trim().toUpperCase(),
              amount: data.paymentMethod === 'USDT' ? (Number(data.usdtAmount) || 5) : 600,
              currency: data.paymentMethod === 'USDT' ? 'USDT' : 'BDT',
              paymentMethod: data.paymentMethod || 'bKash/Nagad',
              status: 'Pending',
              submittedAt: new Date().toISOString()
            };

            saveVerificationRequest(newReq);

            const updated: MerchantProfile = {
              ...merchant,
              partnershipStatus: 'Pending Verification'
            };
            if (onUpdateMerchant) {
              onUpdateMerchant(updated);
            }
            try {
              localStorage.setItem('chaopaopay_merchant', JSON.stringify(updated));
            } catch (e) {}
          }} 
        />
      )}

      {/* Configure Payment Gateway / Activation Modal */}
      {showGatewayModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                {gatewayView === 'BDT_SUPPORT' ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (isSubmitted) {
                        setShowGatewayModal(false);
                      } else {
                        setGatewayView('STATUS');
                      }
                    }}
                    className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                    title="Back"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100/80 text-amber-500 flex items-center justify-center font-bold shadow-2xs">
                    <AlertTriangle className="w-5 h-5 text-amber-500 fill-amber-100" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                    {gatewayView === 'BDT_SUPPORT' ? 'বিকাশ / নগদ পেমেন্ট সাপোর্ট' : 'Payment Gateway Service'}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    {gatewayView === 'BDT_SUPPORT' ? 'টেলিগ্রাম @tkpay_BD এর সাথে যোগাযোগ' : 'একাউন্ট স্ট্যাটাস ও অ্যাক্টিভেশন'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGatewayModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            {gatewayView === 'STATUS' ? (
              /* SCREEN 1: STATUS & REQUIREMENT */
              <div className="p-6 space-y-4 text-center overflow-y-auto">
                {/* Box 1: Service Status */}
                <div className={`w-full py-6 px-4 rounded-3xl border flex flex-col items-center justify-center space-y-1.5 shadow-2xs ${
                  isAccountActive ? 'border-emerald-200/90 bg-emerald-50/40' : 'border-rose-200/90 bg-rose-50/40'
                }`}>
                  <div className={`inline-block px-4 py-1 rounded-full font-bold text-xs tracking-wide ${
                    isAccountActive ? 'bg-emerald-100/90 text-emerald-800' : 'bg-rose-100/80 text-rose-800'
                  }`}>
                    সার্ভিস স্ট্যাটাস: {isAccountActive ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Inactive)'}
                  </div>
                  <h2 className={`text-3xl sm:text-4xl font-black tracking-wide pt-1 pb-0.5 ${
                    isAccountActive ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {isAccountActive ? 'এক্টিভ' : 'এক্টিভ না'}
                  </h2>
                  <p className={`text-xs sm:text-sm font-medium ${isAccountActive ? 'text-emerald-700' : 'text-rose-500'}`}>
                    {isAccountActive ? 'আপনার পেমেন্ট গেটওয়ে সেবাটি সফলভাবে চালু আছে' : 'স্ট্যাটাস নির্দেশনা নিচে দেওয়া হলো'}
                  </p>
                </div>

                {/* Box 2: Activation Requirement / Status Notice */}
                {isAccountActive ? (
                  <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-4 text-left space-y-2 shadow-2xs">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs sm:text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>অ্যাক্টিভেশন স্ট্যাটাস:</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-normal">
                      আপনার অ্যাকাউন্টটি মাস্টার এডমিন থেকে <strong className="text-emerald-600 font-black text-sm sm:text-base">এক্টিভ করা হয়েছে</strong>। সমস্ত পেমেন্ট সার্ভিস ও গেটওয়ে এখন পুরোপুরি সক্রিয়।
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-50/60 border border-amber-200/90 rounded-2xl p-4 text-left space-y-2 shadow-2xs">
                    <div className="flex items-center gap-2 text-amber-800 font-bold text-xs sm:text-sm">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>অ্যাক্টিভেশন রিকোয়ারমেন্ট:</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-normal">
                      এটা এক্টিভ করতে <strong className="text-red-600 font-black text-sm sm:text-base">৬০০ টাকা</strong> পেমেন্ট করতে হবে, দয়া করে সাপোর্ট টিমের সাথে কথা বলুন।
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-2">
                  <a
                    href="https://t.me/tkpay_BD"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold py-3.5 rounded-2xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-sm hover:shadow cursor-pointer no-underline"
                  >
                    <Headphones className="w-4 h-4" />
                    <span>সাপোর্ট টিমের সাথে কথা বলুন</span>
                  </a>

                  {!isAccountActive && (
                    <button
                      type="button"
                      onClick={() => setGatewayView('BDT_SUPPORT')}
                      className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold py-2.5 rounded-2xl text-xs transition flex items-center justify-center gap-2 border border-emerald-200 cursor-pointer"
                    >
                      <span>বিকাশ/নগদ TrxID সাবমিট করুন</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowGatewayModal(false)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-2xl text-xs sm:text-sm transition cursor-pointer"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              </div>
            ) : isSubmitted ? (
              /* SCREEN 2-SUCCESS: VERIFICATION SUBMITTED */
              <div className="p-6 text-center space-y-4 overflow-y-auto">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-900 text-base">পেমেন্ট ভেরিফিকেশন জমা হয়েছে!</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    আপনার ৬০০ টাকা পেমেন্ট ও TrxID তথ্য সফলভাবে পাওয়া গেছে। সাপোর্ট টিম দ্রুত যাচাই করে আপনার পেমেন্ট গেটওয়ে এক্টিভ করে দিবে।
                  </p>
                </div>

                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-left">
                  <div>
                    <p className="text-[11px] font-bold text-gray-800">টেলিগ্রাম সাপোর্ট</p>
                    <p className="font-mono text-xs font-bold text-blue-700">@tkpay_BD</p>
                  </div>
                  <a
                    href="https://t.me/tkpay_BD"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 bg-[#229ED9] hover:bg-[#1E88E5] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-2xs"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>মেসেজ দিন</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => setShowGatewayModal(false)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs shadow-sm transition cursor-pointer"
                >
                  ঠিক আছে (বন্ধ করুন)
                </button>
              </div>
            ) : (
              /* SCREEN 2-FORM: BDT PAYMENT & TELEGRAM DESIGN */
              <form onSubmit={handleBdtSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
                {/* Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl p-3.5 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">Telegram Official Support</p>
                    <h4 className="font-extrabold text-sm sm:text-base">বিকাশ / নগদ পেমেন্ট সাপোর্ট</h4>
                    <p className="text-[11px] text-blue-100">টেলিগ্রাম @tkpay_BD এর সাথে যোগাযোগ করে পেমেন্ট সম্পন্ন করুন</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Telegram Action Card */}
                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-gray-800">অফিসিয়াল টেলিগ্রাম:</p>
                      <p className="font-mono text-sm font-extrabold text-blue-700">@tkpay_BD</p>
                    </div>
                    <a
                      href="https://t.me/tkpay_BD"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-[#229ED9] hover:bg-[#1E88E5] text-white px-3.5 py-2 rounded-xl font-bold text-xs shadow-sm transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>টেলিগ্রামে যান</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-[11px] text-gray-600">
                    টেলিগ্রাম @tkpay_BD এ মেসেজ দিলে আমাদের টিম সরাসরি বিকাশ বা নগদ একাউন্ট নম্বর সরবরাহ করবে। ৬০০ টাকা পেমেন্ট সম্পন্ন করে নিচের ফর্মে TrxID প্রদান করুন।
                  </p>
                </div>

                {/* Amount Fee Box */}
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-gray-700 font-semibold">অ্যাক্টিভেশন ফি:</span>
                  <span className="text-red-600 font-black text-sm">৬০০ টাকা (600 BDT)</span>
                </div>

                {/* Inputs */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Sender Phone Number (প্রেরক বিকাশ/নগদ নাম্বার) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={bdtPhone}
                      onChange={e => setBdtPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Transaction ID (TrxID) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={bdtTrxId}
                      onChange={e => setBdtTrxId(e.target.value)}
                      placeholder="e.g. BL9A3XK2"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono uppercase focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setGatewayView('STATUS')}
                    className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                  >
                    Back (ফিরে যান)
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !bdtTrxId}
                    className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Verification (জমা দিন)'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      
      {/* Top Banner */}
      <div className={`rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex items-center justify-between ${
        isAccountActive 
          ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 text-white' 
          : 'bg-gradient-to-r from-red-600 via-rose-600 to-pink-700 text-white'
      }`}>
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold text-white/90 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Security & Verification Center</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {isAccountActive ? 'Verification & Services' : 'Inactive Gateway Services'}
          </h2>
          <p className="text-xs sm:text-sm text-white/90 max-w-xl font-medium">
            {isAccountActive 
              ? 'Complete your partnership verification to unlock higher transaction volume caps and advanced features.' 
              : 'The following advanced features and integrations are currently inactive. Complete verification to activate.'}
          </p>
        </div>
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-white/20 backdrop-blur-md border border-white/25 flex items-center justify-center shrink-0 shadow-lg relative z-10">
          {isAccountActive ? <ShieldCheck className="w-8 h-8 text-white" /> : <ShieldAlert className="w-8 h-8 text-white animate-bounce" />}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Partner Agents Verification Card (Top) */}
        <div 
          onClick={() => !isAccountActive && !isPartnerApproved && !isPartnerPending && setShowPartnershipForm(true)}
          className={`bg-white rounded-3xl shadow-sm border transition-all duration-300 relative overflow-hidden group flex flex-col justify-between ${
            isPartnerApproved 
              ? 'border-indigo-200/80 bg-gradient-to-b from-indigo-50/40 to-white shadow-md' 
              : isPartnerPending
              ? 'border-amber-200 bg-amber-50/20 cursor-default'
              : isAccountActive
              ? 'border-gray-200/80 opacity-70 cursor-not-allowed bg-gray-50/50'
              : 'border-gray-200/90 hover:shadow-xl hover:border-indigo-300 cursor-pointer hover:-translate-y-0.5'
          }`}
        >
          {/* Partner Banner Image */}
          <div className="relative h-40 w-full overflow-hidden bg-slate-100">
            <img 
              src="/partner_agent_banner.jpg" 
              alt="Partner Agents" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/20 to-transparent"></div>
            <div className="absolute top-3 right-3">
              <span className={`px-3 py-1 rounded-full font-bold text-xs tracking-wide shadow-md backdrop-blur-md ${
                isPartnerApproved ? 'bg-indigo-600/90 text-white' : isPartnerPending ? 'bg-amber-500/90 text-white' : 'bg-white/90 text-gray-900'
              }`}>
                {isPartnerApproved ? 'Approved ✓' : isPartnerPending ? 'রিভিউ চলছে ⏳' : 'Verify Now'}
              </span>
            </div>
            <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md backdrop-blur-md ${
                isPartnerApproved ? 'bg-indigo-600 text-white' : 'bg-white/90 text-indigo-700'
              }`}>
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-white drop-shadow-sm tracking-tight">
                Partner Agents
              </h3>
            </div>
          </div>

          <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
              আপনার সঠিক তথ্য সাবমিট করে অফিসিয়াল পার্টনার হিসেবে একাউন্ট এক্টিভ করুন।
            </p>

            <div className="pt-2">
              <button
                type="button"
                disabled={isAccountActive || isPartnerApproved || isPartnerPending}
                className={`w-full font-bold py-3.5 px-4 rounded-2xl text-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
                  isPartnerApproved
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 cursor-default'
                    : isPartnerPending
                    ? 'bg-amber-50 text-amber-800 border border-amber-200 cursor-default'
                    : isAccountActive
                    ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 cursor-pointer'
                }`}
              >
                <span>{isPartnerApproved ? 'Partner Approved' : isPartnerPending ? 'আবেদন রিভিউ করা হচ্ছে' : isAccountActive ? 'Account Active' : 'Submit Partner Verification'}</span>
                {!isPartnerApproved && !isPartnerPending && !isAccountActive && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* 2. Payment Gateway Use Card (Bottom) */}
        <div 
          onClick={openGatewayModal}
          className={`bg-white rounded-3xl shadow-sm border transition-all duration-300 relative overflow-hidden group flex flex-col justify-between ${
            isGatewayActive 
              ? 'border-emerald-200/80 bg-gradient-to-b from-emerald-50/40 to-white shadow-md cursor-default' 
              : 'border-gray-200/90 hover:shadow-xl hover:border-emerald-300 cursor-pointer hover:-translate-y-0.5'
          }`}
        >
          {/* Gateway Banner Image */}
          <div className="relative h-40 w-full overflow-hidden bg-slate-900">
            <img 
              src="/payment_gateway_banner.jpg" 
              alt="Payment Gateway Use" 
              className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent"></div>
            <div className="absolute top-3 right-3">
              <span className={`px-3 py-1 rounded-full font-bold text-xs tracking-wide shadow-md backdrop-blur-md ${
                isGatewayActive ? 'bg-emerald-600/90 text-white' : 'bg-rose-600/90 text-white'
              }`}>
                {isGatewayActive ? 'Active ✓' : 'Inactive ✕'}
              </span>
            </div>
            <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md backdrop-blur-md ${
                isGatewayActive ? 'bg-emerald-600 text-white' : 'bg-white/90 text-rose-600'
              }`}>
                <Server className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-white drop-shadow-sm tracking-tight">
                Payment Gateway Use
              </h3>
            </div>
          </div>

          <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
              Connect automated agent accounts for direct cash-in and cash-out processing with real-time callbacks.
            </p>

            <div className="pt-2">
              <button
                type="button"
                disabled={isGatewayActive}
                className={`w-full font-bold py-3.5 px-4 rounded-2xl text-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
                  isGatewayActive
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default'
                    : 'bg-gray-900 hover:bg-black text-white shadow-gray-200 cursor-pointer'
                }`}
              >
                <span>{isGatewayActive ? 'Gateway Configured' : 'Configure Payment Gateway'}</span>
                {!isGatewayActive && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
