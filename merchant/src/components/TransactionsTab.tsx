import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, CheckCircle2, Clock, XCircle, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionsTabProps {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  onNewTransaction?: (tx: Transaction) => void;
  initialTypeFilter?: 'All' | 'Payin' | 'Payout';
  onApproveDeposit?: (txId: string) => void;
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({ 
  transactions, 
  onSelectTransaction,
  initialTypeFilter = 'All',
  onApproveDeposit
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Payin' | 'Payout'>(initialTypeFilter);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Success' | 'Pending' | 'Failed'>('All');

  useEffect(() => {
    if (initialTypeFilter) {
      setTypeFilter(initialTypeFilter);
    }
  }, [initialTypeFilter]);

  const filtered = transactions.filter(tx => {
    const matchesSearch = tx.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (tx.customerName && tx.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (tx.customerPhone && tx.customerPhone.includes(searchTerm));
    const matchesType = typeFilter === 'All' || tx.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || tx.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const formatBDT = (amount: number) => {
    return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} BDT`;
  };

  return (
    <div className="space-y-3 pb-8">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-3">
          <h3 className="font-bold text-gray-900 text-base">All Transactions ({filtered.length})</h3>
          <button
            onClick={() => {
              const csv = [
                ['Transaction ID', 'Type', 'Amount', 'Currency', 'Status', 'Method', 'Date'],
                ...transactions.map(t => [t.transactionId, t.type, t.amount, t.currency, t.status, t.method, t.createdAt])
              ].map(e => e.join(',')).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'chaopaopay_transactions.csv';
              a.click();
            }}
            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition border border-emerald-200 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8.5 pr-3 py-2 text-[11px] text-gray-800 focus:outline-none focus:border-emerald-500 transition font-medium"
            />
          </div>

          <div className="flex gap-2 sm:col-span-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 py-2 text-[11px] text-gray-800 focus:outline-none focus:border-emerald-500 transition font-medium"
            >
              <option value="All">All Types</option>
              <option value="Payin">Payin</option>
              <option value="Payout">Payout</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 py-2 text-[11px] text-gray-800 focus:outline-none focus:border-emerald-500 transition font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Success">Success</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                <th className="pb-2 font-semibold">TX ID</th>
                <th className="pb-2 font-semibold">Type</th>
                <th className="pb-2 font-semibold">Method</th>
                <th className="pb-2 font-semibold">Amount</th>
                <th className="pb-2 font-semibold">Date</th>
                <th className="pb-2 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-[10px] sm:text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const isPayin = tx.type === 'Payin';
                  return (
                    <tr
                      key={tx.id}
                      onClick={() => onSelectTransaction(tx)}
                      className="hover:bg-gray-50/80 cursor-pointer transition"
                    >
                      <td className="py-2.5 font-mono font-medium text-gray-800">
                        {tx.transactionId}
                      </td>
                      <td className="py-2.5">
                        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                          isPayin ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-2.5 text-gray-600 font-medium">
                        {tx.method}
                      </td>
                      <td className="py-2.5 font-black text-gray-900">
                        {formatBDT(tx.amount)}
                      </td>
                      <td className="py-2.5 text-gray-500 text-[10px]">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.status === 'Success' ? 'bg-emerald-100 text-emerald-800' :
                            tx.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {tx.status}
                          </span>

                          {tx.status === 'Pending' && tx.type === 'Payin' && onApproveDeposit && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onApproveDeposit(tx.transactionId);
                              }}
                              className="px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[9px] font-bold shadow-2xs transition cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
