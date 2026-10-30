import React, { useState, useEffect } from 'react';
import { 
  Copy, 
  Check, 
  ArrowLeft, 
  Smartphone, 
  Banknote, 
  ShoppingBag, 
  PlusCircle, 
  Lightbulb, 
  PiggyBank, 
  HeartHandshake, 
  Search, 
  X,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import { BKASH_LOGO_URL, ROCKET_LOGO_URL, NAGAD_LOGO_URL } from '../constants/logos';
import { getWalletDetailsForMethod, syncMerchantNumbersFromFirebase } from '../utils/wallet';

interface CheckoutViewProps {
  transactionId: string;
  amount: number;
  merchantName: string;
  merchantId?: string;
  method?: 'bKash' | 'Nagad' | 'Rocket';
  onPaymentSubmit?: (txId: string, submittedTrxId: string) => void;
  onPaymentSuccess?: (txId: string) => void;
  onBackToDashboard: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  transactionId,
  amount,
  merchantName,
  merchantId,
  method = 'bKash',
  onPaymentSubmit,
  onPaymentSuccess,
  onBackToDashboard
}) => {
  const [currentMethod, setCurrentMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>(method);
  const [trxId, setTrxId] = useState('');
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [inputError, setInputError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Determine effective merchantId from prop, URL parameter, or existing transaction
  const effectiveMerchantId = React.useMemo(() => {
    if (merchantId) return merchantId;
    try {
      const params = new URLSearchParams(window.location.search);
      const urlM = params.get('m') || params.get('merchant') || params.get('merchantId');
      if (urlM) return urlM;

      const savedTx = localStorage.getItem('chaopaopay_transactions');
      if (savedTx) {
        const list = JSON.parse(savedTx);
        const match = list.find((t: any) => t.transactionId === transactionId);
        if (match && match.merchantId) return match.merchantId;
      }
    } catch (e) {}
    return '';
  }, [merchantId, transactionId]);

  // Persistent assigned wallet number locked per transactionId and payment method
  const [assignedWallet, setAssignedWallet] = useState<string>(() => {
    const lockKey = `chaopaopay_assigned_wallet_${transactionId}_${method}`;
    try {
      // 1. Check method-specific lock key in localStorage
      const locked = localStorage.getItem(lockKey);
      if (locked) return locked;

      // 2. Check transaction record in localStorage
      const savedTx = localStorage.getItem('chaopaopay_transactions');
      if (savedTx) {
        const list = JSON.parse(savedTx);
        const match = list.find((t: any) => t.transactionId === transactionId);
        if (match && match.walletNumber && (!match.method || match.method === method)) {
          localStorage.setItem(lockKey, match.walletNumber);
          return match.walletNumber;
        }
      }
    } catch (e) {}

    // 3. Fallback: Pick a random valid wallet number for this method & merchant and lock it
    const details = getWalletDetailsForMethod(method, effectiveMerchantId);
    const chosen = details.number || '';
    if (chosen) {
      try {
        localStorage.setItem(lockKey, chosen);
        const savedTx = localStorage.getItem('chaopaopay_transactions');
        if (savedTx) {
          const list = JSON.parse(savedTx);
          const updated = list.map((t: any) => {
            if (t.transactionId === transactionId) {
              return { ...t, walletNumber: chosen, method };
            }
            return t;
          });
          localStorage.setItem('chaopaopay_transactions', JSON.stringify(updated));
        }
      } catch (e) {}
    }
    return chosen;
  });

  // Sync / update wallet when currentMethod changes or background updates happen
  useEffect(() => {
    const lockKey = `chaopaopay_assigned_wallet_${transactionId}_${currentMethod}`;
    try {
      const locked = localStorage.getItem(lockKey);
      if (locked) {
        setAssignedWallet(locked);
        return;
      }
    } catch (e) {}

    // Pick a valid random number for currentMethod and lock it permanently
    const details = getWalletDetailsForMethod(currentMethod, effectiveMerchantId);
    const chosen = details.number || '';
    if (chosen) {
      try {
        localStorage.setItem(lockKey, chosen);
        const savedTx = localStorage.getItem('chaopaopay_transactions');
        if (savedTx) {
          const list = JSON.parse(savedTx);
          const updated = list.map((t: any) => {
            if (t.transactionId === transactionId) {
              return { ...t, walletNumber: chosen, method: currentMethod };
            }
            return t;
          });
          localStorage.setItem('chaopaopay_transactions', JSON.stringify(updated));
        }
      } catch (e) {}
    }
    setAssignedWallet(chosen);
  }, [currentMethod, transactionId, effectiveMerchantId]);

  useEffect(() => {
    if (effectiveMerchantId) {
      syncMerchantNumbersFromFirebase(effectiveMerchantId).catch(() => {});
    }
  }, [effectiveMerchantId]);

  const walletNumber = assignedWallet;

  const walletInfo = React.useMemo(() => {
    const details = getWalletDetailsForMethod(currentMethod, effectiveMerchantId);
    return {
      number: walletNumber,
      label: details.label || 'Personal',
      count: details.count || 1
    };
  }, [currentMethod, effectiveMerchantId, walletNumber]);

  const isBkash = currentMethod === 'bKash';
  const isNagad = currentMethod === 'Nagad';
  const isRocket = currentMethod === 'Rocket';

  const handleCopy = () => {
    navigator.clipboard.writeText(walletNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setInputError('');
    if (!trxId.trim()) {
      setInputError(lang === 'bn' ? 'TrxID অবশ্যই পূরণ করতে হবে!' : 'TrxID is required!');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setIsSuccess(true);

      // Save walletNumber to transaction in localStorage
      try {
        const savedTx = localStorage.getItem('chaopaopay_transactions');
        if (savedTx) {
          const list = JSON.parse(savedTx);
          const updated = list.map((t: any) => {
            if (t.transactionId === transactionId) {
              return { ...t, walletNumber, method: currentMethod };
            }
            return t;
          });
          localStorage.setItem('chaopaopay_transactions', JSON.stringify(updated));
        }
      } catch (e) {}

      if (onPaymentSubmit) {
        onPaymentSubmit(transactionId, trxId);
      } else if (onPaymentSuccess) {
        onPaymentSuccess(transactionId);
      }
    }, 1200);
  };

  const formatAmount = (val: number) => {
    return `BDT ${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col items-center py-3 sm:py-6 px-2 sm:px-4 font-sans text-gray-800 relative">
      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-gray-100">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-lg">পেমেন্ট বাতিল করতে চান?</h3>
              <p className="text-xs text-gray-500 mt-1">
                আপনি যদি বাতিল করেন, এই পেমেন্ট সেশনটি বন্ধ হয়ে যাবে এবং আপনি ড্যাশবোর্ডে ফিরে যাবেন।
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowCancelModal(false);
                  onBackToDashboard();
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer active:scale-95 shadow-2xs"
              >
                হ্যাঁ, বাতিল করুন
              </button>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
              >
                না, চালিয়ে যান
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200/90">
        
        {/* Top Dark Green Banner matching screenshot header with Cancel button */}
        <div className="bg-[#0e6d44] text-white px-5 py-4 flex items-center justify-between shadow-xs">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">{formatAmount(amount)}</h2>
            <p className="text-xs text-emerald-100 font-medium mt-0.5">
              {lang === 'bn' ? 'কম বা বেশি ক্যাশআউট করবেন না' : 'Do not cash out more or less'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-md text-xs font-bold tracking-wider">
              <span className="bg-white text-[#0e6d44] px-1.5 py-0.5 rounded text-[10px] font-black">PAY</span>
              <span>SERVICE</span>
            </div>
            
            {/* Language Switch */}
            <div className="flex items-center bg-white/20 rounded-md p-0.5 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-1.5 py-0.5 rounded transition ${lang === 'en' ? 'bg-white text-emerald-900 font-extrabold shadow-xs' : 'text-white'}`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('bn')}
                className={`px-1.5 py-0.5 rounded transition ${lang === 'bn' ? 'bg-white text-emerald-900 font-extrabold shadow-xs' : 'text-white'}`}
              >
                বাং
              </button>
            </div>

            {/* Header Direct Cancel Button */}
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="বাতিল করুন (Cancel)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Red Warning Alert Text matching screenshot */}
        <div className="p-4 pb-2">
          <p className="text-xs sm:text-[13px] text-red-600 font-bold leading-relaxed text-left">
            {lang === 'bn' 
              ? `আপনি যদি টাকার পরিমাণ পরিবর্তন করেন (${formatAmount(amount)}), আপনি ক্রেডিট পেতে সক্ষম হবেন না।`
              : `If you change the amount (${formatAmount(amount)}), you will not be able to receive credit.`}
          </p>
        </div>

        {isSuccess ? (
          /* SUCCESS SCREEN */
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-lg text-gray-900">
              {lang === 'bn' ? 'পেমেন্ট রিকোয়েস্ট জমা হয়েছে!' : 'Payment Request Submitted!'}
            </h3>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-left text-xs text-emerald-900 space-y-1.5 shadow-2xs">
              <p className="font-bold text-emerald-950">
                {lang === 'bn' ? 'স্ট্যাটাস: Pending (অপেক্ষমান)' : 'Status: Pending (Under Review)'}
              </p>
              <p className="text-[12px] text-emerald-800 leading-relaxed">
                {lang === 'bn' 
                  ? `আপনার TrxID (${trxId}) গ্রহণ করা হয়েছে। এডমিন প্যানেল থেকে যাচাই করে অনুমোদন করার পর আপনার অ্যাকাউন্টে ব্যালেন্স যুক্ত হবে।` 
                  : `Your TrxID (${trxId}) has been received. Balance will be credited once approved by Admin.`}
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={onBackToDashboard}
                className="w-full bg-[#0e6d44] hover:bg-[#0b5837] text-white font-bold py-3.5 rounded-2xl text-xs transition shadow-md cursor-pointer"
              >
                {lang === 'bn' ? 'ড্যাশবোর্ডে ফিরে যান' : 'Return to Dashboard'}
              </button>
            </div>
          </div>
        ) : (
          /* MAIN FORM SCREEN MATCHING EXACT SCREENSHOT */
          <div className="p-4 space-y-4">
            {/* Payment Provider Header Banner */}
            <div>
              <div className={`p-4 rounded-2xl text-white font-bold flex items-center justify-between shadow-md ${
                isBkash 
                  ? 'bg-[#c20058]' :
                isNagad 
                  ? 'bg-gradient-to-r from-[#ea580c] to-[#f97316]' :
                  'bg-gradient-to-r from-purple-700 to-indigo-800'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-0.5 shadow-inner shrink-0 overflow-hidden">
                    {isBkash ? (
                      <img 
                        src={BKASH_LOGO_URL} 
                        alt="bKash" 
                        className="w-full h-full object-cover" 
                      />
                    ) : isNagad ? (
                      <img 
                        src={NAGAD_LOGO_URL} 
                        alt="Nagad" 
                        className="w-8 h-8 object-contain" 
                      />
                    ) : isRocket ? (
                      <img 
                        src={ROCKET_LOGO_URL} 
                        alt="Rocket" 
                        className="w-full h-full object-contain" 
                      />
                    ) : (
                      <span className="font-extrabold text-sm text-[#ea580c]">
                        {currentMethod}
                      </span>
                    )}
                  </div>
                  <span className="text-base sm:text-lg font-black tracking-wide uppercase">
                    {currentMethod} Deposit
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] bg-white/20 px-2 py-0.5 rounded-lg">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </div>
              </div>
            </div>

            {/* Wallet No Section - Clean and without internal rotation debug text */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-gray-900 text-sm sm:text-base">
                  <span>Wallet No</span>
                  <span className="text-red-500">*</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                    walletInfo.label === 'Agent' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {walletInfo.label}
                  </span>
                </div>
              </div>
              
              <p className="text-xs sm:text-[13px] text-gray-800 leading-snug font-normal">
                এই {isBkash ? 'বিকাশ' : isNagad ? 'নগদ' : 'রকেট'} {walletInfo.label === 'Agent' ? 'এজেন্ট' : 'পার্সোনাল'} অ্যাকাউন্টে অর্থ প্রদান করতে <strong className="text-red-600 font-extrabold">{walletInfo.label === 'Agent' ? 'ক্যাশ আউট (Cash Out)' : 'সেন্ড মানি (Send Money)'}</strong> ব্যবহার করুন
              </p>

              {/* Number Box with Copy Button */}
              <div className="flex items-center justify-between p-3.5 bg-[#f8f9fa] border border-gray-200/90 rounded-2xl shadow-2xs mt-1">
                <span className="font-mono font-black text-lg sm:text-xl text-gray-900 tracking-wider">
                  {walletNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 rounded-xl text-emerald-600 hover:bg-emerald-50 active:scale-95 transition cursor-pointer flex items-center gap-1"
                  title="Copy Wallet Number"
                >
                  {copied ? (
                    <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-1">
                      <Check className="w-5 h-5 text-emerald-600 stroke-[3]" /> কপি হয়েছে
                    </span>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                      <Copy className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* bKash App Menu Illustration Grid (8 Icons) matching exact screenshot */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-3 sm:p-4 shadow-2xs space-y-3">
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] sm:text-[11px]">
                
                {/* 1. সেন্ড মানি */}
                <div className={`p-1.5 flex flex-col items-center justify-center rounded-2xl ${
                  walletInfo.label === 'Personal' 
                    ? 'border-2 border-red-500 bg-red-50/50 shadow-xs' 
                    : 'opacity-80'
                }`}>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-pink-50 border border-pink-100 text-pink-600 flex items-center justify-center mb-1 font-bold text-xs">
                    ৳
                  </div>
                  <span className={`${walletInfo.label === 'Personal' ? 'text-gray-900 font-black' : 'text-gray-600 font-medium'}`}>
                    সেন্ড মানি
                  </span>
                </div>

                {/* 2. মোবাইল রিচার্জ */}
                <div className="p-1.5 flex flex-col items-center justify-center opacity-80">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-1">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <span className="text-gray-600 font-medium">মোবাইল রিচার্জ</span>
                </div>

                {/* 3. ক্যাশ আউট (HIGHLIGHTED WITH RED BORDER BOX WHEN AGENT) */}
                <div className={`p-1 flex flex-col items-center justify-center rounded-2xl ${
                  walletInfo.label === 'Agent' 
                    ? 'border-2 border-red-500 bg-red-50/50 shadow-xs' 
                    : 'opacity-80'
                }`}>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center mb-1 shadow-2xs">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <span className={`${walletInfo.label === 'Agent' ? 'text-gray-900 font-black' : 'text-gray-600 font-medium'} text-[10px] sm:text-[11px]`}>
                    ক্যাশ আউট
                  </span>
                </div>

                {/* 4. পেমেন্ট */}
                <div className="p-1.5 flex flex-col items-center justify-center opacity-80">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mb-1">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <span className="text-gray-600 font-medium">পেমেন্ট</span>
                </div>

                {/* 5. অ্যাড মানি */}
                <div className="p-1.5 flex flex-col items-center justify-center opacity-80">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-1">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <span className="text-gray-600 font-medium">অ্যাড মানি</span>
                </div>

                {/* 6. পে বিল */}
                <div className="p-1.5 flex flex-col items-center justify-center opacity-80">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-yellow-50 border border-yellow-100 text-yellow-600 flex items-center justify-center mb-1">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <span className="text-gray-600 font-medium">পে বিল</span>
                </div>

                {/* 7. সেভিংস */}
                <div className="p-1.5 flex flex-col items-center justify-center opacity-80">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center mb-1">
                    <PiggyBank className="w-5 h-5" />
                  </div>
                  <span className="text-gray-600 font-medium">সেভিংস</span>
                </div>

                {/* 8. ডোনেশন */}
                <div className="p-1.5 flex flex-col items-center justify-center opacity-80">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mb-1">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <span className="text-gray-600 font-medium">ডোনেশন</span>
                </div>

              </div>

              {/* Tap image hint text matching screenshot */}
              <div className="text-right pt-1">
                <span className="text-[10px] text-gray-400 font-normal flex items-center justify-end gap-1">
                  <Search className="w-3 h-3 text-gray-400" />
                  <span>ছবিতে ট্যাপ করে বড় করুন</span>
                </span>
              </div>
            </div>

            {/* TrxID Input Form */}
            <form onSubmit={handleConfirm} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-xs sm:text-sm font-black text-gray-900 mb-1.5">
                  {walletInfo.label === 'Agent' ? 'ক্যাশআউটের' : 'সেন্ড মানির'} TrxID নাম্বারটি লিখুন <span className="text-red-600 font-extrabold">(প্রয়োজন)</span>
                </label>
                <input
                  type="text"
                  required
                  value={trxId}
                  onChange={(e) => {
                    setTrxId(e.target.value.toUpperCase());
                    setInputError('');
                  }}
                  placeholder="TrxID অবশ্যই পূরণ করতে হবে!"
                  className={`w-full border-2 ${inputError ? 'border-red-600 ring-2 ring-red-200' : 'border-red-500'} rounded-2xl px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-gray-900 font-mono font-bold placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 bg-[#f9fafb] text-center sm:text-left shadow-2xs uppercase tracking-wider`}
                />
                {inputError && (
                  <p className="mt-1 text-xs text-red-600 font-bold">{inputError}</p>
                )}
              </div>

              {/* Action Buttons: Confirm & Cancel */}
              <div className="pt-1 space-y-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full max-w-xs mx-auto block bg-[#0e6d44] hover:bg-[#0b5837] text-white font-black py-3 px-8 rounded-2xl text-xs sm:text-sm transition shadow-md disabled:opacity-50 cursor-pointer active:scale-98"
                >
                  {submitting ? 'যাচাই করা হচ্ছে...' : '✓ নিশ্চিত (Confirm Payment)'}
                </button>

                {/* Clear Cancel Button */}
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="w-full max-w-xs mx-auto block bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 font-bold py-2.5 px-8 rounded-2xl text-xs transition cursor-pointer active:scale-95"
                >
                  ✕ পেমেন্ট বাতিল করুন (Cancel Payment)
                </button>
              </div>
            </form>

            {/* Footer warning */}
            <div className="space-y-1 text-[11px] text-gray-500 pt-2 border-t border-gray-100">
              <p className="font-bold text-gray-800">সতর্কতাঃ</p>
              <p className="text-gray-500 leading-relaxed">
                লেনদেন আইডি সঠিকভাবে পূরণ করতে হবে। ভুল তথ্য দিলে পেমেন্ট এপ্রুভ হতে দেরি হতে পারে।
              </p>
            </div>

            {/* Back Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 py-1.5 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> ড্যাশবোর্ডে ফিরে যান (Return to Dashboard)
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
