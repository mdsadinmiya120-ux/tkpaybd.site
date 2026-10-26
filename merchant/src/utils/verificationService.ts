import { VerificationRequest, MerchantProfile } from '../types';
import { database } from '../firebase';
import { ref, set, onValue } from 'firebase/database';

export const saveVerificationRequest = (req: VerificationRequest) => {
  try {
    const saved = localStorage.getItem('chaopaopay_verification_requests');
    const list: VerificationRequest[] = saved ? JSON.parse(saved) : [];
    const updated = [req, ...list.filter(item => item.id !== req.id)];
    localStorage.setItem('chaopaopay_verification_requests', JSON.stringify(updated));
  } catch (e) {
    console.warn('LocalStorage error saving verification request:', e);
  }

  if (database) {
    try {
      set(ref(database, `verification_requests/${req.id}`), req).catch(() => {});
      set(ref(database, `merchants/${req.merchantId}/latestVerificationRequest`), req).catch(() => {});
    } catch (e) {
      console.warn('Firebase error saving verification request:', e);
    }
  }

  window.dispatchEvent(new CustomEvent('verificationRequestSubmitted', { detail: req }));
  window.dispatchEvent(new Event('storage'));
};

export const getVerificationRequests = (): VerificationRequest[] => {
  try {
    const saved = localStorage.getItem('chaopaopay_verification_requests');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
};
