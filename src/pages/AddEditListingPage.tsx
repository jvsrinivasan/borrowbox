import { AlertCircle, ImagePlus, Package, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CATEGORY_MAP } from '../components/Badges';
import { toast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { deleteItem, getItemById, saveItem } from '../store';
import type { Item, ItemCategory, LendingType } from '../types';

const CATEGORIES = Object.entries(CATEGORY_MAP) as [ItemCategory, (typeof CATEGORY_MAP)[ItemCategory]][];

const SAMPLE_IMAGES = [
  { label: 'Tools', url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80' },
  { label: 'Electronics', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80' },
  { label: 'Outdoor', url: 'https://images.unsplash.com/photo-1487730116645-74489c95b41b?w=600&q=80' },
  { label: 'Games', url: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=600&q=80' },
  { label: 'Baby', url: 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=600&q=80' },
  { label: 'Sports', url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&q=80' },
];

interface FormState {
  title: string;
  description: string;
  category: ItemCategory;
  imageUrl: string;
  lendingType: LendingType;
  dailyRate: string;
  creditRate: string;
  deposit: string;
  available: boolean;
}

const empty: FormState = {
  title: '',
  description: '',
  category: 'tools',
  imageUrl: '',
  lendingType: 'free',
  dailyRate: '',
  creditRate: '',
  deposit: '',
  available: true,
};

export default function AddEditListingPage() {
  const { id } = useParams<{ id?: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      const item = getItemById(id);
      if (item && item.lenderId === user?.id) {
        setForm({
          title: item.title,
          description: item.description,
          category: item.category,
          imageUrl: item.imageUrl,
          lendingType: item.lendingType,
          dailyRate: item.dailyRate?.toString() ?? '',
          creditRate: item.creditRate?.toString() ?? '',
          deposit: item.deposit?.toString() ?? '',
          available: item.available,
        });
      }
    }
  }, [id, user]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim()) e.title = 'Title is required.';
    if (!form.description.trim()) e.description = 'Description is required.';
    if (form.description.trim().length < 20) e.description = 'Description must be at least 20 characters.';
    if (!form.imageUrl.trim()) e.imageUrl = 'Please provide an image URL or select a sample.';
    if (form.lendingType === 'paid') {
      const r = parseFloat(form.dailyRate);
      if (!form.dailyRate || isNaN(r) || r <= 0) e.dailyRate = 'Enter a valid daily rate (₹).';
    }
    if (form.lendingType === 'credits') {
      const r = parseFloat(form.creditRate);
      if (!form.creditRate || isNaN(r) || r <= 0) e.creditRate = 'Enter a valid credit rate.';
    }
    if (form.deposit) {
      const d = parseFloat(form.deposit);
      if (isNaN(d) || d < 0) e.deposit = 'Enter a valid deposit amount.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      const item: Item = {
        id: id ?? `i${Date.now()}`,
        lenderId: user.id,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        imageUrl: form.imageUrl.trim(),
        lendingType: form.lendingType,
        dailyRate: form.lendingType === 'paid' ? parseFloat(form.dailyRate) : undefined,
        creditRate: form.lendingType === 'credits' ? parseFloat(form.creditRate) : undefined,
        deposit: form.deposit ? parseFloat(form.deposit) : undefined,
        available: form.available,
        createdAt: id ? (getItemById(id)?.createdAt ?? new Date().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
      };
      saveItem(item);
      setSaving(false);
      toast('success', isEdit ? 'Listing updated!' : 'Item listed successfully!');
      navigate('/my-listings');
    }, 400);
  };

  const handleDelete = () => {
    if (!id) return;
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    deleteItem(id);
    toast('info', 'Listing deleted.');
    navigate('/my-listings');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <Package size={22} className="text-amber-600" />
          {isEdit ? 'Edit Listing' : 'List an Item'}
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          {isEdit ? 'Update your listing details.' : 'Share something with your neighbours.'}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Item Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="e.g. Cordless Drill"
            className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${errors.title ? 'border-red-400' : 'border-stone-300'}`}
          />
          {errors.title && <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.title}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            placeholder="Describe the item — brand, model, condition, accessories included…"
            className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none ${
              errors.description ? 'border-red-400' : 'border-stone-300'
            }`}
          />
          {errors.description && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.description}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Category <span className="text-red-500">*</span></label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(([key, meta]) => (
              <button
                key={key}
                type="button"
                onClick={() => set('category', key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  form.category === key
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-amber-300'
                }`}
              >
                {meta.icon}
                {meta.label}
              </button>
            ))}
          </div>
        </div>

        {/* Image */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Image URL <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => set('imageUrl', e.target.value)}
              placeholder="https://…"
              className={`flex-1 border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                errors.imageUrl ? 'border-red-400' : 'border-stone-300'
              }`}
            />
            {form.imageUrl && (
              <img
                src={form.imageUrl}
                alt="preview"
                className="w-10 h-10 rounded-lg object-cover border border-stone-200"
                onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
              />
            )}
          </div>
          {errors.imageUrl && <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.imageUrl}</p>}
          <div className="mt-2">
            <p className="text-xs text-stone-500 mb-1.5 flex items-center gap-1"><ImagePlus size={11} /> Or pick a sample:</p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_IMAGES.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => set('imageUrl', s.url)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs border transition-colors ${
                    form.imageUrl === s.url ? 'border-amber-400 bg-amber-50' : 'border-stone-200 hover:border-amber-300'
                  }`}
                >
                  <img src={s.url} alt={s.label} className="w-5 h-5 rounded object-cover" />
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lending type */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Lending Type <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-3 gap-2">
            {(['free', 'paid', 'credits'] as LendingType[]).map((lt) => (
              <button
                key={lt}
                type="button"
                onClick={() => set('lendingType', lt)}
                className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                  form.lendingType === lt
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-amber-300'
                }`}
              >
                {lt === 'free' ? '🎁 Free' : lt === 'paid' ? '💳 Paid (₹)' : '🪙 Credits'}
              </button>
            ))}
          </div>
        </div>

        {form.lendingType === 'paid' && (
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Daily Rate (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.dailyRate}
              onChange={(e) => set('dailyRate', e.target.value)}
              placeholder="e.g. 100"
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${errors.dailyRate ? 'border-red-400' : 'border-stone-300'}`}
            />
            {errors.dailyRate && <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.dailyRate}</p>}
          </div>
        )}
        {form.lendingType === 'credits' && (
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Daily Rate (credits) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.creditRate}
              onChange={(e) => set('creditRate', e.target.value)}
              placeholder="e.g. 10"
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${errors.creditRate ? 'border-red-400' : 'border-stone-300'}`}
            />
            {errors.creditRate && <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.creditRate}</p>}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Security Deposit (₹, optional)</label>
          <input
            type="number"
            value={form.deposit}
            onChange={(e) => set('deposit', e.target.value)}
            placeholder="e.g. 500"
            className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${errors.deposit ? 'border-red-400' : 'border-stone-300'}`}
          />
          {errors.deposit && <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.deposit}</p>}
        </div>

        {/* Availability toggle */}
        {isEdit && (
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => set('available', !form.available)}
              className={`w-10 h-5 rounded-full relative transition-colors ${form.available ? 'bg-emerald-400' : 'bg-stone-300'}`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.available ? 'left-5' : 'left-0.5'}`}
              />
            </div>
            <span className="text-sm text-stone-700">
              {form.available ? 'Available for borrowing' : 'Marked as unavailable'}
            </span>
          </label>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors"
          >
            <Save size={16} />
            {saving ? 'Saving…' : isEdit ? 'Update Listing' : 'Publish Listing'}
          </button>
          {isEdit && (
            <button
              onClick={handleDelete}
              className="px-4 py-2.5 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 text-sm font-medium transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
