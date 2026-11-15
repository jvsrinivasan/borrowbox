import { Edit, Eye, Package, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CategoryBadge, LendingBadge } from '../components/Badges';
import { toast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { deleteItem, getItems, getRequests, saveItem } from '../store';

export default function MyListingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [, setRefresh] = useState(0);

  if (!user) {
    navigate('/login');
    return null;
  }

  const myItems = getItems().filter((i) => i.lenderId === user.id);
  const allRequests = getRequests();

  const pendingCount = (itemId: string) =>
    allRequests.filter((r) => r.itemId === itemId && r.status === 'pending').length;

  const handleToggle = (itemId: string, current: boolean) => {
    const item = getItems().find((i) => i.id === itemId);
    if (!item) return;
    saveItem({ ...item, available: !current });
    toast('info', `Listing ${!current ? 'activated' : 'paused'}.`);
    setRefresh((r) => r + 1);
  };

  const handleDelete = (itemId: string) => {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    deleteItem(itemId);
    toast('info', 'Listing deleted.');
    setRefresh((r) => r + 1);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">My Listings</h1>
          <p className="text-stone-500 text-sm mt-1">{myItems.length} item{myItems.length !== 1 ? 's' : ''} listed</p>
        </div>
        <Link
          to="/add-listing"
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          <Plus size={15} />
          Add Listing
        </Link>
      </div>

      {myItems.length === 0 ? (
        <div className="text-center py-24 text-stone-400">
          <Package size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium text-stone-500">You haven't listed any items yet</p>
          <p className="text-sm mt-1">Start sharing with your neighbours!</p>
          <Link
            to="/add-listing"
            className="mt-5 inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={15} />
            List your first item
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {myItems.map((item) => {
            const pc = pendingCount(item.id);
            const priceLabel =
              item.lendingType === 'paid' && item.dailyRate
                ? `₹${item.dailyRate}/day`
                : item.lendingType === 'credits' && item.creditRate
                ? `${item.creditRate} credits/day`
                : 'Free';

            return (
              <div key={item.id} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="flex gap-4 p-4">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-stone-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <h3 className="font-semibold text-stone-900 truncate flex-1">{item.title}</h3>
                      <span className="text-sm font-bold text-amber-700 whitespace-nowrap">{priceLabel}</span>
                    </div>
                    <div className="flex gap-2 mt-1.5 flex-wrap">
                      <CategoryBadge category={item.category} />
                      <LendingBadge type={item.lendingType} />
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          item.available
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {item.available ? '● Available' : '○ Paused'}
                      </span>
                      {pc > 0 && (
                        <Link
                          to="/requests"
                          className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full hover:bg-amber-200"
                        >
                          {pc} pending request{pc !== 1 ? 's' : ''}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
                <div className="border-t border-stone-100 px-4 py-2.5 flex items-center gap-2">
                  <Link
                    to={`/items/${item.id}`}
                    className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700 px-2 py-1 rounded-lg hover:bg-stone-50"
                  >
                    <Eye size={13} />
                    View
                  </Link>
                  <Link
                    to={`/edit-listing/${item.id}`}
                    className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700 px-2 py-1 rounded-lg hover:bg-stone-50"
                  >
                    <Edit size={13} />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleToggle(item.id, item.available)}
                    className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700 px-2 py-1 rounded-lg hover:bg-stone-50"
                  >
                    {item.available ? <ToggleRight size={13} className="text-emerald-500" /> : <ToggleLeft size={13} />}
                    {item.available ? 'Pause' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 ml-auto"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
