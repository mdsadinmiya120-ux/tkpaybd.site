import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { ApiDocsView } from './components/ApiDocsView';
import RealMerchantApp from '../merchant/src/App';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/docs/api.php" element={<ApiDocsView />} />
        <Route path="/docs" element={<ApiDocsView />} />
        <Route path="/api-docs" element={<ApiDocsView />} />
        <Route path="/merchant/*" element={<RealMerchantApp />} />
        <Route path="/merchant/login.php" element={<RealMerchantApp />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}
