import { Transaction, DepositWalletNumber } from '../types';
import { database } from '../firebase';
import { ref, set, get } from 'firebase/database';

export type { DepositWalletNumber };

// Default sample fallback numbers if no numbers exist
const DEFAULT_SYSTEM_NUMBERS: DepositWalletNumber[] = [
  { id: 'def_b1', method: 'bKash', number: '01926516246', label: 'Personal', limit: 50000, isActive: true },
  { id: 'def_n1', method: 'Nagad', number: '01926516246', label: 'Personal', limit: 50000, isActive: true },
  { id: 'def_r1', method: 'Rocket', number: '01926516246', label: 'Personal', limit: 50000, isActive: true }
];

/**
 * Get all configured deposit numbers for a specific merchant.
 */
export const getMerchantDepositNumbers = (merchantId?: string): DepositWalletNumber[] => {
  if (!merchantId) {
    return getGlobalDepositNumbers();
  }

  const cleanId = merchantId.trim().toLowerCase();

  try {
    // 1. Check merchant-specific localStorage key
    const saved = localStorage.getItem(`chaopaopay_merchant_numbers_${cleanId}`);
    if (saved) {
      const list = JSON.parse(saved);
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    }

    // 2. Check current logged-in merchant in localStorage
    const curMerchantRaw = localStorage.getItem('chaopaopay_merchant');
    if (curMerchantRaw) {
      const cur = JSON.parse(curMerchantRaw);
      if (cur && cur.merchantId && cur.merchantId.trim().toLowerCase() === cleanId && Array.isArray(cur.depositNumbers) && cur.depositNumbers.length > 0) {
        return cur.depositNumbers;
      }
    }

    // 3. Check all_merchants directory
    const allMerchantsRaw = localStorage.getItem('chaopaopay_all_merchants');
    if (allMerchantsRaw) {
      const all = JSON.parse(allMerchantsRaw);
      if (Array.isArray(all)) {
        const found = all.find((m: any) => m.merchantId && m.merchantId.trim().toLowerCase() === cleanId);
        if (found && Array.isArray(found.depositNumbers) && found.depositNumbers.length > 0) {
          return found.depositNumbers;
        }
      }
    }

    // 4. Check global list filtered by merchantId
    const globalRaw = localStorage.getItem('chaopaopay_deposit_numbers_list');
    if (globalRaw) {
      const gList = JSON.parse(globalRaw);
      if (Array.isArray(gList)) {
        const matched = gList.filter((item: any) => item.merchantId && item.merchantId.trim().toLowerCase() === cleanId);
        if (matched.length > 0) return matched;
      }
    }
  } catch (e) {
    console.warn('Error fetching merchant deposit numbers:', e);
  }

  // Fallback to global list or defaults
  return getGlobalDepositNumbers();
};

/**
 * Get global/admin deposit numbers list
 */
export const getGlobalDepositNumbers = (): DepositWalletNumber[] => {
  try {
    const saved = localStorage.getItem('chaopaopay_deposit_numbers_list');
    if (saved) {
      const list = JSON.parse(saved);
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    }
  } catch (e) {}

  return DEFAULT_SYSTEM_NUMBERS;
};

/**
 * Save deposit numbers for a specific merchant.
 * Syncs to merchant-specific localStorage, merchant profile, all_merchants, and Firebase Realtime Database.
 */
export const saveMerchantDepositNumbers = async (merchantId: string, numbers: DepositWalletNumber[]) => {
  if (!merchantId) return;
  const cleanId = merchantId.trim().toLowerCase();
  const originalId = merchantId.trim();

  // 1. Save to merchant-specific localStorage
  try {
    localStorage.setItem(`chaopaopay_merchant_numbers_${cleanId}`, JSON.stringify(numbers));

    // 2. Update current merchant profile in localStorage if matches
    const curMerchantRaw = localStorage.getItem('chaopaopay_merchant');
    if (curMerchantRaw) {
      const cur = JSON.parse(curMerchantRaw);
      if (cur && cur.merchantId && cur.merchantId.trim().toLowerCase() === cleanId) {
        cur.depositNumbers = numbers;
        localStorage.setItem('chaopaopay_merchant', JSON.stringify(cur));
      }
    }

    // 3. Update all_merchants list
    const allMerchantsRaw = localStorage.getItem('chaopaopay_all_merchants');
    if (allMerchantsRaw) {
      const all = JSON.parse(allMerchantsRaw);
      if (Array.isArray(all)) {
        const idx = all.findIndex((m: any) => m.merchantId && m.merchantId.trim().toLowerCase() === cleanId);
        if (idx >= 0) {
          all[idx].depositNumbers = numbers;
          localStorage.setItem('chaopaopay_all_merchants', JSON.stringify(all));
        }
      }
    }

    // 4. Update global numbers list by merging merchant numbers
    const globalRaw = localStorage.getItem('chaopaopay_deposit_numbers_list');
    let gList: any[] = globalRaw ? JSON.parse(globalRaw) : [];
    if (!Array.isArray(gList)) gList = [];
    // Remove old numbers for this merchant
    gList = gList.filter((item: any) => !item.merchantId || item.merchantId.trim().toLowerCase() !== cleanId);
    // Add new numbers tagged with merchantId
    const taggedNumbers = numbers.map(n => ({ ...n, merchantId: originalId }));
    gList = [...gList, ...taggedNumbers];
    localStorage.setItem('chaopaopay_deposit_numbers_list', JSON.stringify(gList));

    // Dispatch custom events for instant UI reactivity
    window.dispatchEvent(new CustomEvent('depositNumbersUpdated', { detail: { merchantId: originalId, numbers } }));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('LocalStorage error saving merchant numbers:', e);
  }

  // 5. Firebase Realtime Database sync
  if (database) {
    try {
      await Promise.all([
        set(ref(database, `merchants/${cleanId}/deposit_numbers`), numbers),
        set(ref(database, `merchants/${originalId}/deposit_numbers`), numbers),
        set(ref(database, `merchants_directory/${cleanId}/depositNumbers`), numbers),
        set(ref(database, `merchants_directory/${originalId}/depositNumbers`), numbers)
      ]);
    } catch (e) {
      console.warn('Firebase error saving merchant numbers:', e);
    }
  }
};

