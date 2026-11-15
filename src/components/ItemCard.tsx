import { MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Item, User } from '../types';
import { CategoryBadge, LendingBadge } from './Badges';

interface ItemCardProps {
  item: Item;
  lender?: User;
}

export default function ItemCard({ item, lender }: ItemCardProps) {
  const priceLabel =
    item.lendingType === 'paid' && item.dailyRate
      ? `₹${item.dailyRate}/day`
      : item.lendingType === 'credits' && item.creditRate
      ? `${item.creditRate} credits/day`
      : 'Free';

  return (
    <Link
      to={`/items/${item.id}`}
      className={`group flex flex-col bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ${
        !item.available ? 'opacity-70' : ''
      }`}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-stone-100">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80';
          }}
        />
        {!item.available && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-stone-700 text-xs font-bold px-3 py-1 rounded-full">
              Unavailable
            </span>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <LendingBadge type={item.lendingType} />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-stone-900 leading-tight line-clamp-1">{item.title}</h3>
          <span className="text-sm font-bold text-amber-700 whitespace-nowrap">{priceLabel}</span>
        </div>

        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">{item.description}</p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <CategoryBadge category={item.category} />
          {lender && (
            <div className="flex items-center gap-1 text-xs text-stone-500">
              <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-bold text-xs">
                {lender.name[0]}
              </div>
              <span className="truncate max-w-[80px]">{lender.name.split(' ')[0]}</span>
              {lender.rating > 0 && (
                <>
                  <Star size={10} className="text-yellow-400 fill-yellow-400 ml-1" />
                  <span>{lender.rating}</span>
                </>
              )}
            </div>
          )}
        </div>
        {lender && (
          <div className="flex items-center gap-1 text-xs text-stone-400">
            <MapPin size={11} />
            {lender.building} · Apt {lender.apartment}
          </div>
        )}
      </div>
    </Link>
  );
}
