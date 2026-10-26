import React, { useState } from 'react';
import { X, Upload, Copy, Check, ArrowLeft, ShieldCheck, QrCode, AlertCircle, MessageSquare, ExternalLink } from 'lucide-react';


interface PartnershipFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  merchantId: string;
}

export const PartnershipForm: React.FC<PartnershipFormProps> = ({ onClose, onSubmit, merchantId }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [paymentMethod, setPaymentMethod] = useState<'NONE' | 'BDT' | 'USDT'>('NONE');
  
  // Step 1 Form Data
  const [formData, setFormData] = useState({
    name: '',
    nidNumber: '',
    phone: '',
    whatsapp: '',
    nidFirstPart: null as File | null,
    nidSecondPart: null as File | null
  });

  // Step 3 Payment Verification State
  const usdtGatewayAddress = 'TMBXHoZLCUjQzeFvcQTWpbRU46VHDMqWsm';
  const [copied, setCopied] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [senderWallet, setSenderWallet] = useState('');
  const [usdtAmount, setUsdtAmount] = useState('26');
  
  // BDT Form State
  const [bdtPhone, setBdtPhone] = useState('');
  const [bdtTrxId, setBdtTrxId] = useState('');

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFirstStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(usdtGatewayAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'USDT' && (parseFloat(usdtAmount) < 26 || isNaN(parseFloat(usdtAmount)))) {
      alert('সর্বনিম্ন ডিপোজিট ২৬ ডলার।');
      return;
    }
    setIsSubmitting(true);

    // Simulation: In a real app, this would be an API call
    console.log('Partnership submission:', {
      name: formData.name,
      nidNumber: formData.nidNumber,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      merchantId,
      paymentMethod,
      submittedAt: new Date().toISOString()
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      if (onSubmit) {
        onSubmit({
          name: formData.name,
          nidNumber: formData.nidNumber,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          merchantId,
          paymentMethod,
          status: 'Pending Verification',
          submittedAt: new Date().toISOString()
        });
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gradient-to-r from-gray-50 via-white to-gray-50">
          <div className="flex items-center gap-2">
            {step === 3 && paymentMethod !== 'NONE' && !isSuccess && (
              <button 
                type="button" 
                onClick={() => setPaymentMethod('NONE')}
                className="p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg cursor-pointer transition"
                title="Back to payment options"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">
              {isSuccess 
                ? 'Payment Verification Submitted' 
                : step === 1 
                  ? 'Partnership Request (ধাপ ১)' 
                  : step === 2 
                    ? 'Security Fee & Activation Rules (ধাপ ২)' 
                    : paymentMethod === 'USDT'
                      ? 'USDT Payment Gateway (টিআরসি ২০)'
                      : paymentMethod === 'BDT'
                        ? 'BDT Payment Gateway'
                        : 'Select Payment Method (ধাপ ৩)'}
            </h3>
          </div>

          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {isSuccess ? (
          /* SUCCESS SCREEN */
          <div className="p-6 text-center space-y-4 overflow-y-auto flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-bold text-gray-900">
                পেমেন্ট তথ্য সফলভাবে জমা হয়েছে!
              </h4>
              <p className="text-xs text-gray-500 max-w-sm">
                আপনার দেওয়া <span className="font-semibold text-gray-700">{paymentMethod}</span> পেমেন্ট ও এনআইডি তথ্য অ্যাডমিন টিম ভেরিফিকেশন শুরু করেছে।
              </p>
            </div>

            <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Method:</span>
                <span className="font-bold text-gray-800">{paymentMethod}</span>
              </div>
              {paymentMethod === 'USDT' && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount:</span>
                    <span className="font-bold text-emerald-600">{usdtAmount} USDT</span>
                  </div>
              )}
              {paymentMethod === 'BDT' && (
                <div className="flex justify-between">
                  <span className="text-gray-500">TrxID:</span>
                  <span className="font-mono text-gray-800">{bdtTrxId}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t border-gray-200">
                <span className="text-gray-500">Status:</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                  Pending Review (১-৩ ঘণ্টা)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
            >
              ঠিক আছে (Done)
            </button>
          </div>
        ) : step === 1 ? (
          /* STEP 1: FORM INPUTS */
          <form onSubmit={handleFirstStepSubmit} className="p-4 space-y-2.5 overflow-y-auto flex-1">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-0.5">Name (এনআইডি কার্ড অনুযায়ী নাম)</label>
              <input 
                type="text" 
                required 
                value={formData.name}
                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none" 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                placeholder="NID কার্ডের পুরো নাম লিখুন"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-0.5">NID Number (এনআইডি কার্ড নাম্বার)</label>
              <input 
                type="text" 
                required 
                value={formData.nidNumber}
                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none" 
                onChange={e => setFormData({...formData, nidNumber: e.target.value})} 
                placeholder="১০ বা ১৭ ডিজিটের এনআইডি নাম্বার"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-0.5">Personal Number (পার্সোনাল নাম্বার)</label>
              <input 
                type="tel" 
                required 
                value={formData.phone}
                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none" 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
                placeholder="01XXXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-0.5">WhatsApp Number (ঐচ্ছিক)</label>
              <input 
                type="tel" 
                value={formData.whatsapp}
                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none" 
                onChange={e => setFormData({...formData, whatsapp: e.target.value})} 
                placeholder="হোয়াটসঅ্যাপ থাকলে নাম্বারটি দিন"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-0.5">NID Card Image (এনআইডি কার্ডের ছবি)</label>
              
              {/* First Part */}
              <label className="flex flex-col items-center gap-1 border border-dashed border-gray-300 rounded-lg px-2 py-2 text-xs text-gray-500 cursor-pointer hover:bg-gray-50 mb-1.5 transition">
                <Upload className="w-4 h-4 text-indigo-500" />
                <span className="text-[11px] font-medium">{formData.nidFirstPart ? formData.nidFirstPart.name : 'First Part (প্রথম পার্ট আপলোড করুন)'}</span>
                {formData.nidFirstPart && <img src={URL.createObjectURL(formData.nidFirstPart)} alt="NID Front Preview" className="mt-0.5 max-h-12 rounded object-cover shadow-2xs" />}
                <span className="text-[9px] text-gray-400">একটি স্পষ্ট ছবি দিন</span>
                <input type="file" required className="hidden" accept="image/*" onChange={e => setFormData({...formData, nidFirstPart: e.target.files ? e.target.files[0] : null})} />
              </label>

              {/* Second Part */}
              {formData.nidFirstPart && (
                <label className="flex flex-col items-center gap-1 border border-dashed border-gray-300 rounded-lg px-2 py-2 text-xs text-gray-500 cursor-pointer hover:bg-gray-50 transition">
                  <Upload className="w-4 h-4 text-indigo-500" />
                  <span className="text-[11px] font-medium">{formData.nidSecondPart ? formData.nidSecondPart.name : 'Second Part (দ্বিতীয় পার্ট আপলোড করুন)'}</span>
                  {formData.nidSecondPart && <img src={URL.createObjectURL(formData.nidSecondPart)} alt="NID Back Preview" className="mt-0.5 max-h-12 rounded object-cover shadow-2xs" />}
                  <span className="text-[9px] text-gray-400">একটি স্পষ্ট ছবি দিন</span>
                  <input type="file" required className="hidden" accept="image/*" onChange={e => setFormData({...formData, nidSecondPart: e.target.files ? e.target.files[0] : null})} />
                </label>
              )}
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer shrink-0 shadow-sm hover:shadow"
            >
              Submit & Proceed (পরবর্তী ধাপে যান)
            </button>
          </form>
        ) : step === 2 ? (
          /* STEP 2: RULES AND CONDITIONS */
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs text-gray-800 leading-relaxed">
            <p><strong>প্রিয় গ্রাহক,</strong> আমাদের ওপর আস্থা রাখার জন্য আপনাকে ধন্যবাদ। আপনার প্রদত্ত সকল তথ্যের সুরক্ষা নিশ্চিত করা আমাদের সর্বোচ্চ অগ্রাধিকার। আমাদের প্ল্যাটফর্মে আপনার যাবতীয় তথ্য সম্পূর্ণ নিরাপদ থাকবে।</p>
            
            <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/60 space-y-2">
              <p className="font-bold text-amber-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                একাউন্ট অ্যাক্টিভেশন ও সিকিউরিটি ফি সংক্রান্ত নিয়মাবলী:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-amber-950/90 text-[11px]">
                <li><strong>সিকিউরিটি ফি রিফান্ডযোগ্য:</strong> একাউন্ট অ্যাক্টিভ করার জন্য যে সিকিউরিটি ফি জমা দিচ্ছেন, তা সম্পূর্ণ ফেরতযোগ্য (Refundable)। আপনি যদি পরবর্তীতে আর কাজ না করতে চান, তবে যেকোনো সময় এই ফি তুলে নিতে পারবেন।</li>
                <li><strong>রিফান্ড প্রসেসিং সময়:</strong> উইথড্র বা রিফান্ড রিকোয়েস্ট পাঠানোর পর প্রক্রিয়াকরণের জন্য সর্বোচ্চ ৭২ ঘণ্টা পর্যন্ত অপেক্ষা করতে হতে পারে।</li>
                <li><strong>ভবিষ্যৎ সুযোগ-সুবিধা:</strong> আমাদের সাথে সততা ও নিষ্ঠার সাথে কাজ করলে আপনার কাজের পরিধি এবং উপার্জনের সুযোগ আরও বৃদ্ধি পাবে।</li>
              </ul>
            </div>
            
            <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-200/60 space-y-2">
              <p className="font-bold text-indigo-900">কমিশন কাঠামো ও কাজের নিয়ম:</p>
              <ul className="list-disc pl-4 space-y-1 text-indigo-950/90 text-[11px]">
                <li><strong>বর্তমান কমিশন হার:</strong> বর্তমানে আমাদের Payin ১৫% এবং Payout ৬% — অর্থাৎ সর্বমোট ২১% কমিশন প্রদান করা হয়।</li>
                <li><strong>কমিশন হিসাবের সময়:</strong> প্রতিদিনের সমস্ত কাজের কমিশন ও হিসাব-নিকাশ রাত ১১:০০ টার পর সম্পন্ন করা হয়।</li>
                <li><strong>ডলার কনভার্সন:</strong> দিনশেষে আপনার অর্জিত কমিশনের অংশ রেখে বাকি অর্থ আমাদের নির্ধারিত নিয়মে ডলারে (USDT) কনভার্ট করে হস্তান্তর করতে হবে।</li>
              </ul>
            </div>
            
            <div className="space-y-1 text-[11px]">
              <p className="font-bold text-gray-900">পেমেন্ট ও অ্যাক্টিভেশন পদ্ধতি:</p>
              <p className="text-gray-600">আপনি যদি ওপরের সকল শর্তাবলীতে সম্মত থাকেন, তবে সিকিউরিটি ফি জমা দিয়ে আপনার একাউন্টটি অ্যাক্টিভ করতে পারেন:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-gray-700">
                <li><strong>USDT-এর মাধ্যমে:</strong> আপনি নিজে নিজেই সরাসরি USDT ব্যবহার করে একাউন্ট অ্যাক্টিভ করতে পারবেন।</li>
                <li><strong>BDT (টাকা)-এর মাধ্যমে:</strong> বিকাশের মাধ্যমে পেমেন্ট করে একাউন্ট অ্যাক্টিভ করতে চাইলে অবশ্যই আগে আমাদের কাস্টমার সার্ভিসের সাথে যোগাযোগ করুন।</li>
              </ul>
            </div>

            <p className="text-[11px] text-gray-600">আপনার সুন্দর ও সফল ভবিষ্যতের প্রত্যাশায়,<br/><strong className="text-indigo-600">[TkpayBD]</strong></p>
            
            <button 
              type="button"
              onClick={() => setStep(3)} 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs sm:text-sm transition cursor-pointer shrink-0 shadow-md hover:shadow-lg"
            >
              I Agree & Submit Request (সম্মত হয়ে পেমেন্টে যান)
            </button>
          </div>
        ) : paymentMethod === 'NONE' ? (
          /* STEP 3A: SELECT PAYMENT METHOD */
          <div className="p-6 space-y-6 overflow-y-auto flex-1 flex flex-col items-center justify-center">
            <div className="text-center space-y-1">
              <p className="font-bold text-base text-gray-900">পেমেন্ট মেথড নির্বাচন করুন</p>
              <p className="text-xs text-gray-500">Select your preferred payment method</p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              {/* BDT Option -> Telegram Link */}
              <a 
                href="https://t.me/tkpaybd12" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => setPaymentMethod('BDT')} 
                className="flex flex-col items-center justify-center gap-3 p-5 border-2 border-emerald-300 bg-emerald-50/20 rounded-2xl hover:border-emerald-600 hover:bg-emerald-50/40 transition cursor-pointer group shadow-2xs text-center no-underline"
              >
                <img src="https://flagcdn.com/bd.svg" alt="BDT" className="w-14 h-10 object-cover rounded shadow-xs group-hover:scale-105 transition" />
                <div className="text-center">
                  <span className="font-bold text-base text-gray-900 block">BDT</span>
                  <span className="text-[11px] text-emerald-700 font-semibold block">বিকাশ / নগদ</span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 font-bold mt-1.5 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                    <MessageSquare className="w-2.5 h-2.5" /> @tkpaybd12 <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              </a>

              {/* USDT Option */}
              <button 
                type="button"
                onClick={() => setPaymentMethod('USDT')} 
                className="flex flex-col items-center gap-3 p-5 border-2 border-gray-200 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50/20 transition cursor-pointer group shadow-2xs"
              >
                <img src="https://flagcdn.com/cn.svg" alt="USDT" className="w-14 h-10 object-cover rounded shadow-xs group-hover:scale-105 transition" />
                <div className="text-center">
                  <span className="font-bold text-base text-gray-900 block">USDT</span>
                  <span className="text-[11px] text-emerald-600 font-semibold">TRC20 (Direct)</span>
                </div>
              </button>
            </div>
          </div>
        ) : paymentMethod === 'USDT' ? (
          /* STEP 3B: BEAUTIFUL USDT PAYMENT GATEWAY FORMAT */
          <form onSubmit={handlePaymentSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
            
            {/* Banner & Network */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl p-3.5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">Gateway Protocol</p>
                <h4 className="font-extrabold text-sm sm:text-base tracking-wide">USDT (TRC20 / TRON Network)</h4>
                <p className="text-[11px] text-emerald-100">API Management Active • Instant Tracking</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                <QrCode className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Official Wallet Address Box */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                  Payment Wallet Address (টিআরসি ২০)
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Verified Gateway
                </span>
              </div>

              <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-2 shadow-2xs">
                <code className="text-[11px] font-mono text-gray-900 break-all select-all flex-1 font-semibold leading-relaxed">
                  {usdtGatewayAddress}
                </code>
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-md text-xs flex items-center gap-1 shrink-0 transition cursor-pointer border border-indigo-200"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-amber-700 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                <span>শুধুমাত্র TRC20 নেটওয়ার্কের USDT সেন্ড করবেন। অন্য কোনো কয়েন সেন্ড করবেন না।</span>
              </p>
            </div>

            {/* Verification Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Amount Sent (USDT) (সর্বনিম্ন ২৬ ডলার) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="26"
                  value={usdtAmount}
                  onChange={e => setUsdtAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold text-gray-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('NONE')}
                className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                Back (ফিরে যান)
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Verifying...' : 'Submit Verification (যাচাইয়ের জন্য পাঠান)'}
              </button>
            </div>
          </form>
        ) : (
          /* STEP 3C: BDT / TELEGRAM ASSISTANCE */
          <form onSubmit={handlePaymentSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
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
                টেলিগ্রাম @tkpaybd12 এ মেসেজ দিলে আমাদের টিম সরাসরি বিকাশ বা নগদ একাউন্ট নম্বর সরবরাহ করবে। পেমেন্ট শেষ হলে TrxID নিচে দিন।
              </p>
            </div>

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

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('NONE')}
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
  );
};
