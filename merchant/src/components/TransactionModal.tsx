import React from 'react';
import { X, CheckCircle2, Clock, XCircle, ArrowDownLeft, ArrowUpRight, Copy, Check } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onApprove?: (txId: string) => void;
  onReject?: (txId: string) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ 
  transaction, 
  onClose,
  onApprove,
  onReject 
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!transaction) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(transaction.transactionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatBDT = (amount: number) => {
    return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} BDT`;
  };

  const isPayin = transaction.type === 'Payin';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${
            isPayin ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
          }`}>
            {isPayin ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">{transaction.type} Details</h3>
            <p className="text-xs text-gray-500">{transaction.method} Gateway Transaction</p>
          </div>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-500 font-medium">Transaction ID</span>
            <div className="flex items-center gap-1.5 font-mono font-semibold text-gray-800">
              <span>{transaction.transactionId}</span>
              <button onClick={handleCopy} className="text-gray-400 hover:text-emerald-600 cursor-pointer">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-500 font-medium">Amount</span>
            <span className="font-bold text-gray-900 text-sm">{formatBDT(transaction.amount)}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-500 font-medium">
              {isPayin ? 'কমিশন (Commission)' : 'সার্ভিস চার্জ (Charge)'}
            </span>
            <span className={`font-semibold ${isPayin ? 'text-emerald-600 font-bold' : 'text-gray-700'}`}>
              {isPayin && transaction.charge > 0 ? `+${formatBDT(transaction.charge)}` : formatBDT(transaction.charge)}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-500 font-medium">Status</span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
              transaction.status === 'Success' ? 'bg-emerald-100 text-emerald-800' :
              transaction.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
              'bg-red-100 text-red-800'
            }`}>
              {transaction.status === 'Success' && <CheckCircle2 className="w-3 h-3" />}
              {transaction.status === 'Pending' && <Clock className="w-3 h-3" />}
              {transaction.status === 'Failed' && <XCircle className="w-3 h-3" />}
              {transaction.status}
            </span>
          </div>

          {transaction.customerPhone && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-500 font-medium">Customer Phone</span>
              <span className="font-mono text-gray-800">{transaction.customerPhone}</span>
            </div>
          )}

          {transaction.customerName && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-500 font-medium">Customer Name</span>
              <span className="font-semibold text-gray-800">{transaction.customerName}</span>
            </div>
          )}

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-500 font-medium">Date & Time</span>
            <span className="text-gray-800">{new Date(transaction.createdAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons if Pending */}
        {transaction.status === 'Pending' && (
          <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2.5">
            {onApprove && (
              <button
                type="button"
                onClick={() => {
                  onApprove(transaction.transactionId);
                  onClose();
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>অনুমোদন করুন</span>
              </button>
            )}
            {onReject && (
              <button
                type="button"
                onClick={() => {
                  onReject(transaction.transactionId);
                  onClose();
                }}
                className="bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 hover:border-rose-300 font-bold py-2.5 rounded-xl transition text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
              >
                <XCircle className="w-4 h-4 text-rose-500" />
                <span>বাতিল করুন</span>
              </button>
            )}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-2.5 rounded-xl transition text-xs shadow-md cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
