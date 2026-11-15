/**
 * BorrowBox — Local-storage data store (prototype fallback)
 *
 * All state is persisted to localStorage so the app survives page reloads.
 * In a production build this would be replaced by API calls.
 */

import { SEED_ITEMS, SEED_RATINGS, SEED_REQUESTS, SEED_TRANSACTIONS, SEED_USERS } from '../data/seed';
import type { BorrowRequest, Item, Rating, Transaction, User } from '../types';

const KEYS = {
  users: 'bb_users',
  items: 'bb_items',
  requests: 'bb_requests',
  transactions: 'bb_transactions',
  ratings: 'bb_ratings',
  currentUserId: 'bb_currentUser',
  seeded: 'bb_seeded',
};

function load<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function save<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function ensureSeeded(): void {
  if (localStorage.getItem(KEYS.seeded)) return;
  save(KEYS.users, SEED_USERS);
  save(KEYS.items, SEED_ITEMS);
  save(KEYS.requests, SEED_REQUESTS);
  save(KEYS.transactions, SEED_TRANSACTIONS);
  save(KEYS.ratings, SEED_RATINGS);
  localStorage.setItem(KEYS.seeded, '1');
}

ensureSeeded();

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function getCurrentUser(): User | null {
  const id = localStorage.getItem(KEYS.currentUserId);
  if (!id) return null;
  return getUsers().find((u) => u.id === id) ?? null;
}

export function loginUser(email: string, password: string): User | null {
  const user = getUsers().find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === password
  );
  if (!user) return null;
  localStorage.setItem(KEYS.currentUserId, user.id);
  return user;
}

export function logoutUser(): void {
  localStorage.removeItem(KEYS.currentUserId);
}

export function registerUser(
  name: string,
  email: string,
  password: string,
  apartment: string,
  building: string
): User | null {
  const existing = getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) return null;
  const newUser: User = {
    id: `u${Date.now()}`,
    name,
    email,
    passwordHash: password,
    apartment,
    building,
    joinedAt: new Date().toISOString().split('T')[0],
    credits: 30, // welcome credits
    rating: 0,
    totalLends: 0,
    totalBorrows: 0,
  };
  const users = getUsers();
  users.push(newUser);
  save(KEYS.users, users);
  localStorage.setItem(KEYS.currentUserId, newUser.id);
  return newUser;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export function getUsers(): User[] {
  return load<User>(KEYS.users);
}

export function getUserById(id: string): User | undefined {
  return getUsers().find((u) => u.id === id);
}

export function updateUser(updated: User): void {
  const users = getUsers().map((u) => (u.id === updated.id ? updated : u));
  save(KEYS.users, users);
}

// ─── Items ────────────────────────────────────────────────────────────────────

export function getItems(): Item[] {
  return load<Item>(KEYS.items);
}

export function getItemById(id: string): Item | undefined {
  return getItems().find((i) => i.id === id);
}

export function saveItem(item: Item): void {
  const items = getItems();
  const idx = items.findIndex((i) => i.id === item.id);
  if (idx >= 0) {
    items[idx] = item;
  } else {
    items.push(item);
  }
  save(KEYS.items, items);
}

export function deleteItem(id: string): void {
  save(
    KEYS.items,
    getItems().filter((i) => i.id !== id)
  );
}

// ─── Requests ─────────────────────────────────────────────────────────────────

export function getRequests(): BorrowRequest[] {
  return load<BorrowRequest>(KEYS.requests);
}

export function getRequestById(id: string): BorrowRequest | undefined {
  return getRequests().find((r) => r.id === id);
}

