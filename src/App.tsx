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
  <div className="p-8">
    <h1 className="text-2xl font-bold mb-4 text-blue-600">TKPayBD Merchant Management</h1>
    <div className="space-y-4">
      <div className="p-4 border rounded shadow-sm">
        <h2 className="font-semibold mb-2">Main Application</h2>
        <div className="flex gap-4">
          <Link to="/merchant/login" className="text-blue-500 hover:underline">/merchant/login</Link>
          <Link to="/merchant/login.php" className="text-blue-500 hover:underline">/merchant/login.php</Link>
        </div>
      </div>
      <div className="p-4 border rounded shadow-sm bg-gray-50">
        <h2 className="font-semibold mb-2">Demo Version</h2>
        <Link to="/demo" className="text-green-600 hover:underline font-medium">Open Demo Portal</Link>
      </div>
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
