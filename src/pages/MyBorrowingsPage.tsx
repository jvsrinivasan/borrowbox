import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  MapPin,
  MessageSquare,
  RotateCcw,
  Star,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StatusBadge } from '../components/Badges';
import { toast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import {
  completeReturn,
  getItemById,
  getRequests,
  getUserById,
  getRatings,
  saveRating,
} from '../store';
import type { RequestStatus } from '../types';

const STATUS_TABS: { label: string; value: RequestStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Rejected', value: 'rejected' },
];

export default function MyBorrowingsPage() {
  const { user, refresh: refreshUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<RequestStatus | 'all'>('all');
  const [ratingFor, setRatingFor] = useState<string | null>(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  if (!user) {
    navigate('/login');
    return null;
  }

  const forceRefresh = () => { refreshUser(); };

  const allRequests = getRequests()
    .filter((r) => r.borrowerId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const filtered = tab === 'all' ? allRequests : allRequests.filter((r) => r.status === tab);

  const counts: Record<string, number> = {};
  allRequests.forEach((r) => { counts[r.status] = (counts[r.status] ?? 0) + 1; });

  const handleReturn = (reqId: string) => {
    if (!confirm('Confirm return of this item?')) return;
    completeReturn(reqId);
    toast('success', 'Return completed! Deposit will be refunded and lender earns credits.');
    forceRefresh();
    setRatingFor(reqId);
  };

  const hasRated = (reqId: string) =>
    getRatings().some((r) => r.requestId === reqId && r.fromUserId === user.id);

  const submitRating = (reqId: string, toUserId: string) => {
    if (!ratingComment.trim()) { toast('error', 'Please leave a comment.'); return; }
    saveRating({
      id: `rt${Date.now()}`,
      requestId: reqId,
      fromUserId: user.id,
      toUserId,
      score: ratingScore,
      comment: ratingComment.trim(),
      createdAt: new Date().toISOString(),
    });
    toast('success', 'Rating submitted, thank you!');
    setRatingFor(null);
    setRatingComment('');
    setRatingScore(5);
    forceRefresh();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">My Borrowings</h1>
        <p className="text-stone-500 text-sm mt-1">Track all your borrowing requests</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-stone-100 rounded-xl p-1 mb-6">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              tab === t.value ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {t.label}
            {t.value !== 'all' && counts[t.value] ? (
              <span className="bg-amber-100 text-amber-800 text-xs px-1.5 py-0.5 rounded-full">
                {counts[t.value]}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24 text-stone-400">
          <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium text-stone-500">No borrowings here yet</p>
          <Link to="/browse" className="mt-4 inline-block text-sm text-amber-700 underline">
            Browse available items
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((req) => {
            const item = getItemById(req.itemId);
            const lender = getUserById(req.lenderId);
            const days =
              Math.floor(
                (new Date(req.endDate).getTime() - new Date(req.startDate).getTime()) / 86400000
              ) + 1;
            const alreadyRated = hasRated(req.id);

            return (
              <div key={req.id} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex gap-3">
                    {item && (
                      <Link to={`/items/${item.id}`} className="flex-shrink-0">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-16 h-16 rounded-xl object-cover border border-stone-100"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80';
                          }}
                        />
                      </Link>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-stone-900">{item?.title ?? 'Deleted item'}</h3>
                          {lender && (
                            <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
                              Lender: {lender.name}
                              <span className="text-stone-300">·</span>
                              <MapPin size={10} /> {lender.building}
                            </p>
                          )}
                        </div>
                        <StatusBadge status={req.status} />
                      </div>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-stone-500">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={12} />
                          {req.startDate} → {req.endDate} ({days} day{days !== 1 ? 's' : ''})
                        </span>
                        {req.totalCost !== undefined && req.totalCost > 0 && (
                          <span className="font-semibold text-amber-700">
                            {req.lendingType === 'credits'
                              ? `${req.totalCost} credits`
                              : `₹${req.totalCost}`}
                          </span>
                        )}
                      </div>
                      {req.message && (
                        <p className="text-xs text-stone-500 mt-1.5 italic flex items-start gap-1">
                          <MessageSquare size={11} className="mt-0.5 flex-shrink-0" />
                          "{req.message}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {req.status === 'active' && (
                  <div className="border-t border-stone-100 px-4 py-2.5 flex gap-2">
                    <button
                      onClick={() => handleReturn(req.id)}
                      className="flex items-center gap-1.5 bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <RotateCcw size={13} />
                      Return Item
                    </button>
                  </div>
                )}

                {/* Rating prompt */}
                {req.status === 'completed' && !alreadyRated && ratingFor === req.id && (
                  <div className="border-t border-stone-100 px-4 py-3 bg-amber-50">
                    <p className="text-xs font-semibold text-stone-700 mb-2 flex items-center gap-1">
                      <Star size={12} className="text-yellow-500" />
                      Rate your experience with {lender?.name}
                    </p>
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          onClick={() => setRatingScore(s)}
                          className={`text-xl transition-transform hover:scale-110 ${s <= ratingScore ? 'text-yellow-400' : 'text-stone-300'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                      rows={2}
                      placeholder="Leave a short review…"
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 mb-2"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => req.lenderId && submitRating(req.id, req.lenderId)}
                        className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                      >
                        Submit Rating
                      </button>
                      <button
                        onClick={() => setRatingFor(null)}
                        className="text-stone-400 text-xs px-3 py-1.5 rounded-lg hover:bg-stone-100"
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                )}

                {req.status === 'completed' && !alreadyRated && ratingFor !== req.id && (
                  <div className="border-t border-stone-100 px-4 py-2.5">
                    <button
                      onClick={() => setRatingFor(req.id)}
                      className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-800 font-medium"
                    >
                      <Star size={12} />
                      Leave a rating
                    </button>
                  </div>
                )}

                {req.status === 'completed' && alreadyRated && (
                  <div className="border-t border-stone-100 px-4 py-2 flex items-center gap-1 text-xs text-stone-400">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    Rated
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
