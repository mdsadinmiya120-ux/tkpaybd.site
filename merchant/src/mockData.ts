import { Transaction, MerchantProfile, ApiKeyConfig } from './types';

export const initialMerchant: MerchantProfile = {
  merchantId: 'S01926516246',
  name: 'Sadin Master Agent',
  email: 'sadin@tkpaybd.site',
  phone: '01926516246',
  password: 'Sadin120',
  avatar: 'M',
  balance: 0.00,
  totalDeposits: 0.00,
  depositCount: 0,
  todayDeposits: 0.00,
  totalWithdrawals: 0.00,
  withdrawalCount: 0,
  todayWithdrawals: 0.00,
  kycStatus: 'Verified',
  isActive: true,
  isAdminAgent: true,
  isPartnerAgent: true,
  partnershipStatus: 'Approved',
  accountType: 'Partnership Agent',
  feeType: 'Commission',
  commissionPayin: 0.00,
  commissionPayout: 0.00,
};

export const initialTransactions: Transaction[] = [];

export const initialApiKey: ApiKeyConfig = {
  publicKey: 'pk_live_99281a7b88c34fe299182a11b0c9f881',
  secretKey: 'sk_live_559281b77c2a11830029b8c771a2ef90',
  webhookUrl: 'https://tkpaybd.site/api/v1/webhook',
  mode: 'Live',
  ipWhitelisted: '103.145.76.0/24',
  createdAt: '2026-01-15',
};
