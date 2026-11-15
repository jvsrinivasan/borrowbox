import {
  BarChart3,
  Coins,
  Heart,
  Leaf,
  Package,
  Recycle,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import { getRatings, getRequests, getTransactions, getUsers } from '../store';

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className={`flex flex-col gap-2 p-5 rounded-2xl border ${color}`}>
      <div className="w-9 h-9 rounded-xl bg-white/60 flex items-center justify-center">{icon}</div>
      <div>
        <p className="text-2xl font-extrabold text-stone-900">{value}</p>
        <p className="text-sm text-stone-600 font-medium mt-0.5">{label}</p>
        {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function CommunityPage() {
  const users = getUsers();
  const requests = getRequests();
  const transactions = getTransactions();
  const ratings = getRatings();

  const completedRequests = requests.filter((r) => r.status === 'completed');
  const totalLends = completedRequests.length;
  const totalItems = new Set(requests.map((r) => r.itemId)).size;
  const avgRating =
    ratings.length > 0
      ? (ratings.reduce((s, r) => s + r.score, 0) / ratings.length).toFixed(1)
      : '—';

  // Estimate ₹ value of purchases avoided — use an average item cost of ₹2,000
  const purchasesAvoided = totalLends;
  const estimatedSavings = purchasesAvoided * 2000;

  const totalCreditsCirculating = users.reduce((s, u) => s + u.credits, 0);

  // Top lenders by number of completed lends
  const lendCounts: Record<string, number> = {};
  completedRequests.forEach((r) => { lendCounts[r.lenderId] = (lendCounts[r.lenderId] ?? 0) + 1; });
  const topLenders = users
    .filter((u) => lendCounts[u.id])
    .sort((a, b) => (lendCounts[b.id] ?? 0) - (lendCounts[a.id] ?? 0))
    .slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <Heart size={22} className="text-rose-500" />
          Community Impact
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Together we're sharing more and buying less. Here's what Greenfield Apartments has achieved.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          icon={<Package size={18} className="text-amber-600" />}
          label="Items Shared"
          value={totalItems}
          sub="unique items borrowed"
          color="bg-amber-50 border-amber-100"
        />
        <StatCard
          icon={<Users size={18} className="text-blue-600" />}
          label="Active Members"
          value={users.length}
          sub="registered in community"
          color="bg-blue-50 border-blue-100"
        />
        <StatCard
          icon={<TrendingUp size={18} className="text-emerald-600" />}
          label="Successful Lends"
          value={totalLends}
          sub="completed transactions"
          color="bg-emerald-50 border-emerald-100"
        />
        <StatCard
          icon={<Star size={18} className="text-yellow-500" />}
          label="Avg. Rating"
          value={avgRating}
          sub={`${ratings.length} reviews`}
          color="bg-yellow-50 border-yellow-100"
        />
        <StatCard
          icon={<Recycle size={18} className="text-green-600" />}
          label="Purchases Avoided"
          value={purchasesAvoided}
          sub="thanks to sharing"
          color="bg-green-50 border-green-100"
        />
        <StatCard
          icon={<Leaf size={18} className="text-teal-600" />}
          label="Est. Savings"
          value={`₹${(estimatedSavings / 1000).toFixed(0)}K`}
          sub="estimated community savings"
          color="bg-teal-50 border-teal-100"
        />
        <StatCard
          icon={<Coins size={18} className="text-amber-600" />}
          label="Credits Circulating"
          value={totalCreditsCirculating}
          sub="community credits in use"
          color="bg-orange-50 border-orange-100"
        />
        <StatCard
          icon={<BarChart3 size={18} className="text-purple-600" />}
          label="Total Transactions"
          value={transactions.length}
          sub="payments & credits logged"
          color="bg-purple-50 border-purple-100"
        />
      </div>

      {/* Top contributors */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 mb-6">
        <h2 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
          <Star size={16} className="text-yellow-500" />
          Top Lenders
        </h2>
        {topLenders.length === 0 ? (
          <p className="text-stone-400 text-sm">No completed lends yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {topLenders.map((u, idx) => (
              <div key={u.id} className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx === 0
                      ? 'bg-yellow-400 text-white'
                      : idx === 1
                      ? 'bg-stone-300 text-white'
                      : idx === 2
                      ? 'bg-amber-600 text-white'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {idx + 1}
                </span>
                <div className="w-9 h-9 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-bold text-sm">
                  {u.name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-stone-900">{u.name}</p>
                  <p className="text-xs text-stone-500">
                    {u.building} · Apt {u.apartment}
                    {u.rating > 0 && ` · ⭐ ${u.rating}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-amber-700">{lendCounts[u.id]}</p>
                  <p className="text-xs text-stone-400">lends</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-stone-800">{u.credits}</p>
                  <p className="text-xs text-stone-400">credits</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All members */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
        <h2 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
          <Users size={16} className="text-blue-500" />
          Community Members
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {users.map((u) => (
            <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50">
              <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-bold flex-shrink-0">
                {u.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-900 truncate">{u.name}</p>
                <p className="text-xs text-stone-500">
                  {u.building} · Apt {u.apartment}
                  {u.rating > 0 && ` · ⭐ ${u.rating}`}
                </p>
              </div>
              <div className="text-right text-xs text-stone-400 hidden sm:block">
                <div className="font-semibold text-stone-700">{u.credits} cr</div>
                <div>{u.totalLends} lends</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
