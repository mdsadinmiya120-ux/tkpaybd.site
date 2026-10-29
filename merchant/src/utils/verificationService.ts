import { VerificationRequest } from '../types';
import { database } from '../firebase';
import { ref, set, update } from 'firebase/database';

export const saveVerificationRequest = async (req: VerificationRequest) => {
  try {
    // Local storage persistence
    const saved = localStorage.getItem('chaopaopay_verification_requests');
    const list: VerificationRequest[] = saved ? JSON.parse(saved) : [];
    const updatedList = [req, ...list.filter(item => item.id !== req.id)];
    localStorage.setItem('chaopaopay_verification_requests', JSON.stringify(updatedList));
  } catch (e) {
    console.error('LocalStorage error:', e);
  }

  if (database) {
    try {
      const vRef = ref(database, 'verification_requests/' + req.id);
      await set(vRef, req);
      
      const lRef = ref(database, 'merchants/' + req.merchantId + '/latestVerificationRequest');
      await set(lRef, req);

      // Update merchant profile status in Firebase so it syncs back to the UI
      const profileRef = ref(database, 'merchants/' + req.merchantId + '/profile');
      await update(profileRef, {
        partnershipStatus: 'Pending Verification',
        kycStatus: 'Pending'
      });

      const dirRef = ref(database, 'merchants_directory/' + req.merchantId);
      await update(dirRef, {
        partnershipStatus: 'Pending Verification',
        kycStatus: 'Pending'
      });
    } catch (e) {
      console.error('Firebase save error:', e);
    }
  } else {
    console.error('Database object is null');
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

