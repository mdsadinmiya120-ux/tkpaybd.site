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
  <div className="p-8 max-w-md mx-auto text-center">
    <h1 className="text-2xl font-bold mb-6 text-blue-600">TKPayBD Demo Portal</h1>
    <div className="p-6 border rounded-2xl shadow-xl bg-white space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Demo Version</h2>
      <p className="text-sm text-gray-500 mb-4">You can test the features in our demo environment before going live.</p>
      <Link 
        to="/demo" 
        className="block w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition font-bold"
      >
        Open Demo Portal
      </Link>
    </div>
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
