import {
  User,
  MinerPackage,
  UserMiner,
  WithdrawalRequest,
  DepositOrder,
  SystemSettings,
  ChatMessage,
  PlatformMovementEvent,
  BlockchainBlock
} from '../types';
import {
  INITIAL_MINER_PACKAGES,
  INITIAL_SYSTEM_SETTINGS,
  INITIAL_USERS
} from '../data/initialData';

const STORAGE_KEYS = {
  USERS: 'roots_miners_users_v2',
  CURRENT_USER_ID: 'roots_miners_current_user_id',
  PACKAGES: 'roots_miners_packages_v2',
  USER_MINERS: 'roots_miners_user_miners_v2',
  WITHDRAWALS: 'roots_miners_withdrawals_v2',
  DEPOSITS: 'roots_miners_deposits_v2',
  SETTINGS: 'roots_miners_settings_v2',
  CHAT_MESSAGES: 'roots_miners_chat_messages_v2',
  PLATFORM_FEED: 'roots_miners_platform_feed_v2',
};

// Safe JSON retrieval
function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}

// Initial feed items for live system movement
const SEED_FEED: PlatformMovementEvent[] = [
  {
    id: 'evt_1',
    type: 'deposit',
    userMasked: '078****912',
    amountUGX: 90000,
    details: 'Deposited via MTN Mobile Money',
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  },
  {
    id: 'evt_2',
    type: 'miner_rented',
    userMasked: '070****331',
    amountUGX: 30000,
    details: 'Activated Roots H1 Micro-Hash Miner',
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id: 'evt_3',
    type: 'withdrawal',
    userMasked: '077****844',
    amountUGX: 25000,
    details: 'Disbursed to Airtel Money in 18 mins',
    timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
  },
  {
    id: 'evt_4',
    type: 'miner_rented',
    userMasked: '075****210',
    amountUGX: 180000,
    details: 'Activated Roots H4 Prime Miner',
    timestamp: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
  },
  {
    id: 'evt_5',
    type: 'referral_bonus',
    userMasked: '073****600',
    amountUGX: 15000,
    details: '5% Multi-level referral commission credited',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
];

export class StorageService {
  // SETTINGS
  static getSettings(): SystemSettings {
    const stored = getStored<SystemSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SYSTEM_SETTINGS);
    return { ...INITIAL_SYSTEM_SETTINGS, ...stored };
  }

  static updateSettings(partial: Partial<SystemSettings>): SystemSettings {
    const current = this.getSettings();
    const updated = { ...current, ...partial };
    setStored(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  }

  // USERS
  static getUsers(): User[] {
    return getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  static saveUsers(users: User[]): void {
    setStored(STORAGE_KEYS.USERS, users);
  }

  static deleteUser(userId: string): void {
    const users = this.getUsers().filter((u) => u.id !== userId);
    this.saveUsers(users);
  }

  static clearAllAccountsToZero(): void {
    const users = this.getUsers().map((u) => ({
      ...u,
      depositWallet: 0,
      miningBalance: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      referralEarnings: 0,
    }));
    this.saveUsers(users);
    this.saveUserMiners([]);
    const current = this.getCurrentUser();
    if (current) {
      const updated = users.find((u) => u.id === current.id);
      if (updated) {
        this.setCurrentUser(updated);
      }
    }
  }

  static getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  static getUserByPhone(phone: string): User | undefined {
    const cleanPhone = phone.replace(/[\s+-]/g, '');
    return this.getUsers().find((u) => {
      const uPhone = u.phone.replace(/[\s+-]/g, '');
      if (uPhone === cleanPhone) return true;
      if (cleanPhone.startsWith('256') && uPhone === '0' + cleanPhone.slice(3)) return true;
      if (uPhone.startsWith('256') && cleanPhone === '0' + uPhone.slice(3)) return true;
      if (cleanPhone.startsWith('0') && uPhone === '256' + cleanPhone.slice(1)) return true;
      if (uPhone.startsWith('0') && cleanPhone === '256' + uPhone.slice(1)) return true;
      return false;
    });
  }

  static getCurrentUser(): User | null {
    const id = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (!id) return null;
    const user = this.getUserById(id);
    return user || null;
  }

  static setCurrentUser(user: User | null): void {
    if (!user) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    } else {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);
    }
  }

  static updateUser(userId: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates };
    this.saveUsers(users);
    return users[idx];
  }

  // PACKAGES
  static getPackages(): MinerPackage[] {
    return getStored<MinerPackage[]>(STORAGE_KEYS.PACKAGES, INITIAL_MINER_PACKAGES);
  }

  static savePackages(packages: MinerPackage[]): void {
    setStored(STORAGE_KEYS.PACKAGES, packages);
  }

  static updatePackage(id: string, updates: Partial<MinerPackage>): MinerPackage | null {
    const packages = this.getPackages();
    const idx = packages.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    packages[idx] = { ...packages[idx], ...updates };
    this.savePackages(packages);
    return packages[idx];
  }

  static addPackage(newPkg: MinerPackage): void {
    const packages = this.getPackages();
    packages.push(newPkg);
    this.savePackages(packages);
  }

  // USER MINERS
  static getUserMiners(userId?: string): UserMiner[] {
    const all = getStored<UserMiner[]>(STORAGE_KEYS.USER_MINERS, []);
    if (!userId) return all;
    return all.filter((m) => m.userId === userId);
  }

  static saveUserMiners(miners: UserMiner[]): void {
    setStored(STORAGE_KEYS.USER_MINERS, miners);
  }

  // RENT MINER
  static rentMiner(userId: string, pkg: MinerPackage): { success: boolean; message: string; miner?: UserMiner } {
    const user = this.getUserById(userId);
    if (!user) return { success: false, message: 'User not found' };

    if (user.depositWallet < pkg.priceUGX) {
      return {
        success: false,
        message: `Insufficient Wallet balance. You need UGX ${pkg.priceUGX.toLocaleString()} but have UGX ${user.depositWallet.toLocaleString()} in your deposit wallet. Please deposit first!`,
      };
    }

    // Deduct from depositWallet
    const updatedWallet = user.depositWallet - pkg.priceUGX;
    this.updateUser(userId, { depositWallet: updatedWallet });

    const now = new Date();
    // Warmup activation is after 24 hours
    const activation = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const newMiner: UserMiner = {
      id: 'miner_' + Math.random().toString(36).substring(2, 9),
      userId,
      packageId: pkg.id,
      series: pkg.series,
      code: pkg.code,
      name: pkg.name,
      model: pkg.model,
      priceUGX: pkg.priceUGX,
      dailyIncomeUGX: pkg.dailyIncomeUGX,
      totalReturnUGX: pkg.totalReturnUGX,
      rentedAt: now.toISOString(),
      activationAt: activation.toISOString(),
      cycleDays: pkg.cycleDays,
      daysActive: 0,
      totalMinedUGX: 0,
      hashrate: pkg.hashrate,
      status: 'warmup',
      lastYieldCalculatedAt: now.toISOString(),
    };

    const allMiners = this.getUserMiners();
    allMiners.unshift(newMiner);
    this.saveUserMiners(allMiners);

    // Record movement event
    this.addMovementEvent({
      id: 'evt_' + Date.now(),
      type: 'miner_rented',
      userMasked: user.phone.slice(0, 4) + '****' + user.phone.slice(-3),
      amountUGX: pkg.priceUGX,
      details: `Rented ${pkg.name} (${pkg.code})`,
      timestamp: now.toISOString(),
    });

    return { success: true, message: `Successfully rented ${pkg.name}! Warmup begins now. First payout counts after 24-hour roll up.`, miner: newMiner };
  }

  // PROCESS YIELD (24-Hour Roll up & Weekend exclusion)
  static processAllMinersYield(): void {
    const settings = this.getSettings();
    const now = new Date();
    const currentDay = now.getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = currentDay === 0 || currentDay === 6;

    const allMiners = this.getUserMiners();
    const users = this.getUsers();
    let updatedMiners = false;
    let updatedUsers = false;

    allMiners.forEach((miner) => {
      const activationTime = new Date(miner.activationAt).getTime();
      const nowTime = now.getTime();

      // Check if warmup completed
      if (miner.status === 'warmup' && nowTime >= activationTime) {
        miner.status = 'mining';
        updatedMiners = true;
      }

      // If active and mining
      if (miner.status === 'mining') {
        // Check weekend constraint
        if (!settings.weekendMiningEnabled && isWeekend) {
          // Weekend: pause counting
          return;
        }

        const lastCheck = new Date(miner.lastYieldCalculatedAt).getTime();
        const diffHours = (nowTime - lastCheck) / (1000 * 60 * 60);

        // Every 24 hours of operational time accumulates one daily count
        if (diffHours >= 24) {
          const daysToCredit = Math.floor(diffHours / 24);
          miner.daysActive += daysToCredit;
          const cycleGain = miner.dailyIncomeUGX * daysToCredit;
          miner.totalMinedUGX += cycleGain;
          miner.lastYieldCalculatedAt = new Date(lastCheck + daysToCredit * 24 * 60 * 60 * 1000).toISOString();
          updatedMiners = true;

          // For H-Series: daily earnings added directly to inner Withdrawable Mining Balance
          if (miner.series === 'H') {
            const user = users.find((u) => u.id === miner.userId);
            if (user) {
              user.miningBalance += cycleGain;
              updatedUsers = true;
            }
          }

          // Check if cycle expired
          if (miner.daysActive >= miner.cycleDays) {
            miner.status = 'completed';
            // For W-Series: entire totalReturnUGX is disbursed on expiry
            if (miner.series === 'W' && miner.totalReturnUGX) {
              const user = users.find((u) => u.id === miner.userId);
              if (user) {
                user.miningBalance += miner.totalReturnUGX;
                updatedUsers = true;
              }
            }
          }
        }
      }
    });

    if (updatedMiners) this.saveUserMiners(allMiners);
    if (updatedUsers) this.saveUsers(users);
  }

  // WITHDRAWALS
  static getWithdrawals(): WithdrawalRequest[] {
    return getStored<WithdrawalRequest[]>(STORAGE_KEYS.WITHDRAWALS, []);
  }

  static saveWithdrawals(reqs: WithdrawalRequest[]): void {
    setStored(STORAGE_KEYS.WITHDRAWALS, reqs);
  }

  static requestWithdrawal(
    userId: string,
    amountUGX: number,
    account: { provider: string; accountNumber: string; accountName: string }
  ): { success: boolean; message: string; withdrawal?: WithdrawalRequest } {
    const user = this.getUserById(userId);
    if (!user) return { success: false, message: 'User not found' };

    const settings = this.getSettings();

    // 1. Minimum withdrawal check
    if (amountUGX < settings.minWithdrawalUGX) {
      return {
        success: false,
        message: `Minimum withdrawal is UGX ${settings.minWithdrawalUGX.toLocaleString()}. You requested UGX ${amountUGX.toLocaleString()}.`,
      };
    }

    // 2. Deposit requirement check: "no account should withdraw before depositing hence the word *please join use*"
    if ((user.totalDeposited || 0) <= 0) {
      return {
        success: false,
        message: 'Please join us! Account activation requires at least one deposit before making a withdrawal.',
      };
    }

    // 3. Time window check: 8:00 AM to 10:00 PM
    const now = new Date();
    const currentHour = now.getHours();
    if (currentHour < settings.withdrawStartHour || currentHour >= settings.withdrawEndHour) {
      return {
        success: false,
        message: `Withdrawal window is from 8:00 AM to 10:00 PM daily. Current time is ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Please try during active hours.`,
      };
    }

    // 4. Balance check on Inner Mining Balance (not deposit wallet)
    if (user.miningBalance < amountUGX) {
      return {
        success: false,
        message: `Insufficient Withdrawable Mining Balance. Available: UGX ${user.miningBalance.toLocaleString()}, Requested: UGX ${amountUGX.toLocaleString()}`,
      };
    }

    // 5. 10% charge calculation
    const feeUGX = Math.round(amountUGX * (settings.withdrawalFeePercent / 100));
    const netAmountUGX = amountUGX - feeUGX;

    // Deduct from user's mining balance
    const updatedMiningBalance = user.miningBalance - amountUGX;
    this.updateUser(userId, {
      miningBalance: updatedMiningBalance,
      totalWithdrawn: (user.totalWithdrawn || 0) + amountUGX,
      withdrawalAccount: {
        provider: account.provider as any,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
      },
    });

    const newRequest: WithdrawalRequest = {
      id: 'wd_' + Math.random().toString(36).substring(2, 9),
      userId,
      userName: user.username,
      userPhone: user.phone,
      amountUGX,
      feeUGX,
      netAmountUGX,
      provider: account.provider,
      accountNumber: account.accountNumber,
      accountName: account.accountName,
      requestedAt: now.toISOString(),
      status: 'pending',
    };

    const withdrawals = this.getWithdrawals();
    withdrawals.unshift(newRequest);
    this.saveWithdrawals(withdrawals);

    this.addMovementEvent({
      id: 'evt_' + Date.now(),
      type: 'withdrawal',
      userMasked: user.phone.slice(0, 4) + '****' + user.phone.slice(-3),
      amountUGX,
      details: `Withdrawal request submitted (Disbursed in 30 mins)`,
      timestamp: now.toISOString(),
    });

    return {
      success: true,
      message: `Withdrawal request of UGX ${amountUGX.toLocaleString()} (Net: UGX ${netAmountUGX.toLocaleString()}) submitted. Disbursed to your mobile money in 30 minutes!`,
      withdrawal: newRequest,
    };
  }

  static approveWithdrawal(withdrawalId: string): boolean {
    const list = this.getWithdrawals();
    const idx = list.findIndex((w) => w.id === withdrawalId);
    if (idx === -1) return false;
    list[idx].status = 'approved';
    list[idx].approvedAt = new Date().toISOString();
    list[idx].txHash = '0x' + Math.random().toString(16).substring(2, 18) + Math.random().toString(16).substring(2, 18);
    this.saveWithdrawals(list);
    return true;
  }

  static rejectWithdrawal(withdrawalId: string, reason?: string): boolean {
    const list = this.getWithdrawals();
    const idx = list.findIndex((w) => w.id === withdrawalId);
    if (idx === -1) return false;
    const req = list[idx];
    req.status = 'rejected';
    req.rejectedReason = reason || 'Declined by Administrator';

    // Refund mining balance
    const user = this.getUserById(req.userId);
    if (user) {
      this.updateUser(req.userId, {
        miningBalance: user.miningBalance + req.amountUGX,
        totalWithdrawn: Math.max(0, (user.totalWithdrawn || 0) - req.amountUGX),
      });
    }

    this.saveWithdrawals(list);
    return true;
  }

  // DEPOSITS
  static getDeposits(): DepositOrder[] {
    return getStored<DepositOrder[]>(STORAGE_KEYS.DEPOSITS, []);
  }

  static saveDeposits(deposits: DepositOrder[]): void {
    setStored(STORAGE_KEYS.DEPOSITS, deposits);
  }

  static createDepositOrder(userId: string, amountUGX: number, paymentMethod: 'PesaJet Mobile Money' | 'Manual MTN/Airtel Slip'): DepositOrder {
    const user = this.getUserById(userId);
    const order: DepositOrder = {
      id: 'dep_' + Math.random().toString(36).substring(2, 9),
      userId,
      userPhone: user ? user.phone : '',
      userName: user ? user.username : 'Miner',
      amountUGX,
      paymentMethod,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const deposits = this.getDeposits();
    deposits.unshift(order);
    this.saveDeposits(deposits);
    return order;
  }

  static confirmDeposit(orderId: string, verifiedBy: string = 'System Webhook'): boolean {
    const deposits = this.getDeposits();
    const idx = deposits.findIndex((d) => d.id === orderId);
    if (idx === -1) return false;
    const order = deposits[idx];
    if (order.status === 'completed') return true;

    order.status = 'completed';
    order.completedAt = new Date().toISOString();
    order.verifiedBy = verifiedBy;
    this.saveDeposits(deposits);

    // Credit user's Deposit Wallet & totalDeposited
    const user = this.getUserById(order.userId);
    if (user) {
      const updatedWallet = (user.depositWallet || 0) + order.amountUGX;
      const updatedTotalDeposited = (user.totalDeposited || 0) + order.amountUGX;
      this.updateUser(user.id, {
        depositWallet: updatedWallet,
        totalDeposited: updatedTotalDeposited,
      });

      // 5% Referral bonus if referred by someone
      if (user.referredBy) {
        const referrer = this.getUsers().find((u) => u.inviteCode === user.referredBy);
        if (referrer) {
          const settings = this.getSettings();
          const bonus = Math.round(order.amountUGX * (settings.referralBonusPercent / 100));
          this.updateUser(referrer.id, {
            miningBalance: (referrer.miningBalance || 0) + bonus,
            referralEarnings: (referrer.referralEarnings || 0) + bonus,
          });

          this.addMovementEvent({
            id: 'evt_' + Date.now(),
            type: 'referral_bonus',
            userMasked: referrer.phone.slice(0, 4) + '****' + referrer.phone.slice(-3),
            amountUGX: bonus,
            details: `5% Referral Commission from ${user.username}`,
            timestamp: new Date().toISOString(),
          });
        }
      }

      this.addMovementEvent({
        id: 'evt_' + Date.now(),
        type: 'deposit',
        userMasked: user.phone.slice(0, 4) + '****' + user.phone.slice(-3),
        amountUGX: order.amountUGX,
        details: 'Deposit confirmed & credited to Wallet',
        timestamp: new Date().toISOString(),
      });
    }

    return true;
  }

  // CHAT MESSAGES
  static getChatMessages(userId: string): ChatMessage[] {
    const all = getStored<ChatMessage[]>(STORAGE_KEYS.CHAT_MESSAGES, []);
    const userChat = all.filter((m) => m.userId === userId);
    if (userChat.length === 0) {
      const welcomeChat: ChatMessage[] = [
        {
          id: 'chat_welcome',
          sender: 'support',
          userId,
          senderName: 'Roots Support Desk (+256787 493168)',
          text: 'Welcome to Roots Miners Pro Official Support! How can we assist you today? You can also reach us directly via call/WhatsApp at +256787 493168 or join our Telegram group.',
          timestamp: new Date().toISOString(),
          isStaff: true,
        },
      ];
      setStored(STORAGE_KEYS.CHAT_MESSAGES, [...all, ...welcomeChat]);
      return welcomeChat;
    }
    return userChat;
  }

  static sendChatMessage(userId: string, senderName: string, text: string, sender: 'user' | 'support' = 'user'): ChatMessage {
    const all = getStored<ChatMessage[]>(STORAGE_KEYS.CHAT_MESSAGES, []);
    const newMsg: ChatMessage = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      userId,
      senderName,
      text,
      sender,
      timestamp: new Date().toISOString(),
      isStaff: sender === 'support',
    };
    all.push(newMsg);
    setStored(STORAGE_KEYS.CHAT_MESSAGES, all);
    return newMsg;
  }

  // PLATFORM FEED / SYSTEM MOVEMENT
  static getMovementFeed(): PlatformMovementEvent[] {
    return getStored<PlatformMovementEvent[]>(STORAGE_KEYS.PLATFORM_FEED, SEED_FEED);
  }

  static addMovementEvent(evt: PlatformMovementEvent): void {
    const feed = this.getMovementFeed();
    feed.unshift(evt);
    if (feed.length > 50) feed.pop();
    setStored(STORAGE_KEYS.PLATFORM_FEED, feed);
  }

  // LIVE BITCOIN BLOCKS SIMULATION
  static getRecentBlocks(): BlockchainBlock[] {
    const baseHeight = 889240;
    return [
      {
        blockHeight: baseHeight,
        hash: '00000000000000000001f3b28b5a0378eec9b1c2b53587e6aa80f58925ba4098',
        miner: 'Roots Mining Pool Alpha',
        rewardBTC: 3.125,
        txCount: 3412,
        timestamp: '1 min ago',
      },
      {
        blockHeight: baseHeight - 1,
        hash: '000000000000000000029d4791b8a514d2e7b897992c10db054e7d9b01476b71',
        miner: 'Roots Liquid Hydro Cluster',
        rewardBTC: 3.125,
        txCount: 2984,
        timestamp: '11 mins ago',
      },
      {
        blockHeight: baseHeight - 2,
        hash: '000000000000000000018a452ef38b1d42ec9a5b678c43ad291b5049381e4b99',
        miner: 'Roots Sub-Zero Node',
        rewardBTC: 3.125,
        txCount: 4105,
        timestamp: '19 mins ago',
      },
      {
        blockHeight: baseHeight - 3,
        hash: '00000000000000000003b4129e71ab93d2568e0a12cf97b1029c48194a2b9728',
        miner: 'Roots Immersion W-Series',
        rewardBTC: 3.125,
        txCount: 3820,
        timestamp: '28 mins ago',
      },
    ];
  }
}

