// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'individual' | 'business' | 'admin';
  profilePhoto?: string;
  currency: string;
  language: 'en' | 'bn';
  twoFactorEnabled: boolean;
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: Date;
  settings: {
    notifications: {
      email: boolean;
      sms: boolean;
      inApp: boolean;
    };
    privacy: {
      profileVisible: boolean;
    };
  };
}

// Transaction Types
export interface Transaction {
  _id: string;
  userId: string;
  type: 'debit' | 'credit';
  amount: number;
  category: Category;
  date: Date;
  description?: string;
  notes?: string;
  receiptUrl?: string;
  tags?: string[];
  isRecurring: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  _id: string;
  name: string;
  nameLocal?: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  isDefault: boolean;
  userId?: string;
}

// Savings Types
export interface SavingsGoal {
  _id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  startDate: Date;
  targetDate?: Date;
  status: 'active' | 'completed' | 'cancelled';
  autoSaveRules: AutoSaveRule[];
  contributions: Contribution[];
  createdAt: Date;
}

export interface AutoSaveRule {
  _id?: string;
  type: 'percentage' | 'roundup' | 'scheduled';
  value: number;
  frequency?: 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
}

export interface Contribution {
  amount: number;
  date: Date;
  source: 'manual' | 'auto-percentage' | 'auto-roundup' | 'auto-scheduled';
}

// Loan Types
export interface Loan {
  _id: string;
  userId: string;
  loanType: 'borrowed' | 'lent';
  counterparty: string;
  principal: number;
  interestRate: number;
  interestType: 'simple' | 'compound';
  startDate: Date;
  dueDate?: Date;
  status: 'active' | 'paid' | 'overdue' | 'cancelled';
  emiAmount?: number;
  emiFrequency?: 'monthly' | 'quarterly' | 'yearly';
  payments: LoanPayment[];
  remainingBalance: number;
  totalInterest: number;
  notes?: string;
  createdAt: Date;
}

export interface LoanPayment {
  amount: number;
  date: Date;
  transactionId?: string;
  principalPaid: number;
  interestPaid: number;
}

// Group Types
export interface Group {
  _id: string;
  name: string;
  description?: string;
  createdBy: string;
  members: GroupMember[];
  bills: Bill[];
  settlements: Settlement[];
  isActive: boolean;
  createdAt: Date;
}

export interface GroupMember {
  userId: User;
  joinedAt: Date;
  balance: number;
  isActive: boolean;
}

export interface Bill {
  _id?: string;
  description: string;
  totalAmount: number;
  paidBy: string;
  date: Date;
  splits: BillSplit[];
  createdAt: Date;
}

export interface BillSplit {
  userId: string;
  amount: number;
  isPaid: boolean;
  paidAt?: Date;
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
  date: Date;
  transactionId?: string;
}

// Payment Types
export interface Payment {
  _id: string;
  senderId: string;
  receiverId?: string;
  amount: number;
  currency: string;
  gateway: 'bkash' | 'nagad' | 'sslcommerz';
  gatewayTransactionId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  purpose?: string;
  metadata?: {
    relatedType?: 'group-settlement' | 'campaign-contribution' | 'direct-transfer';
    relatedId?: string;
  };
  createdAt: Date;
}

// Campaign Types
export interface Campaign {
  _id: string;
  creatorId: string;
  title: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  visibility: 'public' | 'private';
  status: 'pending' | 'approved' | 'active' | 'completed' | 'rejected' | 'cancelled';
  category?: string;
  coverImage?: string;
  startDate?: Date;
  endDate?: Date;
  contributors: Contributor[];
  createdAt: Date;
}

export interface Contributor {
  userId: string;
  amount: number;
  date: Date;
  isAnonymous: boolean;
  message?: string;
}

// Notification Types
export interface Notification {
  _id: string;
  user: string;
  type: 'payment_due' | 'goal_reached' | 'loan_overdue' | 'bill_added' | 'campaign_contribution' | 'security_alert';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
}

// Analytics Types
export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  savingsRate: number;
  monthlyTrend: MonthlyTrend[];
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  message?: string;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  role: 'individual' | 'business';
}

export interface TransactionFormData {
  type: 'debit' | 'credit';
  amount: number;
  category: string;
  date: Date;
  description?: string;
  notes?: string;
  receipt?: File;
}

export interface SavingsGoalFormData {
  name: string;
  targetAmount: number;
  targetDate?: Date;
}

export interface LoanFormData {
  loanType: 'borrowed' | 'lent';
  counterparty: string;
  principal: number;
  interestRate: number;
  interestType: 'simple' | 'compound';
  startDate: Date;
  dueDate?: Date;
  emiAmount?: number;
  emiFrequency?: 'monthly' | 'quarterly' | 'yearly';
  notes?: string;
}

// Contact Types
export interface Contact {
  _id: string;
  userId: string;
  name: string;
  type: 'person' | 'organization';
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  tags?: string[];
  lastTransactionDate?: Date;
  totalTransactions: number;
  totalAmount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactFormData {
  name: string;
  type: 'person' | 'organization';
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  tags?: string[];
}
