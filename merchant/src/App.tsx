import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardHome } from './components/DashboardHome';
import { TransactionsTab } from './components/TransactionsTab';
import { DepositModal } from './components/DepositModal';
import { PayoutModal } from './components/PayoutModal';
import { ApiKeysTab } from './components/ApiKeysTab';
import { DocumentationTab } from './components/DocumentationTab';
import { SupportTab } from './components/SupportTab';
import { SettingsTab } from './components/SettingsTab';
import { AdminPanel } from './components/AdminPanel';
import { TransactionModal } from './components/TransactionModal';
import { CheckoutView } from './components/CheckoutView';
import { LoginView } from './components/LoginView';
import { InactiveView } from './components/InactiveView';
import { initialMerchant, initialTransactions, initialApiKey } from './mockData';
import { MerchantProfile, Transaction, ApiKeyConfig } from './types';
import { ref, set, onValue } from 'firebase/database';
import { database } from './firebase';
import { APP_LOGO_URL } from './constants/logos';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<'All' | 'Payin' | 'Payout'>('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasUnreadPending, setHasUnreadPending] = useState(false);

  // Clean Merchant Profile
  const [merchant, setMerchant] = useState<MerchantProfile>(() => {
    try {
      const saved = localStorage.getItem('chaopaopay_merchant');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    return initialMerchant;
  });

  // Persistent Transactions List (clear any mock/random items from previous tests)
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('chaopaopay_transactions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(t => !['tx_101', 'tx_102', 'tx_103', 'tx_104', 'tx_105', 'tx_106'].includes(t.id));
          return cleaned;
        }
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    return initialTransactions;
  });

  const [apiKey, setApiKey] = useState<ApiKeyConfig>(initialApiKey);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [checkoutData, setCheckoutData] = useState<{ txId: string; amount: number; method?: 'bKash' | 'Nagad' | 'Rocket' } | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const payId = params.get('pay') || params.get('checkout');
    if (payId) {
      return { txId: payId, amount: 500, method: 'bKash' };
    }
    return null;
  });

  const pendingDepositsCount = transactions.filter(t => t.type === 'Payin' && t.status === 'Pending').length;

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

  // Centralized evaluation function to guarantee Master Admin Panel authority
  const evaluateAccountActive = (data: any, isMaster: boolean = false): boolean => {
    if (isMaster) return true;
    if (!data) return false;
    
    // Explicit inactive check takes absolute precedence
    if (data.isActive === false || data.status === 'Inactive' || data.accountStatus === 'Inactive' || data.partnershipStatus === 'Rejected') {
      return false;
    }
    
    // Only active if explicitly approved & activated by Master Admin Panel
    return Boolean(
      data.isActive === true && 
      data.isApproved === true && 
      data.partnershipStatus === 'Approved' && 
      (data.status === 'Active' || data.accountStatus === 'Active')
    );
  };

  // Strict Account Active Logic
  const isAccountActive = evaluateAccountActive(merchant, isSuperAdmin);

  const isPartnerAgentApproved = Boolean(
    isSuperAdmin || isAccountActive
  );

    // Guard: Only redirect if superadmin restriction applies, never trap in inactive during normal operations
    useEffect(() => {
      if (activeTab === 'admin' && !isPartnerAgentApproved && !isSuperAdmin) {
        setActiveTab('dashboard');
      }
      // New Guard: If account is active, don't allow staying in inactive tab
      if (isAccountActive && (activeTab === 'inactive' || activeTab === 'verification')) {
        setActiveTab('dashboard');
      }
    }, [activeTab, isPartnerAgentApproved, isSuperAdmin, isAccountActive]);

  // Sync profile from chaopaopay_merchant and chaopaopay_all_merchants whenever another tab or Admin Panel updates storage
  useEffect(() => {
    const handleStorageChange = (e?: any) => {
      try {
        const currentId = merchant.merchantId ? merchant.merchantId.trim().toLowerCase() : '';
        
        // Check if event has detail (merchantUpdated CustomEvent)
        const detail = e?.detail;
        if (detail && detail.merchantId && currentId && detail.merchantId.trim().toLowerCase() === currentId) {
          const isMaster = Boolean(
            currentId === 's01926516246' ||
            currentId === 'm20241018' ||
            detail.phone === '01926516246'
          );
          const pActive = evaluateAccountActive(detail, isMaster);

          setMerchant(prev => {
            const updated: MerchantProfile = {
              ...prev,
              ...detail,
              isActive: pActive,
              status: pActive ? 'Active' : 'Inactive',
              accountStatus: pActive ? 'Active' : 'Inactive',
              partnershipStatus: pActive ? 'Approved' : 'Inactive',
              kycStatus: pActive ? 'Verified' : 'Unverified',
              isApproved: pActive,
              isPartnerAgent: pActive ? (detail.isPartnerAgent !== false) : false
            };
            try {
              localStorage.setItem('chaopaopay_merchant', JSON.stringify(updated));
            } catch (err) {}
            return updated;
          });
          return;
        }

        // 1. Check chaopaopay_all_merchants FIRST (Authoritative source from Admin Panel)
        const savedAll = localStorage.getItem('chaopaopay_all_merchants');
        if (savedAll && currentId) {
          try {
            const list = JSON.parse(savedAll);
            if (Array.isArray(list)) {
              const match = list.find((m: any) => m.merchantId && m.merchantId.trim().toLowerCase() === currentId);
              if (match) {
                setMerchant(prev => {
                  const pPayin = match.commissionPayin !== undefined ? Number(match.commissionPayin) : prev.commissionPayin;
                  const pPayout = match.commissionPayout !== undefined ? Number(match.commissionPayout) : prev.commissionPayout;
                  const pBal = match.balance !== undefined ? Number(match.balance) : prev.balance;
                  const pAccType = match.accountType || prev.accountType;
                  const pFeeType = match.feeType || (pAccType === 'Payment Gateway Use' ? 'Charge' : 'Commission');
                  const pCommActive = (match.isCommissionActive === false || match.commissionStatus === 'Inactive' || match.commissionStatus === 'Deactive') ? false : true;
                  const pCommStatus = pCommActive ? 'Active' : 'Inactive';
                  
                  const isMaster = Boolean(
                    currentId === 's01926516246' ||
                    currentId === 'm20241018' ||
                    match.phone === '01926516246'
                  );

                  const pActive = evaluateAccountActive(match, isMaster);

                  const pStatus = pActive ? 'Active' : 'Inactive';
                  const pPartner = pActive ? (match.isPartnerAgent !== false) : false;
                  const pStatusPartner = pActive ? 'Approved' : 'Inactive';
                  const pKyc = pActive ? 'Verified' : 'Unverified';
                  const pApproved = pActive;

                  if (
                    prev.balance === pBal &&
                    prev.commissionPayin === pPayin &&
                    prev.commissionPayout === pPayout &&
                    prev.isCommissionActive === pCommActive &&
                    prev.commissionStatus === pCommStatus &&
                    prev.accountType === pAccType &&
                    prev.feeType === pFeeType &&
                    prev.isPartnerAgent === pPartner &&
                    prev.partnershipStatus === pStatusPartner &&
                    prev.isActive === pActive &&
                    prev.status === pStatus &&
                    prev.accountStatus === pStatus &&
                    prev.kycStatus === pKyc &&
                    prev.isApproved === pApproved
                  ) {
                    return prev;
                  }
                  
                  const updated: MerchantProfile = {
                    ...prev,
                    ...match,
                    balance: pBal,
                    commissionPayin: pPayin,
                    commissionPayout: pPayout,
                    isCommissionActive: pCommActive,
                    commissionStatus: pCommStatus,
                    accountType: pAccType,
                    feeType: pFeeType,
                    isPartnerAgent: pPartner,
                    partnershipStatus: pStatusPartner,
                    isActive: pActive,
                    status: pStatus,
                    accountStatus: pStatus,
                    kycStatus: pKyc,
                    isApproved: pApproved,
                    totalDeposits: typeof match.totalDeposits === 'number' ? match.totalDeposits : (prev.totalDeposits || 0),
                    totalWithdrawals: typeof match.totalWithdrawals === 'number' ? match.totalWithdrawals : (prev.totalWithdrawals || 0),
                    todayDeposits: typeof match.todayDeposits === 'number' ? match.todayDeposits : (prev.todayDeposits || 0),
                    todayWithdrawals: typeof match.todayWithdrawals === 'number' ? match.todayWithdrawals : (prev.todayWithdrawals || 0),
                    depositCount: typeof match.depositCount === 'number' ? match.depositCount : (prev.depositCount || 0),
                    withdrawalCount: typeof match.withdrawalCount === 'number' ? match.withdrawalCount : (prev.withdrawalCount || 0)
                  };
                  
                  try {
                    localStorage.setItem('chaopaopay_merchant', JSON.stringify(updated));
                  } catch (e) {}
                  
                  return updated;
                });
                return;
              }
            }
          } catch (e) {}
        }

        // 2. Fallback to chaopaopay_merchant
        const curSaved = localStorage.getItem('chaopaopay_merchant');
        if (curSaved && currentId) {
          const curM = JSON.parse(curSaved);
          if (curM && curM.merchantId && curM.merchantId.trim().toLowerCase() === currentId) {
            const isMaster = Boolean(
              currentId === 's01926516246' ||
              currentId === 'm20241018' ||
              curM.phone === '01926516246'
            );
            const isAct = evaluateAccountActive(curM, isMaster);
            const isCommAct = (curM.isCommissionActive === false || curM.commissionStatus === 'Inactive' || curM.commissionStatus === 'Deactive') ? false : true;
            setMerchant(prev => {
              const updatedStatus = isAct ? 'Active' : 'Inactive';
              const updatedPartnerStatus = isAct ? 'Approved' : 'Inactive';
              const updatedCommStatus = isCommAct ? 'Active' : 'Inactive';
              if (
                prev.isActive === isAct &&
                prev.status === updatedStatus &&
                prev.accountStatus === updatedStatus &&
                prev.partnershipStatus === updatedPartnerStatus &&
                prev.isCommissionActive === isCommAct &&
                prev.commissionStatus === updatedCommStatus &&
                prev.balance === curM.balance &&
                prev.commissionPayin === curM.commissionPayin &&
                prev.commissionPayout === curM.commissionPayout
              ) {
                return prev;
              }
              return {
                ...prev,
                ...curM,
                isActive: isAct,
                status: updatedStatus,
                accountStatus: updatedStatus,
                isApproved: isAct,
                partnershipStatus: updatedPartnerStatus,
                isCommissionActive: isCommAct,
                commissionStatus: updatedCommStatus
              };
            });
            return;
          }
        }
      } catch (e) {
        console.warn('Sync error:', e);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('merchantUpdated', handleStorageChange);
    
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('merchantUpdated', handleStorageChange);
    };
  }, [merchant.merchantId]);

  // Real-time synchronization for Merchant Profile from Firebase Realtime Database
  useEffect(() => {
    if (!database || !merchant.merchantId) return;
    const currentId = merchant.merchantId.trim().toLowerCase();
    
    try {
      const applyRemoteUpdate = (val: any) => {
        if (!val) return;

        setMerchant(prev => {
          const newBal = Number(val.balance !== undefined ? val.balance : prev.balance);
          const rawPayin = val.commissionPayin !== undefined 
            ? val.commissionPayin 
            : (val.payinFeePercent !== undefined ? val.payinFeePercent : (val.commission !== undefined ? val.commission : prev.commissionPayin));
          const newPayin = Number(rawPayin ?? 0);

          const rawPayout = val.commissionPayout !== undefined 
            ? val.commissionPayout 
            : (val.payoutFeePercent !== undefined ? val.payoutFeePercent : prev.commissionPayout);
          const newPayout = Number(rawPayout ?? 0);

          const newAccType = val.accountType || prev.accountType;
          const pFeeType = val.feeType || (newAccType === 'Payment Gateway Use' ? 'Charge' : 'Commission');
          const isCommAct = (val.isCommissionActive === false || val.commissionStatus === 'Inactive' || val.commissionStatus === 'Deactive') ? false : true;
          const commStatus = isCommAct ? 'Active' : 'Inactive';
          
          const isMaster = Boolean(
            currentId === 's01926516246' ||
            currentId === 'm20241018' ||
            prev.phone === '01926516246' ||
            prev.email === 'admin@tkpaybd.site' ||
            prev.email === 'sadin@tkpaybd.site'
          );

          const newIsActive = evaluateAccountActive(val, isMaster);

          const newStatus = val.status || (newIsActive ? 'Active' : 'Inactive');
          const newPartner = val.isPartnerAgent !== undefined ? val.isPartnerAgent : (newIsActive ? (val.isPartnerAgent !== false) : false);
          const updatedPartnerStatus = val.partnershipStatus || (newIsActive ? 'Approved' : 'Inactive');
          const newKyc = val.kycStatus || (newIsActive ? 'Verified' : 'Unverified');
          const newApproved = val.isApproved !== undefined ? val.isApproved : newIsActive;

          if (
            prev.balance === newBal &&
            prev.commissionPayin === newPayin &&
            prev.commissionPayout === newPayout &&
            prev.isCommissionActive === isCommAct &&
            prev.commissionStatus === commStatus &&
            prev.isActive === newIsActive &&
            prev.status === newStatus &&
            prev.accountStatus === newStatus &&
            prev.partnershipStatus === updatedPartnerStatus &&
            prev.kycStatus === newKyc &&
            prev.isApproved === newApproved &&
            prev.accountType === newAccType &&
            prev.feeType === pFeeType
          ) {
            return prev;
          }

          const updated: MerchantProfile = {
            ...prev,
            ...val,
            balance: newBal,
            commissionPayin: newPayin,
            commissionPayout: newPayout,
            isCommissionActive: isCommAct,
            commissionStatus: commStatus,
            accountType: newAccType,
            feeType: pFeeType,
            isPartnerAgent: newPartner,
            partnershipStatus: updatedPartnerStatus,
            isActive: newIsActive,
            status: newStatus,
            accountStatus: newStatus,
            kycStatus: newKyc,
            isApproved: newApproved,
            totalDeposits: typeof val.totalDeposits === 'number' ? val.totalDeposits : (prev.totalDeposits || 0),
            totalWithdrawals: typeof val.totalWithdrawals === 'number' ? val.totalWithdrawals : (prev.totalWithdrawals || 0),
            todayDeposits: typeof val.todayDeposits === 'number' ? val.todayDeposits : (prev.todayDeposits || 0),
            todayWithdrawals: typeof val.todayWithdrawals === 'number' ? val.todayWithdrawals : (prev.todayWithdrawals || 0),
            depositCount: typeof val.depositCount === 'number' ? val.depositCount : (prev.depositCount || 0),
            withdrawalCount: typeof val.withdrawalCount === 'number' ? val.withdrawalCount : (prev.withdrawalCount || 0)
          };

          try {
            localStorage.setItem('chaopaopay_merchant', JSON.stringify(updated));
          } catch (e) {}

          return updated;
        });
      };

      const unsubProfile1 = onValue(ref(database, `merchants/${merchant.merchantId}/profile`), snap => {
        if (snap.exists()) applyRemoteUpdate(snap.val());
      });

      const unsubProfile2 = onValue(ref(database, `merchants/${currentId}/profile`), snap => {
        if (snap.exists()) applyRemoteUpdate(snap.val());
      });

      const unsubDir1 = onValue(ref(database, `merchants_directory/${merchant.merchantId}`), snap => {
        if (snap.exists()) applyRemoteUpdate(snap.val());
      });

      const unsubDir2 = onValue(ref(database, `merchants_directory/${currentId}`), snap => {
        if (snap.exists()) applyRemoteUpdate(snap.val());
      });

      const unsubComm1 = onValue(ref(database, `merchants/${merchant.merchantId}/commission`), snap => {
        if (snap.exists()) applyRemoteUpdate(snap.val());
      });

      const unsubComm2 = onValue(ref(database, `merchants/${currentId}/commission`), snap => {
        if (snap.exists()) applyRemoteUpdate(snap.val());
      });

      // Also listen to full directory to catch any admin panel toggle instantly
      const unsubAllDir = onValue(ref(database, `merchants_directory`), snap => {
        if (snap.exists()) {
          const all = snap.val();
          if (all && typeof all === 'object') {
            const entries = Object.entries(all);
            for (const [key, val] of entries) {
              const item = val as any;
              if (!item) continue;
              const matchesId = key.trim().toLowerCase() === currentId || 
                (item.merchantId && item.merchantId.trim().toLowerCase() === currentId);
              if (matchesId) {
                applyRemoteUpdate({ merchantId: key, ...item });
                break;
              }
            }
          }
        }
      });

      return () => {
        unsubProfile1();
        unsubProfile2();
        unsubDir1();
        unsubDir2();
        unsubComm1();
        unsubComm2();
        unsubAllDir();
      };
    } catch (e) {
      console.warn('Profile real-time sync error:', e);
    }
  }, [database, merchant.merchantId]);

  // Real-time synchronization for Transactions List
  useEffect(() => {
    if (!database || !merchant.merchantId) return;
    try {
      const txRef = ref(database, `merchants/${merchant.merchantId}/transactions`);
      const unsub = onValue(txRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list = Object.values(data) as Transaction[];
          // Sort by date descending
          const sorted = list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setTransactions(sorted);
        }
      });
      return () => unsub();
    } catch (e) {
      console.warn('Transactions real-time sync error:', e);
    }
  }, [merchant.merchantId]);

  // Sync state to LocalStorage (do NOT overwrite Firebase database nodes automatically)
  useEffect(() => {
    try {
      localStorage.setItem('chaopaopay_merchant', JSON.stringify(merchant));
    } catch (e) {
      console.warn('LocalStorage sync error:', e);
    }
  }, [merchant]);

  useEffect(() => {
    try {
      localStorage.setItem('chaopaopay_transactions', JSON.stringify(transactions));
    } catch (e) {
      console.warn(e);
    }
  }, [transactions]);

  // Sync to Firebase in background
  const syncToFirebase = (newTx?: Transaction, updatedMerchant?: MerchantProfile) => {
    try {
      if (newTx && database) {
        const txRef = ref(database, `merchants/${merchant.merchantId}/transactions/${newTx.transactionId}`);
        set(txRef, newTx).catch(() => {});
      }
      if (updatedMerchant && database) {
        const merchantRef = ref(database, `merchants/${updatedMerchant.merchantId}/profile`);
        set(merchantRef, updatedMerchant).catch(() => {});
      }
    } catch (e) {
      console.warn('Firebase background sync warning:', e);
    }
  };

  // Add Transaction: deposits start as Pending, NOT automatically added to balance!
  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions(prev => [newTx, ...prev]);

    if (newTx.type === 'Payin' && newTx.status === 'Pending') {
      setHasUnreadPending(true);
      syncToFirebase(newTx);
    } else if (newTx.type === 'Payout') {
      // Payout request deducts balance
      setMerchant(prev => {
        const updated = {
          ...prev,
          balance: Math.max(0, prev.balance - newTx.amount),
          totalWithdrawals: prev.totalWithdrawals + newTx.amount,
          withdrawalCount: prev.withdrawalCount + 1,
          todayWithdrawals: prev.todayWithdrawals + newTx.amount,
        };
        syncToFirebase(newTx, updated);
        return updated;
      });
    } else {
      syncToFirebase(newTx);
    }
  };

  // When customer/merchant enters TrxID in Checkout:
  // It remains PENDING! Money is NOT added to balance automatically.
  const handlePaymentSubmit = (txId: string, submittedTrxId: string) => {
    setTransactions(prev => prev.map(t => {
      if (t.transactionId === txId) {
        const updated: Transaction = {
          ...t,
          status: 'Pending',
          customerPhone: submittedTrxId ? `TrxID: ${submittedTrxId}` : t.customerPhone,
        };
        syncToFirebase(updated);
        return updated;
      }
      return t;
    }));

    setHasUnreadPending(true);
  };

  // Admin approves deposit: status becomes Success, money is added to balance!
  const handleAdminApproveDeposit = (txId: string) => {
    setTransactions(prev => {
      const txIndex = prev.findIndex(t => t.transactionId === txId);
      if (txIndex === -1 || prev[txIndex].status === 'Success') return prev;

      const targetTx = { ...prev[txIndex], status: 'Success' as const };
      const newTransactions = [...prev];
      newTransactions[txIndex] = targetTx;

      const targetMerchantId = targetTx.merchantId;
      const approvedAmount = targetTx.amount;

      // 1. Update the merchant's balance in the global directory (localStorage + Firebase)
      try {
        const savedAll = localStorage.getItem('chaopaopay_all_merchants');
        if (savedAll) {
          let list = JSON.parse(savedAll);
          if (Array.isArray(list)) {
            const mIdx = list.findIndex((m: any) => m.merchantId && m.merchantId.trim().toLowerCase() === targetMerchantId?.toLowerCase());
            const mData = mIdx >= 0 ? list[mIdx] : merchant;
            const updatedM = {
              ...merchant,
              ...mData,
              balance: (mData.balance || 0) + approvedAmount,
              totalDeposits: (mData.totalDeposits || 0) + approvedAmount,
              depositCount: (mData.depositCount || 0) + 1,
              todayDeposits: (mData.todayDeposits || 0) + approvedAmount,
              isActive: true,
              status: 'Active',
              isApproved: true,
              partnershipStatus: 'Approved',
              isPartnerAgent: true,
            };
            if (mIdx >= 0) {
              list[mIdx] = updatedM;
            } else {
              list.push(updatedM);
            }
            localStorage.setItem('chaopaopay_all_merchants', JSON.stringify(list));
            
            // If the target merchant is the current logged-in user, update state & storage
            if (targetMerchantId?.toLowerCase() === merchant.merchantId.toLowerCase()) {
              setMerchant(updatedM);
              try {
                localStorage.setItem('chaopaopay_merchant', JSON.stringify(updatedM));
              } catch (e) {}
            }
            
            // Sync updated merchant to Firebase
            if (database && targetMerchantId) {
              set(ref(database, `merchants_directory/${targetMerchantId}`), updatedM).catch(() => {});
              set(ref(database, `merchants/${targetMerchantId}/profile`), updatedM).catch(() => {});
            }
          }
        }
      } catch (e) {
        console.warn('Approval storage update error:', e);
      }

      // 2. Sync the transaction status to Firebase
      if (database && targetMerchantId) {
        set(ref(database, `merchants/${targetMerchantId}/transactions/${targetTx.transactionId}`), targetTx).catch(() => {});
      }

      // Trigger event for other components/tabs
      window.dispatchEvent(new CustomEvent('merchantUpdated'));

      return newTransactions;
    });
  };

  // Admin rejects deposit: status becomes Failed, no money added!
  const handleAdminRejectDeposit = (txId: string) => {
    let rejectedTx: Transaction | undefined;
    setTransactions(prev => prev.map(t => {
      if (t.transactionId === txId) {
        rejectedTx = { ...t, status: 'Failed' as const };
        return rejectedTx;
      }
      return t;
    }));

    if (rejectedTx) {
      syncToFirebase(rejectedTx);
    }
  };

  const handleAdminApprovePayout = (txId: string) => {
    setTransactions(prev => {
      const txIndex = prev.findIndex(t => t.transactionId === txId);
      if (txIndex === -1 || prev[txIndex].status === 'Success') return prev;

      const targetTx = { ...prev[txIndex], status: 'Success' as const };
      const newTransactions = [...prev];
      newTransactions[txIndex] = targetTx;

      if (database && targetTx.merchantId) {
        set(ref(database, `merchants/${targetTx.merchantId}/transactions/${targetTx.transactionId}`), targetTx).catch(() => {});
      }
      return newTransactions;
    });
  };

  const handleAdminRejectPayout = (txId: string) => {
    setTransactions(prev => {
      const txIndex = prev.findIndex(t => t.transactionId === txId);
      if (txIndex === -1 || prev[txIndex].status === 'Failed') return prev;

      const targetTx = { ...prev[txIndex], status: 'Failed' as const };
      const newTransactions = [...prev];
      newTransactions[txIndex] = targetTx;

      const targetMerchantId = targetTx.merchantId;
      const rejectedAmount = targetTx.amount;

      try {
        const savedAll = localStorage.getItem('chaopaopay_all_merchants');
        if (savedAll) {
          let list = JSON.parse(savedAll);
          if (Array.isArray(list)) {
            const mIdx = list.findIndex((m: any) => m.merchantId && m.merchantId.trim().toLowerCase() === targetMerchantId?.toLowerCase());
            const mData = mIdx >= 0 ? list[mIdx] : merchant;
            const updatedM = {
              ...merchant,
              ...mData,
              balance: (mData.balance || 0) + rejectedAmount,
              totalWithdrawals: (mData.totalWithdrawals || 0) - rejectedAmount,
              todayWithdrawals: (mData.todayWithdrawals || 0) - rejectedAmount,
              isActive: true,
              status: 'Active',
              isApproved: true,
              partnershipStatus: 'Approved',
              isPartnerAgent: true,
            };
            if (mIdx >= 0) {
              list[mIdx] = updatedM;
            } else {
              list.push(updatedM);
            }
            localStorage.setItem('chaopaopay_all_merchants', JSON.stringify(list));
            
            if (targetMerchantId?.toLowerCase() === merchant.merchantId.toLowerCase()) {
              setMerchant(updatedM);
              try {
                localStorage.setItem('chaopaopay_merchant', JSON.stringify(updatedM));
              } catch (e) {}
            }
            
            if (database && targetMerchantId) {
              set(ref(database, `merchants_directory/${targetMerchantId}`), updatedM).catch(() => {});
              set(ref(database, `merchants/${targetMerchantId}/profile`), updatedM).catch(() => {});
            }
          }
        }
      } catch (e) {
        console.warn('Reject storage update error:', e);
      }

      if (database && targetMerchantId) {
        set(ref(database, `merchants/${targetMerchantId}/transactions/${targetTx.transactionId}`), targetTx).catch(() => {});
      }
      return newTransactions;
    });
  };

  const handleUpdateSiteSettings = (siteUrl: string, avatarUrl: string) => {
    setMerchant(prev => {
      const updated = {
        ...prev,
        websiteUrl: siteUrl,
        avatar: avatarUrl || (siteUrl ? `https://www.google.com/s2/favicons?domain=${siteUrl.replace(/https?:\/\//, '').split('/')[0]}&sz=64` : 'M')
      };
      syncToFirebase(undefined, updated);
      return updated;
    });
  };

  const handleNavigateToTransactions = (filter: 'All' | 'Payin' | 'Payout') => {
    if (filter === 'Payin') {
      setHasUnreadPending(false); // Clear red mark upon checking
    }
    setTransactionTypeFilter(filter);
    setActiveTab('transactions');
  };

  const handleSwitchMerchant = (targetMerchant: MerchantProfile) => {
    const isMaster = Boolean(
      (targetMerchant.merchantId && ['M20241018', 'S01926516246'].includes(targetMerchant.merchantId.trim().toUpperCase())) ||
      (targetMerchant.phone && ['01926516246', '+8801926516246'].includes(targetMerchant.phone.trim())) ||
      (targetMerchant.email && ['admin@tkpaybd.site', 'sadin@tkpaybd.site', 'mdsadinmiya120@gmail.com'].includes(targetMerchant.email.trim().toLowerCase()))
    );
    const pActive = evaluateAccountActive(targetMerchant, isMaster);
    const updated: MerchantProfile = {
      ...targetMerchant,
      isActive: pActive,
      status: pActive ? 'Active' : 'Inactive',
      accountStatus: pActive ? 'Active' : 'Inactive',
      partnershipStatus: pActive ? 'Approved' : 'Inactive',
      kycStatus: pActive ? 'Verified' : 'Unverified',
      isApproved: pActive,
      isPartnerAgent: pActive ? (targetMerchant.isPartnerAgent !== false) : false
    };
    setMerchant(updated);
    try {
      localStorage.setItem('chaopaopay_merchant', JSON.stringify(updated));
    } catch (e) {}
    setActiveTab(pActive ? 'dashboard' : 'inactive');
  };

  if (checkoutData) {
    return (
      <CheckoutView 
        transactionId={checkoutData.txId}
        amount={checkoutData.amount}
        merchantName={merchant.name}
        method={checkoutData.method || 'bKash'}
        onPaymentSubmit={handlePaymentSubmit}
        onBackToDashboard={() => setCheckoutData(null)}
      />
    );
  }

  if (!isLoggedIn) {
    return (
      <LoginView 
        onLoginSuccess={(customMerchant) => {
          if (customMerchant) {
            setMerchant(customMerchant);
            try {
              localStorage.setItem('chaopaopay_merchant', JSON.stringify(customMerchant));
            } catch (e) {}
          }
          setIsLoggedIn(true);
        }}
        onNavigateToRegister={() => setIsLoggedIn(true)}
        onNavigateToForgot={() => {}}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/80 text-gray-900 font-sans antialiased selection:bg-indigo-500 selection:text-white flex flex-col lg:flex-row">
      {/* Mobile Sidebar Drawer */}
      <div className="lg:hidden">
        <Sidebar 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingCount={pendingDepositsCount}
          hasUnreadPending={hasUnreadPending}
          onMarkDepositsAsViewed={() => setHasUnreadPending(false)}
          balance={merchant.balance}
          onLogout={() => setIsLoggedIn(false)}
          onNavigateToTransactions={handleNavigateToTransactions}
          isPartnerAgentApproved={isPartnerAgentApproved}
          isAccountActive={isAccountActive}
          isSuperAdmin={isSuperAdmin}
        />
      </div>

      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block w-72 shrink-0 border-r border-gray-200 bg-white min-h-screen sticky top-0 z-30">
        <div className="h-full flex flex-col">
          {/* Brand Header */}
          <div className="p-5 border-b border-indigo-100 flex items-center justify-between bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-md">
                <img 
                  src={APP_LOGO_URL} 
                  alt="Tkpaybd.site Logo" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjmTmkRzTlTL7cPJbnOZVeCuyoJw8wLd4-Nm1fgr_XpiBsbe6na7LozF8YRpTQDKrbAMewkhZkcyH6a5S92l-uwrs85TVXnt9V_diWaPTCLdkuuLgDjzn37aMY-Z1Fbdwjlmgd8vUPgQvR5zX9SdSoCwMKA6fnqWOPZEMgvgRzvM3b856zUdP3O4hpOpgo/s640/IMG_20261020_165816_710.jpg';
                  }}
                />
              </div>
              <div>
                <h1 className="font-extrabold text-lg tracking-wide text-white">
                  <span className="text-white">T</span><span className="text-[#eb6a24]">K</span><span className="text-indigo-100 font-semibold ml-0.5">pay</span><span className="text-emerald-300 ml-0.5">BD</span>
                </h1>
                <p className="text-[11px] text-indigo-200">Merchant Gateway</p>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 text-sm">
            <div>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all cursor-pointer ${
                  activeTab === 'dashboard' 
                    ? 'bg-indigo-50 text-indigo-700 shadow-2xs border border-indigo-100' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>🏠</span>
                <span>Dashboard</span>
              </button>
            </div>

            {/* Management Section: directly below Dashboard */}
            <div>
              <p className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Management</p>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    if (!isAccountActive) {
                      setActiveTab('inactive');
                    }
                  }}
                  disabled={isAccountActive}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-extrabold text-sm sm:text-base border transition-all ${
                    isAccountActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default shadow-xs'
                      : activeTab === 'inactive'
                      ? 'bg-red-100 text-red-700 border-red-300 shadow-2xs cursor-pointer'
                      : 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200 cursor-pointer'
                  }`}
                  title={isAccountActive ? 'Your account is verified and active' : 'Click to apply for account verification'}
                >
                  <div className="flex items-center gap-3">
                    <span>{isAccountActive ? '🟢' : '🔴'}</span>
                    <span className="tracking-wide">
                      {isAccountActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {isAccountActive ? (
                    <span className="text-[10px] bg-emerald-200/80 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                      Verified
                    </span>
                  ) : (
                    <span className="text-[10px] bg-red-200/80 text-red-800 font-bold px-2 py-0.5 rounded-md">
                      Unverified
                    </span>
                  )}
                </button>

                {isPartnerAgentApproved && (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-medium transition-all cursor-pointer ${
                      activeTab === 'admin' 
                        ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-indigo-600 font-bold">🛡️</span>
                      <span>Admin Panel</span>
                    </div>
                    {pendingDepositsCount > 0 && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {pendingDepositsCount} pending
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>

            <div>
              <p className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Finance</p>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('deposit')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all cursor-pointer ${
                    activeTab === 'deposit' 
                      ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="text-emerald-600 font-bold">↓</span>
                  <span>Deposit</span>
                </button>

                <button
                  onClick={() => setActiveTab('payout')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all cursor-pointer ${
                    activeTab === 'payout' 
                      ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="text-amber-600 font-bold">↑</span>
                  <span>Withdraw</span>
                </button>
              </div>
            </div>

            <div>
              <p className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Transactions</p>
              <div className="space-y-1">
                {/* Deposits Link with Red mark when new pending deposit exists */}
                <button
                  onClick={() => handleNavigateToTransactions('Payin')}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-medium transition-all cursor-pointer ${
                    activeTab === 'transactions' && transactionTypeFilter === 'Payin'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-blue-600 font-bold">⇄</span>
                    <span>Deposits</span>
                  </div>

                  {/* Red badge when unread pending deposits exist; disappears / turns normal on click */}
                  {hasUnreadPending && pendingDepositsCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-xs animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                      <span>{pendingDepositsCount}</span>
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleNavigateToTransactions('Payout')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all cursor-pointer ${
                    activeTab === 'transactions' && transactionTypeFilter === 'Payout'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100' 
                      : ''
                  }`}
                >
                  <span className="text-gray-400">📉</span>
                  <span>Withdrawals</span>
                </button>
              </div>
            </div>


            <div>
              <p className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Developer</p>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('apikeys')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all cursor-pointer ${
                    activeTab === 'apikeys' 
                      ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span>🔑</span>
                  <span>API Keys</span>
                </button>

                <button
                  onClick={() => setActiveTab('documentation')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all cursor-pointer ${
                    activeTab === 'documentation' 
                      ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span>📚</span>
                  <span>API Docs</span>
                </button>
              </div>
            </div>

            <div>
              <p className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Account</p>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('settings')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all cursor-pointer"
                >
                  <span>👤</span>
                  <span>Profile</span>
                </button>

                <button
                  onClick={() => setIsLoggedIn(false)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Balance in Desktop Sidebar */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">

            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 text-white shadow-md">
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200 mb-1">Available Balance</p>
              <h3 className="text-xl font-extrabold tracking-tight">৳{merchant.balance.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} BDT</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          onOpenSidebar={() => setIsSidebarOpen(true)}
          merchant={merchant}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onUpdateMerchant={setMerchant}
          onSwitchMerchant={handleSwitchMerchant}
          isAccountActive={isAccountActive}
          isCommissionActive={merchant.isCommissionActive !== false && merchant.commissionStatus !== 'Inactive' && merchant.commissionStatus !== 'Deactive'}
        />

        <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 pb-20">
          {activeTab === 'dashboard' && (
            <DashboardHome 
              merchant={merchant}
              transactions={transactions.filter(t => t.merchantId === merchant.merchantId)}
              setActiveTab={setActiveTab}
              onSelectTransaction={(tx) => setSelectedTx(tx)}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsTab 
              transactions={transactions.filter(t => t.merchantId === merchant.merchantId)}
              onSelectTransaction={(tx) => setSelectedTx(tx)}
              onNewTransaction={handleAddTransaction}
              initialTypeFilter={transactionTypeFilter}
              onApproveDeposit={handleAdminApproveDeposit}
            />
          )}

          {activeTab === 'admin' && isPartnerAgentApproved && (
            <AdminPanel 
              merchant={merchant}
              transactions={transactions}
              onApproveDeposit={handleAdminApproveDeposit}
              onRejectDeposit={handleAdminRejectDeposit}
              onApprovePayout={handleAdminApprovePayout}
              onRejectPayout={handleAdminRejectPayout}
              onUpdateSiteSettings={handleUpdateSiteSettings}
              onUpdateMerchant={setMerchant}
              onSwitchMerchant={handleSwitchMerchant}
            />
          )}

          {activeTab === 'deposit' && (
            <DepositModal 
              merchantId={merchant.merchantId}
              currentBalance={merchant.balance}
              commissionPayin={(merchant.isCommissionActive !== false && merchant.commissionStatus !== 'Inactive' && merchant.commissionStatus !== 'Deactive') ? Number(merchant.commissionPayin ?? 0) : 0}
              transactions={transactions.filter(t => t.merchantId === merchant.merchantId)}
              onAddTransaction={handleAddTransaction}
              onSuccessReturn={() => setActiveTab('dashboard')}
              onSelectTransaction={(tx) => setSelectedTx(tx)}
              onOpenCheckout={(txId, amount, method) => setCheckoutData({ txId, amount, method })}
            />
          )}

          {activeTab === 'payout' && (
            <PayoutModal 
              merchantId={merchant.merchantId}
              currentBalance={merchant.balance}
              commissionPayout={(merchant.isCommissionActive !== false && merchant.commissionStatus !== 'Inactive' && merchant.commissionStatus !== 'Deactive') ? Number(merchant.commissionPayout ?? 0) : 0}
              transactions={transactions.filter(t => t.merchantId === merchant.merchantId)}
              onAddTransaction={handleAddTransaction}
              onSuccessReturn={() => setActiveTab('dashboard')}
              onSelectTransaction={(tx) => setSelectedTx(tx)}
            />
          )}

          {activeTab === 'apikeys' && (
            <ApiKeysTab 
              apiKey={apiKey}
              onUpdateApiKey={setApiKey}
            />
          )}

          {activeTab === 'documentation' && (
            <DocumentationTab />
          )}

          {activeTab === 'support' && (
            <SupportTab />
          )}

          {activeTab === 'inactive' && (
            <InactiveView 
              setActiveTab={setActiveTab} 
              merchantId={merchant.merchantId}
              merchant={merchant}
              onUpdateMerchant={setMerchant}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab 
              merchant={merchant}
              onUpdateMerchant={setMerchant}
            />
          )}
        </main>
      </div>

      {/* Transaction Detail Modal */}
      <TransactionModal 
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </div>
  );
}
