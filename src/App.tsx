import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import RealMerchantApp from '../merchant/src/App';

const DemoPortal = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold mb-4">Merchant Login (Demo)</h1>
    <form className="space-y-4">
      <div>
        <label className="block">Username</label>
        <input type="text" className="border p-2 w-full" placeholder="Enter username" />
      </div>
      <div>
        <label className="block">Password</label>
        <input type="password" className="border p-2 w-full" placeholder="Enter password" />
      </div>
      <button className="bg-blue-500 text-white p-2 rounded">Login</button>
    </form>
  </div>
);

const Home = () => (
  <div className="p-8 max-w-2xl mx-auto text-center">
    <h1 className="text-3xl font-extrabold mb-8 text-blue-700 tracking-tight">TKPayBD Portal</h1>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Main Application Card */}
      <div className="p-6 border border-blue-100 rounded-3xl shadow-xl bg-white space-y-4 hover:border-blue-300 transition-all">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
          <span className="text-2xl font-bold">🚀</span>
        </div>
        <h2 className="text-xl font-bold text-gray-800">Main Application</h2>
        <p className="text-sm text-gray-500 mb-4">Access the live merchant management system and start processing payments.</p>
        <Link 
          to="/merchant/login.php" 
          className="block w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-200"
        >
          Open Main App
        </Link>
      </div>

      {/* Demo Version Card */}
      <div className="p-6 border border-emerald-100 rounded-3xl shadow-xl bg-white space-y-4 hover:border-emerald-300 transition-all">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
          <span className="text-2xl font-bold">🧪</span>
        </div>
        <h2 className="text-xl font-bold text-gray-800">Demo Version</h2>
        <p className="text-sm text-gray-500 mb-4">Test features and explore the interface in our safe sandbox environment.</p>
        <Link 
          to="/demo" 
          className="block w-full bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 transition font-bold shadow-lg shadow-emerald-200"
        >
          Open Demo Portal
        </Link>
      </div>
    </div>

    <p className="mt-12 text-xs text-gray-400">© 2026 TkpayBD. All rights reserved.</p>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/merchant/login" element={<RealMerchantApp />} />
        <Route path="/merchant/login.php" element={<RealMerchantApp />} />
        <Route path="/demo" element={<DemoPortal />} />
      </Routes>
    </BrowserRouter>
  );
}
