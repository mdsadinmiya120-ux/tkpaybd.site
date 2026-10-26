import React, { useState } from 'react';
import { BookOpen, Copy, Check, Code, Terminal, Server, Key, CreditCard, ArrowDownToLine, Webhook, ChevronRight } from 'lucide-react';

export const DocumentationTab: React.FC = () => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [activeLang, setActiveLang] = useState<'curl' | 'nodejs' | 'php'>('curl');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sections = [
    { id: 'getting-started', label: 'Getting Started', icon: BookOpen },
    { id: 'authentication', label: 'Authentication', icon: Key },
    { id: 'payin', label: 'Create Payin', icon: CreditCard },
    { id: 'payout', label: 'Create Payout', icon: ArrowDownToLine },
    { id: 'webhooks', label: 'Webhooks/IPN', icon: Webhook },
  ];

  const codeExamples = {
    'authentication': {
      curl: `curl -H "X-API-KEY: YOUR_SECRET_KEY" \\
     -H "Content-Type: application/json" \\
     https://api.tkpaybd.com/v1/validate`,
      nodejs: `const axios = require('axios');

const response = await axios.get('https://api.tkpaybd.com/v1/validate', {
  headers: {
    'X-API-KEY': 'YOUR_SECRET_KEY'
  }
});`,
      php: `$ch = curl_init('https://api.tkpaybd.com/v1/validate');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'X-API-KEY: YOUR_SECRET_KEY'
]);
$response = curl_exec($ch);`
    },
    'payin': {
      curl: `curl -X POST https://api.tkpaybd.com/v1/payin/create \\
  -H "X-API-KEY: YOUR_SECRET_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 500.00,
    "currency": "BDT",
    "method": "bKash",
    "customer_phone": "017XXXXXXXX",
    "success_url": "https://yoursite.com/success",
    "cancel_url": "https://yoursite.com/cancel",
    "callback_url": "https://yoursite.com/api/webhook"
  }'`,
      nodejs: `const axios = require('axios');

const response = await axios.post('https://api.tkpaybd.com/v1/payin/create', {
  amount: 500.00,
  currency: 'BDT',
  method: 'bKash',
  customer_phone: '017XXXXXXXX',
  success_url: 'https://yoursite.com/success',
  cancel_url: 'https://yoursite.com/cancel',
  callback_url: 'https://yoursite.com/api/webhook'
}, {
  headers: { 'X-API-KEY': 'YOUR_SECRET_KEY' }
});`,
      php: `$data = [
    "amount" => 500.00,
    "currency" => "BDT",
    "method" => "bKash",
    "customer_phone" => "017XXXXXXXX"
];

$ch = curl_init('https://api.tkpaybd.com/v1/payin/create');
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['X-API-KEY: YOUR_SECRET_KEY', 'Content-Type: application/json']);
$response = curl_exec($ch);`
    },
    'payout': {
      curl: `curl -X POST https://api.tkpaybd.com/v1/payout/create \\
  -H "X-API-KEY: YOUR_SECRET_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 1000.00,
    "method": "Nagad",
    "wallet_number": "018XXXXXXXX",
    "payout_type": "Personal"
  }'`,
      nodejs: `const axios = require('axios');

const response = await axios.post('https://api.tkpaybd.com/v1/payout/create', {
  amount: 1000.00,
  method: 'Nagad',
  wallet_number: '018XXXXXXXX',
  payout_type: 'Personal'
}, {
  headers: { 'X-API-KEY': 'YOUR_SECRET_KEY' }
});`,
      php: `$data = [
    "amount" => 1000.00,
    "method" => "Nagad",
    "wallet_number" => "018XXXXXXXX"
];

$ch = curl_init('https://api.tkpaybd.com/v1/payout/create');
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['X-API-KEY: YOUR_SECRET_KEY']);
$response = curl_exec($ch);`
    }
  };

  const CodeBlock = ({ id, codeObj }: { id: string, codeObj: any }) => {
    const code = codeObj[activeLang] || '';
    return (
      <div className="relative group">
        <div className="flex items-center justify-between mb-2">
          <div className="flex bg-gray-100 p-0.5 rounded-lg text-[10px] font-bold">
            {(['curl', 'nodejs', 'php'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`px-2 py-1 rounded-md transition-all ${activeLang === lang ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {lang === 'curl' ? 'cURL' : lang === 'nodejs' ? 'Node.js' : 'PHP'}
              </button>
            ))}
          </div>
          <button
            onClick={() => copyToClipboard(code, id)}
            className="flex items-center gap-1 text-[10px] font-bold text-gray-500 hover:text-gray-800 transition-colors"
          >
            {copiedCode === id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            {copiedCode === id ? 'Copied' : 'Copy'}
          </button>
        </div>
        <div className="bg-[#1e293b] rounded-xl p-3 overflow-x-auto border border-slate-800 shadow-lg">
          <pre className="text-[11px] font-mono leading-relaxed text-blue-300">
            <code>{code}</code>
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 max-w-6xl mx-auto pb-10">
      {/* Sidebar Navigation */}
      <div className="lg:w-56 shrink-0">
        <div className="sticky top-4 bg-white rounded-xl border border-gray-100 p-2 shadow-sm">
          <h3 className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">API Docs</h3>
          <nav className="space-y-1 mt-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeSection === section.id 
                    ? 'bg-[#eb6a24]/10 text-[#eb6a24]' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <section.icon className={`w-4 h-4 ${activeSection === section.id ? 'text-[#eb6a24]' : 'text-gray-400'}`} />
                {section.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-4">
        {activeSection === 'getting-started' && (
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[#eb6a24]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Welcome to TKPayBD API</h2>
                <p className="text-[11px] text-gray-500">Integrate automated bKash, Nagad, and Rocket payments into your platform.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-gray-50 bg-gray-50/50">
                <div className="w-7 h-7 rounded-lg bg-[#eb6a24] text-white flex items-center justify-center text-xs font-bold mb-3 shadow-md shadow-orange-200">1</div>
                <h4 className="text-xs font-bold text-gray-900 mb-1">Generate Keys</h4>
                <p className="text-[10px] text-gray-500 leading-relaxed">Go to the <b>API Keys</b> tab and generate your Secret Key to authenticate requests.</p>
              </div>
              <div className="p-4 rounded-xl border border-gray-50 bg-gray-50/50">
                <div className="w-7 h-7 rounded-lg bg-[#10b981] text-white flex items-center justify-center text-xs font-bold mb-3 shadow-md shadow-emerald-200">2</div>
                <h4 className="text-xs font-bold text-gray-900 mb-1">Create Sessions</h4>
                <p className="text-[10px] text-gray-500 leading-relaxed">Use the <b>Payin API</b> to initiate a payment session and redirect customers.</p>
              </div>
              <div className="p-4 rounded-xl border border-gray-50 bg-gray-50/50">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold mb-3 shadow-md shadow-blue-200">3</div>
                <h4 className="text-xs font-bold text-gray-900 mb-1">Handle IPN</h4>
                <p className="text-[10px] text-gray-500 leading-relaxed">Setup your <b>Webhook URL</b> to receive real-time payment status updates.</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Server className="w-4 h-4 text-gray-400" /> API Base URL
              </h4>
              <div className="bg-gray-900 rounded-xl p-3 flex items-center justify-between group">
                <code className="text-xs font-mono text-emerald-400">https://api.tkpaybd.com/v1</code>
                <button 
                  onClick={() => copyToClipboard('https://api.tkpaybd.com/v1', 'base-url')}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/10 rounded-lg text-white"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'authentication' && (
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-6">
            <div>
              <h2 className="text-sm font-bold text-gray-900 mb-1">Authentication</h2>
              <p className="text-[11px] text-gray-500">All API requests must include your secret key in the headers.</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-50 border border-orange-100">
                <div className="mt-0.5"><Key className="w-4 h-4 text-[#eb6a24]" /></div>
                <div>
                  <h4 className="text-xs font-bold text-[#eb6a24]">Secret Key Header</h4>
                  <p className="text-[10px] text-[#eb6a24]/80">Key: <code className="font-bold">X-API-KEY</code></p>
                  <p className="text-[10px] text-[#eb6a24]/80">Value: <code className="font-bold">sk_live_...</code></p>
                </div>
              </div>
            </div>

            <CodeBlock id="auth-code" codeObj={codeExamples.authentication} />
          </div>
        )}

        {activeSection === 'payin' && (
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-900 mb-1">Create Payin Session</h2>
                <p className="text-[11px] text-gray-500">Initiate a payment request for your customer.</p>
              </div>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg uppercase">POST</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Request Parameters</h4>
                <div className="space-y-3">
                  {[
                    { name: 'amount', type: 'number', req: true, desc: 'The amount in BDT' },
                    { name: 'method', type: 'string', req: true, desc: 'bKash, Nagad, or Rocket' },
                    { name: 'customer_phone', type: 'string', req: true, desc: 'Customers wallet number' },
                    { name: 'success_url', type: 'string', req: true, desc: 'Where to redirect after success' },
                    { name: 'callback_url', type: 'string', req: false, desc: 'URL for webhook notification' },
                  ].map(param => (
                    <div key={param.name} className="flex flex-col gap-0.5 border-l-2 border-gray-100 pl-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-gray-800">{param.name}</span>
                        <span className="text-[9px] text-gray-400">{param.type}</span>
                        {param.req && <span className="text-[9px] text-red-500 font-bold">REQUIRED</span>}
                      </div>
                      <p className="text-[10px] text-gray-500">{param.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Code Example</h4>
                <CodeBlock id="payin-code" codeObj={codeExamples.payin} />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'payout' && (
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-900 mb-1">Request Payout</h2>
                <p className="text-[11px] text-gray-500">Withdraw funds from your merchant balance to a wallet.</p>
              </div>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg uppercase">POST</span>
            </div>

            <CodeBlock id="payout-code" codeObj={codeExamples.payout} />

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <div className="flex gap-3">
                <ArrowDownToLine className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-blue-900">Payout Rules</h4>
                  <ul className="mt-2 space-y-1.5">
                    <li className="text-[10px] text-blue-800/80 flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-blue-400" />
                      Minimum payout amount is 10.00 BDT.
                    </li>
                    <li className="text-[10px] text-blue-800/80 flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-blue-400" />
                      Personal and Agent wallets are both supported.
                    </li>
                    <li className="text-[10px] text-blue-800/80 flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-blue-400" />
                      Processing time is usually 5-30 minutes.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'webhooks' && (
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-6">
            <div>
              <h2 className="text-sm font-bold text-gray-900 mb-1">Webhooks & IPN</h2>
              <p className="text-[11px] text-gray-500">Receive automated notifications when payment status changes.</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-gray-100 space-y-3">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payload Structure (JSON)</h4>
                <div className="bg-[#1e293b] rounded-lg p-3">
                  <pre className="text-[10px] font-mono text-blue-300">
{`{
  "status": "Success",
  "transaction_id": "TKP-12345678",
  "amount": 500.00,
  "currency": "BDT",
  "method": "bKash",
  "customer_phone": "017XXXXXXXX",
  "merchant_order_id": "ORDER-99"
}`}
                  </pre>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                  <h4 className="text-xs font-bold text-emerald-900 mb-1">Verification</h4>
                  <p className="text-[10px] text-emerald-800/70 leading-relaxed">
                    Always verify the transaction status via our Get Transaction API before delivering services.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
                  <h4 className="text-xs font-bold text-[#eb6a24] mb-1">Retries</h4>
                  <p className="text-[10px] text-[#eb6a24]/70 leading-relaxed">
                    If your server is down, we will retry the webhook up to 3 times over 1 hour.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

