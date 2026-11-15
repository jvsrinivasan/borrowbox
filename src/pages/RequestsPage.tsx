import {
  CalendarDays,
  CheckCircle2,
  Inbox,
  MapPin,
  MessageSquare,
  Truck,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../components/Badges';
import { toast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import {
  approveRequest,
  getItemById,
  getRequests,
  getUserById,
  markActive,
  rejectRequest,
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

export default function RequestsPage() {
  const { user, refresh: refreshUser } = useAuth();
  const [tab, setTab] = useState<RequestStatus | 'all'>('all');

  const forceRefresh = () => { refreshUser(); };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center text-stone-400">
        Please sign in to view requests.
      </div>
    );
  }

  const allRequests = getRequests()
    .filter((r) => r.lenderId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const filtered = tab === 'all' ? allRequests : allRequests.filter((r) => r.status === tab);

  const counts: Record<string, number> = {};
  allRequests.forEach((r) => { counts[r.status] = (counts[r.status] ?? 0) + 1; });

  const handleApprove = (reqId: string) => {
    try {
      approveRequest(reqId);
      toast('success', 'Request approved! Transactions recorded.');
      forceRefresh();
    } catch (e) {
      toast('error', 'Failed to approve request.');
    }
  };

  const handleReject = (reqId: string) => {
    rejectRequest(reqId);
    toast('info', 'Request rejected.');
    forceRefresh();
  };

  const handleMarkActive = (reqId: string) => {
    markActive(reqId);
    toast('success', 'Item marked as collected. Borrowing is now active!');
    forceRefresh();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Borrowing Requests</h1>
        <p className="text-stone-500 text-sm mt-1">Requests for items you are lending</p>
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
          <Inbox size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium text-stone-500">No requests here</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((req) => {
            const item = getItemById(req.itemId);
            const borrower = getUserById(req.borrowerId);
            const days =
              Math.floor(
                (new Date(req.endDate).getTime() - new Date(req.startDate).getTime()) / 86400000
              ) + 1;

            return (
              <div key={req.id} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex gap-3">
                    {item && (
                      <Link to={`/items/${item.id}`}>
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-16 h-16 rounded-xl object-cover border border-stone-100 flex-shrink-0"
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
                          <h3 className="font-semibold text-stone-900">
                            {item?.title ?? 'Deleted item'}
                          </h3>
                          {borrower && (
                            <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                              <div className="w-4 h-4 rounded-full bg-amber-200 inline-flex items-center justify-center text-amber-800 font-bold text-xs">
                                {borrower.name[0]}
                              </div>
                              {borrower.name}
                              <span className="text-stone-300">·</span>
                              <MapPin size={10} />
                              {borrower.building} · Apt {borrower.apartment}
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
                        <p className="text-xs text-stone-500 mt-2 italic flex items-start gap-1">
                          <MessageSquare size={11} className="mt-0.5 flex-shrink-0 text-stone-400" />
                          "{req.message}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {(req.status === 'pending' || req.status === 'approved') && (
                  <div className="border-t border-stone-100 px-4 py-2.5 flex gap-2">
                    {req.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <CheckCircle2 size={13} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          className="flex items-center gap-1.5 border border-red-300 text-red-600 hover:bg-red-50 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <XCircle size={13} />
                          Reject
                        </button>
                      </>
                    )}
                    {req.status === 'approved' && (
                      <button
                        onClick={() => handleMarkActive(req.id)}
                        className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Truck size={13} />
                        Mark as Collected
                      </button>
                    )}
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