/**
 * Fetch numbers from Firebase for a merchant in the background (useful when opening deposit link on another device)
 */
export const syncMerchantNumbersFromFirebase = async (merchantId: string): Promise<DepositWalletNumber[] | null> => {
  if (!database || !merchantId) return null;
  const cleanId = merchantId.trim().toLowerCase();
  const originalId = merchantId.trim();

  try {
    const snap = await get(ref(database, `merchants/${cleanId}/deposit_numbers`));
    if (snap.exists()) {
      const data = snap.val();
      const list = Array.isArray(data) ? data : Object.values(data);
      if (Array.isArray(list) && list.length > 0) {
        localStorage.setItem(`chaopaopay_merchant_numbers_${cleanId}`, JSON.stringify(list));
        window.dispatchEvent(new CustomEvent('depositNumbersUpdated', { detail: { merchantId: originalId, numbers: list } }));
        return list as DepositWalletNumber[];
      }
    }
  } catch (e) {
    console.warn('Firebase sync error for merchant numbers:', e);
  }
  return null;
};

/**
 * Get random wallet number for a merchant and payment method.
 * Requirement:
 * - Each merchant's own configured numbers for bKash, Nagad, and Rocket must be used.
 * - If there are multiple numbers (e.g. multiple bKash numbers), it chooses RANDOMLY!
 */
export const getValidRandomWalletNumber = (method: string, merchantId?: string): string => {
  try {
    const merchantNumbers = getMerchantDepositNumbers(merchantId);

    // Filter valid numbers for this method
    const methodNumbers = merchantNumbers.filter((item: any) => {
      if (!item || !item.number) return false;
      const numStr = String(item.number).trim();
      // Exclude placeholder numbers
      if (['01711223344', '01811223344', '01911223344', '12345678', '1234'].includes(numStr)) {
        return false;
      }
      return item.method && item.method.toLowerCase() === method.toLowerCase() && item.isActive !== false;
    });

    // Check transaction usage against limits if applicable
    const savedTx = localStorage.getItem('chaopaopay_transactions');
    const allTx: Transaction[] = savedTx ? JSON.parse(savedTx) : [];

    const availableNumbers = methodNumbers.filter((item: any) => {
      const limit = item.limit !== undefined ? Number(item.limit) : 50000;
      const used = allTx
        .filter(t => t.walletNumber === item.number && (t.status === 'Success' || t.status === 'Pending'))
        .reduce((sum, t) => sum + t.amount, 0);
      return used < limit;
    });

    // Target pool is available numbers, or fallback to any method numbers for this merchant
    const candidatePool = availableNumbers.length > 0 ? availableNumbers : methodNumbers;

    if (candidatePool.length > 0) {
      // REQUIREMENT: "আর একের অধিক নাম্বার যদি থাকে যেমন বিকাশ নাম্বার যদি একের অধিক থাকে সেটা রেনডম ভাবে দেখাবে"
      const randomIndex = Math.floor(Math.random() * candidatePool.length);
      return candidatePool[randomIndex].number;
    }

    // Fallback: Check global system numbers
    const globalNumbers = getGlobalDepositNumbers().filter((item: any) => 
      item && item.number && item.method && item.method.toLowerCase() === method.toLowerCase()
    );

    if (globalNumbers.length > 0) {
      const randomIndex = Math.floor(Math.random() * globalNumbers.length);
      return globalNumbers[randomIndex].number;
    }
  } catch (e) {
    console.warn('Error picking random wallet number:', e);
  }

  return '01926516246';
};

/**
 * Get detailed wallet info (number + label + total matching count) for display on deposit/checkout page.
 */
export const getWalletDetailsForMethod = (method: string, merchantId?: string): { number: string; label: 'Personal' | 'Agent'; count: number } => {
  const merchantNumbers = getMerchantDepositNumbers(merchantId);
  const methodNumbers = merchantNumbers.filter((item: any) => 
    item && item.number && item.method && item.method.toLowerCase() === method.toLowerCase() && item.isActive !== false
  );

  const totalCount = methodNumbers.length;
  const pickedNumber = getValidRandomWalletNumber(method, merchantId);
  const matchedItem = methodNumbers.find(m => m.number === pickedNumber);

  return {
    number: pickedNumber,
    label: matchedItem?.label || 'Personal',
    count: totalCount
  };
};
