import React, { useState } from 'react';
import { Copy, Check, ArrowLeft, Send, Smartphone, Banknote, ShoppingBag } from 'lucide-react';
import { BKASH_LOGO_URL, ROCKET_LOGO_URL, NAGAD_LOGO_URL } from '../constants/logos';
import { getValidRandomWalletNumber } from '../utils/wallet';

interface CheckoutViewProps {
  transactionId: string;
  amount: number;
  merchantName: string;
  method?: 'bKash' | 'Nagad' | 'Rocket';
  onPaymentSubmit?: (txId: string, submittedTrxId: string) => void;
  onPaymentSuccess?: (txId: string) => void;
  onBackToDashboard: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  transactionId,
  amount,
  merchantName,
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

  // Randomly select a valid wallet number considering limits
  const [walletNumber, setWalletNumber] = useState<string>(() => getValidRandomWalletNumber(method));

  React.useEffect(() => {
    setWalletNumber(getValidRandomWalletNumber(currentMethod));
  }, [currentMethod]);
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
    if (!trxId.trim()) {
      alert(lang === 'bn' ? 'TrxID অবশ্যই পূরণ করতে হবে!' : 'TrxID is required!');
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
    return `BDT ${val.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-4 px-2 sm:px-4 font-sans text-gray-800">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        
        {/* Top Dark Green Banner matching screenshot */}
        <div className="bg-[#0f7147] text-white px-4 py-3.5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">{formatAmount(amount)}</h2>
            <p className="text-xs text-green-100 mt-0.5">
              {lang === 'bn' ? 'কম বা বেশি করবেন না সেন্ড মানি' : 'Do not send more or less'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-green-100">PAY SERVICE</span>
            <div className="flex items-center bg-white/20 rounded-md p-0.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-1.5 py-0.5 rounded transition ${lang === 'en' ? 'bg-white text-emerald-900 shadow-xs' : 'text-white'}`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('bn')}
                className={`px-1.5 py-0.5 rounded transition ${lang === 'bn' ? 'bg-white text-emerald-900 shadow-xs' : 'text-white'}`}
              >
                বাং
              </button>
            </div>
          </div>
        </div>

        {/* Red Warning Alert Box matching screenshot */}
        <div className="p-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-center">
            <p className="text-xs text-red-600 font-semibold leading-relaxed">
              {lang === 'bn' 
                ? `আপনি যদি টাকার পরিমাণ পরিবর্তন করেন (${formatAmount(amount)}), আপনি ক্রেডিট পেতে সক্ষম হবেন না।`
                : `If you change the amount (${formatAmount(amount)}), you will not receive credit.`}
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-lg text-gray-900">
              {lang === 'bn' ? 'পেমেন্ট রিকোয়েস্ট জমা হয়েছে!' : 'Payment Request Submitted!'}
            </h3>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs text-amber-900 space-y-1">
              <p className="font-bold">
                {lang === 'bn' ? 'স্ট্যাটাস: Pending (অপেক্ষমান)' : 'Status: Pending (Under Review)'}
              </p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                {lang === 'bn' 
                  ? `আপনার TrxID (${trxId}) গ্রহণ করা হয়েছে। এডমিন প্যানেল থেকে যাচাই করে অনুমোদন (Approve) করার পর আপনার অ্যাকাউন্টে ব্যালেন্স যুক্ত হবে।` 
                  : `Your TrxID (${trxId}) has been received. Balance will be credited once approved from the Admin Panel.`}
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={onBackToDashboard}
                className="w-full bg-[#0f7147] hover:bg-[#0c5c39] text-white font-bold py-3 rounded-xl text-xs transition shadow-md cursor-pointer"
              >
                {lang === 'bn' ? 'ড্যাশবোর্ডে ফিরে যান' : 'Return to Dashboard'}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-5">
            {/* Wallet Provider Section */}
            <div>
              <p className="text-xs font-bold text-gray-700 mb-2">Wallet Provider</p>
              
