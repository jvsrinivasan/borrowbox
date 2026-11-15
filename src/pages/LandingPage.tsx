import {
  ArrowRight,
  BadgeCheck,
  Coins,
  Gift,
  MapPin,
  Package,
  Shield,
  Sparkles,
  Star,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getItems, getUserById } from '../store';

const FEATURES = [
  {
    icon: <Package size={22} className="text-amber-600" />,
    title: 'List your items',
    desc: 'Upload a photo, set lending terms and make your idle possessions available to neighbours.',
  },
  {
    icon: <MapPin size={22} className="text-emerald-600" />,
    title: 'Borrow locally',
    desc: 'Find what you need from people in your own building or community — no shipping, no wait.',
  },
  {
    icon: <Coins size={22} className="text-blue-600" />,
    title: 'Earn community credits',
    desc: 'Every successful lend earns you credits you can spend on other items in the community.',
  },
  {
    icon: <Shield size={22} className="text-purple-600" />,
    title: 'Built-in trust',
    desc: 'Security deposits, ratings, and verified neighbours keep every transaction safe.',
  },
];

const STATS = [
  { value: '120+', label: 'Items shared' },
  { value: '48', label: 'Active members' },
  { value: '₹62,000', label: 'Purchases avoided' },
  { value: '4.8', label: 'Avg. rating' },
];

export default function LandingPage() {
  const { user } = useAuth();
  const previewItems = getItems().filter((i) => i.available).slice(0, 6);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-50 via-white to-orange-50 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Sparkles size={13} />
            Greenfield Apartments, Bengaluru
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-tight mb-5">
            Your Neighbourhood,
            <br />
            <span className="text-amber-600">Your Shared Store.</span>
          </h1>
          <p className="text-lg sm:text-xl text-stone-500 max-w-2xl mx-auto mb-8 leading-relaxed">
            BorrowBox connects residents to share tools, gadgets, gear and more — saving money,
            reducing waste and building community.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {user ? (
              <Link
                to="/browse"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-7 py-3.5 rounded-xl transition-colors shadow-md"
              >
                Browse Items
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-7 py-3.5 rounded-xl transition-colors shadow-md"
                >
                  Join BorrowBox — it's free
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/browse"
                  className="inline-flex items-center gap-2 border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-semibold px-7 py-3.5 rounded-xl transition-colors"
                >
                  Browse items
                </Link>
              </>
            )}
          </div>

          {/* Stats row */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-extrabold text-stone-900">{s.value}</div>
                <div className="text-xs text-stone-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-stone-900 mb-3">How BorrowBox works</h2>
        <p className="text-stone-500 text-center mb-12">Simple, safe, and built for your community.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex flex-col gap-3 p-6 bg-white rounded-2xl border border-stone-200 shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center border border-stone-100">
                {f.icon}
              </div>
              <h3 className="font-semibold text-stone-900">{f.title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Preview items */}
      <section className="bg-stone-50 border-y border-stone-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-stone-900">Available right now</h2>
              <p className="text-stone-500 text-sm mt-1">From your Greenfield neighbours</p>
            </div>
            <Link
              to="/browse"
              className="text-sm font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {previewItems.map((item) => {
              const lender = getUserById(item.lenderId);
              const priceLabel =
                item.lendingType === 'paid' && item.dailyRate
                  ? `₹${item.dailyRate}/day`
                  : item.lendingType === 'credits' && item.creditRate
                  ? `${item.creditRate} credits/day`
                  : 'Free';
              return (
                <Link
                  key={item.id}
                  to={`/items/${item.id}`}
                  className="flex flex-col items-center gap-2 bg-white rounded-2xl border border-stone-200 p-4 hover:shadow-md transition-all text-center"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-12 h-12 rounded-xl object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <span className="text-sm font-semibold text-stone-800 leading-tight line-clamp-2">{item.title}</span>
                  {lender && (
                    <span className="text-xs text-stone-500">{lender.name.split(' ')[0]} · {lender.apartment}</span>
                  )}
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                    {priceLabel}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-stone-900 mb-4">Designed for community trust</h2>
          <p className="text-stone-500 mb-10">
            Every interaction is transparent, accountable and community-reviewed.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 text-left">
            {[
              { icon: <Star size={18} className="text-yellow-500" />, t: 'Verified ratings', d: 'Rate every interaction so the community knows who to trust.' },
              { icon: <Shield size={18} className="text-green-600" />, t: 'Security deposits', d: 'Optional refundable deposits protect both lender and borrower.' },
              { icon: <BadgeCheck size={18} className="text-blue-500" />, t: 'Transaction records', d: 'Every lending event is logged so there are never disputes.' },
            ].map((item) => (
              <div key={item.t} className="flex gap-3 p-5 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="mt-0.5">{item.icon}</div>
                <div>
                  <p className="font-semibold text-stone-900 text-sm">{item.t}</p>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="bg-amber-500 py-14 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Ready to share?</h2>
          <p className="text-amber-100 mb-7 text-lg">
            Join your neighbours on BorrowBox today.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-amber-700 font-bold px-8 py-3.5 rounded-xl hover:bg-amber-50 transition-colors shadow-md"
          >
            <Gift size={18} />
            Create free account
          </Link>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-8 text-center text-xs text-stone-400">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Gift size={14} className="text-amber-500" />
          <span className="font-semibold text-stone-600">BorrowBox</span>
        </div>
        <p>Prototype · Local data only · Not a real financial service</p>
        <p className="mt-1">© 2024 Greenfield Apartments Community · Bengaluru</p>
      </footer>
    </div>
  );
}
