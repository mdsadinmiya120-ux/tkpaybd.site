import React, { useState } from 'react';
import { KeyRound, Copy, Check, RefreshCw, Shield, Globe } from 'lucide-react';
import { ApiKeyConfig } from '../types';

interface ApiKeysTabProps {
  apiKey: ApiKeyConfig;
  onUpdateApiKey: (newKey: ApiKeyConfig) => void;
}

export const ApiKeysTab: React.FC<ApiKeysTabProps> = ({ apiKey, onUpdateApiKey }) => {
  const [copiedPublic, setCopiedPublic] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(apiKey.webhookUrl);
  const [mode, setMode] = useState<'Live' | 'Sandbox'>(apiKey.mode);
  const [saved, setSaved] = useState(false);

  const handleCopy = (text: string, type: 'public' | 'secret') => {
    navigator.clipboard.writeText(text);
    if (type === 'public') {
      setCopiedPublic(true);
      setTimeout(() => setCopiedPublic(false), 2000);
    } else {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const handleRegenerateKeys = () => {
    if (confirm('Are you sure you want to regenerate API keys? Old keys will become invalid immediately.')) {
      const newPub = 'pk_' + (mode === 'Live' ? 'live_' : 'test_') + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const newSec = 'sk_' + (mode === 'Live' ? 'live_' : 'test_') + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      onUpdateApiKey({
        ...apiKey,
        publicKey: newPub,
        secretKey: newSec,
      });
      alert('New API credentials generated successfully.');
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateApiKey({
      ...apiKey,
      webhookUrl,
      mode,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-12">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">API Credentials & Webhooks</h3>
            <p className="text-xs text-gray-500">Manage API keys and IP whitelisting for ChaoPaoPay gateway integration</p>
          </div>
        </div>

        {saved && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" /> API settings updated successfully!
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
          {/* Mode Switch */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1.5">Environment Mode</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMode('Live')}
                className={`flex-1 py-2.5 rounded-xl font-semibold border transition flex items-center justify-center gap-2 ${
                  mode === 'Live' 
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <Shield className="w-4 h-4" /> Live Mode
              </button>
              <button
                type="button"
                onClick={() => setMode('Sandbox')}
                className={`flex-1 py-2.5 rounded-xl font-semibold border transition flex items-center justify-center gap-2 ${
                  mode === 'Sandbox' 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <Globe className="w-4 h-4" /> Sandbox / Test
              </button>
            </div>
          </div>

          {/* Public Key */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1.5">Public API Key</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={apiKey.publicKey}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 font-mono text-xs text-gray-800 select-all"
              />
              <button
                type="button"
                onClick={() => handleCopy(apiKey.publicKey, 'public')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2.5 rounded-xl transition flex items-center gap-1 font-semibold shrink-0"
              >
                {copiedPublic ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedPublic ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Secret Key */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1.5">Secret API Key</label>
            <div className="flex items-center gap-2">
              <input
                type={showSecret ? 'text' : 'password'}
                readOnly
                value={apiKey.secretKey}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 font-mono text-xs text-gray-800 select-all"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2.5 rounded-xl transition font-semibold shrink-0"
              >
                {showSecret ? 'Hide' : 'Reveal'}
              </button>
              <button
                type="button"
                onClick={() => handleCopy(apiKey.secretKey, 'secret')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2.5 rounded-xl transition flex items-center gap-1 font-semibold shrink-0"
              >
                {copiedSecret ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSecret ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Webhook URL */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1.5">Webhook Notification Endpoint</label>
            <input
              type="url"
              required
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 font-mono focus:outline-none focus:border-emerald-500 focus:bg-white transition"
              placeholder="https://yourwebsite.com/api/webhook"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={handleRegenerateKeys}
              className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-1.5 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl transition"
            >
              <RefreshCw className="w-4 h-4" /> Regenerate Keys
            </button>

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
