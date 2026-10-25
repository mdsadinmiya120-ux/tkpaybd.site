import React, { useState } from 'react';
import { Headphones, Send, MessageSquare, CheckCircle2 } from 'lucide-react';

export const SupportTab: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-xl mx-auto space-y-5 pb-12">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Merchant Support & Helpdesk</h3>
            <p className="text-xs text-gray-500">Get direct assistance from ChaoPaoPay gateway support engineers</p>
          </div>
        </div>

        {submitted ? (
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 text-center space-y-3">
            <div className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-indigo-900 text-base">Support Ticket Created!</h4>
            <p className="text-xs text-indigo-700">
              Your ticket #SUP{Math.floor(Math.random() * 89999 + 10000)} has been received. Our support team will reply within 15 minutes.
            </p>
            <button
              onClick={() => { setSubmitted(false); setSubject(''); setMessage(''); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow transition"
            >
              Submit Another Ticket
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1.5">Issue Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Webhook callback delay or Payout status"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1.5">Detailed Message</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue with transaction IDs or error codes..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs text-gray-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="font-semibold text-gray-900">Telegram Support Channel</p>
                  <p className="text-[11px] text-gray-500">@Chaopaopay_bd</p>
                </div>
              </div>
              <a
                href="https://t.me/Chaopaopay_bd"
                target="_blank"
                rel="noreferrer"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition"
              >
                Join Telegram
              </a>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Submit Support Ticket
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
