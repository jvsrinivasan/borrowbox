import { LayoutGrid, List, Search, SlidersHorizontal, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CATEGORY_MAP } from '../components/Badges';
import ItemCard from '../components/ItemCard';
import { getItems, getUsers } from '../store';
import type { ItemCategory, LendingType } from '../types';

const CATEGORIES: (ItemCategory | 'all')[] = [
  'all', 'tools', 'electronics', 'outdoor', 'baby', 'games', 'appliances', 'sports', 'other',
];
const LENDING_TYPES: (LendingType | 'all')[] = ['all', 'free', 'paid', 'credits'];

export default function BrowsePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ItemCategory | 'all'>('all');
  const [lendingType, setLendingType] = useState<LendingType | 'all'>('all');
  const [showUnavailable, setShowUnavailable] = useState(false);
  const [grid, setGrid] = useState(true);

  const allItems = getItems();
  const users = getUsers();
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  const filtered = useMemo(() => {
    return allItems.filter((item) => {
      if (!showUnavailable && !item.available) return false;
      if (category !== 'all' && item.category !== category) return false;
      if (lendingType !== 'all' && item.lendingType !== lendingType) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          (item.tags ?? []).some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [allItems, search, category, lendingType, showUnavailable]);

  const hasFilters = search || category !== 'all' || lendingType !== 'all' || showUnavailable;

  const clearFilters = () => {
    setSearch('');
    setCategory('all');
    setLendingType('all');
    setShowUnavailable(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Browse Items</h1>
        <p className="text-stone-500 text-sm mt-1">Discover items available in your community</p>
      </div>

      {/* Search + controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items…"
            className="w-full pl-9 pr-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setGrid(true)}
            className={`p-2 rounded-lg border ${grid ? 'bg-amber-100 border-amber-300 text-amber-700' : 'border-stone-200 text-stone-500'}`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setGrid(false)}
            className={`p-2 rounded-lg border ${!grid ? 'bg-amber-100 border-amber-300 text-amber-700' : 'border-stone-200 text-stone-500'}`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => {
            const meta = c !== 'all' ? CATEGORY_MAP[c] : null;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  category === c
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-amber-300'
                }`}
              >
                {meta && c !== 'all' ? meta.icon : null}
                {c === 'all' ? 'All Categories' : meta?.label ?? c}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Lending type */}
        <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-xl p-1">
          {LENDING_TYPES.map((lt) => (
            <button
              key={lt}
              onClick={() => setLendingType(lt)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                lendingType === lt
                  ? 'bg-amber-500 text-white'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {lt === 'all' ? 'All Types' : lt.charAt(0).toUpperCase() + lt.slice(1)}
            </button>
          ))}
        </div>

        {/* Show unavailable toggle */}
        <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showUnavailable}
            onChange={(e) => setShowUnavailable(e.target.checked)}
            className="w-4 h-4 rounded accent-amber-500"
          />
          Show unavailable
        </label>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-800 font-medium"
          >
            <X size={12} />
            Clear filters
          </button>
        )}

        <span className="text-xs text-stone-400 ml-auto">
          {filtered.length} item{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Grid / List */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 text-stone-400">
          <SlidersHorizontal size={36} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium text-stone-500">No items match your filters</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 text-sm text-amber-700 underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : grid ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((item) => (
            <ItemCard key={item.id} item={item} lender={userMap[item.lenderId]} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((item) => {
            const lender = userMap[item.lenderId];
            const priceLabel =
              item.lendingType === 'paid' && item.dailyRate
                ? `₹${item.dailyRate}/day`
                : item.lendingType === 'credits' && item.creditRate
                ? `${item.creditRate} credits/day`
                : 'Free';
            return (
              <a
                key={item.id}
                href={`/items/${item.id}`}
                className="flex gap-4 bg-white rounded-2xl border border-stone-200 p-4 hover:shadow-md transition-all"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-stone-900 truncate">{item.title}</h3>
                    <span className="text-sm font-bold text-amber-700 whitespace-nowrap">{priceLabel}</span>
                  </div>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-1">{item.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {lender && (
                      <span className="text-xs text-stone-400">
                        {lender.name} · {lender.building}
                      </span>
                    )}
                    {!item.available && (
                      <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
                        Unavailable
                      </span>
                    )}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
