import { Transaction, DepositWalletNumber } from '../types';
import { database } from '../firebase';
import { ref, set, get } from 'firebase/database';

export type { DepositWalletNumber };

// Default sample fallback numbers ONLY for default admin merchant M20241018
const DEFAULT_SYSTEM_NUMBERS: DepositWalletNumber[] = [
  { id: 'def_b1', merchantId: 'M20241018', method: 'bKash', number: '01926516246', label: 'Personal', limit: 50000, isActive: true },
  { id: 'def_n1', merchantId: 'M20241018', method: 'Nagad', number: '01926516246', label: 'Personal', limit: 50000, isActive: true },
  { id: 'def_r1', merchantId: 'M20241018', method: 'Rocket', number: '01926516246', label: 'Personal', limit: 50000, isActive: true }
];

/**
 * Get all configured deposit numbers for a specific merchant.
 * STRICT ISOLATION: A merchant ONLY sees numbers assigned to their specific merchantId!
 * It will NEVER leak numbers belonging to another merchant.
 */
export const getMerchantDepositNumbers = (merchantId?: string): DepositWalletNumber[] => {
  if (!merchantId) {
    return [];
  }

  const cleanId = merchantId.trim().toLowerCase();

  try {
    // 1. Check merchant-specific localStorage key
    const saved = localStorage.getItem(`chaopaopay_merchant_numbers_${cleanId}`);
    if (saved) {
      const list = JSON.parse(saved);
      if (Array.isArray(list) && list.length > 0) {
        return list.map(item => ({ ...item, merchantId: merchantId.trim() }));
      }
    }

    // 2. Check current logged-in merchant in localStorage
    const curMerchantRaw = localStorage.getItem('chaopaopay_merchant');
    if (curMerchantRaw) {
      const cur = JSON.parse(curMerchantRaw);
      if (cur && cur.merchantId && cur.merchantId.trim().toLowerCase() === cleanId && Array.isArray(cur.depositNumbers) && cur.depositNumbers.length > 0) {
        return cur.depositNumbers.map((item: any) => ({ ...item, merchantId: merchantId.trim() }));
      }
    }

    // 3. Check all_merchants directory
    const allMerchantsRaw = localStorage.getItem('chaopaopay_all_merchants');
    if (allMerchantsRaw) {
      const all = JSON.parse(allMerchantsRaw);
      if (Array.isArray(all)) {
        const found = all.find((m: any) => m.merchantId && m.merchantId.trim().toLowerCase() === cleanId);
        if (found && Array.isArray(found.depositNumbers) && found.depositNumbers.length > 0) {
          return found.depositNumbers.map((item: any) => ({ ...item, merchantId: merchantId.trim() }));
        }
      }
    }

    // 4. Check global list filtered strictly by this merchantId
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

  // If default admin merchant and nothing saved, return default numbers
  if (cleanId === 'm20241018' || cleanId === 's01926516246') {
    return DEFAULT_SYSTEM_NUMBERS;
  }

  // Strictly return empty list for any other merchant - NEVER leak another merchant's numbers!
  return [];
};

/**
 * Get all configured deposit numbers across all merchants for the Admin Panel view.
 */
export const getAllDepositNumbers = (): DepositWalletNumber[] => {
  try {
    const map = new Map<string, DepositWalletNumber>();

    // 1. From global list
    const saved = localStorage.getItem('chaopaopay_deposit_numbers_list');
    if (saved) {
      const list = JSON.parse(saved);
      if (Array.isArray(list)) {
        list.forEach((item: any) => {
          if (item && item.number) {
            const mId = item.merchantId || 'M20241018';
            const key = `${mId}_${item.method}_${item.number}`;
            map.set(key, { ...item, merchantId: mId });
          }
        });
      }
    }

    // 2. From all merchants in storage
    const allMerchantsRaw = localStorage.getItem('chaopaopay_all_merchants');
    if (allMerchantsRaw) {
      const all = JSON.parse(allMerchantsRaw);
      if (Array.isArray(all)) {
        all.forEach((m: any) => {
          if (Array.isArray(m.depositNumbers)) {
            m.depositNumbers.forEach((item: any) => {
              if (item && item.number) {
                const key = `${m.merchantId}_${item.method}_${item.number}`;
                map.set(key, { ...item, merchantId: m.merchantId });
              }
            });
          }
        });
      }
    }

    // If map is completely empty, populate default admin numbers
    if (map.size === 0) {
      DEFAULT_SYSTEM_NUMBERS.forEach(item => {
        map.set(`M20241018_${item.method}_${item.number}`, item);
      });
    }

    return Array.from(map.values());
  } catch (e) {
    return DEFAULT_SYSTEM_NUMBERS;
  }
};

/**
 * Save deposit numbers for a specific merchant.
 * Syncs to merchant-specific localStorage, merchant profile, all_merchants, and Firebase Realtime Database.
 */
export const saveMerchantDepositNumbers = async (merchantId: string, numbers: DepositWalletNumber[]) => {
  if (!merchantId) return;
  const cleanId = merchantId.trim().toLowerCase();
  const originalId = merchantId.trim();

  // Tag every number with this merchantId
  const taggedNumbers = numbers.map(n => ({
    ...n,
    merchantId: originalId,
    id: n.id || `num_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
  }));

  // 1. Save to merchant-specific localStorage
  try {
    localStorage.setItem(`chaopaopay_merchant_numbers_${cleanId}`, JSON.stringify(taggedNumbers));

    // 2. Update current merchant profile in localStorage if matches
    const curMerchantRaw = localStorage.getItem('chaopaopay_merchant');
    if (curMerchantRaw) {
      const cur = JSON.parse(curMerchantRaw);
      if (cur && cur.merchantId && cur.merchantId.trim().toLowerCase() === cleanId) {
        cur.depositNumbers = taggedNumbers;
        if (cur.isActive === undefined || cur.isActive === false) cur.isActive = true;
        if (!cur.status || cur.status === 'Inactive') cur.status = 'Active';
        if (!cur.accountStatus || cur.accountStatus === 'Inactive') cur.accountStatus = 'Active';
        if (!cur.partnershipStatus || cur.partnershipStatus === 'Inactive' || cur.partnershipStatus === 'Rejected') cur.partnershipStatus = 'Approved';
        if (cur.isApproved === undefined) cur.isApproved = true;
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
          all[idx].depositNumbers = taggedNumbers;
          if (all[idx].isActive === undefined || all[idx].isActive === false) all[idx].isActive = true;
          if (!all[idx].status || all[idx].status === 'Inactive') all[idx].status = 'Active';
          if (!all[idx].accountStatus || all[idx].accountStatus === 'Inactive') all[idx].accountStatus = 'Active';
          if (!all[idx].partnershipStatus || all[idx].partnershipStatus === 'Inactive' || all[idx].partnershipStatus === 'Rejected') all[idx].partnershipStatus = 'Approved';
          if (all[idx].isApproved === undefined) all[idx].isApproved = true;
          localStorage.setItem('chaopaopay_all_merchants', JSON.stringify(all));
        }
      }
    }

    // 4. Update global numbers list by replacing old numbers for this merchant
    const globalRaw = localStorage.getItem('chaopaopay_deposit_numbers_list');
    let gList: any[] = globalRaw ? JSON.parse(globalRaw) : [];
    if (!Array.isArray(gList)) gList = [];
    gList = gList.filter((item: any) => !item.merchantId || item.merchantId.trim().toLowerCase() !== cleanId);
    gList = [...gList, ...taggedNumbers];
    localStorage.setItem('chaopaopay_deposit_numbers_list', JSON.stringify(gList));

    // Dispatch custom events for instant UI reactivity
    window.dispatchEvent(new CustomEvent('depositNumbersUpdated', { detail: { merchantId: originalId, numbers: taggedNumbers } }));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('LocalStorage error saving merchant numbers:', e);
  }

  // 5. Firebase Realtime Database sync
  if (database) {
    try {
      const upperId = originalId.toUpperCase();
      await Promise.all([
        set(ref(database, `merchants/${cleanId}/deposit_numbers`), taggedNumbers),
        set(ref(database, `merchants/${originalId}/deposit_numbers`), taggedNumbers),
        set(ref(database, `merchants/${upperId}/deposit_numbers`), taggedNumbers),
        set(ref(database, `merchants_directory/${cleanId}/depositNumbers`), taggedNumbers),
        set(ref(database, `merchants_directory/${originalId}/depositNumbers`), taggedNumbers),
        set(ref(database, `merchants_directory/${upperId}/depositNumbers`), taggedNumbers)
      ]);
    } catch (e) {
      console.warn('Firebase error saving merchant numbers:', e);
    }
  }
};

/**
 * Delete a specific deposit number for a merchant.
 */
export const deleteMerchantDepositNumber = async (merchantId: string, numberVal: string, method?: string) => {
  const cleanId = merchantId.trim().toLowerCase();
  const current = getMerchantDepositNumbers(merchantId);
  const updated = current.filter(n => !(n.number === numberVal && (!method || n.method.toLowerCase() === method.toLowerCase())));
  await saveMerchantDepositNumbers(merchantId, updated);

  try {
    const globalRaw = localStorage.getItem('chaopaopay_deposit_numbers_list');
    if (globalRaw) {
      let gList = JSON.parse(globalRaw);
      if (Array.isArray(gList)) {
        gList = gList.filter((item: any) => {
          if (item.merchantId && item.merchantId.trim().toLowerCase() === cleanId && item.number === numberVal) {
            return false;
          }
          return true;
        });
        localStorage.setItem('chaopaopay_deposit_numbers_list', JSON.stringify(gList));
      }
    }
  } catch (e) {}

  window.dispatchEvent(new CustomEvent('depositNumbersUpdated', { detail: { merchantId, numbers: updated } }));
  window.dispatchEvent(new Event('storage'));
};

const cacheSyncedNumbersLocally = (merchantId: string, list: DepositWalletNumber[]) => {
  const cleanId = merchantId.trim().toLowerCase();
  const originalId = merchantId.trim();
  const tagged = list.map(item => ({ ...item, merchantId: originalId }));
  try {
    localStorage.setItem(`chaopaopay_merchant_numbers_${cleanId}`, JSON.stringify(tagged));

    const curMerchantRaw = localStorage.getItem('chaopaopay_merchant');
    if (curMerchantRaw) {
      const cur = JSON.parse(curMerchantRaw);
      if (cur && cur.merchantId && cur.merchantId.trim().toLowerCase() === cleanId) {
        cur.depositNumbers = tagged;
        localStorage.setItem('chaopaopay_merchant', JSON.stringify(cur));
      }
    }

    const globalRaw = localStorage.getItem('chaopaopay_deposit_numbers_list');
    let gList: any[] = globalRaw ? JSON.parse(globalRaw) : [];
    if (!Array.isArray(gList)) gList = [];
    gList = gList.filter((item: any) => !item.merchantId || item.merchantId.trim().toLowerCase() !== cleanId);
    gList = [...gList, ...tagged];
    localStorage.setItem('chaopaopay_deposit_numbers_list', JSON.stringify(gList));

    window.dispatchEvent(new CustomEvent('depositNumbersUpdated', { detail: { merchantId: originalId, numbers: tagged } }));
  } catch (e) {}
  return tagged;
};

/**
 * Fetch numbers from Firebase for a merchant in the background (useful when opening deposit link or logging in on another device)
 */
export const syncMerchantNumbersFromFirebase = async (merchantId: string): Promise<DepositWalletNumber[] | null> => {
  if (!database || !merchantId) return null;
  const cleanId = merchantId.trim().toLowerCase();
  const originalId = merchantId.trim();
  const upperId = originalId.toUpperCase();

  const paths = [
    `merchants/${cleanId}/deposit_numbers`,
    `merchants/${originalId}/deposit_numbers`,
    `merchants/${upperId}/deposit_numbers`,
    `merchants_directory/${cleanId}/depositNumbers`,
    `merchants_directory/${originalId}/depositNumbers`,
    `merchants_directory/${upperId}/depositNumbers`
  ];

  try {
    for (const p of paths) {
      const snap = await get(ref(database, p));
      if (snap.exists()) {
        const data = snap.val();
        const rawList = Array.isArray(data) ? data : Object.values(data || {});
        const list = (rawList as DepositWalletNumber[]).filter(item => item && item.number);
        if (list.length > 0) {
          return cacheSyncedNumbersLocally(originalId, list);
        }
      }
    }
  } catch (e) {
    console.warn('Firebase sync error for merchant numbers:', e);
  }
  return null;
};

/**
 * Subscribe in real time to deposit numbers in Firebase for a merchant across devices.
 */
export const subscribeMerchantNumbersFromFirebase = (
  merchantId: string,
  onNumbers?: (numbers: DepositWalletNumber[]) => void
): (() => void) => {
  if (!database || !merchantId) return () => {};
  const cleanId = merchantId.trim().toLowerCase();
  const originalId = merchantId.trim();

  let unsubClean: (() => void) | undefined;
  let unsubOrig: (() => void) | undefined;

  import('firebase/database').then(({ onValue }) => {
    const handleSnap = (snap: any) => {
      if (snap.exists()) {
        const data = snap.val();
        const rawList = Array.isArray(data) ? data : Object.values(data || {});
        const list = (rawList as DepositWalletNumber[]).filter(item => item && item.number);
        const cached = cacheSyncedNumbersLocally(originalId, list);
        if (onNumbers) onNumbers(cached);
      }
    };
    unsubClean = onValue(ref(database, `merchants/${cleanId}/deposit_numbers`), handleSnap);
    if (originalId !== cleanId) {
      unsubOrig = onValue(ref(database, `merchants/${originalId}/deposit_numbers`), handleSnap);
    }
  }).catch(() => {});

  return () => {
    if (unsubClean) unsubClean();
    if (unsubOrig) unsubOrig();
  };
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

    const candidatePool = availableNumbers.length > 0 ? availableNumbers : methodNumbers;

    if (candidatePool.length > 0) {
      // REQUIREMENT: "একটি এডমিন প্যানেলে যদি একটির অধিক নাম্বার হয় তাহলে সেটা রেনডম ভাবে দেখাবে"
      const randomIndex = Math.floor(Math.random() * candidatePool.length);
      return candidatePool[randomIndex].number;
    }

    // Default admin fallback only
    if (merchantId && ['m20241018', 's01926516246'].includes(merchantId.trim().toLowerCase())) {
      const def = DEFAULT_SYSTEM_NUMBERS.find(d => d.method.toLowerCase() === method.toLowerCase());
      if (def) return def.number;
    }
  } catch (e) {
    console.warn('Error picking random wallet number:', e);
  }

  return '';
};

/**
 * Get detailed wallet info (number + label + total matching count) for display on deposit/checkout page.
 * If multiple numbers exist for this method, picks one RANDOMLY each time!
 */
export const getWalletDetailsForMethod = (
  method: string, 
  merchantId?: string
): { number: string; label: 'Personal' | 'Agent'; count: number; allNumbers: string[] } => {
  const merchantNumbers = getMerchantDepositNumbers(merchantId);
  const methodNumbers = merchantNumbers.filter((item: any) => 
    item && item.number && item.method && item.method.toLowerCase() === method.toLowerCase() && item.isActive !== false
  );

  const totalCount = methodNumbers.length;
  if (totalCount === 0) {
    // If it's admin merchant, check fallback
    if (merchantId && ['m20241018', 's01926516246'].includes(merchantId.trim().toLowerCase())) {
      const def = DEFAULT_SYSTEM_NUMBERS.find(d => d.method.toLowerCase() === method.toLowerCase());
      if (def) {
        return {
          number: def.number,
          label: def.label || 'Personal',
          count: 1,
          allNumbers: [def.number]
        };
      }
    }
    return {
      number: '',
      label: 'Personal',
      count: 0,
      allNumbers: []
    };
  }

  // REQUIREMENT: "আর দ্বিতীয়ত হচ্ছে একটি এডমিন প্যানেলে যদি একটির অধিক নাম্বার হয় তাহলে সেটা রেনডম ভাবে দেখাবে"
  const randomIndex = Math.floor(Math.random() * methodNumbers.length);
  const picked = methodNumbers[randomIndex];

  return {
    number: picked.number,
    label: picked.label || 'Personal',
    count: totalCount,
    allNumbers: methodNumbers.map(n => n.number)
  };
};
