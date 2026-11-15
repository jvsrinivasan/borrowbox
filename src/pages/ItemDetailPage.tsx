import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Coins,
  MapPin,
  MessageSquare,
  Package,
  Shield,
  Star,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CategoryBadge, LendingBadge } from '../components/Badges';
import { toast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import {
  getItemById,
  getRatings,
  getRequests,
  getUserById,
  hasOverlap,
  saveRequest,
} from '../store';
import type { BorrowRequest } from '../types';

function dateDiffDays(start: string, end: string): number {
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  return Math.max(0, Math.floor((b - a) / 86400000));
}

function today() {
  return new Date().toISOString().split('T')[0];
}

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, refresh } = useAuth();
  const navigate = useNavigate();

  const item = id ? getItemById(id) : undefined;
  const lender = item ? getUserById(item.lenderId) : undefined;
  const ratings = getRatings().filter((r) => r.toUserId === item?.lenderId);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!item) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center text-stone-400">
        <Package size={40} className="mx-auto mb-3 opacity-40" />
        <p className="font-medium text-stone-500">Item not found</p>
      </div>
    );
  }

  const isOwnItem = user?.id === item.lenderId;
  const days = startDate && endDate ? dateDiffDays(startDate, endDate) + 1 : 0;
  const cost =
    item.lendingType === 'paid' && item.dailyRate
      ? days * item.dailyRate
      : item.lendingType === 'credits' && item.creditRate
      ? days * item.creditRate
      : 0;

  const existingRequest = user
    ? getRequests().find(
        (r) =>
          r.itemId === item.id &&
          r.borrowerId === user.id &&
          ['pending', 'approved', 'active'].includes(r.status)
      )
    : null;

  const handleRequest = () => {
    setFormError('');
    if (!user) {
      navigate('/login');
      return;
    }
    if (!startDate || !endDate) {
      setFormError('Please select start and end dates.');
      return;
    }
    if (endDate < startDate) {
      setFormError('End date must be on or after start date.');
      return;
    }
    if (startDate < today()) {
      setFormError('Start date cannot be in the past.');
      return;
    }
    if (item.lendingType === 'credits' && item.creditRate) {
      const needed = days * item.creditRate;
      if ((user.credits ?? 0) < needed) {
        setFormError(`You need ${needed} credits but only have ${user.credits}.`);
        return;
      }
    }
    if (hasOverlap(item.id, startDate, endDate)) {
      setFormError('These dates overlap with an existing approved booking. Please choose different dates.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const req: BorrowRequest = {
        id: `r${Date.now()}`,
        itemId: item.id,
        borrowerId: user.id,
        lenderId: item.lenderId,
        startDate,
        endDate,
        status: 'pending',
        totalCost: cost || undefined,
        lendingType: item.lendingType,
        message: message.trim() || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveRequest(req);
      setSubmitting(false);
      setSubmitted(true);
      refresh();
      toast('success', 'Borrowing request submitted! The lender will review it shortly.');
    }, 400);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left – image + details */}
        <div>
          <div className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 h-72 sm:h-96">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80';
              }}
            />
          </div>

          {/* Lender info */}
          {lender && (
            <div className="mt-5 p-4 bg-white rounded-2xl border border-stone-200">
              <h3 className="text-sm font-semibold text-stone-700 mb-3">About the Lender</h3>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-bold text-lg flex-shrink-0">
                  {lender.name[0]}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-stone-900">{lender.name}</p>
                  <div className="flex items-center gap-3 text-xs text-stone-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {lender.building} · Apt {lender.apartment}
                    </span>
                    {lender.rating > 0 && (
                      <span className="flex items-center gap-1">
                        <Star size={11} className="text-yellow-400 fill-yellow-400" />
                        {lender.rating} ({ratings.length} reviews)
                      </span>
                    )}
                  </div>
                  {lender.bio && (
                    <p className="text-xs text-stone-500 mt-1.5 italic">"{lender.bio}"</p>
                  )}
                </div>
              </div>
              <div className="flex gap-4 mt-3 pt-3 border-t border-stone-100 text-center">
                <div className="flex-1">
                  <div className="text-base font-bold text-stone-800">{lender.totalLends}</div>
                  <div className="text-xs text-stone-500">Total lends</div>
                </div>
                <div className="flex-1">
                  <div className="text-base font-bold text-stone-800">{lender.credits}</div>
                  <div className="text-xs text-stone-500">Credits</div>
                </div>
                <div className="flex-1">
                  <div className="text-base font-bold text-stone-800">
                    {lender.rating > 0 ? lender.rating : '—'}
                  </div>
                  <div className="text-xs text-stone-500">Rating</div>
                </div>
              </div>
            </div>
          )}

          {/* Reviews */}
          {ratings.length > 0 && (
            <div className="mt-4 p-4 bg-white rounded-2xl border border-stone-200">
              <h3 className="text-sm font-semibold text-stone-700 mb-3">Recent Reviews</h3>
              <div className="flex flex-col gap-3">
                {ratings.slice(0, 3).map((r) => {
                  const reviewer = getUserById(r.fromUserId);
                  return (
                    <div key={r.id} className="text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold text-stone-600">
                          {reviewer?.name[0] ?? '?'}
                        </div>
                        <span className="font-medium text-stone-700">{reviewer?.name ?? 'Anonymous'}</span>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={11}
                              className={i < r.score ? 'text-yellow-400 fill-yellow-400' : 'text-stone-200 fill-stone-200'}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-stone-500 text-xs pl-8">{r.comment}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right – item info + request form */}
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            <CategoryBadge category={item.category} />
            <LendingBadge type={item.lendingType} />
            {!item.available && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-500">
                Currently Unavailable
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-stone-900 mb-2">{item.title}</h1>
          <p className="text-stone-600 leading-relaxed mb-4">{item.description}</p>

          {/* Pricing info */}
          <div className="bg-amber-50 rounded-xl border border-amber-100 p-4 mb-5 flex flex-wrap gap-4">
            <div>
              <p className="text-xs text-amber-700 font-medium mb-0.5">Lending Type</p>
              <p className="text-sm font-bold text-stone-900 capitalize">{item.lendingType}</p>
            </div>
            {item.lendingType === 'paid' && item.dailyRate && (
              <div>
                <p className="text-xs text-amber-700 font-medium mb-0.5">Daily Rate</p>
                <p className="text-sm font-bold text-stone-900">₹{item.dailyRate}/day</p>
              </div>
            )}
            {item.lendingType === 'credits' && item.creditRate && (
              <div>
                <p className="text-xs text-amber-700 font-medium mb-0.5">Credit Rate</p>
                <p className="text-sm font-bold text-stone-900">{item.creditRate} credits/day</p>
              </div>
            )}
            {item.deposit && (
              <div>
                <p className="text-xs text-amber-700 font-medium mb-0.5 flex items-center gap-1">
                  <Shield size={11} />
                  Deposit
                </p>
                <p className="text-sm font-bold text-stone-900">₹{item.deposit} (refundable)</p>
              </div>
            )}
          </div>

          {/* Request form */}
          {isOwnItem ? (
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-700 flex items-center gap-2">
              <AlertCircle size={16} />
              This is your listing. You cannot request your own item.
            </div>
          ) : submitted || existingRequest ? (
            <div className="p-5 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
              <CheckCircle2 size={28} className="text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-emerald-800">Request Submitted!</p>
              <p className="text-sm text-emerald-700 mt-1">
                {existingRequest?.status === 'pending' || submitted
                  ? "You'll be notified when the lender responds."
                  : 'You already have an active request for this item.'}
              </p>
              <button
                onClick={() => navigate('/my-borrowings')}
                className="mt-4 text-sm text-emerald-700 font-semibold underline"
              >
                View my borrowings →
              </button>
            </div>
          ) : !item.available ? (
            <div className="p-4 bg-stone-100 rounded-xl text-stone-500 text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              This item is currently unavailable. Check back later.
            </div>
          ) : !user ? (
            <div className="p-5 bg-amber-50 rounded-xl border border-amber-200 text-center">
              <p className="text-sm text-amber-800 font-medium mb-3">Sign in to request this item</p>
              <button
                onClick={() => navigate('/login')}
                className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
              >
                Sign In / Register
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h3 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
                <CalendarDays size={16} className="text-amber-600" />
                Request to Borrow
              </h3>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">From</label>
                  <input
                    type="date"
                    value={startDate}
                    min={today()}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">To</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || today()}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* Cost preview */}
              {days > 0 && (
                <div className="bg-stone-50 rounded-lg p-3 mb-3 text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-stone-600">{days} day{days !== 1 ? 's' : ''} × {item.lendingType === 'paid' ? `₹${item.dailyRate}` : item.lendingType === 'credits' ? `${item.creditRate} credits` : 'free'}</span>
                    <span className="font-semibold">
                      {item.lendingType === 'paid' ? `₹${cost}` : item.lendingType === 'credits' ? `${cost} credits` : 'Free'}
                    </span>
                  </div>
                  {item.deposit && (
                    <div className="flex justify-between text-stone-500 text-xs">
                      <span className="flex items-center gap-1"><Shield size={10} /> Security deposit</span>
                      <span>₹{item.deposit} (refundable)</span>
                    </div>
                  )}
                </div>
              )}

              <div className="mb-3">
                <label className="block text-xs font-medium text-stone-600 mb-1 flex items-center gap-1">
                  <MessageSquare size={12} />
                  Message to lender (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={2}
                  placeholder="Why do you need this item?"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                />
              </div>

              {item.lendingType === 'credits' && (
                <div className="text-xs text-stone-500 mb-3 flex items-center gap-1">
                  <Coins size={12} className="text-amber-500" />
                  You have <strong className="mx-0.5">{user.credits}</strong> credits
                </div>
              )}

              {formError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3 flex items-start gap-1.5">
                  <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
                  {formError}
                </p>
              )}

              <button
                onClick={handleRequest}
                disabled={submitting}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
              >
                {submitting ? 'Submitting…' : item.lendingType === 'free' ? 'Request to Borrow (Free)' : `Request to Borrow`}
              </button>

              {item.lendingType !== 'free' && (
                <p className="text-xs text-stone-400 text-center mt-2">
                  ⚠️ This is a prototype. No real payments are processed.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
