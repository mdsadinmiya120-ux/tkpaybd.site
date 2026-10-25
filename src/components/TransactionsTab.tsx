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
    <div className="space-y-4 pb-12">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
          <h3 className="font-bold text-gray-900 text-lg">All Transactions ({filtered.length})</h3>
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
            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-emerald-200 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by ID, name, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
            />
          </div>

          <div className="flex gap-2 sm:col-span-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-emerald-500 transition font-medium"
            >
              <option value="All">All Types</option>
              <option value="Payin">Payin (Deposit)</option>
              <option value="Payout">Payout (Withdraw)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-emerald-500 transition font-medium"
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
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Transaction ID</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Method</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    No transactions found matching your criteria.
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
                      <td className="py-3 font-mono font-medium text-gray-800">
                        {tx.transactionId}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          isPayin ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {isPayin ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 text-gray-600 font-medium">
                        {tx.method}
                      </td>
                      <td className="py-3 font-bold text-gray-900">
                        {formatBDT(tx.amount)}
                      </td>
                      <td className="py-3 text-gray-500 text-[11px]">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            tx.status === 'Success' ? 'bg-emerald-100 text-emerald-800' :
                            tx.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {tx.status === 'Success' && <CheckCircle2 className="w-3 h-3" />}
                            {tx.status === 'Pending' && <Clock className="w-3 h-3" />}
                            {tx.status === 'Failed' && <XCircle className="w-3 h-3" />}
                            {tx.status}
                          </span>

                          {tx.status === 'Pending' && tx.type === 'Payin' && onApproveDeposit && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onApproveDeposit(tx.transactionId);
                              }}
                              className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[10px] font-bold shadow-2xs transition cursor-pointer"
                              title="Approve and credit balance"
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