export function saveRequest(req: BorrowRequest): void {
  const requests = getRequests();
  const idx = requests.findIndex((r) => r.id === req.id);
  if (idx >= 0) {
    requests[idx] = req;
  } else {
    requests.push(req);
  }
  save(KEYS.requests, requests);
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export function getTransactions(): Transaction[] {
  return load<Transaction>(KEYS.transactions);
}

export function saveTransaction(tx: Transaction): void {
  const txs = getTransactions();
  txs.push(tx);
  save(KEYS.transactions, txs);
}

// ─── Ratings ─────────────────────────────────────────────────────────────────

export function getRatings(): Rating[] {
  return load<Rating>(KEYS.ratings);
}

export function saveRating(r: Rating): void {
  const ratings = getRatings();
  ratings.push(r);
  save(KEYS.ratings, ratings);
  // recalculate user rating
  const userRatings = ratings.filter((rt) => rt.toUserId === r.toUserId);
  const avg = userRatings.reduce((sum, rt) => sum + rt.score, 0) / userRatings.length;
  const user = getUserById(r.toUserId);
  if (user) {
    updateUser({ ...user, rating: Math.round(avg * 10) / 10 });
  }
}

// ─── Business logic helpers ──────────────────────────────────────────────────

/**
 * Check whether an item has any overlapping approved/active booking for given dates.
 */
export function hasOverlap(itemId: string, startDate: string, endDate: string, excludeRequestId?: string): boolean {
  return getRequests().some((r) => {
    if (r.itemId !== itemId) return false;
    if (excludeRequestId && r.id === excludeRequestId) return false;
    if (r.status !== 'approved' && r.status !== 'active') return false;
    // Overlap check: not (endDate < r.startDate || startDate > r.endDate)
    return !(endDate < r.startDate || startDate > r.endDate);
  });
}

export function approveRequest(requestId: string): void {
  const req = getRequestById(requestId);
  if (!req) throw new Error('Request not found');
  const updated: BorrowRequest = {
    ...req,
    status: 'approved',
    updatedAt: new Date().toISOString(),
  };
  saveRequest(updated);

  // record transactions
  const item = getItemById(req.itemId);
  if (!item) return;

  const days = dateDiffDays(req.startDate, req.endDate) + 1;

  if (req.lendingType === 'paid' && item.dailyRate) {
    const cost = days * item.dailyRate;
    saveTransaction({
      id: `tx${Date.now()}a`,
      requestId,
      fromUserId: req.borrowerId,
      toUserId: req.lenderId,
      type: 'rental_fee',
      amount: cost,
      currency: 'INR',
      description: `Rental fee for ${item.title} (${days} day${days > 1 ? 's' : ''} × ₹${item.dailyRate})`,
      createdAt: new Date().toISOString(),
    });
  }
  if (req.lendingType === 'credits' && item.creditRate) {
    const cost = days * item.creditRate;
    // deduct from borrower
    const borrower = getUserById(req.borrowerId);
    if (borrower) updateUser({ ...borrower, credits: Math.max(0, borrower.credits - cost) });
    saveTransaction({
      id: `tx${Date.now()}b`,
      requestId,
      fromUserId: req.borrowerId,
      toUserId: req.lenderId,
      type: 'credit_spend',
      amount: cost,
      currency: 'credits',
      description: `Credits paid for ${item.title} (${days} day${days > 1 ? 's' : ''} × ${item.creditRate} credits)`,
      createdAt: new Date().toISOString(),
    });
  }
  if (item.deposit) {
    saveTransaction({
      id: `tx${Date.now()}c`,
      requestId,
      fromUserId: req.borrowerId,
      toUserId: req.lenderId,
      type: 'deposit',
      amount: item.deposit,
      currency: 'INR',
      description: `Security deposit for ${item.title}`,
      createdAt: new Date().toISOString(),
    });
  }
}

export function rejectRequest(requestId: string): void {
  const req = getRequestById(requestId);
  if (!req) return;
  saveRequest({ ...req, status: 'rejected', updatedAt: new Date().toISOString() });
}

export function markActive(requestId: string): void {
  const req = getRequestById(requestId);
  if (!req) return;
  saveRequest({ ...req, status: 'active', updatedAt: new Date().toISOString() });
  // mark item unavailable
  const item = getItemById(req.itemId);
  if (item) saveItem({ ...item, available: false });
}

export function completeReturn(requestId: string): void {
  const req = getRequestById(requestId);
  if (!req) return;
  saveRequest({ ...req, status: 'completed', updatedAt: new Date().toISOString() });

  // restore item availability
  const item = getItemById(req.itemId);
  if (item) saveItem({ ...item, available: true });

  // earn credits for lender (community reward for successful lend)
  const lender = getUserById(req.lenderId);
  if (lender) {
    const reward = 10;
    updateUser({ ...lender, credits: lender.credits + reward, totalLends: lender.totalLends + 1 });
    saveTransaction({
      id: `tx${Date.now()}d`,
      requestId,
      fromUserId: req.lenderId,
      toUserId: req.lenderId,
      type: 'credit_earn',
      amount: reward,
      currency: 'credits',
      description: `Community credits earned for lending ${item?.title ?? 'item'}`,
      createdAt: new Date().toISOString(),
    });
  }
  // update borrower count
  const borrower = getUserById(req.borrowerId);
  if (borrower) updateUser({ ...borrower, totalBorrows: borrower.totalBorrows + 1 });

  // refund deposit
  const txs = getTransactions().filter((t) => t.requestId === requestId && t.type === 'deposit');
  if (txs.length > 0) {
    const depositTx = txs[0];
    saveTransaction({
      id: `tx${Date.now()}e`,
      requestId,
      fromUserId: req.lenderId,
      toUserId: req.borrowerId,
      type: 'deposit_refund',
      amount: depositTx.amount,
      currency: 'INR',
      description: `Deposit refund – ${item?.title ?? 'item'} returned in good condition`,
      createdAt: new Date().toISOString(),
    });
  }
}

function dateDiffDays(start: string, end: string): number {
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  return Math.max(0, Math.floor((b - a) / 86400000));
}
