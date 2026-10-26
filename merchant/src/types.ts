export type TransactionType = 'Payin' | 'Payout';
export type TransactionStatus = 'Pending' | 'Success' | 'Failed' | 'Processing';
export type PaymentMethod = 'bKash' | 'Nagad' | 'Rocket';

export interface Transaction {
  id: string;
  transactionId: string;
  merchantId?: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  method: PaymentMethod;
  customerPhone?: string;
  customerName?: string;
  createdAt: string;
  charge: number;
  walletNumber?: string;
}

export interface ApiKeyConfig {
  publicKey: string;
  secretKey: string;
  webhookUrl: string;
  mode: 'Live' | 'Sandbox';
  ipWhitelisted: string;
  createdAt: string;
}

export interface MerchantProfile {
  merchantId: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  websiteUrl?: string;
  balance: number;
  totalDeposits: number;
  depositCount: number;
  todayDeposits: number;
  totalWithdrawals: number;
  withdrawalCount: number;
  todayWithdrawals: number;
  kycStatus: 'Verified' | 'Pending' | 'Unverified';
  password?: string;
  isAdminAgent?: boolean;
  isPartnerAgent?: boolean;
  partnershipStatus?: 'None' | 'Pending Verification' | 'Approved' | 'Rejected' | 'Inactive';
  isActive?: boolean;
  isApproved?: boolean;
  status?: string;
  commissionPayin?: number;
  commissionPayout?: number;
  accountType?: 'Partnership Agent' | 'Payment Gateway Use' | 'Merchant';
  feeType?: 'Commission' | 'Charge';
}

export interface VerificationRequest {
  id: string;
  merchantId: string;
  merchantName: string;
  type: 'GATEWAY_1350' | 'PARTNER_AGENT';
  title: string;
  phone: string;
  trxId?: string;
  nidNumber?: string;
  whatsapp?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedAt: string;
}

