import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  Copy, 
  Check, 
  Download, 
  BookOpen, 
  Key, 
  CreditCard, 
  ArrowDownToLine, 
  Webhook, 
  Clock, 
  CheckCircle2, 
  ArrowLeft,
  FileCode,
  ShieldCheck,
  Terminal,
  Code2,
  Info,
  AlertTriangle,
  AlertOctagon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import JSZip from 'jszip';
import { BKASH_LOGO_URL, NAGAD_LOGO_URL, ROCKET_LOGO_URL } from '../../merchant/src/constants/logos';

export const ApiDocsView: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeLang, setActiveLang] = useState<'curl' | 'php' | 'nodejs' | 'python'>('php');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [downloadingZip, setDownloadingZip] = useState(false);

  const [activeNav, setActiveNav] = useState('overview');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const scrollToSection = (id: string) => {
    setActiveNav(id);
    setIsSidebarOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Generate & Download PHP Integration Kit (.zip)
  const handleDownloadPhpKit = async () => {
    setDownloadingZip(true);
    try {
      const zip = new JSZip();

      // 1. config.php
      zip.file(
        'config.php',
`<?php
// TKPayBD API Configuration
define('CP_API_KEY', 'YOUR_SECRET_KEY_HERE'); // Replace with your Secret Key
define('CP_BASE_URL', 'https://tkpaybd.site/api/v1/'); // Live Base URL
define('CP_SANDBOX_URL', 'https://sandbox.tkpaybd.site/api/v1/'); // Sandbox URL
define('CP_MODE', 'live'); // Set 'live' or 'sandbox'

function get_api_url($endpoint) {
    $base = (CP_MODE === 'sandbox') ? CP_SANDBOX_URL : CP_BASE_URL;
    return rtrim($base, '/') . '/' . ltrim($endpoint, '/');
}
?>`
      );

      // 2. payin.php
      zip.file(
        'payin.php',
`<?php
require_once 'config.php';

function create_payin($amount, $method, $customerPhone, $successUrl, $cancelUrl, $callbackUrl) {
    $url = get_api_url('payin/create');
    
    $payload = [
        'amount' => (float)$amount,
        'currency' => 'BDT',
        'method' => $method, // 'bKash', 'Nagad', or 'Rocket'
        'customer_phone' => $customerPhone,
        'success_url' => $successUrl,
        'cancel_url' => $cancelUrl,
        'callback_url' => $callbackUrl
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'X-API-KEY: ' . CP_API_KEY
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        'status_code' => $httpCode,
        'data' => json_decode($response, true)
    ];
}

// Example Usage:
/*
$result = create_payin(
    500.00,
    'bKash',
    '017XXXXXXXX',
    'https://yoursite.com/success.php',
    'https://yoursite.com/cancel.php',
    'https://yoursite.com/webhook.php'
);

if (isset($result['data']['payment_url'])) {
    header('Location: ' . $result['data']['payment_url']);
    exit();
}
*/
?>`
      );

      // 3. payout.php
      zip.file(
        'payout.php',
`<?php
require_once 'config.php';

function create_payout($amount, $method, $walletNumber, $payoutType = 'Personal') {
    $url = get_api_url('payout/create');
    
    $payload = [
        'amount' => (float)$amount,
        'currency' => 'BDT',
        'method' => $method,
        'wallet_number' => $walletNumber,
        'payout_type' => $payoutType
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'X-API-KEY: ' . CP_API_KEY
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return json_decode($response, true);
}
?>`
      );

      // 4. webhook.php
      zip.file(
        'webhook.php',
`<?php
require_once 'config.php';

// Receive IPN Callback POST
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid payload']);
    exit();
}

$transactionId = $data['transaction_id'] ?? '';
$trxId = $data['trx_id'] ?? '';
$status = $data['status'] ?? ''; // 'Success', 'Pending', 'Failed'
$amount = $data['amount'] ?? 0;

if ($status === 'Success') {
    // Transaction Verified Successfully!
    // Update order status in your database here...
    
    http_response_code(200);
    echo json_encode(['status' => 'acknowledged', 'message' => 'Payment processed successfully']);
} else {
    http_response_code(200);
    echo json_encode(['status' => 'received']);
}
?>`
      );

      // Generate Zip Blob
      const content = await zip.generateAsync({ type: 'blob' });
      const blobUrl = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'tkpaybd_php_kit.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error('ZIP creation error:', e);
    } finally {
      setDownloadingZip(false);
    }
  };

  const codeSnippets = {
    payin: {
      php: `$data = [
    'trx_id'           => 'PAY-' . time(),
    'amount'           => 1500.00,
    'method_code'      => 101,
    'customer_name'    => 'John Doe',
    'callback_url'     => 'https://yourdomain.com/webhook/payin',
    'customer_email'   => 'john@example.com',
    'customer_phone'   => '+8801234567890',
    'return_url'       => 'https://yourdomain.com/success',
];

$ch = curl_init('https://tkpaybd.site/api/v1/payin/create.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'X-API-Key: YOUR_API_KEY',
    'X-Merchant-ID: YOUR_MERCHANT_ID',
]);
$result = json_decode(curl_exec($ch), true);

if ($result['success']) {
    header('Location: ' . $result['data']['payment_url']);
}`,
      curl: `curl -X POST https://tkpaybd.site/api/v1/payin/create.php \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "X-Merchant-ID: YOUR_MERCHANT_ID" \\
  -H "Content-Type: application/json" \\
  -d '{
    "trx_id": "PAY-1730374800",
    "amount": 1500.00,
    "method_code": 101,
    "customer_name": "John Doe",
    "customer_email": "customer@example.com",
    "customer_phone": "017XXXXXXXX",
    "customer_address": "Dhaka, Bangladesh",
    "callback_url": "https://yoursite.com/callback.php",
    "return_url": "https://yoursite.com/return.php",
    "description": "Payment for Order #1234"
  }'`,
      nodejs: `const axios = require('axios');

const response = await axios.post('https://tkpaybd.site/api/v1/payin/create.php', {
  trx_id: 'PAY-' + Date.now(),
  amount: 1500.00,
  method_code: 101,
  customer_name: 'John Doe',
  customer_email: 'customer@example.com',
  customer_phone: '017XXXXXXXX',
  customer_address: 'Dhaka, Bangladesh',
  callback_url: 'https://yoursite.com/callback.php',
  return_url: 'https://yoursite.com/return.php',
  description: 'Payment for Order #1234'
}, {
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'X-Merchant-ID': 'YOUR_MERCHANT_ID',
    'Content-Type': 'application/json'
  }
});

console.log(response.data);`,
      python: `import requests, time

url = "https://tkpaybd.site/api/v1/payin/create.php"
headers = {
    "X-API-Key": "YOUR_API_KEY",
    "X-Merchant-ID": "YOUR_MERCHANT_ID",
    "Content-Type": "application/json"
}
payload = {
    "trx_id": f"PAY-{int(time.time())}",
    "amount": 1500.00,
    "method_code": 101,
    "customer_name": "John Doe",
    "customer_email": "customer@example.com",
    "customer_phone": "017XXXXXXXX",
    "customer_address": "Dhaka, Bangladesh",
    "callback_url": "https://yoursite.com/callback.php",
    "return_url": "https://yoursite.com/return.php",
    "description": "Payment for Order #1234"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`
    },
    payout: {
      php: `$data = [
    'trx_id'           => 'WIT-' . time(),
    'amount'           => 1000.00,
    'method_code'      => 101,
    'account_number'   => '01712345678',
    'account_name'     => 'John Doe',
    'notify_url'       => 'https://yourdomain.com/webhook/payout',
    'description'      => 'Commission payout',
];

$ch = curl_init('https://tkpaybd.site/api/v1/payout/create.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'X-API-Key: YOUR_API_KEY',
    'X-Merchant-ID: YOUR_MERCHANT_ID',
]);
$result = json_decode(curl_exec($ch), true);`,
      curl: `curl -X POST https://tkpaybd.site/api/v1/payout/create.php \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "X-Merchant-ID: YOUR_MERCHANT_ID" \\
  -H "Content-Type: application/json" \\
  -d '{
    "trx_id": "WIT-1730374800",
    "amount": 1000.00,
    "method_code": 101,
    "account_number": "01712345678",
    "account_name": "John Doe",
    "notify_url": "https://yourdomain.com/webhook/payout",
    "description": "Commission payout"
  }'`,
      nodejs: `const axios = require('axios');

const response = await axios.post('https://tkpaybd.site/api/v1/payout/create.php', {
  trx_id: 'WIT-' + Date.now(),
  amount: 1000.00,
  method_code: 101,
  account_number: '01712345678',
  account_name: 'John Doe',
  notify_url: 'https://yourdomain.com/webhook/payout',
  description: 'Commission payout'
}, {
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'X-Merchant-ID': 'YOUR_MERCHANT_ID',
    'Content-Type': 'application/json'
  }
});

console.log(response.data);`,
      python: `import requests, time

url = "https://tkpaybd.site/api/v1/payout/create.php"
headers = {
    "X-API-Key": "YOUR_API_KEY",
    "X-Merchant-ID": "YOUR_MERCHANT_ID",
    "Content-Type": "application/json"
}
payload = {
    "trx_id": f"WIT-{int(time.time())}",
    "amount": 1000.00,
    "method_code": 101,
    "account_number": "01712345678",
    "account_name": "John Doe",
    "notify_url": "https://yourdomain.com/webhook/payout",
    "description": "Commission payout"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`
    }
  };

  return (
    <div className="min-h-screen bg-[#070b16] text-slate-100 font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200 flex flex-col">
      
      {/* 1. TOP NAVBAR - Mobile & Desktop Friendly */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#070b16]/95 backdrop-blur-xl border-b border-slate-800/90 h-16 sm:h-20 flex items-center px-4 sm:px-6 justify-between shadow-lg shadow-black/40">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Toggle Button - Visible on mobile/tablet */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
            title="Toggle Navigation Menu"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Title - "API Reference" matching exact screenshot */}
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>API Reference</span>
            </h1>
          </div>
        </div>

        {/* Right side navigation actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="bg-[#101935] text-[#818cf8] border border-[#3b497a]/60 text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full shadow-xs shrink-0">
            v1.0 · REST
          </span>
          <Link
            to="/merchant/login.php"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-xl transition hover:bg-slate-800/60"
          >
            Merchant Portal
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-xl transition cursor-pointer border border-slate-700/60 shadow-2xs shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">TKPayBD Home</span>
            <span className="xs:hidden">Home</span>
          </Link>
        </div>
      </header>

      {/* 2. MOBILE NAVIGATION DRAWER - Exact Match to Screenshot */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-xs flex" onClick={() => setIsSidebarOpen(false)}>
          <div 
            className="w-72 sm:w-80 bg-[#090f1d] border-r border-slate-800/90 h-full p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-5">
              {/* Drawer Header matching screenshot */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-black text-xs shadow-md shadow-indigo-500/20">
                    TK
                  </div>
                  <div>
                    <h2 className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-tight">
                      TKPayBD
                    </h2>
                    <p className="text-[11px] text-slate-400 font-medium">API Documentation</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categorized Navigation matching screenshot */}
              <div className="space-y-4">
                {/* GETTING STARTED */}
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-3 block mb-1.5">
                    GETTING STARTED
                  </span>
                  <nav className="space-y-0.5 text-xs">
                    <button 
                      onClick={() => scrollToSection('overview')}
                      className={`w-full text-left px-3 py-2 rounded-xl transition cursor-pointer ${
                        activeNav === 'overview' 
                          ? 'bg-[#182348] text-white font-semibold shadow-xs' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      Overview
                    </button>

                    <button 
                      onClick={() => scrollToSection('sandbox')}
                      className={`w-full text-left px-3 py-2 rounded-xl transition cursor-pointer ${
                        activeNav === 'sandbox' 
                          ? 'bg-[#182348] text-white font-semibold shadow-xs' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      Sandbox (Test Mode)
                    </button>

                    <button 
                      onClick={() => scrollToSection('auth')}
                      className={`w-full text-left px-3 py-2 rounded-xl transition cursor-pointer ${
                        activeNav === 'auth' 
                          ? 'bg-[#182348] text-white font-semibold shadow-xs' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      Authentication
                    </button>

                    <button 
                      onClick={() => scrollToSection('channels')}
                      className={`w-full text-left px-3 py-2 rounded-xl transition cursor-pointer ${
                        activeNav === 'channels' 
                          ? 'bg-[#182348] text-white font-semibold shadow-xs' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      Payment Channels
                    </button>
                  </nav>
                </div>

                {/* ENDPOINTS */}
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-3 block mb-1.5">
                    ENDPOINTS
                  </span>
                  <nav className="space-y-0.5 text-xs">
                    <button 
                      onClick={() => scrollToSection('payin')}
                      className={`w-full text-left px-3 py-2 rounded-xl transition cursor-pointer ${
                        activeNav === 'payin' 
                          ? 'bg-[#182348] text-white font-semibold shadow-xs' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      PayIn — Create Payment
                    </button>

                    <button 
                      onClick={() => scrollToSection('payout')}
                      className={`w-full text-left px-3 py-2 rounded-xl transition cursor-pointer ${
                        activeNav === 'payout' 
                          ? 'bg-[#182348] text-white font-semibold shadow-xs' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      PayOut — Withdrawal
                    </button>

                    <button 
                      onClick={() => scrollToSection('status')}
                      className={`w-full text-left px-3 py-2 rounded-xl transition cursor-pointer ${
                        activeNav === 'status' 
                          ? 'bg-[#182348] text-white font-semibold shadow-xs' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      Check Status
                    </button>
                  </nav>
                </div>

                {/* INTEGRATION */}
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-3 block mb-1.5">
                    INTEGRATION
                  </span>
                  <nav className="space-y-0.5 text-xs">
                    <button 
                      onClick={() => scrollToSection('webhook')}
                      className={`w-full text-left px-3 py-2 rounded-xl transition cursor-pointer ${
                        activeNav === 'webhook' 
                          ? 'bg-[#182348] text-white font-semibold shadow-xs' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      Callback / Webhook
                    </button>

                    <button 
                      onClick={() => scrollToSection('errors')}
                      className={`w-full text-left px-3 py-2 rounded-xl transition cursor-pointer ${
                        activeNav === 'errors' 
                          ? 'bg-[#182348] text-white font-semibold shadow-xs' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      Error Codes
                    </button>
                  </nav>
                </div>

                {/* RESOURCES */}
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-3 block mb-1.5">
                    RESOURCES
                  </span>
                  <div className="pt-0.5">
                    <button
                      type="button"
                      onClick={handleDownloadPhpKit}
                      disabled={downloadingZip}
                      className="w-full text-left px-3 py-2.5 rounded-xl border border-indigo-500/30 bg-[#161d38] text-indigo-300 hover:text-white hover:bg-indigo-900/50 text-xs font-semibold flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                    >
                      <Download className="w-4 h-4 shrink-0" />
                      <span>{downloadingZip ? 'Creating Zip...' : 'Download PHP Kit'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer matching screenshot: Merchant Login · v1.0 */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <Link 
                to="/merchant/login.php" 
                className="hover:text-white font-medium transition cursor-pointer"
              >
                Merchant Login
              </Link>
              <span className="text-slate-600">·</span>
              <span className="text-slate-500 font-mono">v1.0</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. RESPONSIVE CONTAINER WITH DESKTOP STICKY SIDEBAR */}
      <div className="pt-20 sm:pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex gap-8 xl:gap-10 items-start">
        
        {/* DESKTOP SIDEBAR - Categorized navigation on large screens */}
        <aside className="hidden lg:block w-64 xl:w-72 shrink-0 sticky top-24 self-start max-h-[calc(100vh-7.5rem)] overflow-y-auto pr-2">
          <div className="bg-[#090f1d] border border-slate-800/90 rounded-3xl p-5 shadow-xl space-y-5">
            {/* GETTING STARTED */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-3 block mb-1.5">
                GETTING STARTED
              </span>
              <nav className="space-y-0.5 text-xs">
                <button 
                  onClick={() => scrollToSection('overview')}
                  className={`w-full text-left px-3 py-2 rounded-xl transition cursor-pointer ${
                    activeNav === 'overview' 
                      ? 'bg-[#182348] text-white font-semibold shadow-xs' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  Overview
                </button>

                <button 
                  onClick={() => scrollToSection('sandbox')}
                  className={`w-full text-left px-3 py-2 rounded-xl transition cursor-pointer ${
                    activeNav === 'sandbox' 
                      ? 'bg-[#182348] text-white font-semibold shadow-xs' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  Sandbox (Test Mode)
                </button>

                <button 
                  onClick={() => scrollToSection('auth')}
                  className={`w-full text-left px-3 py-2 rounded-xl transition cursor-pointer ${
                    activeNav === 'auth' 
                      ? 'bg-[#182348] text-white font-semibold shadow-xs' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  Authentication
                </button>

                <button 
                  onClick={() => scrollToSection('channels')}
                  className={`w-full text-left px-3 py-2 rounded-xl transition cursor-pointer ${
                    activeNav === 'channels' 
                      ? 'bg-[#182348] text-white font-semibold shadow-xs' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  Payment Channels
                </button>
              </nav>
            </div>

            {/* ENDPOINTS */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-3 block mb-1.5">
                ENDPOINTS
              </span>
              <nav className="space-y-0.5 text-xs">
                <button 
                  onClick={() => scrollToSection('payin')}
                  className={`w-full text-left px-3 py-2 rounded-xl transition cursor-pointer ${
                    activeNav === 'payin' 
                      ? 'bg-[#182348] text-white font-semibold shadow-xs' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  PayIn — Create Payment
                </button>

                <button 
                  onClick={() => scrollToSection('payout')}
                  className={`w-full text-left px-3 py-2 rounded-xl transition cursor-pointer ${
                    activeNav === 'payout' 
                      ? 'bg-[#182348] text-white font-semibold shadow-xs' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  PayOut — Withdrawal
                </button>

                <button 
                  onClick={() => scrollToSection('status')}
                  className={`w-full text-left px-3 py-2 rounded-xl transition cursor-pointer ${
                    activeNav === 'status' 
                      ? 'bg-[#182348] text-white font-semibold shadow-xs' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  Check Status
                </button>
              </nav>
            </div>

            {/* INTEGRATION */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-3 block mb-1.5">
                INTEGRATION
              </span>
              <nav className="space-y-0.5 text-xs">
                <button 
                  onClick={() => scrollToSection('webhook')}
                  className={`w-full text-left px-3 py-2 rounded-xl transition cursor-pointer ${
                    activeNav === 'webhook' 
                      ? 'bg-[#182348] text-white font-semibold shadow-xs' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  Callback / Webhook
                </button>

                <button 
                  onClick={() => scrollToSection('errors')}
                  className={`w-full text-left px-3 py-2 rounded-xl transition cursor-pointer ${
                    activeNav === 'errors' 
                      ? 'bg-[#182348] text-white font-semibold shadow-xs' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  Error Codes
                </button>
              </nav>
            </div>

            {/* RESOURCES */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-3 block mb-1.5">
                RESOURCES
              </span>
              <div className="pt-0.5 space-y-2">
                <button
                  type="button"
                  onClick={handleDownloadPhpKit}
                  disabled={downloadingZip}
                  className="w-full text-left px-3 py-2.5 rounded-xl border border-indigo-500/30 bg-[#161d38] text-indigo-300 hover:text-white hover:bg-indigo-900/50 text-xs font-semibold flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span>{downloadingZip ? 'Creating Zip...' : 'Download PHP Kit'}</span>
                </button>
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <Link 
                to="/merchant/login.php" 
                className="hover:text-white font-medium transition cursor-pointer"
              >
                Merchant Login
              </Link>
              <span className="text-slate-600">·</span>
              <span className="text-slate-500 font-mono">v1.0</span>
            </div>
          </div>
        </aside>

        {/* MAIN DOCUMENTATION CONTENT */}
        <main className="flex-1 min-w-0 max-w-4xl space-y-12">
        
        {/* SECTION 1: OVERVIEW - EXACT MATCH TO USER'S UPLOADED SCREENSHOT */}
        <section id="overview" className="space-y-5 pt-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              Overview
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Integrate PayIn and PayOut into your application using our simple REST API.
            </p>
          </div>

          {/* Outer Overview Container Box (Matches Screenshot) */}
          <div className="bg-[#0b1222] rounded-3xl p-5 sm:p-7 border border-slate-800/90 shadow-2xl space-y-6">
            
            {/* BASE URL Box */}
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                BASE URL
              </span>
              <div className="bg-[#070b16] border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-inner">
                <span className="font-mono font-bold text-xs sm:text-sm text-indigo-300 truncate">
                  https://tkpaybd.site/api/v1/
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('https://tkpaybd.site/api/v1/', 'base_url')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 shrink-0 border border-slate-700/60 cursor-pointer"
                >
                  {copiedText === 'base_url' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* PHP Integration Kit Card (Matches Screenshot Button) */}
            <div className="bg-[#0e172e] p-5 rounded-2xl border border-slate-800/90 space-y-3">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  PHP Integration Kit
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Ready-to-use PHP files — config, payin, payout, webhook
                </p>
              </div>

              {/* Purple Download Button matching screenshot */}
              <button
                type="button"
                onClick={handleDownloadPhpKit}
                disabled={downloadingZip}
                className="bg-[#6366f1] hover:bg-[#4f46e5] text-white font-extrabold px-5 py-3 rounded-2xl text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer active:scale-95 border border-indigo-400/20 disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-indigo-100" />
                <span>{downloadingZip ? 'Preparing ZIP Archive...' : 'Download Kit (.zip)'}</span>
              </button>
            </div>

            {/* REQUEST FORMAT */}
            <div className="space-y-2 pt-1 border-t border-slate-800/80">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                REQUEST FORMAT
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed flex items-center flex-wrap gap-1.5">
                <span>All requests must be</span>
                <span className="bg-slate-800 text-indigo-300 font-mono font-bold text-[11px] px-2 py-0.5 rounded border border-slate-700/60">
                  POST
                </span>
                <span>with</span>
                <span className="bg-slate-800 text-emerald-300 font-mono font-bold text-[11px] px-2 py-0.5 rounded border border-slate-700/60">
                  Content-Type: application/json
                </span>
                <span>body. Responses are always JSON.</span>
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: SANDBOX (TEST MODE) - EXACT MATCH TO USER'S UPLOADED SCREENSHOT */}
        <section id="sandbox" className="space-y-5 pt-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
              Sandbox (Test Mode)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Test your integration end-to-end without moving real money. The sandbox mirrors the live API exactly — same endpoints, same callback signatures.
            </p>
          </div>

          <div className="bg-[#0b1222] rounded-3xl p-5 sm:p-7 border border-slate-800/90 shadow-2xl space-y-6">
            {/* SANDBOX BASE URL */}
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                SANDBOX BASE URL
              </span>
              <div className="bg-[#070b16] border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-inner">
                <span className="font-mono font-bold text-xs sm:text-sm text-amber-300 truncate">
                  https://sandbox.tkpaybd.site/api/v1/
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('https://sandbox.tkpaybd.site/api/v1/', 'sandbox_url')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 shrink-0 border border-slate-700/60 cursor-pointer"
                >
                  {copiedText === 'sandbox_url' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* DEMO CREDENTIALS TABLE - Exact Match to Screenshot */}
            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                DEMO CREDENTIALS
              </span>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="pb-3 w-1/3">FIELD</th>
                      <th className="pb-3">VALUE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    <tr>
                      <td className="py-3.5">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-200 font-mono text-xs font-semibold border border-slate-700/60">
                          Merchant ID
                        </span>
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs sm:text-sm text-indigo-300 bg-[#070b16] px-3 py-1 rounded-lg border border-slate-800 font-semibold">
                            M-SANDBOX
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('M-SANDBOX', 'demo_mid')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            title="Copy Merchant ID"
                          >
                            {copiedText === 'demo_mid' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3.5">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-200 font-mono text-xs font-semibold border border-slate-700/60">
                          API Key
                        </span>
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs sm:text-sm text-emerald-300 bg-[#070b16] px-3 py-1 rounded-lg border border-slate-800">
                            pk_test_demo1234567890ab
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('pk_test_demo1234567890ab', 'demo_apk')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            title="Copy API Key"
                          >
                            {copiedText === 'demo_apk' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3.5">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-200 font-mono text-xs font-semibold border border-slate-700/60">
                          Secret Key
                        </span>
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs sm:text-sm text-pink-300 bg-[#070b16] px-3 py-1 rounded-lg border border-slate-800">
                            sk_test_demo1234567890ab
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('sk_test_demo1234567890ab', 'demo_sec')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            title="Copy Secret Key"
                          >
                            {copiedText === 'demo_sec' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sandbox Notice / Callout Box matching screenshot */}
            <div className="bg-[#070d1e] border border-indigo-950/60 rounded-2xl p-4 sm:p-5 flex items-start gap-3 text-xs sm:text-[13px] text-slate-300 leading-relaxed shadow-sm">
              <span className="text-slate-400 text-sm mt-0.5 select-none shrink-0 font-bold">◦</span>
              <div>
                Sandbox API keys always start with <code className="text-indigo-300 font-mono font-bold bg-[#0b1222] px-1.5 py-0.5 rounded border border-indigo-900/50">pk_test_</code>. Live keys cannot be used in the sandbox and vice versa. Payins return a hosted checkout that auto-completes the payment and fires a signed callback to your <code className="text-amber-300 font-mono font-bold bg-[#0b1222] px-1.5 py-0.5 rounded border border-slate-800">callback_url</code> — verify it the same way as live.
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: AUTHENTICATION - EXACT MATCH TO USER'S UPLOADED SCREENSHOT */}
        <section id="auth" className="space-y-4 pt-4 border-t border-slate-800/80">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-1">
              Authentication
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              All API requests require the following HTTP headers.
            </p>
          </div>

          <div className="bg-[#0b1222] rounded-3xl p-5 sm:p-7 border border-slate-800/90 shadow-2xl space-y-5">
            <div className="overflow-x-auto pb-1">
              <table className="w-full min-w-[460px] text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 pr-4">HEADER</th>
                    <th className="pb-3 pr-4">VALUE</th>
                    <th className="pb-3 text-right sm:text-left">REQUIRED</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  <tr>
                    <td className="py-3.5 pr-4">
                      <span className="inline-block px-3 py-1 rounded-xl bg-[#0c243c] text-[#38bdf8] font-mono text-xs font-semibold border border-[#0284c7]/40 shadow-xs">
                        X-API-Key
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-300 text-xs sm:text-sm">
                      Your API Key (from merchant panel)
                    </td>
                    <td className="py-3.5 text-red-500 font-semibold text-xs sm:text-sm text-right sm:text-left">
                      Yes
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4">
                      <span className="inline-block px-3 py-1 rounded-xl bg-[#0c243c] text-[#38bdf8] font-mono text-xs font-semibold border border-[#0284c7]/40 shadow-xs">
                        X-Merchant-ID
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-300 text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span>Your Merchant ID e.g.</span>
                        <code className="bg-[#121c33] text-slate-200 px-2 py-0.5 rounded border border-slate-700/60 font-mono text-xs font-bold">
                          M2024XXXXXX
                        </code>
                      </div>
                    </td>
                    <td className="py-3.5 text-red-500 font-semibold text-xs sm:text-sm text-right sm:text-left">
                      Yes
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4">
                      <span className="inline-block px-3 py-1 rounded-xl bg-[#141d38] text-[#818cf8] font-mono text-xs font-semibold border border-[#6366f1]/40 shadow-xs">
                        Content-Type
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-300 text-xs sm:text-sm">
                      <code className="bg-[#121c33] text-indigo-300 px-2 py-0.5 rounded border border-slate-700/60 font-mono text-xs">
                        application/json
                      </code>
                    </td>
                    <td className="py-3.5 text-red-500 font-semibold text-xs sm:text-sm text-right sm:text-left">
                      Yes
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Secret key note callout box matching screenshot */}
            <div className="bg-[#0b1426] border border-blue-900/50 rounded-2xl p-4 flex items-start gap-2.5 text-xs sm:text-[13px] text-slate-300 leading-relaxed shadow-sm">
              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                Secret Key is <strong className="text-white font-bold">not</strong> needed for API calls — only for verifying incoming callbacks.
              </div>
            </div>

            {/* EXAMPLE HEADERS Box matching screenshot */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                EXAMPLE HEADERS
              </span>
              <div className="bg-[#070b16] rounded-2xl border border-slate-800 p-4 relative font-mono text-xs text-indigo-200 leading-relaxed">
                <button
                  type="button"
                  onClick={() => copyToClipboard(`X-API-Key: your_api_key_here\nX-Merchant-ID: M2024XXXXXX\nContent-Type: application/json`, 'example_headers')}
                  className="absolute top-3.5 right-3.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700/60 cursor-pointer"
                >
                  {copiedText === 'example_headers' ? (
                    <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Copied</span>
                  ) : (
                    <span>Copy</span>
                  )}
                </button>
                <div className="space-y-1 pr-16">
                  <div><span className="text-[#7dd3fc]">X-API-Key:</span> your_api_key_here</div>
                  <div><span className="text-[#7dd3fc]">X-Merchant-ID:</span> M2024XXXXXX</div>
                  <div><span className="text-[#7dd3fc]">Content-Type:</span> application/json</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: PAYMENT CHANNELS - EXACT MATCH TO USER'S SCREENSHOT */}
        <section id="channels" className="space-y-4 pt-6 border-t border-slate-800/80">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Payment Channels
            </h2>
          </div>

          <div className="bg-[#0b1222] rounded-3xl p-5 sm:p-7 border border-slate-800/90 shadow-2xl space-y-4">
            <div className="overflow-x-auto pb-1">
              <table className="w-full min-w-[460px] text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 pr-4">CHANNEL</th>
                    <th className="pb-3 pr-4">CODE</th>
                    <th className="pb-3 pr-4">PAYIN</th>
                    <th className="pb-3">PAYOUT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {/* bKash */}
                  <tr>
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-md overflow-hidden shrink-0">
                          <img src={BKASH_LOGO_URL} alt="bKash" className="w-full h-full object-contain" />
                        </div>
                        <span className="font-bold text-white text-xs sm:text-sm">bKash</span>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-lg bg-slate-800/90 text-slate-200 font-mono text-xs font-semibold border border-slate-700/60">
                        101
                      </span>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#064e3b]/80 text-[#34d399] font-semibold text-xs border border-emerald-500/30">
                        ✓ Supported
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#064e3b]/80 text-[#34d399] font-semibold text-xs border border-emerald-500/30">
                        ✓ Supported
                      </span>
                    </td>
                  </tr>

                  {/* Nagad */}
                  <tr>
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 flex items-center justify-center shrink-0">
                          <img src={NAGAD_LOGO_URL} alt="Nagad" className="w-full h-full object-contain" />
                        </div>
                        <span className="font-bold text-white text-xs sm:text-sm">Nagad</span>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-lg bg-slate-800/90 text-slate-200 font-mono text-xs font-semibold border border-slate-700/60">
                        102
                      </span>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#064e3b]/80 text-[#34d399] font-semibold text-xs border border-emerald-500/30">
                        ✓ Supported
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#064e3b]/80 text-[#34d399] font-semibold text-xs border border-emerald-500/30">
                        ✓ Supported
                      </span>
                    </td>
                  </tr>

                  {/* Rocket */}
                  <tr>
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-md overflow-hidden shrink-0">
                          <img src={ROCKET_LOGO_URL} alt="Rocket" className="w-full h-full object-contain" />
                        </div>
                        <span className="font-bold text-white text-xs sm:text-sm">Rocket</span>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-lg bg-slate-800/90 text-slate-200 font-mono text-xs font-semibold border border-slate-700/60">
                        103
                      </span>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#064e3b]/80 text-[#34d399] font-semibold text-xs border border-emerald-500/30">
                        ✓ Supported
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#064e3b]/80 text-[#34d399] font-semibold text-xs border border-emerald-500/30">
                        ✓ Supported
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              Currency is always <strong className="text-white font-bold">BDT</strong>. More channels may be added in the future.
            </p>
          </div>
        </section>

        {/* SECTION 5: PAYIN — CREATE PAYMENT (EXACT MATCH TO USER'S SCREENSHOT) */}
        <section id="payin" className="space-y-4 pt-6 border-t border-slate-800/80">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-1">
              PayIn — Create Payment
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Create a payment request and redirect your customer to the payment page.
            </p>
          </div>

          <div className="bg-[#0b1222] rounded-3xl p-5 sm:p-7 border border-slate-800/90 shadow-2xl space-y-5">
            {/* Endpoint Pill Banner */}
            <div className="flex items-center gap-2.5 bg-[#070b16] p-3 rounded-2xl border border-slate-800 shadow-inner">
              <span className="bg-[#064e3b]/90 text-[#34d399] text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-500/40 tracking-wider">
                POST
              </span>
              <span className="font-mono text-xs sm:text-sm font-bold text-slate-300">
                /api/v1/payin/create.php
              </span>
            </div>

            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block pt-1">
              REQUEST PARAMETERS
            </span>

            <div className="overflow-x-auto pb-1">
              <table className="w-full min-w-[560px] text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 pr-4">PARAMETER</th>
                    <th className="pb-3 pr-4">TYPE</th>
                    <th className="pb-3 pr-4">DESCRIPTION</th>
                    <th className="pb-3 text-right sm:text-left">REQUIRED</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {/* trx_id */}
                  <tr>
                    <td className="py-3.5 pr-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-200 font-mono text-xs font-semibold border border-slate-700/60">
                        trx_id
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-400 font-mono text-xs sm:text-sm">string</td>
                    <td className="py-3.5 pr-4 text-slate-300 text-xs sm:text-sm">Your unique transaction ID</td>
                    <td className="py-3.5 text-red-500 font-semibold text-xs sm:text-sm text-right sm:text-left">Yes</td>
                  </tr>

                  {/* amount */}
                  <tr>
                    <td className="py-3.5 pr-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-200 font-mono text-xs font-semibold border border-slate-700/60">
                        amount
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-400 font-mono text-xs sm:text-sm">decimal</td>
                    <td className="py-3.5 pr-4 text-slate-300 text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span>Payment amount e.g.</span>
                        <code className="bg-[#121c33] text-slate-200 px-2 py-0.5 rounded border border-slate-700/60 font-mono text-xs">
                          100.50
                        </code>
                      </div>
                    </td>
                    <td className="py-3.5 text-red-500 font-semibold text-xs sm:text-sm text-right sm:text-left">Yes</td>
                  </tr>

                  {/* method_code */}
                  <tr>
                    <td className="py-3.5 pr-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-200 font-mono text-xs font-semibold border border-slate-700/60">
                        method_code
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-400 font-mono text-xs sm:text-sm">integer</td>
                    <td className="py-3.5 pr-4 text-slate-300 text-xs sm:text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <code className="bg-[#121c33] text-slate-200 px-1.5 py-0.5 rounded border border-slate-700/60 font-mono text-[11px]">101</code>
                          <span>=bKash,</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <code className="bg-[#121c33] text-slate-200 px-1.5 py-0.5 rounded border border-slate-700/60 font-mono text-[11px]">102</code>
                          <span>=Nagad,</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <code className="bg-[#121c33] text-slate-200 px-1.5 py-0.5 rounded border border-slate-700/60 font-mono text-[11px]">103</code>
                          <span>=Rocket</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-red-500 font-semibold text-xs sm:text-sm text-right sm:text-left">Yes</td>
                  </tr>

                  {/* customer_name */}
                  <tr>
                    <td className="py-3.5 pr-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-200 font-mono text-xs font-semibold border border-slate-700/60">
                        customer_name
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-400 font-mono text-xs sm:text-sm">string</td>
                    <td className="py-3.5 pr-4 text-slate-300 text-xs sm:text-sm">Customer full name</td>
                    <td className="py-3.5 text-red-500 font-semibold text-xs sm:text-sm text-right sm:text-left">Yes</td>
                  </tr>

                  {/* callback_url */}
                  <tr>
                    <td className="py-3.5 pr-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-200 font-mono text-xs font-semibold border border-slate-700/60">
                        callback_url
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-400 font-mono text-xs sm:text-sm">string</td>
                    <td className="py-3.5 pr-4 text-slate-300 text-xs sm:text-sm">Webhook URL for status notifications</td>
                    <td className="py-3.5 text-red-500 font-semibold text-xs sm:text-sm text-right sm:text-left">Yes</td>
                  </tr>

                  {/* customer_email */}
                  <tr>
                    <td className="py-3.5 pr-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-200 font-mono text-xs font-semibold border border-slate-700/60">
                        customer_email
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-400 font-mono text-xs sm:text-sm">string</td>
                    <td className="py-3.5 pr-4 text-slate-300 text-xs sm:text-sm">Customer email</td>
                    <td className="py-3.5 text-slate-400 text-xs sm:text-sm text-right sm:text-left">Optional</td>
                  </tr>

                  {/* customer_phone */}
                  <tr>
                    <td className="py-3.5 pr-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-200 font-mono text-xs font-semibold border border-slate-700/60">
                        customer_phone
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-400 font-mono text-xs sm:text-sm">string</td>
                    <td className="py-3.5 pr-4 text-slate-300 text-xs sm:text-sm">Customer phone number</td>
                    <td className="py-3.5 text-slate-400 text-xs sm:text-sm text-right sm:text-left">Optional</td>
                  </tr>

                  {/* customer_address */}
                  <tr>
                    <td className="py-3.5 pr-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-200 font-mono text-xs font-semibold border border-slate-700/60">
                        customer_address
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-400 font-mono text-xs sm:text-sm">string</td>
                    <td className="py-3.5 pr-4 text-slate-300 text-xs sm:text-sm">Customer address</td>
                    <td className="py-3.5 text-slate-400 text-xs sm:text-sm text-right sm:text-left">Optional</td>
                  </tr>

                  {/* description */}
                  <tr>
                    <td className="py-3.5 pr-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-200 font-mono text-xs font-semibold border border-slate-700/60">
                        description
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-400 font-mono text-xs sm:text-sm">string</td>
                    <td className="py-3.5 pr-4 text-slate-300 text-xs sm:text-sm">Payment description / note</td>
                    <td className="py-3.5 text-slate-400 text-xs sm:text-sm text-right sm:text-left">Optional</td>
                  </tr>

                  {/* return_url */}
                  <tr>
                    <td className="py-3.5 pr-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-200 font-mono text-xs font-semibold border border-slate-700/60">
                        return_url
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-400 font-mono text-xs sm:text-sm">string</td>
                    <td className="py-3.5 pr-4 text-slate-300 text-xs sm:text-sm">Redirect URL after payment completes</td>
                    <td className="py-3.5 text-red-500 font-semibold text-xs sm:text-sm text-right sm:text-left">Yes</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* EXAMPLE REQUEST - Matches Screenshot */}
            <div className="pt-4 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  EXAMPLE REQUEST
                </span>
                <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-bold">
                  {(['php', 'curl', 'nodejs', 'python'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setActiveLang(lang)}
                      className={`px-3 py-1 rounded-lg uppercase transition cursor-pointer ${
                        activeLang === lang ? 'bg-[#6366f1] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {lang === 'php' ? 'PHP' : lang === 'curl' ? 'cURL' : lang === 'nodejs' ? 'Node.js' : 'Python'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Snippet Box with Copy Button - Exact Screenshot Match */}
              <div className="bg-[#070b16] rounded-2xl border border-slate-800/90 p-4 relative font-mono text-xs shadow-2xl">
                <button
                  type="button"
                  onClick={() => copyToClipboard(codeSnippets.payin[activeLang], 'payin_code')}
                  className="absolute top-3.5 right-3.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition border border-slate-700/60 cursor-pointer z-10 flex items-center gap-1"
                >
                  {copiedText === 'payin_code' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <span>Copy</span>
                  )}
                </button>
                <pre className="overflow-x-auto text-xs font-mono text-[#7dd3fc] pr-16 leading-relaxed selection:bg-indigo-500/30">
                  <code>{codeSnippets.payin[activeLang]}</code>
                </pre>
              </div>
            </div>
            {/* SUCCESS RESPONSE - Matching Screenshot */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                SUCCESS RESPONSE
              </span>
              <div className="bg-[#070b16] rounded-2xl border border-slate-800 p-4 relative font-mono text-xs text-indigo-200">
                <button
                  type="button"
                  onClick={() => copyToClipboard(`{\n  "success": true,\n  "message": "Payment request created",\n  "data": {\n    "transaction_id": "TRX20241201ABC123",\n    "trx_id": "PAY-123456",\n    "amount": 1500.00,\n    "currency": "BDT",\n    "status": "pending",\n    "payment_url": "https://gateway.tkpaybd.site/pay/..."\n  }\n}`, 'success_response')}
                  className="absolute top-3.5 right-3.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700/60 cursor-pointer"
                >
                  {copiedText === 'success_response' ? (
                    <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Copied</span>
                  ) : (
                    <span>Copy</span>
                  )}
                </button>
                <pre className="text-slate-300 font-mono text-xs overflow-x-auto pr-16 leading-relaxed">
{`{
  "success": true,
  "message": "Payment request created",
  "data": {
    "transaction_id": "TRX20241201ABC123",
    "trx_id": "PAY-123456",
    "amount": 1500.00,
    "currency": "BDT",
    "status": "pending",
    "payment_url": "https://gateway.tkpaybd.site/pay/..."
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: PAYOUT — WITHDRAWAL (EXACT MATCH TO USER'S SCREENSHOT) */}
        <section id="payout" className="space-y-4 pt-6 border-t border-slate-800/80">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-1">
              PayOut — Withdrawal
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Submit a payout request to send funds to a bKash or Nagad account.
            </p>
          </div>

          <div className="bg-[#0b1222] rounded-3xl p-5 sm:p-7 border border-slate-800/90 shadow-2xl space-y-5">
            {/* Endpoint Pill Banner */}
            <div className="flex items-center gap-2.5 bg-[#070b16] p-3 rounded-2xl border border-slate-800 shadow-inner">
              <span className="bg-[#064e3b]/90 text-[#34d399] text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-500/40 tracking-wider">
                POST
              </span>
              <span className="font-mono text-xs sm:text-sm font-bold text-slate-300">
                /api/v1/payout/create.php
              </span>
            </div>

            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block pt-1">
              REQUEST PARAMETERS
            </span>

            <div className="overflow-x-auto pb-1">
              <table className="w-full min-w-[560px] text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 pr-4">PARAMETER</th>
                    <th className="pb-3 pr-4">TYPE</th>
                    <th className="pb-3 pr-4">DESCRIPTION</th>
                    <th className="pb-3 text-right sm:text-left">REQUIRED</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {/* trx_id */}
                  <tr>
                    <td className="py-3.5 pr-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-200 font-mono text-xs font-semibold border border-slate-700/60">
                        trx_id
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-400 font-mono text-xs sm:text-sm">string</td>
                    <td className="py-3.5 pr-4 text-slate-300 text-xs sm:text-sm">Your unique transaction ID</td>
                    <td className="py-3.5 text-red-500 font-semibold text-xs sm:text-sm text-right sm:text-left">Yes</td>
                  </tr>

                  {/* amount */}
                  <tr>
                    <td className="py-3.5 pr-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-200 font-mono text-xs font-semibold border border-slate-700/60">
                        amount
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-400 font-mono text-xs sm:text-sm">decimal</td>
                    <td className="py-3.5 pr-4 text-slate-300 text-xs sm:text-sm">Withdrawal amount</td>
                    <td className="py-3.5 text-red-500 font-semibold text-xs sm:text-sm text-right sm:text-left">Yes</td>
                  </tr>

                  {/* method_code */}
                  <tr>
                    <td className="py-3.5 pr-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-200 font-mono text-xs font-semibold border border-slate-700/60">
                        method_code
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-400 font-mono text-xs sm:text-sm">integer</td>
                    <td className="py-3.5 pr-4 text-slate-300 text-xs sm:text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <code className="bg-[#121c33] text-slate-200 px-1.5 py-0.5 rounded border border-slate-700/60 font-mono text-[11px]">101</code>
                          <span>=bKash,</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <code className="bg-[#121c33] text-slate-200 px-1.5 py-0.5 rounded border border-slate-700/60 font-mono text-[11px]">102</code>
                          <span>=Nagad,</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <code className="bg-[#121c33] text-slate-200 px-1.5 py-0.5 rounded border border-slate-700/60 font-mono text-[11px]">103</code>
                          <span>=Rocket</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-red-500 font-semibold text-xs sm:text-sm text-right sm:text-left">Yes</td>
                  </tr>

                  {/* account_number */}
                  <tr>
                    <td className="py-3.5 pr-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-200 font-mono text-xs font-semibold border border-slate-700/60">
                        account_number
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-400 font-mono text-xs sm:text-sm">string</td>
                    <td className="py-3.5 pr-4 text-slate-300 text-xs sm:text-sm">Recipient wallet number</td>
                    <td className="py-3.5 text-red-500 font-semibold text-xs sm:text-sm text-right sm:text-left">Yes</td>
                  </tr>

                  {/* account_name */}
                  <tr>
                    <td className="py-3.5 pr-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-200 font-mono text-xs font-semibold border border-slate-700/60">
                        account_name
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-400 font-mono text-xs sm:text-sm">string</td>
                    <td className="py-3.5 pr-4 text-slate-300 text-xs sm:text-sm">Recipient full name</td>
                    <td className="py-3.5 text-red-500 font-semibold text-xs sm:text-sm text-right sm:text-left">Yes</td>
                  </tr>

                  {/* notify_url */}
                  <tr>
                    <td className="py-3.5 pr-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-200 font-mono text-xs font-semibold border border-slate-700/60">
                        notify_url
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-400 font-mono text-xs sm:text-sm">string</td>
                    <td className="py-3.5 pr-4 text-slate-300 text-xs sm:text-sm">Webhook URL for status updates</td>
                    <td className="py-3.5 text-red-500 font-semibold text-xs sm:text-sm text-right sm:text-left">Yes</td>
                  </tr>

                  {/* description */}
                  <tr>
                    <td className="py-3.5 pr-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-200 font-mono text-xs font-semibold border border-slate-700/60">
                        description
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-400 font-mono text-xs sm:text-sm">string</td>
                    <td className="py-3.5 pr-4 text-slate-300 text-xs sm:text-sm">Payout note / reference</td>
                    <td className="py-3.5 text-slate-400 text-xs sm:text-sm text-right sm:text-left">Optional</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* EXAMPLE REQUEST - Matches Screenshot */}
            <div className="pt-4 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  EXAMPLE REQUEST
                </span>
                <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-bold">
                  {(['php', 'curl', 'nodejs', 'python'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setActiveLang(lang)}
                      className={`px-3 py-1 rounded-lg uppercase transition cursor-pointer ${
                        activeLang === lang ? 'bg-[#6366f1] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {lang === 'php' ? 'PHP' : lang === 'curl' ? 'cURL' : lang === 'nodejs' ? 'Node.js' : 'Python'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Snippet Box with Copy Button - Exact Screenshot Match */}
              <div className="bg-[#070b16] rounded-2xl border border-slate-800/90 p-4 relative font-mono text-xs shadow-2xl">
                <button
                  type="button"
                  onClick={() => copyToClipboard(codeSnippets.payout[activeLang], 'payout_code')}
                  className="absolute top-3.5 right-3.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition border border-slate-700/60 cursor-pointer z-10 flex items-center gap-1"
                >
                  {copiedText === 'payout_code' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <span>Copy</span>
                  )}
                </button>
                <pre className="overflow-x-auto text-xs font-mono text-[#7dd3fc] pr-16 leading-relaxed selection:bg-indigo-500/30">
                  <code>{codeSnippets.payout[activeLang]}</code>
                </pre>
              </div>
            </div>

            {/* SUCCESS RESPONSE - Matching Screenshot */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                SUCCESS RESPONSE
              </span>
              <div className="bg-[#070b16] rounded-2xl border border-slate-800 p-4 relative font-mono text-xs text-indigo-200">
                <button
                  type="button"
                  onClick={() => copyToClipboard(`{\n  "success": true,\n  "message": "Payout request submitted",\n  "data": {\n    "transaction_id": "TRX20241201PAY456",\n    "trx_id": "WIT-001",\n    "amount": 1000.00,\n    "fee": 20.00,\n    "net_amount": 1000.00,\n    "currency": "BDT",\n    "status": "pending",\n    "account_number": "017***5678"\n  }\n}`, 'payout_response')}
                  className="absolute top-3.5 right-3.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700/60 cursor-pointer"
                >
                  {copiedText === 'payout_response' ? (
                    <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Copied</span>
                  ) : (
                    <span>Copy</span>
                  )}
                </button>
                <pre className="text-slate-300 font-mono text-xs overflow-x-auto pr-16 leading-relaxed">
{`{
  "success": true,
  "message": "Payout request submitted",
  "data": {
    "transaction_id": "TRX20241201PAY456",
    "trx_id": "WIT-001",
    "amount": 1000.00,
    "fee": 20.00,
    "net_amount": 1000.00,
    "currency": "BDT",
    "status": "pending",
    "account_number": "017***5678"
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: CHECK STATUS (EXACT MATCH TO USER'S SCREENSHOT) */}
        <section id="status" className="space-y-4 pt-6 border-t border-slate-800/80">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-1">
              Check Status
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Query the current status of any transaction.
            </p>
          </div>

          <div className="bg-[#0b1222] rounded-3xl p-5 sm:p-7 border border-slate-800/90 shadow-2xl space-y-6">
            {/* Endpoint Pill Banner */}
            <div className="flex items-center gap-2.5 bg-[#070b16] p-3 rounded-2xl border border-slate-800 shadow-inner">
              <span className="bg-[#064e3b]/90 text-[#34d399] text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-500/40 tracking-wider">
                POST
              </span>
              <span className="font-mono text-xs sm:text-sm font-bold text-slate-300">
                /api/v1/transaction/status.php
              </span>
            </div>

            {/* REQUEST - Exact Screenshot Match */}
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                REQUEST
              </span>
              <div className="bg-[#070b16] rounded-2xl border border-slate-800/90 p-4 relative font-mono text-xs shadow-2xl">
                <button
                  type="button"
                  onClick={() => copyToClipboard(`// By system transaction_id\n{\n  "transaction_id": "TRX20241201ABC123"\n}\n\n// OR by your own trx_id\n{\n  "trx_id": "PAY-123456"\n}`, 'status_req')}
                  className="absolute top-3.5 right-3.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition border border-slate-700/60 cursor-pointer flex items-center gap-1 z-10"
                >
                  {copiedText === 'status_req' ? (
                    <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Copied</span>
                  ) : (
                    <span>Copy</span>
                  )}
                </button>
                <div className="text-xs font-mono space-y-4 pr-16 leading-relaxed">
                  <div>
                    <span className="text-slate-500">// By system transaction_id</span>
                    <div className="text-slate-200 mt-1">
                      {`{ `}<span className="text-[#34d399]">"transaction_id"</span>: <span className="text-[#38bdf8]">"TRX20241201ABC123"</span>{` }`}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">// OR by your own trx_id</span>
                    <div className="text-slate-200 mt-1">
                      {`{ `}<span className="text-[#34d399]">"trx_id"</span>: <span className="text-[#38bdf8]">"PAY-123456"</span>{` }`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TRANSACTION STATUS VALUES - Exact Screenshot Match */}
            <div className="pt-2 border-t border-slate-800/80 space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                TRANSACTION STATUS VALUES
              </span>

              <div className="space-y-3 pt-1 text-xs sm:text-sm">
                {/* pending */}
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    pending
                  </span>
                  <span className="text-slate-400">— Awaiting payment or processing</span>
                </div>

                {/* processing */}
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0"></span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    processing
                  </span>
                  <span className="text-slate-400">— Payment in progress</span>
                </div>

                {/* completed */}
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    completed
                  </span>
                  <span className="text-slate-400">— Successfully completed</span>
                </div>

                {/* failed */}
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                    failed
                  </span>
                  <span className="text-slate-400">— Payment failed</span>
                </div>

                {/* cancelled */}
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0"></span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-700/60 text-slate-300 border border-slate-600/40">
                    cancelled
                  </span>
                  <span className="text-slate-400">— Payout cancelled</span>
                </div>

                {/* refunded */}
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0"></span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-orange-500/10 text-orange-300 border border-orange-500/20">
                    refunded
                  </span>
                  <span className="text-slate-400">— Amount refunded</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 8: CALLBACK / WEBHOOK - EXACT MATCH TO SCREENSHOT */}
        <section id="webhook" className="space-y-4 pt-6 border-t border-slate-800/80">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-1">
              Callback / Webhook
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 flex items-center flex-wrap gap-1.5">
              <span>We send a POST request to your</span>
              <code className="bg-[#101935] text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-800 text-xs">
                callback_url
              </code>
              <span>whenever a transaction status changes.</span>
            </p>
          </div>

          <div className="bg-[#0b1222] rounded-3xl p-5 sm:p-7 border border-slate-800/90 shadow-2xl space-y-5">
            {/* Amber warning/verification callout box - Exact Screenshot */}
            <div className="p-4 rounded-2xl bg-[#1c1813] border border-amber-500/30 text-amber-200/90 text-xs leading-relaxed flex items-start gap-3 shadow-inner">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                Always verify the <strong className="text-white font-bold">signature</strong> to ensure the callback is genuinely from us. Return HTTP <strong className="text-white font-bold">200</strong> to acknowledge.
              </div>
            </div>

            {/* CALLBACK PAYLOAD - Exact Screenshot */}
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                CALLBACK PAYLOAD
              </span>

              <div className="bg-[#070b16] rounded-2xl border border-slate-800/90 p-4 relative font-mono text-xs shadow-2xl">
                <button
                  type="button"
                  onClick={() => copyToClipboard(`{\n  "transaction_id": "TRX20241201ABC123",\n  "trx_id": "PAY-123456",\n  "type": "payin",\n  "amount": 1500.00,\n  "currency": "BDT",\n  "status": "completed",\n  "customer_name": "John Doe",\n  "updated_at": "2024-12-01T14:35:00+06:00",\n  "signature": "sha256_hash"\n}`, 'callback_payload')}
                  className="absolute top-3.5 right-3.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition border border-slate-700/60 cursor-pointer flex items-center gap-1 z-10"
                >
                  {copiedText === 'callback_payload' ? (
                    <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Copied</span>
                  ) : (
                    <span>Copy</span>
                  )}
                </button>
                <pre className="text-slate-300 font-mono text-xs overflow-x-auto pr-16 leading-relaxed">
{`{
  `}<span className="text-[#34d399]">"transaction_id"</span>{`: `}<span className="text-[#38bdf8]">"TRX20241201ABC123"</span>{`,
  `}<span className="text-[#34d399]">"trx_id"</span>{`: `}<span className="text-[#38bdf8]">"PAY-123456"</span>{`,
  `}<span className="text-[#34d399]">"type"</span>{`: `}<span className="text-[#38bdf8]">"payin"</span>{`,
  `}<span className="text-[#34d399]">"amount"</span>{`: `}<span className="text-[#fbbf24]">1500.00</span>{`,
  `}<span className="text-[#34d399]">"currency"</span>{`: `}<span className="text-[#38bdf8]">"BDT"</span>{`,
  `}<span className="text-[#34d399]">"status"</span>{`: `}<span className="text-[#38bdf8]">"completed"</span>{`,
  `}<span className="text-[#34d399]">"customer_name"</span>{`: `}<span className="text-[#38bdf8]">"John Doe"</span>{`,
  `}<span className="text-[#34d399]">"updated_at"</span>{`: `}<span className="text-[#38bdf8]">"2024-12-01T14:35:00+06:00"</span>{`,
  `}<span className="text-[#34d399]">"signature"</span>{`: `}<span className="text-[#38bdf8]">"sha256_hash"</span>{`
}`}
                </pre>
              </div>
            </div>

            {/* Secret Key Info Callout - Exact Screenshot Match */}
            <div className="p-4 rounded-2xl bg-[#0a1428] border border-blue-500/20 text-slate-300 text-xs leading-relaxed flex items-start gap-3 shadow-inner">
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white font-bold">Secret Key</strong> is different from your API Key. Find it in your{' '}
                <Link to="/merchant/login.php" className="underline text-indigo-400 font-semibold hover:text-indigo-300">
                  Merchant Panel
                </Link>{' '}
                under API Settings.
              </div>
            </div>

            {/* VERIFY SIGNATURE (PHP) - Exact Screenshot Match */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                VERIFY SIGNATURE (PHP)
              </span>

              <div className="bg-[#070b16] rounded-2xl border border-slate-800/90 p-4 relative font-mono text-xs shadow-2xl">
                <button
                  type="button"
                  onClick={() => copyToClipboard(`$secretKey = 'YOUR_SECRET_KEY_FROM_MERCHANT_PANEL';\n$data = json_decode(file_get_contents('php://input'), true);\n\n$expected = hash('sha256',\n    $data['transaction_id'] .\n    $data['trx_id'] .\n    $data['status'] .\n    $secretKey\n);\n\nif ($data['signature'] === $expected) {\n    // Valid – update your order\n    echo json_encode(['success' => true]);\n} else {\n    http_response_code(400);\n    echo json_encode(['success' => false]);\n}`, 'verify_sig')}
                  className="absolute top-3.5 right-3.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition border border-slate-700/60 cursor-pointer flex items-center gap-1 z-10"
                >
                  {copiedText === 'verify_sig' ? (
                    <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Copied</span>
                  ) : (
                    <span>Copy</span>
                  )}
                </button>
                <div className="text-slate-300 font-mono text-xs overflow-x-auto pr-16 leading-relaxed">
                  <div>
                    <span className="text-[#38bdf8]">$secretKey</span> = <span className="text-[#34d399]">'YOUR_SECRET_KEY_FROM_MERCHANT_PANEL'</span>;
                  </div>
                  <div>
                    <span className="text-[#38bdf8]">$data</span> = <span className="text-[#fbbf24]">json_decode</span>(<span className="text-[#fbbf24]">file_get_contents</span>(<span className="text-[#34d399]">'php://input'</span>), <span className="text-[#818cf8]">true</span>);
                  </div>
                  <br />
                  <div>
                    <span className="text-[#38bdf8]">$expected</span> = <span className="text-[#fbbf24]">hash</span>(<span className="text-[#34d399]">'sha256'</span>,
                  </div>
                  <div className="pl-4">
                    <span className="text-[#38bdf8]">$data</span>[<span className="text-[#34d399]">'transaction_id'</span>] .
                  </div>
                  <div className="pl-4">
                    <span className="text-[#38bdf8]">$data</span>[<span className="text-[#34d399]">'trx_id'</span>] .
                  </div>
                  <div className="pl-4">
                    <span className="text-[#38bdf8]">$data</span>[<span className="text-[#34d399]">'status'</span>] .
                  </div>
                  <div className="pl-4">
                    <span className="text-[#38bdf8]">$secretKey</span>
                  </div>
                  <div>);</div>
                  <br />
                  <div>
                    <span className="text-[#c084fc]">if</span> (<span className="text-[#38bdf8]">$data</span>[<span className="text-[#34d399]">'signature'</span>] === <span className="text-[#38bdf8]">$expected</span>) {` {`}
                  </div>
                  <div className="pl-4 text-slate-500">
                    // Valid – update your order
                  </div>
                  <div className="pl-4">
                    <span className="text-[#c084fc]">echo</span> <span className="text-[#fbbf24]">json_encode</span>([<span className="text-[#34d399]">'success'</span> ={`>`} <span className="text-[#818cf8]">true</span>]);
                  </div>
                  <div>
                    {`} `}<span className="text-[#c084fc]">else</span> {`{`}
                  </div>
                  <div className="pl-4">
                    <span className="text-[#fbbf24]">http_response_code</span>(<span className="text-[#fbbf24]">400</span>);
                  </div>
                  <div className="pl-4">
                    <span className="text-[#c084fc]">echo</span> <span className="text-[#fbbf24]">json_encode</span>([<span className="text-[#34d399]">'success'</span> ={`>`} <span className="text-[#818cf8]">false</span>]);
                  </div>
                  <div>{`}`}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 9: ERROR CODES - EXACT MATCH TO SCREENSHOT */}
        <section id="errors" className="space-y-4 pt-6 border-t border-slate-800/80">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Error Codes
            </h2>
          </div>

          <div className="bg-[#0b1222] rounded-3xl p-5 sm:p-7 border border-slate-800/90 shadow-2xl space-y-4">
            <div className="overflow-x-auto pb-1">
              <table className="w-full min-w-[480px] text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 pr-4">CODE</th>
                    <th className="pb-3 pr-4">HTTP</th>
                    <th className="pb-3">DESCRIPTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {/* AUTH_FAILED */}
                  <tr>
                    <td className="py-3.5 pr-4 font-mono font-bold text-xs sm:text-sm text-[#f59e0b]">
                      AUTH_FAILED
                    </td>
                    <td className="py-3.5 pr-4 font-mono font-semibold text-xs sm:text-sm text-[#f59e0b]">
                      401
                    </td>
                    <td className="py-3.5 text-slate-300 text-xs sm:text-sm">
                      Invalid API Key or Merchant ID
                    </td>
                  </tr>

                  {/* INSUFFICIENT_BALANCE */}
                  <tr>
                    <td className="py-3.5 pr-4 font-mono font-bold text-xs sm:text-sm text-[#f59e0b]">
                      INSUFFICIENT_BALANCE
                    </td>
                    <td className="py-3.5 pr-4 font-mono font-semibold text-xs sm:text-sm text-[#f59e0b]">
                      402
                    </td>
                    <td className="py-3.5 text-slate-300 text-xs sm:text-sm">
                      Not enough balance for payout
                    </td>
                  </tr>

                  {/* INVALID_PARAMS */}
                  <tr>
                    <td className="py-3.5 pr-4 font-mono font-bold text-xs sm:text-sm text-[#f59e0b]">
                      INVALID_PARAMS
                    </td>
                    <td className="py-3.5 pr-4 font-mono font-semibold text-xs sm:text-sm text-[#f59e0b]">
                      400
                    </td>
                    <td className="py-3.5 text-slate-300 text-xs sm:text-sm">
                      Missing or invalid request parameters
                    </td>
                  </tr>

                  {/* DUPLICATE_ORDER */}
                  <tr>
                    <td className="py-3.5 pr-4 font-mono font-bold text-xs sm:text-sm text-[#f59e0b]">
                      DUPLICATE_ORDER
                    </td>
                    <td className="py-3.5 pr-4 font-mono font-semibold text-xs sm:text-sm text-[#f59e0b]">
                      409
                    </td>
                    <td className="py-3.5 text-slate-300 text-xs sm:text-sm">
                      Transaction ID already exists
                    </td>
                  </tr>

                  {/* INVALID_WITHDRAW_PASS */}
                  <tr>
                    <td className="py-3.5 pr-4 font-mono font-bold text-xs sm:text-sm text-[#f59e0b]">
                      INVALID_WITHDRAW_PASS
                    </td>
                    <td className="py-3.5 pr-4 font-mono font-semibold text-xs sm:text-sm text-[#f59e0b]">
                      403
                    </td>
                    <td className="py-3.5 text-slate-300 text-xs sm:text-sm">
                      Incorrect withdrawal password
                    </td>
                  </tr>

                  {/* ACCOUNT_SUSPENDED */}
                  <tr>
                    <td className="py-3.5 pr-4 font-mono font-bold text-xs sm:text-sm text-[#f59e0b]">
                      ACCOUNT_SUSPENDED
                    </td>
                    <td className="py-3.5 pr-4 font-mono font-semibold text-xs sm:text-sm text-[#f59e0b]">
                      403
                    </td>
                    <td className="py-3.5 text-slate-300 text-xs sm:text-sm">
                      Merchant account suspended
                    </td>
                  </tr>

                  {/* SERVER_ERROR */}
                  <tr>
                    <td className="py-3.5 pr-4 font-mono font-bold text-xs sm:text-sm text-[#f59e0b]">
                      SERVER_ERROR
                    </td>
                    <td className="py-3.5 pr-4 font-mono font-semibold text-xs sm:text-sm text-[#f59e0b]">
                      500
                    </td>
                    <td className="py-3.5 text-slate-300 text-xs sm:text-sm">
                      Internal server error
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-[#04070e] py-8 px-4 text-center text-xs text-slate-500">
        <p>© 2026 TKPayBD API Infrastructure. All rights reserved.</p>
      </footer>
    </div>
  );
};
