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
  Eye,
  Shuffle,
  Wallet,
  CreditCard,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Phone,
  Shield,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Transaction, MerchantProfile, VerificationRequest, DepositWalletNumber } from '../types';
import { BKASH_LOGO_URL, ROCKET_LOGO_URL, NAGAD_LOGO_URL } from '../constants/logos';
import { database } from '../firebase';
import { ref, set, onValue } from 'firebase/database';
import { getVerificationRequests } from '../utils/verificationService';
import { defaultMerchantsList } from '../mockData';
import { 
  getAllDepositNumbers, 
  saveMerchantDepositNumbers, 
  deleteMerchantDepositNumber, 
  getMerchantDepositNumbers 
} from '../utils/wallet';

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

  const [adminSection, setAdminSection] = useState<'wallets' | 'transactions' | 'accounts' | 'verifications'>('wallets');
  const [depositNumbers, setDepositNumbers] = useState<DepositWalletNumber[]>(() => {
    return getAllDepositNumbers();
  });
  const currentMId = (merchant.merchantId || 'M20241018').trim();
  const myDepositNumbers = depositNumbers.filter(
    n => (n.merchantId || '').trim().toLowerCase() === currentMId.toLowerCase()
  );
  const [newNumMethod, setNewNumMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [newNumVal, setNewNumVal] = useState('');
  const [newNumLimit, setNewNumLimit] = useState('50000');
  const [newNumLabel, setNewNumLabel] = useState<'Personal' | 'Agent'>('Personal');
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const handleCopyText = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedNumber(text);
      setTimeout(() => setCopiedNumber(null), 2000);
    } catch (e) {}
  };

  useEffect(() => {
    const refresh = () => setDepositNumbers(getAllDepositNumbers());
    window.addEventListener('depositNumbersUpdated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('depositNumbersUpdated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const handleAddNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = newNumVal.trim();
    if (!cleanNum) return;
    const limitNum = parseFloat(newNumLimit) || 50000;
    const currentMerchantId = (merchant.merchantId || 'M20241018').trim();

    const newEntry: DepositWalletNumber = {
      id: `num_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      merchantId: currentMerchantId,
      method: newNumMethod,
      number: cleanNum,
      limit: limitNum,
      label: newNumLabel,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    const currentMerchantNums = getMerchantDepositNumbers(currentMerchantId);
    if (currentMerchantNums.some(n => n.number === cleanNum && n.method === newNumMethod)) {
      setFeedbackMsg({ text: `আপনার মার্চেন্ট অ্যাকাউন্টে এই ${newNumMethod} নম্বরটি ইতিমধ্যে যোগ করা আছে!`, type: 'error' });
      setTimeout(() => setFeedbackMsg(null), 3500);
      return;
    }

    const updated = [newEntry, ...currentMerchantNums];
    await saveMerchantDepositNumbers(currentMerchantId, updated);
    setDepositNumbers(getAllDepositNumbers());

    // Explicitly guarantee current merchant remains Active and unlocked
    setAllAccounts(prev => prev.map(a => {
      if (a.merchantId && a.merchantId.trim().toLowerCase() === currentMerchantId.toLowerCase()) {
        return {
          ...a,
          isActive: true,
          status: 'Active',
          accountStatus: 'Active',
          partnershipStatus: 'Approved',
          isApproved: true
        };
      }
      return a;
    }));

    setNewNumVal('');
    setNewNumLimit('50000');
    setNewNumLabel('Personal');
    setFeedbackMsg({ 
      text: `আপনার অ্যাকাউন্টে নতুন ${newNumMethod} (${newNumLabel}) নম্বর (${cleanNum}) সফলভাবে যোগ করা হয়েছে!`, 
      type: 'success' 
    });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleDeleteNumber = async (item: DepositWalletNumber) => {
    const mId = (item.merchantId || merchant.merchantId || 'M20241018').trim();
    await deleteMerchantDepositNumber(mId, item.number, item.method);
    setDepositNumbers(getAllDepositNumbers());
    setFeedbackMsg({ text: `আপনার অ্যাকাউন্ট থেকে ${item.method} নম্বর (${item.number}) মুছে ফেলা হয়েছে।`, type: 'error' });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  return (
    <div className="space-y-3 sm:space-y-4 pb-16">
      {/* Top Executive Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4 sm:p-6 text-white shadow-xl border border-slate-800/80">
        {/* Subtle decorative glow accents */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isSuperAdmin ? 'Super Admin System' : 'Merchant Control Hub'}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Gateway</span>
              </span>
            </div>

            <div className="flex items-baseline gap-2.5 flex-wrap">
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                {isSuperAdmin ? 'কন্ট্রোল ও ম্যানেজমেন্ট সেন্টার' : 'মার্চেন্ট ড্যাশবোর্ড কন্ট্রোল'}
              </h2>
              <span className="text-xs font-mono font-bold text-indigo-300 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
                {merchant.merchantId || 'M20241018'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {isSuperAdmin 
                ? 'সিস্টেমের ডিপোজিট নম্বর, লেনদেন অনুমোদন ও মার্চেন্ট অ্যাকাউন্ট পরিচালনা পোর্টাল' 
                : 'আপনার গেটওয়ে ডিপোজিট নম্বর ও লেনদেন রিকোয়েস্ট পর্যবেক্ষণ করুন'}
            </p>
          </div>

          {/* Quick Stat Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full lg:w-auto">
            <button 
              type="button"
              onClick={() => { setAdminSection('transactions'); setFilterType('PendingDeposit'); }}
              className={`p-3 rounded-2xl border transition-all text-left group cursor-pointer ${
                pendingDeposits.length > 0 
                  ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50' 
                  : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-400">ডিপোজিট পেন্ডিং</span>
                {pendingDeposits.length > 0 && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
              </div>
              <p className="text-xl font-black text-amber-300">{pendingDeposits.length}</p>
            </button>

            <button 
              type="button"
              onClick={() => { setAdminSection('transactions'); setFilterType('PendingWithdrawal'); }}
              className={`p-3 rounded-2xl border transition-all text-left group cursor-pointer ${
                pendingWithdrawals.length > 0 
                  ? 'bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20 hover:border-orange-500/50' 
                  : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-orange-400">উত্তোলন পেন্ডিং</span>
                {pendingWithdrawals.length > 0 && <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />}
              </div>
              <p className="text-xl font-black text-orange-300">{pendingWithdrawals.length}</p>
            </button>

            <button 
              type="button"
              onClick={() => setAdminSection('verifications')}
              className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 hover:border-purple-500/50 transition-all text-left group cursor-pointer"
            >
              <span className="text-[9px] font-black uppercase tracking-wider text-purple-400 block mb-1">পার্টনার আবেদন</span>
              <p className="text-xl font-black text-purple-300">
                {displayVerificationRequests.filter(r => r.status === 'Pending').length}
              </p>
            </button>

            <button 
              type="button"
              onClick={() => setAdminSection('wallets')}
              className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 hover:bg-emerald-900/30 hover:border-emerald-500/60 transition-all text-left group cursor-pointer"
            >
              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 block mb-1">সিস্টেম ব্যালেন্স</span>
              <p className="text-sm sm:text-base font-black text-emerald-300 truncate">
                {formatBDT(merchant.balance)}
              </p>
            </button>
          </div>
        </div>

        {feedbackMsg && (
          <div className={`mt-4 p-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-top-2 duration-200 border backdrop-blur-md ${
            feedbackMsg.type === 'success' 
              ? 'bg-emerald-500/15 text-emerald-200 border-emerald-500/40' 
              : 'bg-rose-500/15 text-rose-200 border-rose-500/40'
          }`}>
            {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            <span className="leading-snug">{feedbackMsg.text}</span>
          </div>
        )}
      </div>

      {/* Admin Section Tabs Navigation Bar */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-1.5 sm:p-2 shadow-sm border border-gray-200/80 flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
        <button
          type="button"
          onClick={() => setAdminSection('wallets')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shrink-0 ${
            adminSection === 'wallets'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>ডিপোজিট নম্বর সেটিংস</span>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
            adminSection === 'wallets' ? 'bg-indigo-700/80 text-white' : 'bg-gray-100 text-gray-700'
          }`}>
            {myDepositNumbers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setAdminSection('transactions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shrink-0 ${
            adminSection === 'transactions'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>লেনদেন ও অনুমোদন</span>
          {(pendingDeposits.length > 0 || pendingWithdrawals.length > 0) && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500 text-white animate-pulse">
              {pendingDeposits.length + pendingWithdrawals.length}
            </span>
          )}
        </button>

        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => setAdminSection('accounts')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shrink-0 ${
              adminSection === 'accounts'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>মার্চেন্ট অ্যাকাউন্ট তালিকা</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
              adminSection === 'accounts' ? 'bg-indigo-700/80 text-white' : 'bg-gray-100 text-gray-700'
            }`}>
              {allAccounts.length}
            </span>
          </button>
        )}

        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => setAdminSection('verifications')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shrink-0 ${
              adminSection === 'verifications'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>পার্টনার আবেদন</span>
            {displayVerificationRequests.filter(r => r.status === 'Pending').length > 0 && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-600 text-white animate-pulse">
                {displayVerificationRequests.filter(r => r.status === 'Pending').length}
              </span>
            )}
          </button>
        )}
      </div>

      {isSuperAdmin && adminSection === 'verifications' && (
        <>
          {/* Verification & Partner Requests (Pending Submissions) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-200/80 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-base sm:text-lg flex items-center gap-2">
                <span>পার্টনার আবেদন ও ভেরিফিকেশন (Partner Verification)</span>
                {displayVerificationRequests.filter(r => r.status === 'Pending').length > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full animate-pulse shadow-xs">
                    {displayVerificationRequests.filter(r => r.status === 'Pending').length} Pending
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                মার্চেন্ট কর্তৃক জমা দেওয়া রেন্ডি কার্ড (Partner Card) ও এনআইডি ভেরিফিকেশন আবেদন পর্যালোচনা করুন
              </p>
            </div>
          </div>
          <span className="text-xs font-black text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100">
            মোট রিকোয়েস্ট: {displayVerificationRequests.length}টি
          </span>
        </div>

        {displayVerificationRequests.length === 0 ? (
          <div className="p-12 text-center text-gray-400 font-medium italic text-xs bg-slate-50/50 rounded-2xl border border-dashed border-gray-200 space-y-1.5">
            <Shield className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="font-bold text-gray-600">এখনও কোনো ভেরিফিকেশন রিকোয়েস্ট জমা পড়েনি</p>
            <p className="text-[11px] text-gray-400">মার্চেন্ট ইন-অ্যাক্টিভ পেজ থেকে আবেদন সাবমিট করলে এখানে রিয়েল-টাইমে দেখতে পাবেন।</p>
          </div>
        ) : (
          <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
            {displayVerificationRequests.map((req) => {
              const isPending = req.status === 'Pending';
              return (
                <div 
                  key={req.id} 
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isPending 
                      ? 'bg-amber-50/40 border-amber-200/80 shadow-xs hover:border-amber-300' 
                      : req.status === 'Approved'
                      ? 'bg-emerald-50/20 border-emerald-100/90'
                      : 'bg-gray-50/60 border-gray-100'
                  }`}
                >
                  <div className="space-y-2.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-gray-900 text-xs bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs">
                        {req.merchantId}
                      </span>
                      <span className="font-black text-gray-900 text-sm">
                        {req.merchantName}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tight ${
                        req.type === 'GATEWAY_1350' 
                          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                          : 'bg-purple-100 text-purple-800 border border-purple-200'
                      }`}>
                        {req.type === 'GATEWAY_1350' ? 'Gateway 1350 BDT' : 'Rendy Card (Partner)'}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black flex items-center gap-1 ${
                        isPending 
                          ? 'bg-amber-100 text-amber-800 animate-pulse border border-amber-200' 
                          : req.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isPending ? 'bg-amber-500' : req.status === 'Approved' ? 'bg-emerald-500' : 'bg-red-500'
                        }`} />
                        <span>{req.status}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-gray-600 bg-white/70 p-3 rounded-xl border border-gray-100">
                      {req.phone && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400 font-semibold">📞 ফোন:</span>
                          <span className="font-mono font-bold text-gray-900">{req.phone}</span>
                        </div>
                      )}
                      {req.trxId && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400 font-semibold">💳 TrxID:</span>
                          <span className="font-mono font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 select-all">
                            {req.trxId}
                          </span>
                        </div>
                      )}
                      {req.amount && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400 font-semibold">💰 ফি:</span>
                          <span className="font-black text-emerald-700">{req.amount} {req.currency || 'BDT'}</span>
                        </div>
                      )}
                      {req.nidNumber && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400 font-semibold">🆔 NID:</span>
                          <span className="font-mono font-bold text-gray-800">{req.nidNumber}</span>
                        </div>
                      )}
                      {req.whatsapp && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400 font-semibold">💬 WhatsApp:</span>
                          <a 
                            href={`https://wa.me/${req.whatsapp.replace(/[^0-9]/g, '')}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-emerald-700 hover:underline font-bold flex items-center gap-1"
                          >
                            <span>{req.whatsapp}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
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
                          className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>অনুমোদন ও এক্টিভ করুন</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectVerification(req)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-3.5 py-2.5 rounded-xl text-xs transition border border-rose-200 cursor-pointer active:scale-95"
                        >
                          বাতিল
                        </button>
                      </>
                    ) : req.status === 'Approved' ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-bold bg-emerald-100/70 border border-emerald-200 px-3.5 py-2 rounded-xl">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>সক্রিয় অনুমোদিত</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-red-700 text-xs font-bold bg-red-100/70 border border-red-200 px-3.5 py-2 rounded-xl">
                        <XCircle className="w-4 h-4 text-red-600" />
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
      {isSuperAdmin && adminSection === 'accounts' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-200/80 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-base sm:text-lg">
                  মার্চেন্ট অ্যাকাউন্ট তালিকা ও পারমিশন (Merchant Directory)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">সকল মার্চেন্টের স্ট্যাটাস, কমিশন ও গেটওয়ে সুবিধা নিয়ন্ত্রণ করুন</p>
              </div>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="ID, নাম, ফোন বা ইমেইল খুঁজুন..."
                value={accountSearch}
                onChange={(e) => setAccountSearch(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white font-medium transition shadow-2xs"
              />
            </div>
          </div>

          <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
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
              <div className="p-12 text-center text-gray-400 font-medium italic text-xs bg-slate-50/50 rounded-2xl border border-dashed border-gray-200 space-y-1.5">
                <Users className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="font-bold text-gray-600">কোনো মার্চেন্ট অ্যাকাউন্ট পাওয়া যায়নি</p>
                <p className="text-[11px] text-gray-400">অন্য কোনো নাম বা মার্চেন্ট আইডি দিয়ে অনুসন্ধান করুন।</p>
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
                    <div key={acc.merchantId} className="p-4 sm:p-5 border border-gray-200/90 rounded-2xl bg-white hover:border-indigo-300 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-black text-gray-900 text-xs sm:text-sm bg-slate-100 px-2.5 py-1 rounded-lg border border-gray-200">
                            {acc.merchantId}
                          </span>
                          <span className="font-black text-gray-900 text-sm truncate max-w-[150px] sm:max-w-none">
                            {acc.name || 'Merchant'}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight flex items-center gap-1 ${
                            isActive ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                          {(acc.merchantId === 'S01926516246' || acc.merchantId === 'M20241018') && (
                            <span className="text-[9px] font-black bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100 uppercase tracking-wider">
                              Admin Master
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 sm:flex sm:items-center gap-y-1 gap-x-4 text-xs text-gray-600 font-medium">
                          <span className="truncate">📞 <span className="font-bold text-gray-800">{acc.phone || 'N/A'}</span></span>
                          <span className="truncate hidden md:inline">📧 <span className="text-gray-700">{acc.email || 'N/A'}</span></span>
                          <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-bold text-[11px] border border-indigo-100">ইন: {acc.commissionPayin ?? 0}%</span>
                          <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md font-bold text-[11px] border border-purple-100">আউট: {acc.commissionPayout ?? 0}%</span>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                            evaluateCommissionActive(acc) 
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            <Percent className="w-2.5 h-2.5" />
                            <span>কমিশন: {evaluateCommissionActive(acc) ? 'Active' : 'Deactive'}</span>
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

      {/* Deposit Numbers Management - Isolated Per Merchant */}
      {adminSection === 'wallets' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-200/80 space-y-6">
        {/* Section Header */}
        {(() => {
          const currentMId = (merchant.merchantId || 'M20241018').trim();
          const myDepositNumbers = depositNumbers.filter(
            n => (n.merchantId || '').trim().toLowerCase() === currentMId.toLowerCase()
          );

          return (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-base sm:text-lg">
                        ডিপোজিট ওয়ালেট নম্বর সেটিংস
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        আপনার মার্চেন্ট গেটওয়েতে গ্রাহকদের প্রদর্শনের জন্য bKash, Nagad ও Rocket নম্বর যুক্ত করুন
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <span className="text-xs font-black bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl border border-indigo-100/80">
                    মোট সক্রিয় নম্বর: {myDepositNumbers.length}টি
                  </span>
                </div>
              </div>

              {/* Add Number Form - Locked to Own Merchant */}
              <form onSubmit={handleAddNumber} className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-gray-200/80 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider">নতুন ওয়ালেট নম্বর যুক্ত করুন</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                  {/* Current Merchant (Locked / Read-only) */}
                  <div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                      আপনার মার্চেন্ট অ্যাকাউন্ট (Merchant ID)
                    </label>
                    <div className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 flex items-center justify-between shadow-2xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse"></span>
                        <span className="font-mono font-black text-indigo-600 text-xs tracking-wide">
                          {merchant.merchantId || 'M20241018'}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500 font-semibold truncate max-w-[130px] bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                        {merchant.name || merchant.email || 'Merchant Account'}
                      </span>
                    </div>
                  </div>

                  {/* Method */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider">মেথড</label>
                    <select
                      value={newNumMethod}
                      onChange={(e) => setNewNumMethod(e.target.value as any)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition shadow-2xs"
                    >
                      <option value="bKash">bKash (বিকাশ)</option>
                      <option value="Nagad">Nagad (নগদ)</option>
                      <option value="Rocket">Rocket (রকেট)</option>
                    </select>
                  </div>

                  {/* Label */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider">টাইপ</label>
                    <select
                      value={newNumLabel}
                      onChange={(e) => setNewNumLabel(e.target.value as any)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition shadow-2xs"
                    >
                      <option value="Personal">Personal (ব্যক্তিগত)</option>
                      <option value="Agent">Agent (এজেন্ট)</option>
                    </select>
                  </div>

                  {/* Limit */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider">ম্যাক্স লিমিট (BDT)</label>
                    <input
                      type="number"
                      required
                      placeholder="50000"
                      value={newNumLimit}
                      onChange={(e) => setNewNumLimit(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition shadow-2xs"
                    />
                  </div>

                  {/* Wallet Number Input */}
                  <div className="space-y-1.5 sm:col-span-2 lg:col-span-4">
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                      ওয়ালেট মোবাইল নম্বর (Wallet Number)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: 017XXXXXXXX বা 019XXXXXXXX"
                      value={newNumVal}
                      onChange={(e) => setNewNumVal(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition shadow-2xs"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl transition shadow-md shadow-indigo-600/25 active:scale-95 text-xs flex items-center justify-center gap-1.5 cursor-pointer h-[40px]"
                    >
                      <span>+ নম্বর যোগ করুন</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Active Wallets List */}
              <div className="space-y-3 pt-1">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs sm:text-sm text-gray-900 uppercase tracking-wider">
                      আপনার সক্রিয় ওয়ালেট তালিকা
                    </span>
                    <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                      {myDepositNumbers.length}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1.5">
                    <span>মার্চেন্ট অ্যাকাউন্ট:</span>
                    <span className="font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {merchant.merchantId || 'M20241018'}
                    </span>
                  </div>
                </div>

                {/* Random Rotation Banner Notice */}
                <div className="p-3.5 bg-gradient-to-r from-indigo-50/80 via-purple-50/60 to-indigo-50/80 border border-indigo-100 rounded-2xl flex items-center gap-3 text-indigo-900 text-xs shadow-2xs">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Shuffle className="w-4 h-4 animate-spin-slow" />
                  </div>
                  <p className="leading-relaxed">
                    <strong>স্মার্ট র‍্যান্ডম রোটেশন সক্রিয়:</strong> আপনার অ্যাকাউন্টে একই মেথডে (যেমন bKash) একের অধিক নম্বর থাকলে ডিপোজিট পেজে প্রতি গ্রাহককে স্বয়ংক্রিয়ভাবে আলাদা আলাদা রেনডম নম্বর বরাদ্দ করা হবে।
                  </p>
                </div>

                {/* Grid of Wallets */}
                {myDepositNumbers.length === 0 ? (
                  <div className="p-12 text-center text-gray-400 bg-slate-50/50 rounded-2xl border border-dashed border-gray-200 text-xs font-medium space-y-2">
                    <Wallet className="w-8 h-8 text-gray-300 mx-auto" />
                    <p className="font-bold text-gray-600">আপনার মার্চেন্ট অ্যাকাউন্টে এখনও কোনো ওয়ালেট নম্বর যোগ করা নেই</p>
                    <p className="text-[11px] text-gray-400">উপরের ফর্ম ব্যবহার করে আপনার bKash, Nagad বা Rocket নম্বর যোগ করুন।</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                    {myDepositNumbers.map((item, idx) => {
                      const usedAmount = transactions
                        .filter(t => t.walletNumber === item.number && (t.status === 'Success' || t.status === 'Pending'))
                        .reduce((sum, t) => sum + t.amount, 0);
                      const limit = item.limit || 50000;
                      const percent = Math.min(100, Math.round((usedAmount / limit) * 100));
                      const isExceeded = usedAmount >= limit;

                      return (
                        <div 
                          key={item.id || idx} 
                          className="p-4 border border-gray-200/90 rounded-2xl bg-white hover:border-indigo-300 hover:shadow-md transition-all group relative overflow-hidden"
                        >
                          {/* Top colored line by method */}
                          <div className={`absolute top-0 left-0 right-0 h-1 ${
                            item.method === 'bKash' ? 'bg-[#E2136E]' :
                            item.method === 'Nagad' ? 'bg-[#F68F1E]' :
                            'bg-[#8C3494]'
                          }`} />

                          <div className="flex items-start justify-between gap-3 pt-1">
                            <div className="space-y-2.5 min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tight ${
                                  item.method === 'bKash' ? 'bg-pink-100 text-pink-700 border border-pink-200' :
                                  item.method === 'Nagad' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                                  'bg-purple-100 text-purple-700 border border-purple-200'
                                }`}>
                                  {item.method}
                                </span>
                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-tight ${
                                  item.label === 'Personal' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                                }`}>
                                  {item.label || 'Personal'}
                                </span>
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[9px] font-bold border border-emerald-100">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  Active
                                </span>
                              </div>

                              {/* Number & Copy */}
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-gray-900 text-base sm:text-lg tracking-wide">
                                  {item.number}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(item.number)}
                                  className="p-1 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                                  title="নম্বর কপি করুন"
                                >
                                  {copiedNumber === item.number ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                {copiedNumber === item.number && (
                                  <span className="text-[10px] font-bold text-emerald-600 animate-in fade-in">কপি হয়েছে!</span>
                                )}
                              </div>

                              {/* Merchant Identifier Badge */}
                              <div className="flex items-center gap-1.5 text-[11px]">
                                <span className="text-gray-400 font-medium">মার্চেন্ট ID:</span>
                                <span className="font-mono font-bold text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded border border-indigo-100">
                                  {item.merchantId || merchant.merchantId || 'M20241018'}
                                </span>
                              </div>

                              {/* Limit Bar */}
                              <div className="space-y-1.5 bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                                <div className="flex items-center justify-between text-[10px] font-bold text-gray-600">
                                  <span>দৈনিক লিমিট ব্যবহার:</span>
                                  <span className={isExceeded ? 'text-red-600 font-black' : 'text-emerald-700 font-black'}>
                                    {percent}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200/80 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${isExceeded ? 'bg-red-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-gray-500 font-medium">
                                  <span>ব্যবহৃত: <strong className="text-gray-800">৳{usedAmount.toLocaleString()}</strong></span>
                                  <span>সর্বোচ্চ: <strong className="text-gray-800">৳{limit.toLocaleString()}</strong></span>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              title="মুছে ফেলুন"
                              onClick={() => handleDeleteNumber(item)}
                              className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer shrink-0 border border-transparent hover:border-red-100"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          );
        })()}
        </div>
      )}

      {/* Transactions & Approvals Section */}
      {adminSection === 'transactions' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-200/80 space-y-5">
          {/* Header & List Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base sm:text-lg">
                    লেনদেন ও অনুমোদন পোর্টাল (Transactions)
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isSuperAdmin ? 'সকল গ্রাহক ও মার্চেন্টের ডিপোজিট ও উত্তোলন অনুমোদন করুন' : 'আপনার অ্যাকাউন্টের লেনদেন স্থিতি ও অগ্রগতি'}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="TrxID, ফোন বা নাম খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white font-medium transition shadow-2xs"
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
            <button
              type="button"
              onClick={() => setFilterType('PendingDeposit')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                filterType === 'PendingDeposit' 
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25' 
                  : 'bg-slate-100/80 text-gray-600 hover:text-gray-900 hover:bg-slate-200/70'
              }`}
            >
              <span>পেন্ডিং ডিপোজিট</span>
              {pendingDeposits.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                  filterType === 'PendingDeposit' ? 'bg-amber-700/80 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {pendingDeposits.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setFilterType('PendingWithdrawal')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                filterType === 'PendingWithdrawal' 
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25' 
                  : 'bg-slate-100/80 text-gray-600 hover:text-gray-900 hover:bg-slate-200/70'
              }`}
            >
              <span>পেন্ডিং উত্তোলন</span>
              {pendingWithdrawals.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                  filterType === 'PendingWithdrawal' ? 'bg-orange-700/80 text-white' : 'bg-orange-500 text-white'
                }`}>
                  {pendingWithdrawals.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setFilterType('AllDeposit')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                filterType === 'AllDeposit' 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25' 
                  : 'bg-slate-100/80 text-gray-600 hover:text-gray-900 hover:bg-slate-200/70'
              }`}
            >
              সকল ডিপোজিট
            </button>

            <button
              type="button"
              onClick={() => setFilterType('AllWithdrawal')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                filterType === 'AllWithdrawal' 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25' 
                  : 'bg-slate-100/80 text-gray-600 hover:text-gray-900 hover:bg-slate-200/70'
              }`}
            >
              সকল উত্তোলন
            </button>
          </div>

          {/* Transactions List */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
            {displayList.length === 0 ? (
              <div className="p-14 text-center text-gray-400 font-medium italic text-xs bg-slate-50/50 rounded-2xl border border-dashed border-gray-200 space-y-1.5">
                <CreditCard className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="font-bold text-gray-600">কোনো লেনদেন পাওয়া যায়নি</p>
                <p className="text-[11px] text-gray-400">এই ফিল্টারে বর্তমানে কোনো রিকোয়েস্ট নেই।</p>
              </div>
            ) : (
              displayList.map((tx) => {
                const isPending = tx.status === 'Pending';
                return (
                  <div 
                    key={tx.id} 
                    className="p-4 sm:p-5 rounded-2xl border border-gray-200/90 bg-white hover:border-indigo-300 hover:shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-2.5 flex-1 min-w-0 w-full sm:w-auto">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-gray-900 text-xs sm:text-sm bg-slate-100 px-2.5 py-1 rounded-lg border border-gray-200">
                            {tx.transactionId}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(tx.transactionId)}
                            className="p-1 text-gray-400 hover:text-indigo-600 transition cursor-pointer"
                            title="ID কপি করুন"
                          >
                            {copiedNumber === tx.transactionId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tight ${
                          tx.type === 'Payin' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {tx.type === 'Payin' ? 'Deposit (ডিপোজিট)' : 'Payout (উত্তোলন)'}
                        </span>

                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black flex items-center gap-1 ${
                          tx.status === 'Success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          tx.status === 'Pending' ? 'bg-amber-100 text-amber-800 animate-pulse border border-amber-200' :
                          'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            tx.status === 'Success' ? 'bg-emerald-500' : tx.status === 'Pending' ? 'bg-amber-500' : 'bg-red-500'
                          }`} />
                          <span>{tx.status}</span>
                        </span>

                        {tx.method && (
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                            tx.method === 'bKash' ? 'bg-pink-100 text-pink-700' :
                            tx.method === 'Nagad' ? 'bg-orange-100 text-orange-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {tx.method}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-gray-600 font-medium">
                        <span className="flex items-center gap-1">
                           <span className="text-gray-400">👤 গ্রাহক:</span>
                           <span className="font-mono font-bold text-gray-900">{tx.customerPhone || 'Unknown'}</span>
                        </span>
                        <span className="flex items-center gap-1">
                           <span className="text-gray-400">📅 সময়:</span>
                           <span className="text-gray-700">{new Date(tx.createdAt).toLocaleString()}</span>
                        </span>
                        {tx.walletNumber && (
                          <span className="flex items-center gap-1">
                            <span className="text-gray-400">📲 ওয়ালেট:</span>
                            <span className="font-mono font-bold text-indigo-700">{tx.walletNumber}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                      <div className="text-left sm:text-right">
                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-wider mb-0.5">টাকার পরিমাণ</p>
                        <p className="text-base sm:text-lg font-black text-emerald-700">
                          {formatBDT(tx.amount)}
                        </p>
                      </div>

                      {isPending ? (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleApprove(tx)}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-3.5 py-2 rounded-xl text-xs font-black transition shadow-md shadow-emerald-600/25 active:scale-95 cursor-pointer flex items-center gap-1.5"
                            title="ডিপোজিট অনুমোদন করুন এবং ব্যালেন্সে টাকা যুক্ত করুন"
                          >
                            <Check className="w-4 h-4 stroke-[2.5]" />
                            <span>অনুমোদন</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(tx)}
                            className="bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 px-3.5 py-2 rounded-xl text-xs font-bold transition border border-rose-200 hover:border-rose-300 shadow-2xs cursor-pointer active:scale-95 flex items-center gap-1.5"
                            title="ডিপোজিট রিকোয়েস্ট বাতিল করুন"
                          >
                            <X className="w-4 h-4 text-rose-500 stroke-[2.5]" />
                            <span>বাতিল (Cancel)</span>
                          </button>
                        </div>
                      ) : (
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-tight ${
                          tx.status === 'Success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                          {tx.status === 'Success' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Approved</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-red-600" />
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
      )}
    </div>
  );
};