              <div className="flex gap-2 mb-3">
                {(['bKash', 'Nagad', 'Rocket'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setCurrentMethod(m)}
                    className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg border transition flex items-center justify-center gap-1.5 ${
                      currentMethod === m 
                        ? m === 'bKash' ? 'bg-pink-50 border-pink-500 text-pink-700' :
                          m === 'Nagad' ? 'bg-orange-50 border-orange-500 text-orange-700' :
                          'bg-purple-50 border-purple-500 text-purple-700'
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    }`}
                  >
                    {m === 'bKash' && (
                      <img 
                        src={BKASH_LOGO_URL} 
                        alt="bKash" 
                        className="w-4 h-4 object-contain rounded-full" 
                      />
                    )}
                    {m === 'Nagad' && (
                      <img 
                        src={NAGAD_LOGO_URL} 
                        alt="Nagad" 
                        className="w-4 h-4 object-contain rounded-full" 
                      />
                    )}
                    {m === 'Rocket' && (
                      <img 
                        src={ROCKET_LOGO_URL} 
                        alt="Rocket" 
                        className="w-4 h-4 object-contain rounded-xs" 
                      />
                    )}
                    <span>{m}</span>
                  </button>
                ))}
              </div>

              {/* Dedicated Banner matching screenshot */}
              <div className={`p-4 rounded-2xl text-white font-bold flex items-center gap-3 shadow-md ${
                isBkash 
                  ? 'bg-gradient-to-r from-[#d12053] to-[#e2136e]' :
                isNagad 
                  ? 'bg-gradient-to-r from-[#ea580c] to-[#f97316]' :
                  'bg-gradient-to-r from-purple-700 to-indigo-800'
              }`}>
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1 shadow-inner shrink-0 overflow-hidden">
                  {isBkash ? (
                    <img 
                      src={BKASH_LOGO_URL} 
                      alt="bKash" 
                      className="w-full h-full object-contain p-0.5 rounded-full" 
                    />
                  ) : isNagad ? (
                    <img 
                      src={NAGAD_LOGO_URL} 
                      alt="Nagad" 
                      className="w-full h-full object-contain p-0.5 rounded-full" 
                    />
                  ) : isRocket ? (
                    <img 
                      src={ROCKET_LOGO_URL} 
                      alt="Rocket" 
                      className="w-full h-full object-contain p-0.5" 
                    />
                  ) : (
                    <span className="font-extrabold text-sm text-[#ea580c]">
                      {currentMethod}
                    </span>
                  )}
                </div>
                <span className="text-base tracking-wide uppercase">
                  {currentMethod} Deposit
                </span>
              </div>
            </div>

            {/* Wallet No Section - Hidden as per user request */}
            <div className="hidden">
              <label className="block text-xs font-bold text-gray-700 mb-0.5">
                Wallet No <span className="text-red-500">*</span>
              </label>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <span className="font-mono font-bold text-base text-gray-900 tracking-wider">
                  {walletNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 active:scale-95 transition"
                  title="Copy number"
                >
                  {copied ? (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <Check className="w-4 h-4" /> কপি হয়েছে
                    </span>
                  ) : (
                    <Copy className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* TrxID Input Form */}
            <form onSubmit={handleConfirm} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  {lang === 'bn' 
                    ? <>ক্যাশআউটের TrxID নাম্বারটি লিখুন <span className="text-red-600">((প্রয়োজন))</span></>
                    : <>Enter TrxID Number <span className="text-red-600">((Required))</span></>}
                </label>
                <input
                  type="text"
                  required
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  placeholder={lang === 'bn' ? 'TrxID অবশ্যই পূরণ করতে হবে!' : 'TrxID is required!'}
                  className="w-full border-2 border-red-500 rounded-xl px-4 py-3 text-xs text-gray-900 font-mono font-bold placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                />
              </div>

              {/* নিশ্চিত (Confirm) Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold py-3 rounded-2xl text-sm transition shadow-2xs disabled:opacity-50"
              >
                {submitting ? (lang === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Verifying...') : (lang === 'bn' ? 'নিশ্চিত' : 'Confirm')}
              </button>
            </form>

            {/* Visual Guide matching screenshot: 4 icons with red arrow on সেন্ড মানি */}
            <div className="p-3 bg-white border border-gray-200 rounded-2xl">
              <div className="grid grid-cols-4 gap-2 text-center text-[11px] relative pt-2">
                
                {/* 1. সেন্ড মানি (Highlighted with red box & arrow) */}
                <div className="relative">
                  {/* Red Pointer Arrow */}
                  <div className="absolute -top-3 -right-1 text-red-500 font-black text-base animate-pulse">
                    ↙
                  </div>
                  <div className="border-2 border-red-500 rounded-xl p-2 bg-red-50/40 flex flex-col items-center justify-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-1 ${
                      isBkash ? 'bg-pink-100 text-pink-600' :
                      isNagad ? 'bg-orange-100 text-orange-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      <Send className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-gray-800 text-[10px]">সেন্ড মানি</span>
                  </div>
                </div>

                {/* 2. মোবাইল রিচার্জ */}
                <div className="p-2 flex flex-col items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mb-1">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <span className="text-gray-600 text-[10px]">মোবাইল রিচার্জ</span>
                </div>

                {/* 3. ক্যাশ আউট */}
                <div className="p-2 flex flex-col items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mb-1">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <span className="text-gray-600 text-[10px]">ক্যাশ আউট</span>
                </div>

                {/* 4. পেমেন্ট */}
                <div className="p-2 flex flex-col items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-1">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <span className="text-gray-600 text-[10px]">পেমেন্ট</span>
                </div>
              </div>

              {/* Bold Red Heading: সেন্ড মানি */}
              <div className="text-center mt-3">
                <h4 className="text-xl font-extrabold text-red-600 tracking-wide">
                  সেন্ড মানি
                </h4>
              </div>
            </div>

            {/* সতর্কবার্তা (Warning Notice) matching screenshot */}
            <div className="space-y-1.5 text-[11px] text-gray-600 border-t border-gray-100 pt-3">
              <p className="font-bold text-gray-900">সতর্কতাঃ</p>
              <p className="font-bold text-red-600 leading-tight">
                লেনদেন আইডি সঠিকভাবে পূরণ করতে হবে, অন্যথায় স্কোর ব্যর্থ হবে!
              </p>
              <p className="text-gray-500 leading-relaxed">
                অনুগ্রহ করে নিশ্চিত হয়ে নিন যে আপনি {isBkash ? 'BKASH' : 'NAGAD'} deposit ওয়ালেট নাম্বারে সেন্ড মানি করছেন। এই নাম্বারের অন্য কোন ওয়ালেট থেকে সেন্ড মানি করলে সেই টাকা পাওয়ার কোন সম্ভাবনা নাই।
              </p>
            </div>

            {/* Back Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={onBackToDashboard}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 py-2 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> ড্যাশবোর্ডে ফিরে যান
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
