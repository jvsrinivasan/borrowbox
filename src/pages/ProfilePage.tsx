import { Coins, Edit, LogOut, MapPin, Package, Star, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/Toast';
import { getRequests, updateUser } from '../store';

export default function ProfilePage() {
  const { user, logout, refresh } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(user?.bio ?? '');
  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const myRequests = getRequests().filter((r) => r.borrowerId === user.id || r.lenderId === user.id);
  const lendCount = myRequests.filter((r) => r.lenderId === user.id && r.status === 'completed').length;
  const borrowCount = myRequests.filter((r) => r.borrowerId === user.id && r.status === 'completed').length;
  const activeCount = myRequests.filter((r) => ['pending', 'approved', 'active'].includes(r.status)).length;

  const handleSave = () => {
    if (!name.trim()) { toast('error', 'Name cannot be empty.'); return; }
    setSaving(true);
    setTimeout(() => {
      updateUser({ ...user, name: name.trim(), bio: bio.trim() });
      refresh();
      setSaving(false);
      setEditing(false);
      toast('success', 'Profile updated!');
    }, 300);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 border-b border-stone-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-amber-300 flex items-center justify-center text-amber-900 font-extrabold text-2xl flex-shrink-0">
              {user.name[0]}
            </div>
            <div className="flex-1">
              {editing ? (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xl font-bold bg-white border border-amber-300 rounded-lg px-3 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              ) : (
                <h1 className="text-xl font-bold text-stone-900">{user.name}</h1>
              )}
              <div className="flex items-center gap-3 mt-1 text-sm text-stone-500">
                <span className="flex items-center gap-1">
                  <MapPin size={13} />
                  {user.building} · Apt {user.apartment}
                </span>
                {user.rating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star size={13} className="text-yellow-400 fill-yellow-400" />
                    {user.rating}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => { setEditing((e) => !e); setBio(user.bio ?? ''); setName(user.name); }}
              className="p-2 rounded-lg border border-stone-200 hover:bg-white text-stone-500"
              title="Edit profile"
            >
              <Edit size={15} />
            </button>
          </div>

          {editing ? (
            <div className="mt-4">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                placeholder="Tell your neighbours about yourself…"
                className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none bg-white"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="text-stone-500 text-sm px-4 py-2 rounded-lg hover:bg-stone-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            user.bio && (
              <p className="mt-3 text-sm text-stone-600 italic">"{user.bio}"</p>
            )
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 divide-x divide-stone-100 border-b border-stone-100">
          {[
            { icon: <Package size={14} />, label: 'Lends', value: lendCount },
            { icon: <UserCheck size={14} />, label: 'Borrows', value: borrowCount },
            { icon: <Coins size={14} className="text-amber-500" />, label: 'Credits', value: user.credits },
            { icon: <Star size={14} className="text-yellow-400" />, label: 'Rating', value: user.rating > 0 ? user.rating : '—' },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1 p-4">
              <div className="text-stone-400">{s.icon}</div>
              <p className="text-xl font-bold text-stone-900">{s.value}</p>
              <p className="text-xs text-stone-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="p-6">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-500">Email</span>
              <span className="text-stone-800 font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Building</span>
              <span className="text-stone-800 font-medium">{user.building}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Apartment</span>
              <span className="text-stone-800 font-medium">{user.apartment}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Member since</span>
              <span className="text-stone-800 font-medium">
                {new Date(user.joinedAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Active requests</span>
              <span className="text-stone-800 font-medium">{activeCount}</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-stone-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
