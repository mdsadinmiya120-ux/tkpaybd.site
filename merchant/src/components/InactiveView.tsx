import React, { useState } from 'react';
import { ShieldAlert, Users, Server, ArrowRight, X, AlertTriangle, Headphones, ArrowLeft, MessageSquare, ExternalLink, CheckCircle2, ShieldCheck, Check, RotateCcw } from 'lucide-react';
import { PartnershipForm } from './PartnershipForm';
import { MerchantProfile } from '../types';

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
  const isAccountActive = Boolean(
    merchant.isActive === true && 
    merchant.status === 'Active' && 
    merchant.isApproved === true
  );

  const isPartnerApproved = Boolean(
    isAccountActive && 
    (merchant.isPartnerAgent === true || merchant.partnershipStatus === 'Approved')
  );

  const isGatewayActive = Boolean(
    isAccountActive && 
    merchant.accountType === 'Payment Gateway Use'
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
    // Simulation: In a real app, this would be an API call
    console.log('Submission:', { merchantId, bdtPhone, bdtTrxId });
    setTimeout(() => {
      setIsSubmitted(true);
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Partnership Request Modal */}
      {showPartnershipForm && (
        <PartnershipForm 
          merchantId={merchantId} 
          onClose={() => setShowPartnershipForm(false)} 
          onSubmit={(data) => {
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
            setShowPartnershipForm(false);
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
                    {gatewayView === 'BDT_SUPPORT' ? 'টেলিগ্রাম @tkpaybd12 এর সাথে যোগাযোগ' : 'একাউন্ট স্ট্যাটাস ও অ্যাক্টিভেশন'}
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
              /* SCREEN 1: STATUS & REQUIREMENT (Matching user screenshot) */
              <div className="p-6 space-y-4 text-center overflow-y-auto">
                {/* Box 1: Service Status "এক্টিভ না" */}
                <div className="w-full py-6 px-4 rounded-3xl border border-rose-200/90 bg-rose-50/40 flex flex-col items-center justify-center space-y-1.5 shadow-2xs">
                  <div className="inline-block px-4 py-1 rounded-full bg-rose-100/80 text-rose-800 font-bold text-xs tracking-wide">
                    সার্ভিস স্ট্যাটাস
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-red-600 tracking-wide pt-1 pb-0.5">
                    এক্টিভ না
                  </h2>
                  <p className="text-xs sm:text-sm text-rose-500 font-medium">
                    স্ট্যাটাস নির্দেশনা নিচে দেওয়া হলো
                  </p>
                </div>

                {/* Box 2: Activation Requirement Notice */}
                <div className="bg-amber-50/60 border border-amber-200/90 rounded-2xl p-4 text-left space-y-2 shadow-2xs">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs sm:text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>অ্যাক্টিভেশন রিকোয়ারমেন্ট:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-normal">
                    এটা এক্টিভ করতে <strong className="text-red-600 font-black text-sm sm:text-base">১৩৫০ টাকা</strong> পেমেন্ট করতে হবে, দয়া করে সাপোর্ট টিমের সাথে কথা বলুন।
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-2">
                  <a
                    href="https://t.me/tkpaybd12"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold py-3.5 rounded-2xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-sm hover:shadow cursor-pointer no-underline"
                  >
                    <Headphones className="w-4 h-4" />
                    <span>সাপোর্ট টিমের সাথে কথা বলুন</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setGatewayView('BDT_SUPPORT')}
                    className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold py-2.5 rounded-2xl text-xs transition flex items-center justify-center gap-2 border border-emerald-200 cursor-pointer"
                  >
                    <span>বিকাশ/নগদ TrxID সাবমিট করুন</span>
                  </button>

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
                    আপনার ১৩৫০ টাকা পেমেন্ট ও TrxID তথ্য সফলভাবে পাওয়া গেছে। সাপোর্ট টিম দ্রুত যাচাই করে আপনার পেমেন্ট গেটওয়ে এক্টিভ করে দিবে।
                  </p>
                </div>

                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-left">
                  <div>
                    <p className="text-[11px] font-bold text-gray-800">টেলিগ্রাম সাপোর্ট</p>
                    <p className="font-mono text-xs font-bold text-blue-700">@tkpaybd12</p>
                  </div>
                  <a
                    href="https://t.me/tkpaybd12"
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
                    <p className="text-[11px] text-blue-100">টেলিগ্রাম @tkpaybd12 এর সাথে যোগাযোগ করে পেমেন্ট সম্পন্ন করুন</p>
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
                      <p className="font-mono text-sm font-extrabold text-blue-700">@tkpaybd12</p>
                    </div>
                    <a
                      href="https://t.me/tkpaybd12"
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
                    টেলিগ্রাম @tkpaybd12 এ মেসেজ দিলে আমাদের টিম সরাসরি বিকাশ বা নগদ একাউন্ট নম্বর সরবরাহ করবে। ১৩৫০ টাকা পেমেন্ট সম্পন্ন করে নিচের ফর্মে TrxID প্রদান করুন।
                  </p>
                </div>

                {/* Amount Fee Box */}
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-gray-700 font-semibold">অ্যাক্টিভেশন ফি:</span>
                  <span className="text-red-600 font-black text-sm">১৩৫০ টাকা (1,350 BDT)</span>
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
      <div className={`rounded-2xl p-6 shadow-md flex items-center justify-between ${
        isAccountActive 
          ? 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white' 
          : 'bg-gradient-to-r from-red-600 to-rose-700 text-white'
      }`}>
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {isAccountActive ? 'Verification & Services' : 'Inactive Gateway Services'}
          </h2>
          <p className="text-xs sm:text-sm opacity-90">
            {isAccountActive 
              ? 'Complete your partnership verification to unlock more features.' 
              : 'The following advanced features and integrations are currently inactive.'}
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
          {isAccountActive ? <ShieldCheck className="w-7 h-7 text-white" /> : <ShieldAlert className="w-7 h-7 text-white" />}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 1. Payment Gateway Use Card */}
        <div 
          onClick={openGatewayModal}
          className={`bg-white rounded-2xl p-4 sm:p-5 shadow-sm border transition space-y-3 relative overflow-hidden ${
            isGatewayActive 
              ? 'border-emerald-100 hover:border-emerald-200 cursor-default' 
              : 'border-gray-100 hover:shadow-md hover:border-gray-200 cursor-pointer'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-2xs ${
              isGatewayActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              <Server className="w-5 h-5" />
            </div>
            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
              isGatewayActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}>
              {isGatewayActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Payment Gateway Use</h3>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Connect automated agent accounts for direct cash-in and cash-out processing with real-time callbacks.
            </p>
          </div>

          <div className="pt-1">
            <button
              type="button"
              disabled={isGatewayActive}
              className={`w-full font-bold py-2.5 rounded-xl text-[10px] transition flex items-center justify-center gap-2 border ${
                isGatewayActive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200 cursor-pointer'
              }`}
            >
              <span>{isGatewayActive ? 'Gateway Configured' : 'Configure Payment Gateway'}</span>
              {!isGatewayActive && <ArrowRight className="w-3.5 h-3.5 text-gray-500" />}
            </button>
          </div>
        </div>

        {/* 2. Partner Agent Verification Card */}
        <div 
          onClick={() => !isPartnerApproved && setShowPartnershipForm(true)}
          className={`bg-white rounded-2xl p-4 sm:p-5 shadow-sm border transition space-y-3 relative overflow-hidden ${
            isPartnerApproved 
              ? 'border-indigo-100 hover:border-indigo-200 cursor-default' 
              : 'border-gray-100 hover:shadow-md hover:border-gray-200 cursor-pointer'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-2xs ${
              isPartnerApproved ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
            }`}>
              <Users className="w-5 h-5" />
            </div>
            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
              isPartnerApproved ? 'bg-indigo-100 text-indigo-700' : isPartnerPending ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {isPartnerApproved ? 'Approved' : isPartnerPending ? 'Pending' : 'Verify Now'}
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Partner Agents Verify</h3>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Apply to become an official Partner Agent to manage sub-merchants and earn higher commissions.
            </p>
          </div>

          <div className="pt-1">
            <button
              type="button"
              disabled={isPartnerApproved || isPartnerPending}
              className={`w-full font-bold py-2.5 rounded-xl text-[10px] transition flex items-center justify-center gap-2 border ${
                isPartnerApproved
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                  : isPartnerPending
                  ? 'bg-amber-50 text-amber-700 border-amber-100'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 cursor-pointer'
              }`}
            >
              <span>{isPartnerApproved ? 'Partner Approved' : isPartnerPending ? 'Pending Verification' : 'Start Verification'}</span>
              {!isPartnerApproved && !isPartnerPending && <ArrowRight className="w-3.5 h-3.5 text-white" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
