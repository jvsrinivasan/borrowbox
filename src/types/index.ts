export type LendingType = 'free' | 'paid' | 'credits';

export type ItemCategory =
  | 'tools'
  | 'electronics'
  | 'outdoor'
  | 'baby'
  | 'games'
  | 'appliances'
  | 'sports'
  | 'other';

export type RequestStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'active'
  | 'returned'
  | 'completed';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // demo only — plain text for prototype
  avatarUrl?: string;
  apartment: string;
  building: string;
  joinedAt: string; // ISO date
  credits: number;
  rating: number;
  totalLends: number;
  totalBorrows: number;
  bio?: string;
}

export interface Item {
  id: string;
  lenderId: string;
  title: string;
  description: string;
  category: ItemCategory;
  imageUrl: string;
  lendingType: LendingType;
  dailyRate?: number;    // INR – only for 'paid'
  creditRate?: number;   // credits/day – only for 'credits'
  deposit?: number;      // INR refundable deposit
  available: boolean;
  createdAt: string;
  tags?: string[];
}

export interface BorrowRequest {
  id: string;
  itemId: string;
  borrowerId: string;
  lenderId: string;
  startDate: string;   // ISO date YYYY-MM-DD
  endDate: string;
  status: RequestStatus;
  totalCost?: number;   // INR or credits depending on lendingType
  depositPaid?: number;
  lendingType: LendingType;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  requestId: string;
  fromUserId: string;
  toUserId: string;
  type: 'rental_fee' | 'deposit' | 'deposit_refund' | 'credit_earn' | 'credit_spend';
  amount: number;       // INR or credits
  currency: 'INR' | 'credits';
  description: string;
  createdAt: string;
}

export interface Rating {
  id: string;
  requestId: string;
  fromUserId: string;
  toUserId: string;
  score: number;   // 1-5
  comment: string;
  createdAt: string;
}
