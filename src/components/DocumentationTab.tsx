import React, { useState } from 'react';
import { BookOpen, Copy, Check, Code, Terminal, Server } from 'lucide-react';

export const DocumentationTab: React.FC = () => {
  const [activeLang, setActiveLang] = useState<'curl' | 'nodejs' | 'php'>('curl');
  const [copiedCode, setCopiedCode] = useState(false);

  const codeSnippets = {
    curl: `curl -X POST https://chaopaopaybd.site/api/v1/payin/create \\
  -H "Authorization: Bearer sk_live_559281b77c2a11830029b8c771a2ef90" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 500.00,
    "currency": "BDT",
    "method": "bKash",
    "customer_phone": "12345678",
    "success_url": "https://yourwebsite.com/success",
    "cancel_url": "https://yourwebsite.com/cancel"
  }'`,
    nodejs: `import axios from 'axios';

const response = await axios.post('https://chaopaopaybd.site/api/v1/payin/create', {
  amount: 500.00,
  currency: 'BDT',
  method: 'bKash',
  customer_phone: '12345678',
  success_url: 'https://yourwebsite.com/success',
  cancel_url: 'https://yourwebsite.com/cancel'
}, {
  headers: {
    'Authorization': 'Bearer sk_live_559281b77c2a11830029b8c771a2ef90',
    'Content-Type': 'application/json'
  }
});

console.log(response.data.payment_url);`,
    php: `$ch = curl_init('https://chaopaopaybd.site/api/v1/payin/create');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer sk_live_559281b77c2a11830029b8c771a2ef90',
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'amount' => 500.00,
    'currency' => 'BDT',
    'method' => 'bKash',
    'customer_phone' => '12345678'
]));
$response = curl_exec($ch);
curl_close($ch);`
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeLang]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-12">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Integration Documentation</h3>
            <p className="text-xs text-gray-500">Integrate ChaoPaoPay gateway into your website or mobile app</p>
          </div>
        </div>

        {/* Quick Steps */}
        <div className="space-y-4 text-xs mb-8">
          <h4 className="font-bold text-gray-900 uppercase tracking-wide text-[11px]">Getting Started</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs mb-2">1</span>
              <h5 className="font-bold text-gray-800 mb-1">Get API Keys</h5>
              <p className="text-gray-500">Copy your public & secret keys from the API Keys tab.</p>
            </div>
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs mb-2">2</span>
              <h5 className="font-bold text-gray-800 mb-1">Make API Request</h5>
              <p className="text-gray-500">Send POST request to create payment session.</p>
            </div>
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs mb-2">3</span>
              <h5 className="font-bold text-gray-800 mb-1">Webhook Callback</h5>
              <p className="text-gray-500">Receive instant payment success notification via webhook.</p>
            </div>
          </div>
        </div>

        {/* Code Snippets Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
              <Code className="w-4 h-4 text-blue-600" /> API Code Examples
            </h4>
            <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveLang('curl')}
                className={`px-3 py-1 rounded-lg transition ${activeLang === 'curl' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'}`}
              >
                cURL
              </button>
              <button
                onClick={() => setActiveLang('nodejs')}
                className={`px-3 py-1 rounded-lg transition ${activeLang === 'nodejs' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'}`}
              >
                Node.js
              </button>
              <button
                onClick={() => setActiveLang('php')}
                className={`px-3 py-1 rounded-lg transition ${activeLang === 'php' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'}`}
              >
                PHP
              </button>
            </div>
          </div>

          <div className="relative bg-gray-900 text-emerald-400 font-mono text-xs rounded-2xl p-4 overflow-x-auto shadow-inner">
            <button
              onClick={handleCopyCode}
              className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded-lg text-[11px] font-sans flex items-center gap-1 transition"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
            <pre>{codeSnippets[activeLang]}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
