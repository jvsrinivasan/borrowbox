import { ArrowDownLeft, ArrowUpRight, Coins, History } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTransactions, getUserById } from '../store';

const TYPE_LABELS: Record<string, string> = {
  rental_fee: 'Rental Fee',
  deposit: 'Security Deposit',
  deposit_refund: 'Deposit Refund',
  credit_earn: 'Credits Earned',
  credit_spend: 'Credits Spent',
};

export default function TransactionHistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'INR' | 'credits'>('all');

  if (!user) {
    navigate('/login');
    return null;
  }

  const allTx = getTransactions()
    .filter((t) => t.fromUserId === user.id || t.toUserId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const filtered = filter === 'all' ? allTx : allTx.filter((t) => t.currency === filter);

  const totalEarnedINR = allTx
    .filter((t) => t.toUserId === user.id && t.currency === 'INR' && t.type === 'rental_fee')
    .reduce((s, t) => s + t.amount, 0);

  const totalSpentINR = allTx
    .filter((t) => t.fromUserId === user.id && t.currency === 'INR' && t.type === 'rental_fee')
    .reduce((s, t) => s + t.amount, 0);

  const totalCreditsEarned = allTx
    .filter((t) => t.toUserId === user.id && t.type === 'credit_earn')
    .reduce((s, t) => s + t.amount, 0);

  const totalCreditsSpent = allTx
    .filter((t) => t.fromUserId === user.id && t.type === 'credit_spend')
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Transaction History</h1>
        <p className="text-stone-500 text-sm mt-1">All your financial activity on BorrowBox</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <SummaryCard
          label="Earned (₹)"
          value={`₹${totalEarnedINR}`}
          icon={<ArrowDownLeft size={16} className="text-emerald-500" />}
          color="bg-emerald-50 border-emerald-100"
        />
        <SummaryCard
          label="Spent (₹)"
          value={`₹${totalSpentINR}`}
          icon={<ArrowUpRight size={16} className="text-red-400" />}
          color="bg-red-50 border-red-100"
        />
        <SummaryCard
          label="Credits Earned"
          value={totalCreditsEarned.toString()}
          icon={<Coins size={16} className="text-amber-500" />}
          color="bg-amber-50 border-amber-100"
        />
        <SummaryCard
          label="Credits Spent"
          value={totalCreditsSpent.toString()}
          icon={<Coins size={16} className="text-blue-400" />}
          color="bg-blue-50 border-blue-100"
        />
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-5">
        {(['all', 'INR', 'credits'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              filter === f
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-white text-stone-600 border-stone-200 hover:border-amber-300'
            }`}
          >
            {f === 'all' ? 'All' : f === 'INR' ? '₹ Payments' : '🪙 Credits'}
          </button>
        ))}
        <span className="text-xs text-stone-400 ml-auto">{filtered.length} transactions</span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24 text-stone-400">
          <History size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium text-stone-500">No transactions yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((tx) => {
            const isIncoming = tx.toUserId === user.id;
            const otherUser = getUserById(isIncoming ? tx.fromUserId : tx.toUserId);

            return (
              <div
                key={tx.id}
                className="flex items-center gap-4 bg-white rounded-xl border border-stone-200 px-4 py-3"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isIncoming ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'
                  }`}
                >
                  {isIncoming ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800 truncate">{tx.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-stone-400">
                      {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    {otherUser && (
                      <span className="text-xs text-stone-400">
                        {isIncoming ? 'from' : 'to'} {otherUser.name}
                      </span>
                    )}
                    <span className="text-xs bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-full">
                      {TYPE_LABELS[tx.type] ?? tx.type}
                    </span>
                  </div>
                </div>

                <div
                  className={`text-sm font-bold whitespace-nowrap ${
                    isIncoming ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  {isIncoming ? '+' : '-'}
                  {tx.currency === 'INR' ? `₹${tx.amount}` : `${tx.amount} cr`}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-stone-400 text-center mt-8">
        ⚠️ This is a prototype. All transactions are simulated and no real money is involved.
      </p>
    </div>
  );
}

function SummaryCard({
  label, value, icon, color,
}: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className={`flex flex-col gap-1 p-4 rounded-2xl border ${color}`}>
      <div className="flex items-center gap-2">{icon}<span className="text-xs text-stone-500">{label}</span></div>
      <p className="text-xl font-bold text-stone-900">{value}</p>
    </div>
  );
}
