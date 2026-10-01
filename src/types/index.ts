export interface User {
  id: string;
  username: string;
  phone: string;
  password?: string;
  role: 'user' | 'admin' | 'super-admin';
  depositWallet: number; // Moneys from out of the system (MTN/Airtel deposit)
  miningBalance: number; // Moneys from inner system (mined BTC yield + referrals) - withdrawable
  totalDeposited: number;
  totalWithdrawn: number;
  withdrawalAccount?: {
    provider: 'MTN Mobile Money' | 'Airtel Money' | 'Stanbic Bank' | 'Centenary Bank';
    accountNumber: string;
    accountName: string;
  };
  inviteCode: string;
  referredBy?: string;
  referralEarnings: number;
  isBanned: boolean;
  createdAt: string;
}

export interface MinerPackage {
  id: string;
  series: 'H' | 'W';
  code: string; // e.g. H1, H2, W-1
  name: string;
  model: string;
  priceUGX: number;
  dailyIncomeUGX: number;
  totalReturnUGX?: number; // for W-series
  cycleDays: number;
  hashrate: string;
  powerWatts: number;
  efficiency: string;
  image: string;
  type: 'daily_withdrawable' | 'cycle_expiry_payout';
  description: string;
  badge?: string;
  status: 'active' | 'sold_out';
}

export interface UserMiner {
  id: string;
  userId: string;
  packageId: string;
  series: 'H' | 'W';
  code: string;
  name: string;
  model: string;
  priceUGX: number;
  dailyIncomeUGX: number;
  totalReturnUGX?: number;
  rentedAt: string; // ISO timestamp
  activationAt: string; // rentedAt + 24h
  cycleDays: number;
  daysActive: number;
  totalMinedUGX: number;
  hashrate: string;
  status: 'warmup' | 'mining' | 'completed';
  lastYieldCalculatedAt: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  amountUGX: number; // Gross amount
  feeUGX: number; // 10%
  netAmountUGX: number; // 90%
  provider: string;
  accountNumber: string;
  accountName: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  rejectedReason?: string;
  txHash?: string;
  payoutReference?: string;
}

export interface DepositOrder {
  id: string;
  userId: string;
  userPhone: string;
  userName: string;
  amountUGX: number;
  paymentMethod: 'PesaJet Mobile Money' | 'Manual MTN/Airtel Slip';
  status: 'pending' | 'completed' | 'failed';
  pesajetReference?: string;
  createdAt: string;
  completedAt?: string;
  verifiedBy?: string;
}

export interface SystemSettings {
  appName: string;
  supportPhone: string;
  adminPhone: string;
  telegramGroupLink: string;
  telegramSupportLink: string;
  whatsappGroupLink: string;
  pesajetPayUrl: string;
  pesajetSecretKey: string;
  webhookSecret: string;
  automaticPayments: boolean;
  minWithdrawalUGX: number;
  welcomeBonusUGX: number;
  withdrawalFeePercent: number;
  withdrawalDisbursementMinutes: number;
  referralBonusPercent: number;
  withdrawStartHour: number; // 8 = 8:00 AM
  withdrawEndHour: number; // 22 = 10:00 PM
  weekendMiningEnabled: boolean; // defaults to false ("Packages not not Counts weekend days")
  warmupHours: number; // 24
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'support' | 'system';
  userId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isStaff?: boolean;
}

export interface BlockchainBlock {
  blockHeight: number;
  hash: string;
  miner: string;
  rewardBTC: number;
  txCount: number;
  timestamp: string;
}

export interface PlatformMovementEvent {
  id: string;
  type: 'deposit' | 'withdrawal' | 'miner_rented' | 'yield_disbursed' | 'referral_bonus';
  userMasked: string;
  amountUGX: number;
  details: string;
  timestamp: string;
}
