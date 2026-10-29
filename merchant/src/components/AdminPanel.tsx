import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  UserCheck, 
  Globe, 
  Save, 
  Percent,
  Check,
  X,
  Users,
  UserX,
  Power,
  RefreshCw,
  FileText,
  Copy,
  Eye
} from 'lucide-react';
import { Transaction, MerchantProfile, VerificationRequest } from '../types';
import { BKASH_LOGO_URL, ROCKET_LOGO_URL, NAGAD_LOGO_URL } from '../constants/logos';
import { database } from '../firebase';
import { ref, set, onValue } from 'firebase/database';
import { getVerificationRequests } from '../utils/verificationService';
import { defaultMerchantsList } from '../mockData';

interface AdminPanelProps {
  merchant: MerchantProfile;
  transactions: Transaction[];
  onApproveDeposit: (txId: string) => void;
  onRejectDeposit: (txId: string) => void;
  onApprovePayout: (txId: string) => void;
  onRejectPayout: (txId: string) => void;
  onUpdateSiteSettings?: (siteUrl: string, avatarUrl: string) => void;
  onUpdateMerchant?: (updated: MerchantProfile) => void;
  onSwitchMerchant?: (targetMerchant: MerchantProfile) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  merchant,
  transactions,
  onApproveDeposit,
  onRejectDeposit,
  onApprovePayout,
  onRejectPayout,
  onUpdateSiteSettings,
  onUpdateMerchant,
  onSwitchMerchant
}) => {
  const [filterType, setFilterType] = useState<'PendingDeposit' | 'PendingWithdrawal' | 'AllDeposit' | 'AllWithdrawal'>('PendingDeposit');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const isSuperAdmin = Boolean(
    (merchant.merchantId && ['M20241018', 'S01926516246'].includes(merchant.merchantId.trim().toUpperCase())) || 
    (merchant.phone && ['01926516246', '+8801926516246'].includes(merchant.phone.trim())) ||
    (merchant.email && [
      'admin@tkpaybd.site', 
      'sadin@tkpaybd.site', 
      'admin@chaopaopaybd.site', 
      'sadin@chaopaopaybd.site',
      'mdsadinmiya120@gmail.com'
    ].includes(merchant.email.trim().toLowerCase()))
  );

  const evaluateAccountActive = (data: any, isMaster: boolean = false): boolean => {
    if (!data) return isMaster;
    if (data.isActive === false || data.status === 'Inactive' || data.accountStatus === 'Inactive') {
      return false;
    }
    if (data.isActive === true || data.status === 'Active' || data.accountStatus === 'Active') {
      return true;
    }
    if (data.partnershipStatus === 'Approved' || data.isApproved === true) {
      return true;
    }
    if (isMaster) return true;
    return true; // Default to active for registered merchants so they don't show inactive incorrectly
  };

  const evaluateCommissionActive = (data: any): boolean => {
    if (!data) return false;
    if (data.isCommissionActive === true || data.commissionStatus === 'Active') {
      return true;
    }
    if (data.isCommissionActive === false || data.commissionStatus === 'Inactive' || data.commissionStatus === 'Deactive') {
      return false;
    }
    return true; // Default active if not explicitly turned off
  };

  // Master Admin Account Status Control State & Listeners
  const [allAccounts, setAllAccounts] = useState<MerchantProfile[]>(() => {
    try {
      const saved = localStorage.getItem('chaopaopay_all_merchants');
      let list: MerchantProfile[] = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(list)) list = [];
      defaultMerchantsList.forEach(def => {
        const exists = list.some(m => m.merchantId && m.merchantId.trim().toLowerCase() === def.merchantId.trim().toLowerCase());
        if (!exists) {
          list.push(def);
        }
      });
      return list.length > 0 ? list : defaultMerchantsList;
    } catch (e) {}
    return defaultMerchantsList;
  });
  const [accountSearch, setAccountSearch] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<MerchantProfile | null>(null);
  const [editPayin, setEditPayin] = useState<string>('0');
  const [editPayout, setEditPayout] = useState<string>('0');
  const [editFeeType, setEditFeeType] = useState<'Commission' | 'Charge'>('Commission');
  const [editCommissionActive, setEditCommissionActive] = useState<boolean>(true);

  // Verification Requests State (TrxID, NID, 1350 BDT, Partner applications)
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>(() => {
    return getVerificationRequests();
  });

  useEffect(() => {
    // 1. Local listener
    const loadRequests = () => {
      setVerificationRequests(getVerificationRequests());
    };
    loadRequests();
    window.addEventListener('verificationRequestSubmitted', loadRequests);
    window.addEventListener('storage', loadRequests);

    // 2. Realtime listener from Firebase
    if (database) {
      try {
        const vrRef = ref(database, 'verification_requests');
        
        // Fetch initially
        import('firebase/database').then(({ get }) => {
          get(vrRef).then((snapshot) => {
             if (snapshot.exists()) {
                const val = snapshot.val();
                const list = Object.values(val) as VerificationRequest[];
                list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
                setVerificationRequests(list);
             }
          });
        });

        const unsub = onValue(vrRef, (snapshot) => {
          if (snapshot.exists()) {
            const val = snapshot.val();
            // Handle both object-based maps and array-based lists
            const list: VerificationRequest[] = Array.isArray(val) 
              ? val 
              : Object.values(val);
            
            list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
            setVerificationRequests(list);
          } else {
            setVerificationRequests([]);
          }
        });
        return () => {
          unsub();
          window.removeEventListener('verificationRequestSubmitted', loadRequests);
          window.removeEventListener('storage', loadRequests);
        };
      } catch (e) {}
    }

    return () => {
      window.removeEventListener('verificationRequestSubmitted', loadRequests);
      window.removeEventListener('storage', loadRequests);
    };
  }, [database]);

  useEffect(() => {
    if (!database || !isSuperAdmin) return;
    try {
      const dirRef = ref(database, 'merchants_directory');
      const unsub = onValue(dirRef, (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          const rawList = Object.values(val) as MerchantProfile[];

          const dedupedMap: { [key: string]: MerchantProfile } = {};

          defaultMerchantsList.forEach(def => {
            dedupedMap[def.merchantId.trim().toLowerCase()] = def;
          });

          rawList.forEach(m => {
            if (!m || !m.merchantId) return;
            const key = m.merchantId.trim().toLowerCase();
            const existing = dedupedMap[key];
            const isMaster = key === 's01926516246' || key === 'm20241018';

            const evaluateActive = (item: any): boolean => {
              if (isMaster) return true;
              if (!item) return false;
              if (item.isActive === false || item.status === 'Inactive' || item.accountStatus === 'Inactive' || item.partnershipStatus === 'Rejected') {
                return false;
              }
              // Only active if explicitly approved & activated
              return Boolean(
                item.isActive === true && 
                item.isApproved === true && 
                item.partnershipStatus === 'Approved'
              );
            };

            const finalAct = evaluateActive(m);
            const finalCommAct = evaluateCommissionActive(m);

            if (existing) {
              dedupedMap[key] = {
                ...existing,
                ...m,
                isActive: finalAct,
                status: m.status || (finalAct ? 'Active' : 'Inactive'),
                accountStatus: m.accountStatus || (finalAct ? 'Active' : 'Inactive'),
                partnershipStatus: m.partnershipStatus || (finalAct ? 'Approved' : 'Inactive'),
                kycStatus: m.kycStatus || (finalAct ? 'Verified' : 'Unverified'),
                isApproved: m.isApproved !== undefined ? m.isApproved : finalAct,
                isPartnerAgent: m.isPartnerAgent !== undefined ? m.isPartnerAgent : finalAct,
                isCommissionActive: finalCommAct,
                commissionStatus: finalCommAct ? 'Active' : 'Inactive',
                feeType: m.feeType || existing.feeType || 'Commission'
              };
            } else {
              dedupedMap[key] = {
                ...m,
                isActive: finalAct,
                status: m.status || (finalAct ? 'Active' : 'Inactive'),
                accountStatus: m.accountStatus || (finalAct ? 'Active' : 'Inactive'),
                partnershipStatus: m.partnershipStatus || (finalAct ? 'Approved' : 'Inactive'),
                kycStatus: m.kycStatus || (finalAct ? 'Verified' : 'Unverified'),
                isApproved: m.isApproved !== undefined ? m.isApproved : finalAct,
                isPartnerAgent: m.isPartnerAgent !== undefined ? m.isPartnerAgent : finalAct,
                isCommissionActive: finalCommAct,
                commissionStatus: finalCommAct ? 'Active' : 'Inactive',
                feeType: m.feeType || 'Commission'
              };
            }
          });

          const finalList = Object.values(dedupedMap);
          setAllAccounts(finalList);
          try {
            localStorage.setItem('chaopaopay_all_merchants', JSON.stringify(finalList));
          } catch (e) {}
        } else {
          try {
            const saved = localStorage.getItem('chaopaopay_all_merchants');
            if (saved) setAllAccounts(JSON.parse(saved));
            else setAllAccounts(defaultMerchantsList);
          } catch (e) {}
        }
      });
      return () => unsub();
    } catch (e) {
      console.warn('Error loading merchant directory:', e);
    }
  }, [database, isSuperAdmin]);

  const handleToggleAccountStatus = async (target: MerchantProfile, shouldActivate: boolean) => {
    const updatedAcc: MerchantProfile = {
      ...target,
      isPartnerAgent: shouldActivate,
      partnershipStatus: shouldActivate ? 'Approved' : 'Inactive',
      isActive: shouldActivate,
      isApproved: shouldActivate,
      kycStatus: shouldActivate ? 'Verified' : 'Unverified',
      status: shouldActivate ? 'Active' : 'Inactive',
      accountStatus: shouldActivate ? 'Active' : 'Inactive',
      accountType: shouldActivate ? 'Partnership Agent' : (target.accountType || 'Merchant')
    };

    // 1. Firebase Realtime DB Updates (write to original case, lowercase, and uppercase paths)
    if (database) {
      try {
        const cleanId = target.merchantId.trim();
        const lowerId = cleanId.toLowerCase();
        const upperId = cleanId.toUpperCase();
        await Promise.all([
          set(ref(database, `merchants_directory/${cleanId}`), updatedAcc),
          set(ref(database, `merchants_directory/${lowerId}`), updatedAcc),
          set(ref(database, `merchants_directory/${upperId}`), updatedAcc),
          set(ref(database, `merchants/${cleanId}/profile`), updatedAcc),
          set(ref(database, `merchants/${lowerId}/profile`), updatedAcc),
          set(ref(database, `merchants/${upperId}/profile`), updatedAcc)
        ]);
      } catch (e) {
        console.warn('Firebase status update error:', e);
      }
    }

    // 2. localStorage Updates
    try {
      const saved = localStorage.getItem('chaopaopay_all_merchants');
      let list: MerchantProfile[] = saved ? JSON.parse(saved) : [];
      const idx = list.findIndex(m => m.merchantId.trim().toLowerCase() === target.merchantId.trim().toLowerCase());
      if (idx >= 0) {
        list[idx] = updatedAcc;
      } else {
        list.push(updatedAcc);
      }
      localStorage.setItem('chaopaopay_all_merchants', JSON.stringify(list));
      try {
        const curSaved = localStorage.getItem('chaopaopay_merchant');
        if (curSaved) {
          const curM = JSON.parse(curSaved);
          if (curM.merchantId && curM.merchantId.trim().toLowerCase() === target.merchantId.trim().toLowerCase()) {
            localStorage.setItem('chaopaopay_merchant', JSON.stringify(updatedAcc));
          }
        }
      } catch (e) {}
      window.dispatchEvent(new CustomEvent('merchantUpdated', { detail: updatedAcc }));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}

    if (onUpdateMerchant && target.merchantId.trim().toLowerCase() === merchant.merchantId.trim().toLowerCase()) {
      onUpdateMerchant(updatedAcc);
    }

    if (selectedProfile && selectedProfile.merchantId.trim().toLowerCase() === target.merchantId.trim().toLowerCase()) {
      setSelectedProfile(updatedAcc);
    }

    // Local state optimistic update with case-insensitive check
    setAllAccounts(prev => prev.map(a => 
      (a.merchantId && target.merchantId && a.merchantId.trim().toLowerCase() === target.merchantId.trim().toLowerCase()) 
        ? updatedAcc 
        : a
    ));

    setFeedbackMsg({
      text: shouldActivate 
        ? `অ্যাকাউন্ট (${target.merchantId}) সফলভাবে একটিভ করা হয়েছে! প্রোফাইল এখন সক্রিয়।`
        : `অ্যাকাউন্ট (${target.merchantId}) সফলভাবে ইনঅ্যাক্টিভ করা হয়েছে! প্রোফাইল এখন নিষ্ক্রিয়।`,
      type: shouldActivate ? 'success' : 'error'
    });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleToggleCommissionStatus = async (target: MerchantProfile, shouldActivate: boolean) => {
    const updatedAcc: MerchantProfile = {
      ...target,
      isCommissionActive: shouldActivate,
      commissionStatus: shouldActivate ? 'Active' : 'Inactive',
      commissionPayin: target.commissionPayin !== undefined ? target.commissionPayin : 1.5,
      commissionPayout: target.commissionPayout !== undefined ? target.commissionPayout : 1.0,
      feeType: target.feeType || 'Commission'
    };

    if (database) {
      try {
        const cleanId = target.merchantId.trim();
        const lowerId = cleanId.toLowerCase();
        const upperId = cleanId.toUpperCase();
        await Promise.all([
          set(ref(database, `merchants_directory/${cleanId}`), updatedAcc),
          set(ref(database, `merchants_directory/${lowerId}`), updatedAcc),
          set(ref(database, `merchants_directory/${upperId}`), updatedAcc),
          set(ref(database, `merchants/${cleanId}/profile`), updatedAcc),
          set(ref(database, `merchants/${lowerId}/profile`), updatedAcc),
          set(ref(database, `merchants/${upperId}/profile`), updatedAcc),
          set(ref(database, `merchants/${cleanId}/commission`), {
            isCommissionActive: shouldActivate,
            commissionStatus: shouldActivate ? 'Active' : 'Inactive',
            commissionPayin: updatedAcc.commissionPayin,
            commissionPayout: updatedAcc.commissionPayout,
            feeType: updatedAcc.feeType
          }),
          set(ref(database, `merchants/${lowerId}/commission`), {
            isCommissionActive: shouldActivate,
            commissionStatus: shouldActivate ? 'Active' : 'Inactive',
            commissionPayin: updatedAcc.commissionPayin,
            commissionPayout: updatedAcc.commissionPayout,
            feeType: updatedAcc.feeType
          })
        ]);
      } catch (e) {
        console.warn('Firebase commission toggle error:', e);
      }
    }

    try {
      const saved = localStorage.getItem('chaopaopay_all_merchants');
      let list: MerchantProfile[] = saved ? JSON.parse(saved) : [];
      const idx = list.findIndex(m => m.merchantId.trim().toLowerCase() === target.merchantId.trim().toLowerCase());
      if (idx >= 0) list[idx] = updatedAcc;
      else list.push(updatedAcc);
      localStorage.setItem('chaopaopay_all_merchants', JSON.stringify(list));

      const curSaved = localStorage.getItem('chaopaopay_merchant');
      if (curSaved) {
        const curM = JSON.parse(curSaved);
        if (curM.merchantId && curM.merchantId.trim().toLowerCase() === target.merchantId.trim().toLowerCase()) {
          localStorage.setItem('chaopaopay_merchant', JSON.stringify(updatedAcc));
        }
      }
      window.dispatchEvent(new CustomEvent('merchantUpdated', { detail: updatedAcc }));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}

    if (onUpdateMerchant && target.merchantId.trim().toLowerCase() === merchant.merchantId.trim().toLowerCase()) {
      onUpdateMerchant(updatedAcc);
    }

    if (selectedProfile && selectedProfile.merchantId.trim().toLowerCase() === target.merchantId.trim().toLowerCase()) {
      setSelectedProfile(updatedAcc);
      setEditCommissionActive(shouldActivate);
    }

    setAllAccounts(prev => prev.map(a => 
      (a.merchantId && target.merchantId && a.merchantId.trim().toLowerCase() === target.merchantId.trim().toLowerCase())
        ? updatedAcc 
        : a
    ));

    setFeedbackMsg({
      text: shouldActivate 
        ? `মার্চেন্ট (${target.merchantId}) এর কমিশন সফলভাবে একটিভ (Active) করা হয়েছে!`
        : `মার্চেন্ট (${target.merchantId}) এর কমিশন সফলভাবে ডিএক্টিভ (Deactive) করা হয়েছে!`,
      type: shouldActivate ? 'success' : 'error'
    });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleSaveProfileCommission = async (target: MerchantProfile, overrideActive?: boolean) => {
    const pIn = parseFloat(editPayin) || 0;
    const pOut = parseFloat(editPayout) || 0;
    const isCommAct = overrideActive !== undefined 
      ? overrideActive 
      : editCommissionActive;

    const updatedAcc: MerchantProfile = {
      ...target,
      commissionPayin: pIn,
      commissionPayout: pOut,
      feeType: editFeeType,
      isCommissionActive: isCommAct,
      commissionStatus: isCommAct ? 'Active' : 'Inactive'
    };

    if (database) {
      try {
        const cleanId = target.merchantId.trim();
        const lowerId = cleanId.toLowerCase();
        const upperId = cleanId.toUpperCase();
        await Promise.all([
          set(ref(database, `merchants_directory/${cleanId}`), updatedAcc),
          set(ref(database, `merchants_directory/${lowerId}`), updatedAcc),
          set(ref(database, `merchants_directory/${upperId}`), updatedAcc),
          set(ref(database, `merchants/${cleanId}/profile`), updatedAcc),
          set(ref(database, `merchants/${lowerId}/profile`), updatedAcc),
          set(ref(database, `merchants/${upperId}/profile`), updatedAcc),
          set(ref(database, `merchants/${cleanId}/commission`), {
            isCommissionActive: isCommAct,
            commissionStatus: isCommAct ? 'Active' : 'Inactive',
            commissionPayin: pIn,
            commissionPayout: pOut,
            feeType: editFeeType
          }),
          set(ref(database, `merchants/${lowerId}/commission`), {
            isCommissionActive: isCommAct,
            commissionStatus: isCommAct ? 'Active' : 'Inactive',
            commissionPayin: pIn,
            commissionPayout: pOut,
            feeType: editFeeType
          })
        ]);
      } catch (e) {
        console.warn('Firebase commission save error:', e);
      }
    }

    try {
      const saved = localStorage.getItem('chaopaopay_all_merchants');
      let list: MerchantProfile[] = saved ? JSON.parse(saved) : [];
      const idx = list.findIndex(m => m.merchantId.trim().toLowerCase() === target.merchantId.trim().toLowerCase());
      if (idx >= 0) list[idx] = updatedAcc;
      else list.push(updatedAcc);
      localStorage.setItem('chaopaopay_all_merchants', JSON.stringify(list));

      const curSaved = localStorage.getItem('chaopaopay_merchant');
      if (curSaved) {
        const curM = JSON.parse(curSaved);
        if (curM.merchantId && curM.merchantId.trim().toLowerCase() === target.merchantId.trim().toLowerCase()) {
          localStorage.setItem('chaopaopay_merchant', JSON.stringify(updatedAcc));
        }
      }
      window.dispatchEvent(new CustomEvent('merchantUpdated', { detail: updatedAcc }));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}

    if (onUpdateMerchant && target.merchantId.trim().toLowerCase() === merchant.merchantId.trim().toLowerCase()) {
      onUpdateMerchant(updatedAcc);
    }

    setSelectedProfile(updatedAcc);
    setEditCommissionActive(isCommAct);
    setAllAccounts(prev => prev.map(a => 
      (a.merchantId && target.merchantId && a.merchantId.trim().toLowerCase() === target.merchantId.trim().toLowerCase())
        ? updatedAcc 
        : a
    ));

    setFeedbackMsg({
      text: `কমিশন রেট ও স্ট্যাটাস (${isCommAct ? 'Active' : 'Deactive'}, In: ${pIn}%, Out: ${pOut}%) সফলভাবে সংরক্ষণ করা হয়েছে!`,
      type: 'success'
    });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleApproveVerification = async (req: VerificationRequest) => {
    const updatedReq: VerificationRequest = { ...req, status: 'Approved' };
    const updatedList = verificationRequests.map(r => r.id === req.id ? updatedReq : r);
    setVerificationRequests(updatedList);
    try {
      localStorage.setItem('chaopaopay_verification_requests', JSON.stringify(updatedList));
    } catch (e) {}

    if (database) {
      try {
        await set(ref(database, `verification_requests/${req.id}`), updatedReq);
      } catch (e) {}
    }

    const targetId = req.merchantId.trim().toLowerCase();
    let target = allAccounts.find(a => a.merchantId && a.merchantId.trim().toLowerCase() === targetId);
    if (!target) {
      target = {
        merchantId: req.merchantId,
        name: req.merchantName || 'Merchant',
        email: `${req.merchantId.toLowerCase()}@tkpaybd.site`,
        phone: req.phone || '',
        avatar: 'M',
        balance: 0,
        totalDeposits: 0,
        depositCount: 0,
        todayDeposits: 0,
        totalWithdrawals: 0,
        withdrawalCount: 0,
        todayWithdrawals: 0,
        kycStatus: 'Verified',
        isActive: true,
        accountType: 'Partnership Agent'
      };
    }

    const approvedProfile: MerchantProfile = {
      ...target,
      isPartnerAgent: true,
      partnershipStatus: 'Approved',
      isActive: true,
      isApproved: true,
      kycStatus: 'Verified',
      status: 'Active',
      accountStatus: 'Active',
      accountType: 'Partnership Agent'
    };

    await handleToggleAccountStatus(approvedProfile, true);

    setFeedbackMsg({
      text: `🎉 পার্টনার ভেরিফিকেশন সফলভাবে অনুমোদন করা হয়েছে! মার্চেন্ট (${req.merchantId}) এখন Active (সক্রিয়) এবং এডমিন প্যানেল আনলক হয়েছে।`,
      type: 'success'
    });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleRejectVerification = async (req: VerificationRequest) => {
    const updatedReq: VerificationRequest = { ...req, status: 'Rejected' };
    const updatedList = verificationRequests.map(r => r.id === req.id ? updatedReq : r);
    setVerificationRequests(updatedList);
    try {
      localStorage.setItem('chaopaopay_verification_requests', JSON.stringify(updatedList));
    } catch (e) {}

    if (database) {
      try {
        await set(ref(database, `verification_requests/${req.id}`), updatedReq);
      } catch (e) {}
    }

    const targetId = req.merchantId.trim().toLowerCase();
    let target = allAccounts.find(a => a.merchantId && a.merchantId.trim().toLowerCase() === targetId);
    if (target) {
      const rejectedProfile: MerchantProfile = {
        ...target,
        isPartnerAgent: false,
        partnershipStatus: 'Rejected',
        isActive: false,
        isApproved: false,
        kycStatus: 'Unverified',
        status: 'Inactive',
        accountStatus: 'Inactive'
      };
      await handleToggleAccountStatus(rejectedProfile, false);
    }

    setFeedbackMsg({
      text: `❌ পার্টনার ভেরিফিকেশন রিকোয়েস্ট বাতিল করা হয়েছে। মার্চেন্ট (${req.merchantId}) নিষ্ক্রিয় (Inactive) রাখা হয়েছে।`,
      type: 'error'
    });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Combine stored verificationRequests with any merchants marked as Pending Verification
  const displayVerificationRequests = React.useMemo(() => {
    const map = new Map<string, VerificationRequest>();
    verificationRequests.forEach(r => map.set(r.id, r));

    allAccounts.forEach(acc => {
      if (acc.partnershipStatus === 'Pending Verification' || acc.kycStatus === 'Pending') {
        const hasPending = Array.from(map.values()).some(
          r => r.merchantId.trim().toLowerCase() === acc.merchantId.trim().toLowerCase() && r.status === 'Pending'
        );
        if (!hasPending) {
          const autoReq: VerificationRequest = {
            id: 'VR-AUTO-' + acc.merchantId,
            merchantId: acc.merchantId,
            merchantName: acc.name || 'Merchant User',
            type: 'PARTNER_AGENT',
            title: 'পার্টনার এনআইডি কার্ড ভেরিফিকেশন আবেদন',
            phone: acc.phone || '',
            whatsapp: acc.phone || '',
            nidNumber: acc.merchantId,
            amount: 600,
            currency: 'BDT',
            paymentMethod: 'NID Submitted',
            status: 'Pending',
            submittedAt: new Date().toISOString()
          };
          map.set(autoReq.id, autoReq);
        }
      }
    });

    const list = Array.from(map.values());
    list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    return list;
  }, [verificationRequests, allAccounts]);

  const pendingDeposits = transactions.filter(t => t.type === 'Payin' && t.status === 'Pending' && (isSuperAdmin || t.merchantId === merchant.merchantId));
  const pendingWithdrawals = transactions.filter(t => t.type === 'Payout' && t.status === 'Pending' && (isSuperAdmin || t.merchantId === merchant.merchantId));

  const displayList = transactions.filter(tx => {
    if (!isSuperAdmin && tx.merchantId && tx.merchantId !== merchant.merchantId) return false;
    
    switch (filterType) {
      case 'PendingDeposit': return tx.type === 'Payin' && tx.status === 'Pending';
      case 'PendingWithdrawal': return tx.type === 'Payout' && tx.status === 'Pending';
      case 'AllDeposit': return tx.type === 'Payin';
      case 'AllWithdrawal': return tx.type === 'Payout';
      default: return true;
    }
  }).filter(tx => {
     const matchesSearch = tx.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (tx.customerPhone && tx.customerPhone.includes(searchTerm)) ||
                          (tx.customerName && tx.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
     return matchesSearch;
  });

  const formatBDT = (amount: number) => {
    return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} BDT`;
  };

  const handleApprove = (tx: Transaction) => {
    if (tx.type === 'Payin') {
      onApproveDeposit(tx.transactionId);
      setFeedbackMsg({
        text: `ডিপোজিট সফলভাবে অনুমোদন করা হয়েছে! ${formatBDT(tx.amount)} ব্যালেন্সে যুক্ত হয়েছে।`,
        type: 'success'
      });
    } else {
      onApprovePayout(tx.transactionId);
      setFeedbackMsg({
        text: `উত্তোলন সফলভাবে অনুমোদন করা হয়েছে!`,
        type: 'success'
      });
    }
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleReject = (tx: Transaction) => {
    if (tx.type === 'Payin') {
      onRejectDeposit(tx.transactionId);
      setFeedbackMsg({
        text: 'ডিপোজিটটি বাতিল করা হয়েছে। কোনো ব্যালেন্স যুক্ত করা হয়নি।',
        type: 'error'
      });
    } else {
      onRejectPayout(tx.transactionId);
      setFeedbackMsg({
        text: 'উত্তোলনটি বাতিল করা হয়েছে।',
        type: 'error'
      });
    }
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const [depositNumbers, setDepositNumbers] = useState<{ method: 'bKash' | 'Nagad' | 'Rocket'; number: string; limit: number; label: 'Personal' | 'Agent' }[]>(() => {
    try {
      const saved = localStorage.getItem('chaopaopay_deposit_numbers_list');
      return saved ? JSON.parse(saved).map((item: any) => ({ ...item, label: item.label || 'Personal' })) : [];
    } catch (e) { return []; }
  });
  const [newNumMethod, setNewNumMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [newNumVal, setNewNumVal] = useState('');
  const [newNumLimit, setNewNumLimit] = useState('50000');
  const [newNumLabel, setNewNumLabel] = useState<'Personal' | 'Agent'>('Personal');

  const handleAddNumber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNumVal.trim()) return;
    const limitNum = parseFloat(newNumLimit) || 50000;
    const updated = [...depositNumbers, { method: newNumMethod, number: newNumVal.trim(), limit: limitNum, label: newNumLabel }];
    setDepositNumbers(updated);
    localStorage.setItem('chaopaopay_deposit_numbers_list', JSON.stringify(updated));
    setNewNumVal('');
    setNewNumLimit('50000');
    setNewNumLabel('Personal');
    setFeedbackMsg({ text: 'নতুন ডিপোজিট নম্বর সফলভাবে যোগ করা হয়েছে!', type: 'success' });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleDeleteNumber = (index: number) => {
    const updated = depositNumbers.filter((_, i) => i !== index);
    setDepositNumbers(updated);
    localStorage.setItem('chaopaopay_deposit_numbers_list', JSON.stringify(updated));
    setFeedbackMsg({ text: 'নম্বরটি মুছে ফেলা হয়েছে।', type: 'error' });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  return (
    <div className="space-y-3 sm:space-y-4 pb-16">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
                <ShieldCheck className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight">
                {isSuperAdmin ? 'Admin Control Center' : 'Merchant Dashboard Control'}
              </h2>
            </div>
            <p className="text-[10px] text-gray-500 font-medium">
              {isSuperAdmin ? 'Global system management and approval portal.' : 'Manage your gateway deposits and withdrawals.'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full lg:w-auto">
            <div className="bg-amber-50/50 border border-amber-100 p-2 sm:p-2.5 rounded-2xl text-center">
              <p className="text-[8px] font-bold text-amber-700 uppercase tracking-wider mb-0.5">Pending Deposits</p>
              <p className="text-base font-black text-amber-900">{pendingDeposits.length}</p>
            </div>
            <div className="bg-amber-50/50 border border-amber-100 p-2 sm:p-2.5 rounded-2xl text-center">
              <p className="text-[8px] font-bold text-amber-700 uppercase tracking-wider mb-0.5">Pending Payouts</p>
              <p className="text-base font-black text-amber-900">{pendingWithdrawals.length}</p>
            </div>
            <div className="bg-purple-50/50 border border-purple-100 p-2 sm:p-2.5 rounded-2xl text-center">
              <p className="text-[8px] font-bold text-purple-700 uppercase tracking-wider mb-0.5">Verifications</p>
              <p className="text-base font-black text-purple-900">
                {displayVerificationRequests.filter(r => r.status === 'Pending').length}
              </p>
            </div>
            <div className="bg-emerald-50/50 border border-emerald-100 p-2 sm:p-2.5 rounded-2xl text-center">
              <p className="text-[8px] font-bold text-emerald-700 uppercase tracking-wider mb-0.5">System Balance</p>
              <p className="text-[11px] font-black text-emerald-900 truncate px-1">{formatBDT(merchant.balance)}</p>
            </div>
          </div>
        </div>

        {feedbackMsg && (
          <div className={`mt-3 p-2.5 rounded-2xl text-[11px] font-bold flex items-center gap-2 animate-in slide-in-from-top-2 duration-200 ${
            feedbackMsg.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs' 
              : 'bg-red-50 text-red-800 border border-red-200 shadow-xs'
          }`}>
            {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
            <span className="leading-tight">{feedbackMsg.text}</span>
          </div>
        )}
      </div>

      {isSuperAdmin && (
        <>
          {/* Verification & Partner Requests (Pending Submissions) */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                <span>পার্টনার অ্যাপ্রুভাল (Partner Approvals)</span>
                {displayVerificationRequests.filter(r => r.status === 'Pending').length > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                    {displayVerificationRequests.filter(r => r.status === 'Pending').length} Pending
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                মার্চেন্ট কর্তৃক সাবমিট করা রেন্ডি কার্ড (Partner Card) ও এনআইডি ভেরিফিকেশন আবেদন তথ্য
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200/60">
            মোট রিকোয়েস্ট: {displayVerificationRequests.length}
          </span>
        </div>

        {displayVerificationRequests.length === 0 ? (
          <div className="p-8 text-center text-gray-400 font-medium italic text-xs bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            এখনও কোনো ভেরিফিকেশন রিকোয়েস্ট জমা পড়েনি। মার্চেন্ট ইন-এক্টিভ পেজ থেকে সাবমিট করলে এখানে দেখতে পাবেন।
          </div>
        ) : (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
            {displayVerificationRequests.map((req) => {
              const isPending = req.status === 'Pending';
              return (
                <div 
                  key={req.id} 
                  className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isPending 
                      ? 'bg-amber-50/40 border-amber-200 shadow-xs' 
                      : req.status === 'Approved'
                      ? 'bg-emerald-50/20 border-emerald-100'
                      : 'bg-gray-50/60 border-gray-100'
                  }`}
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-gray-900 text-xs bg-white px-2 py-0.5 rounded-lg border border-gray-200">
                        {req.merchantId}
                      </span>
                      <span className="font-bold text-gray-800 text-xs sm:text-sm">
                        {req.merchantName}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tight ${
                        req.type === 'GATEWAY_1350' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {req.type === 'GATEWAY_1350' ? 'Gateway 1350 BDT' : 'Rendy Card (Partner)'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                        isPending 
                          ? 'bg-amber-100 text-amber-800 animate-pulse' 
                          : req.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-[11px] text-gray-600">
                      {req.phone && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400">📞 Phone:</span>
                          <span className="font-mono font-bold text-gray-900">{req.phone}</span>
                        </div>
                      )}
                      {req.trxId && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400">💳 TrxID:</span>
                          <span className="font-mono font-black text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-indigo-100 select-all">
                            {req.trxId}
                          </span>
                        </div>
                      )}
                      {req.amount && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400">💰 Fee:</span>
                          <span className="font-black text-emerald-700">{req.amount} {req.currency || 'BDT'}</span>
                        </div>
                      )}
                      {req.nidNumber && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400">🆔 NID:</span>
                          <span className="font-mono text-gray-800">{req.nidNumber}</span>
                        </div>
                      )}
                      {req.whatsapp && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400">💬 WhatsApp:</span>
                          <span className="text-gray-800">{req.whatsapp}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <span>🕒 {new Date(req.submittedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isPending ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApproveVerification(req)}
                          className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>অনুমোদন ও এক্টিভ করুন</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectVerification(req)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-2 rounded-xl text-xs transition border border-red-200 cursor-pointer"
                        >
                          বাতিল
                        </button>
                      </>
                    ) : req.status === 'Approved' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-bold bg-emerald-100/70 px-3 py-1.5 rounded-xl">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>সক্রিয় অনুমোদিত</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-700 text-xs font-bold bg-red-100/70 px-3 py-1.5 rounded-xl">
                        <XCircle className="w-4 h-4" />
                        <span>বাতিলকৃত</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </>)}

      {/* Master Admin: Account Control */}
      {isSuperAdmin && (
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-50 pb-4">
            <div>
              <h3 className="font-extrabold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                <Users className="w-4.5 h-4.5 text-indigo-600" />
                <span>Account Management</span>
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Control partner agent access and status.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="ID, Name, or Phone..."
                value={accountSearch}
                onChange={(e) => setAccountSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-indigo-600 focus:bg-white font-medium transition"
              />
            </div>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
            {allAccounts.filter(acc => {
              if (!accountSearch.trim()) return true;
              const term = accountSearch.toLowerCase();
              return (
                (acc.merchantId && acc.merchantId.toLowerCase().includes(term)) ||
                (acc.name && acc.name.toLowerCase().includes(term)) ||
                (acc.phone && acc.phone.includes(term)) ||
                (acc.email && acc.email.toLowerCase().includes(term))
              );
            }).length === 0 ? (
              <div className="p-10 text-center text-gray-400 font-medium italic text-xs">
                No accounts found matching your search.
              </div>
            ) : (
              allAccounts
                .filter(acc => {
                  if (!accountSearch.trim()) return true;
                  const term = accountSearch.toLowerCase();
                  return (
                    (acc.merchantId && acc.merchantId.toLowerCase().includes(term)) ||
                    (acc.name && acc.name.toLowerCase().includes(term)) ||
                    (acc.phone && acc.phone.includes(term)) ||
                    (acc.email && acc.email.toLowerCase().includes(term))
                  );
                })
                .map((acc) => {
                  const isMaster = acc.merchantId === 'S01926516246' || acc.merchantId === 'M20241018';
                  const isActive = evaluateAccountActive(acc, isMaster);

                  return (
                    <div key={acc.merchantId} className="p-4 border border-gray-100 rounded-2xl bg-white hover:border-indigo-100 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-black text-gray-900 text-xs sm:text-sm bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-200">
                            {acc.merchantId}
                          </span>
                          <span className="font-bold text-gray-800 truncate max-w-[130px] sm:max-w-none">
                            {acc.name || 'Merchant'}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tight flex items-center gap-1 ${
                            isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                          {(acc.merchantId === 'S01926516246' || acc.merchantId === 'M20241018') && (
                            <span className="text-[9px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100">
                              Admin Tag
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 sm:flex sm:items-center gap-y-1 gap-x-4 text-[10px] sm:text-[11px] text-gray-500 font-medium">
                          <span className="truncate">📞 <span className="text-gray-700">{acc.phone || 'N/A'}</span></span>
                          <span className="truncate hidden md:inline">📧 <span className="text-gray-700">{acc.email || 'N/A'}</span></span>
                          <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-bold">In: {acc.commissionPayin ?? 0}%</span>
                          <span className="text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded font-bold">Out: {acc.commissionPayout ?? 0}%</span>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                            evaluateCommissionActive(acc) 
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            <Percent className="w-2.5 h-2.5" />
                            <span>Comm: {evaluateCommissionActive(acc) ? 'Active' : 'Deactive'}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProfile(acc);
                            setEditPayin(String(acc.commissionPayin ?? 0));
                            setEditPayout(String(acc.commissionPayout ?? 0));
                            setEditFeeType(acc.feeType || 'Commission');
                            setEditCommissionActive(evaluateCommissionActive(acc));
                          }}
                          className="px-3 py-1.5 rounded-xl font-bold text-xs text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          title="View and Edit Profile"
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-600" />
                          <span>প্রোফাইল</span>
                        </button>
                        {acc.merchantId !== merchant.merchantId && (
                          <button
                            type="button"
                            onClick={() => {
                              const pActive = evaluateAccountActive(acc, isMaster);
                              const updatedAcc: MerchantProfile = {
                                ...acc,
                                isActive: pActive,
                                status: pActive ? 'Active' : 'Inactive',
                                accountStatus: pActive ? 'Active' : 'Inactive',
                                partnershipStatus: pActive ? 'Approved' : 'Inactive',
                                kycStatus: pActive ? 'Verified' : 'Unverified',
                                isApproved: pActive,
                                isPartnerAgent: pActive ? (acc.isPartnerAgent !== false) : false
                              };
                              try {
                                localStorage.setItem('chaopaopay_merchant', JSON.stringify(updatedAcc));
                              } catch (e) {}
                              if (onSwitchMerchant) {
                                onSwitchMerchant(updatedAcc);
                              } else if (onUpdateMerchant) {
                                onUpdateMerchant(updatedAcc);
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl font-bold text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            title="Login and view as this merchant"
                          >
                            <span>👀 ভিউ করুন</span>
                          </button>
                        )}
                        <div className="flex items-center gap-1 bg-gray-50/80 p-1 rounded-xl border border-gray-200">
                          <button
                            type="button"
                            onClick={() => handleToggleAccountStatus(acc, true)}
                            disabled={isActive}
                            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer ${
                              isActive
                                ? 'bg-gray-100 text-gray-400 border border-gray-100 cursor-not-allowed opacity-60'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200 active:scale-95'
                            }`}
                            title="অ্যাকাউন্ট Active করুন"
                          >
                            <UserCheck className="w-3 h-3" />
                            <span>Active</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleAccountStatus(acc, false)}
                            disabled={!isActive}
                            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer ${
                              !isActive
                                ? 'bg-gray-100 text-gray-400 border border-gray-100 cursor-not-allowed opacity-60'
                                : 'bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-200 active:scale-95'
                            }`}
                            title="অ্যাকাউন্ট Inactive করুন"
                          >
                            <UserX className="w-3 h-3" />
                            <span>Inactive</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1 bg-indigo-50/60 p-1 rounded-xl border border-indigo-200">
                          <span className="text-[9px] font-bold text-indigo-800 px-1">কমিশন:</span>
                          <button
                            type="button"
                            onClick={() => handleToggleCommissionStatus(acc, true)}
                            disabled={evaluateCommissionActive(acc)}
                            className={`px-2 py-1 rounded-lg font-bold text-[10px] transition cursor-pointer ${
                              evaluateCommissionActive(acc)
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs active:scale-95'
                            }`}
                            title="কমিশন চালু (Active) করুন"
                          >
                            Active
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleCommissionStatus(acc, false)}
                            disabled={!evaluateCommissionActive(acc)}
                            className={`px-2 py-1 rounded-lg font-bold text-[10px] transition cursor-pointer ${
                              !evaluateCommissionActive(acc)
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                                : 'bg-red-500 hover:bg-red-600 text-white shadow-2xs active:scale-95'
                            }`}
                            title="কমিশন বন্ধ (Deactive) করুন"
                          >
                            Deactive
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>

          {/* Individual Merchant Profile Modal */}
          {selectedProfile && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[92vh]">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 via-white to-gray-50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <Eye className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">
                        মার্চেন্ট প্রোফাইল ও নিয়ন্ত্রণ
                      </h3>
                      <p className="text-[11px] text-gray-500">ID: {selectedProfile.merchantId}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedProfile(null)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5 overflow-y-auto space-y-4 text-xs">
                  {/* Status Card & Switcher */}
                  {(() => {
                    const isMaster = selectedProfile.merchantId === 'S01926516246' || selectedProfile.merchantId === 'M20241018';
                    const isSelectedActive = evaluateAccountActive(selectedProfile, isMaster);

                    return (
                      <div className="space-y-3">
                        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                          isSelectedActive
                            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                            : 'bg-red-50/80 border-red-200 text-red-900'
                        }`}>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">বর্তমান অ্যাকাউন্ট স্ট্যাটাস</span>
                            <h4 className="font-black text-sm sm:text-base flex items-center gap-2 mt-0.5">
                              <span>{isSelectedActive ? '🟢 Active (সক্রিয়)' : '🔴 Inactive (নিষ্ক্রিয়)'}</span>
                            </h4>
                            <p className="text-[11px] opacity-80 mt-1">
                              {isSelectedActive
                                ? 'অ্যাকাউন্ট ভেরিফাইড এবং এডমিন প্যানেল আনলক আছে।'
                                : 'অ্যাকাউন্ট ইনঅ্যাক্টিভ, পার্টনার ভেরিফাই প্রয়োজন।'}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleAccountStatus(selectedProfile, true)}
                              disabled={isSelectedActive}
                              className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white transition cursor-pointer shadow-xs"
                            >
                              Active করুন
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleAccountStatus(selectedProfile, false)}
                              disabled={!isSelectedActive}
                              className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white transition cursor-pointer shadow-xs"
                            >
                              Inactive করুন
                            </button>
                          </div>
                        </div>

                        {selectedProfile.merchantId !== merchant.merchantId && (
                          <button
                            type="button"
                            onClick={() => {
                              const pActive = evaluateAccountActive(selectedProfile, isMaster);
                              const updatedAcc: MerchantProfile = {
                                ...selectedProfile,
                                isActive: pActive,
                                status: pActive ? 'Active' : 'Inactive',
                                accountStatus: pActive ? 'Active' : 'Inactive',
                                partnershipStatus: pActive ? 'Approved' : 'Inactive',
                                kycStatus: pActive ? 'Verified' : 'Unverified',
                                isApproved: pActive,
                                isPartnerAgent: pActive ? (selectedProfile.isPartnerAgent !== false) : false
                              };
                              try {
                                localStorage.setItem('chaopaopay_merchant', JSON.stringify(updatedAcc));
                              } catch (e) {}
                              if (onSwitchMerchant) {
                                onSwitchMerchant(updatedAcc);
                              } else if (onUpdateMerchant) {
                                onUpdateMerchant(updatedAcc);
                              }
                              setSelectedProfile(null);
                            }}
                            className="w-full py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.99]"
                          >
                            <Eye className="w-4 h-4" />
                            <span>এই মার্চেন্ট হিসেবে লগইন করে ড্যাশবোর্ড ভিউ করুন ({selectedProfile.merchantId})</span>
                          </button>
                        )}
                      </div>
                    );
                  })()}

                  {/* Merchant Details Grid */}
                  <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 space-y-2.5">
                    <h5 className="font-bold text-gray-800 text-[11px] uppercase tracking-wider">ব্যক্তিগত ও ব্যবসায়িক তথ্য</h5>
                    <div className="grid grid-cols-2 gap-3 text-gray-700">
                      <div>
                        <span className="text-gray-400 block text-[10px]">মার্চেন্ট নাম</span>
                        <span className="font-bold text-gray-900">{selectedProfile.name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">ফোন নম্বর</span>
                        <span className="font-mono font-semibold text-gray-900">{selectedProfile.phone || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">ইমেইল</span>
                        <span className="font-medium text-gray-900 truncate block">{selectedProfile.email || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">ব্যালেন্স</span>
                        <span className="font-mono font-black text-emerald-600">৳{Number(selectedProfile.balance || 0).toLocaleString()} BDT</span>
                      </div>
                    </div>
                  </div>

                  {/* Commission Settings & Active/Deactive Control */}
                  {(() => {
                    const isCommActive = evaluateCommissionActive(selectedProfile);
                    return (
                      <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-gray-800 text-[11px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5">
                            <Percent className="w-4 h-4 text-indigo-600" />
                            <span>কমিশন রেট ও স্ট্যাটাস নিয়ন্ত্রণ</span>
                          </h5>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 ${
                            isCommActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isCommActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                            <span>{isCommActive ? '🟢 কমিশন Active (চালু)' : '🔴 কমিশন Deactive (নিষ্ক্রিয়)'}</span>
                          </span>
                        </div>

                        {/* Commission Active / Deactive Buttons */}
                        <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 rounded-2xl border border-gray-100">
                          <button
                            type="button"
                            onClick={() => handleToggleCommissionStatus(selectedProfile, true)}
                            disabled={isCommActive}
                            className={`py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                              isCommActive
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>কমিশন Active করুন</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleCommissionStatus(selectedProfile, false)}
                            disabled={!isCommActive}
                            className={`py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                              !isCommActive
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                                : 'bg-red-600 hover:bg-red-700 text-white active:scale-95'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>কমিশন Deactive করুন</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 mb-1">Payin Commission (%)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={editPayin}
                              onChange={(e) => setEditPayin(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 mb-1">Payout Commission (%)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={editPayout}
                              onChange={(e) => setEditPayout(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 mb-1">ফি টাইপ (Fee Type)</label>
                          <select
                            value={editFeeType}
                            onChange={(e) => setEditFeeType(e.target.value as any)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                          >
                            <option value="Commission">Commission (কমিশন)</option>
                            <option value="Charge">Charge (চার্জ)</option>
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSaveProfileCommission(selectedProfile)}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>কমিশন রেট ও সেটিংস সংরক্ষণ করুন</span>
                        </button>
                      </div>
                    );
                  })()}
                </div>

                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedProfile(null)}
                    className="px-4 py-2 rounded-xl font-bold text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 transition cursor-pointer"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Deposit Numbers Management */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-5">
        <div className="flex items-center justify-between border-b border-gray-50 pb-4">
          <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">Wallet Management</h3>
          <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-xl">Count: {depositNumbers.length}</span>
        </div>

        <form onSubmit={handleAddNumber} className="bg-gray-50/50 p-4 sm:p-5 rounded-2xl border border-gray-200/80 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider ml-1">Method</label>
              <select
                value={newNumMethod}
                onChange={(e) => setNewNumMethod(e.target.value as any)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              >
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
                <option value="Rocket">Rocket</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider ml-1">Label</label>
              <select
                value={newNumLabel}
                onChange={(e) => setNewNumLabel(e.target.value as any)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              >
                <option value="Personal">Personal</option>
                <option value="Agent">Agent</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider ml-1">Wallet Number</label>
              <input
                type="text"
                required
                placeholder="e.g. 017XXXXXXXX"
                value={newNumVal}
                onChange={(e) => setNewNumVal(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider ml-1">Max Limit (BDT)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  required
                  placeholder="50000"
                  value={newNumLimit}
                  onChange={(e) => setNewNumLimit(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-md shadow-indigo-100 active:scale-95 shrink-0 text-xs"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </form>

        <div className="space-y-3">
          <p className="font-bold text-[11px] text-gray-400 uppercase tracking-widest px-1">Active Wallets</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
            {depositNumbers.length === 0 ? (
              <div className="col-span-2 p-10 text-center text-gray-400 font-medium italic text-xs">No wallets configured.</div>
            ) : (
              depositNumbers.map((item, idx) => {
                const usedAmount = transactions
                  .filter(t => t.walletNumber === item.number && (t.status === 'Success' || t.status === 'Pending'))
                  .reduce((sum, t) => sum + t.amount, 0);
                const isExceeded = usedAmount >= item.limit;

                return (
                  <div key={idx} className="p-4 border border-gray-100 rounded-2xl bg-white hover:border-indigo-100 transition group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                            item.method === 'bKash' ? 'bg-pink-100 text-pink-700' :
                            item.method === 'Nagad' ? 'bg-orange-100 text-orange-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {item.method}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                            item.label === 'Personal' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {item.label}
                          </span>
                          <span className="font-mono font-bold text-gray-900 text-sm">{item.number}</span>
                        </div>
                        <div className="space-y-1">
                           <div className="flex items-center justify-between text-[10px] font-bold text-gray-500">
                             <span>Progress</span>
                             <span className={isExceeded ? 'text-red-600' : 'text-emerald-600'}>
                                {Math.round((usedAmount / item.limit) * 100)}%
                             </span>
                           </div>
                           <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${isExceeded ? 'bg-red-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(100, (usedAmount / item.limit) * 100)}%` }}
                              ></div>
                           </div>
                           <p className="text-[10px] text-gray-400 font-medium">
                              Used: <span className="text-gray-700">৳{usedAmount.toLocaleString()}</span> / ৳{item.limit.toLocaleString()}
                           </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteNumber(idx)}
                        className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* List Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 -mx-1 px-1 custom-scrollbar">
          <button
            onClick={() => setFilterType('PendingDeposit')}
            className={`px-3.5 py-2 rounded-xl text-[10px] sm:text-xs font-black transition whitespace-nowrap ${
              filterType === 'PendingDeposit' ? 'bg-amber-500 text-white shadow-md shadow-amber-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            Pending Deposits
          </button>
          <button
            onClick={() => setFilterType('PendingWithdrawal')}
            className={`px-3.5 py-2 rounded-xl text-[10px] sm:text-xs font-black transition whitespace-nowrap ${
              filterType === 'PendingWithdrawal' ? 'bg-amber-500 text-white shadow-md shadow-amber-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            Pending Payouts
          </button>
          <button
            onClick={() => setFilterType('AllDeposit')}
            className={`px-3.5 py-2 rounded-xl text-[10px] sm:text-xs font-black transition whitespace-nowrap ${
              filterType === 'AllDeposit' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            All Deposits
          </button>
          <button
            onClick={() => setFilterType('AllWithdrawal')}
            className={`px-3.5 py-2 rounded-xl text-[10px] sm:text-xs font-black transition whitespace-nowrap ${
              filterType === 'AllWithdrawal' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            All Payouts
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-indigo-600 focus:bg-white transition font-medium"
          />
        </div>
      </div>

      {/* Approval List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <h3 className="font-black text-gray-900 text-xs sm:text-sm tracking-tight">
            Transaction Requests ({displayList.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-50">
          {displayList.length === 0 ? (
            <div className="p-16 text-center text-gray-400 font-medium italic text-xs bg-white">
              No transactions found in this view.
            </div>
          ) : (
            displayList.map((tx) => {
              const isPending = tx.status === 'Pending';
              return (
                <div key={tx.id} className="p-4 sm:p-6 hover:bg-gray-50/60 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                  <div className="space-y-2 flex-1 min-w-0 w-full sm:w-auto">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono font-black text-gray-900 text-[10px] sm:text-xs bg-white px-1.5 py-0.5 rounded-lg border border-gray-100">
                        {tx.transactionId}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tight ${
                        tx.type === 'Payin' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {tx.type === 'Payin' ? 'Deposit' : 'Payout'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                        tx.status === 'Success' ? 'bg-emerald-50 text-emerald-700' :
                        tx.status === 'Pending' ? 'bg-amber-50 text-amber-700 animate-pulse' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {tx.status}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-y-1 gap-x-3 text-[10px] text-gray-500 font-medium">
                      <span className="flex items-center gap-1 truncate">
                         <span className="text-gray-400">👤</span>
                         <span className="text-gray-700 font-bold truncate max-w-[120px]">{tx.customerPhone || 'Unknown'}</span>
                      </span>
                      <span className="flex items-center gap-1">
                         <span className="text-gray-400">📅</span>
                         <span className="text-gray-700">{new Date(tx.createdAt).toLocaleString()}</span>
                      </span>
                      {tx.method && (
                        <span className="flex items-center gap-1">
                          <span className="text-gray-400">💳</span>
                          <span className="text-gray-700 font-bold">{tx.method}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-50">
                    <div className="text-left sm:text-right">
                      <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Amount</p>
                      <p className="text-base font-black text-emerald-700">
                        {formatBDT(tx.amount)}
                      </p>
                    </div>

                    {isPending ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleApprove(tx)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-[10px] font-black transition shadow-md shadow-emerald-100 active:scale-95 cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(tx)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-xl text-[10px] font-bold transition border border-red-100 cursor-pointer active:scale-95"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-xl font-black text-[9px] uppercase tracking-tight ${
                        tx.status === 'Success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {tx.status === 'Success' ? (
                          <>
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Approved</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-2.5 h-2.5" />
                            <span>Rejected</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
