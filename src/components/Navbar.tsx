import {
  BookOpen,
  CircleDollarSign,
  Coins,
  Gift,
  List,
  LogIn,
  LogOut,
  Menu,
  Package,
  Plus,
  Star,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-amber-100 text-amber-800'
            : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const links = user
    ? [
        { to: '/browse', icon: <Package size={16} />, label: 'Browse' },
        { to: '/my-borrowings', icon: <BookOpen size={16} />, label: 'My Borrowings' },
        { to: '/my-listings', icon: <List size={16} />, label: 'My Listings' },
        { to: '/requests', icon: <CircleDollarSign size={16} />, label: 'Requests' },
        { to: '/transactions', icon: <Coins size={16} />, label: 'Transactions' },
        { to: '/community', icon: <Star size={16} />, label: 'Community' },
      ]
    : [];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-stone-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 font-bold text-amber-700 text-lg">
            <Gift size={22} className="text-amber-500" />
            BorrowBox
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <NavItem key={l.to} {...l} />
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link
                  to="/add-listing"
                  className="hidden sm:flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus size={15} />
                  List Item
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-sm text-stone-700 hover:text-stone-900 px-2 py-1.5 rounded-lg hover:bg-stone-100"
                >
                  <div className="w-7 h-7 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-bold text-xs">
                    {user.name[0]}
                  </div>
                  <span className="hidden sm:block">{user.name.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm text-stone-500 hover:text-red-600 px-2 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
                  title="Logout"
                >
                  <LogOut size={15} />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                <LogIn size={15} />
                Sign In
              </Link>
            )}
            {/* Hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-stone-500 hover:bg-stone-100"
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-stone-100 bg-white px-4 py-3 flex flex-col gap-1">
          {links.map((l) => (
            <NavItem key={l.to} {...l} />
          ))}
          {user && (
            <Link
              to="/add-listing"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-amber-500 text-white mt-1"
            >
              <Plus size={16} />
              List an Item
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