// Auto-clear all accounts to 0 before depositing, remove demo accounts, and ensure login first
if (typeof window !== 'undefined') {
  try {
    const CLEARED_FLAG = 'roots_miners_cleared_to_zero_v6';
    if (!localStorage.getItem(CLEARED_FLAG)) {
      StorageService.clearAllAccountsToZero();
      // Purge any legacy demo account
      let users = StorageService.getUsers().filter(
        (u) => u.id !== 'usr_demo_003' && u.phone.replace(/\s/g, '') !== '0772123456'
      );

      // Ensure 0751497910 exists and has super-admin role with password #Wizard256
      const super0751Idx = users.findIndex(
        (u) => u.phone.replace(/[\s+-]/g, '') === '0751497910' || u.phone.replace(/[\s+-]/g, '') === '256751497910'
      );
      if (super0751Idx !== -1) {
        users[super0751Idx].role = 'super-admin';
        users[super0751Idx].password = '#Wizard256';
        users[super0751Idx].isBanned = false;
      } else {
        users.unshift({
          id: 'usr_super_0751497910',
          username: 'RootsSuperAdmin',
          phone: '0751497910',
          password: '#Wizard256',
          role: 'super-admin',
          depositWallet: 0,
          miningBalance: 0,
          totalDeposited: 0,
          totalWithdrawn: 0,
          withdrawalAccount: {
            provider: 'Airtel Money',
            accountNumber: '0751497910',
            accountName: 'ROOTS SUPER ADMIN',
          },
          inviteCode: 'SUPER0751',
          referralEarnings: 0,
          isBanned: false,
          createdAt: '2026-01-01T00:00:00.000Z',
        });
      }

      StorageService.saveUsers(users);
      localStorage.removeItem('roots_miners_current_user_id');
      localStorage.setItem(CLEARED_FLAG, 'true');
    }
  } catch (e) {
    console.error('Error auto-clearing accounts to 0 or provisioning super admin:', e);
  }
}
