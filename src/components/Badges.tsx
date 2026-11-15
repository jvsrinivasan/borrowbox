import type { RequestStatus, LendingType, ItemCategory } from '../types';
import {
  Wrench, Cpu, TreePine, Baby, Gamepad2, ChefHat, Bike, Box,
  CheckCircle2, Clock, XCircle, Truck, RotateCcw, BadgeCheck,
  Gift, CircleDollarSign, Coins,
} from 'lucide-react';

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_MAP: Record<RequestStatus, { label: string; className: string; icon: React.ReactNode }> = {
  pending:   { label: 'Pending',   className: 'bg-yellow-100 text-yellow-800',  icon: <Clock size={12} /> },
  approved:  { label: 'Approved',  className: 'bg-blue-100 text-blue-800',      icon: <CheckCircle2 size={12} /> },
  rejected:  { label: 'Rejected',  className: 'bg-red-100 text-red-800',        icon: <XCircle size={12} /> },
  active:    { label: 'Active',    className: 'bg-green-100 text-green-800',    icon: <Truck size={12} /> },
  returned:  { label: 'Returned',  className: 'bg-purple-100 text-purple-800', icon: <RotateCcw size={12} /> },
  completed: { label: 'Completed', className: 'bg-stone-100 text-stone-600',   icon: <BadgeCheck size={12} /> },
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  const { label, className, icon } = STATUS_MAP[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {icon}
      {label}
    </span>
  );
}

// ─── Lending type badge ───────────────────────────────────────────────────────

const LENDING_MAP: Record<LendingType, { label: string; className: string; icon: React.ReactNode }> = {
  free:    { label: 'Free',    className: 'bg-emerald-100 text-emerald-800', icon: <Gift size={12} /> },
  paid:    { label: 'Paid',    className: 'bg-blue-100 text-blue-800',       icon: <CircleDollarSign size={12} /> },
  credits: { label: 'Credits', className: 'bg-amber-100 text-amber-800',    icon: <Coins size={12} /> },
};

export function LendingBadge({ type }: { type: LendingType }) {
  const { label, className, icon } = LENDING_MAP[type];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {icon}
      {label}
    </span>
  );
}

// ─── Category icon ────────────────────────────────────────────────────────────

const CATEGORY_MAP: Record<ItemCategory, { label: string; icon: React.ReactNode; color: string }> = {
  tools:       { label: 'Tools',       icon: <Wrench size={14} />,      color: 'bg-orange-100 text-orange-700' },
  electronics: { label: 'Electronics', icon: <Cpu size={14} />,         color: 'bg-blue-100 text-blue-700' },
  outdoor:     { label: 'Outdoor',     icon: <TreePine size={14} />,     color: 'bg-green-100 text-green-700' },
  baby:        { label: 'Baby',        icon: <Baby size={14} />,         color: 'bg-pink-100 text-pink-700' },
  games:       { label: 'Games',       icon: <Gamepad2 size={14} />,    color: 'bg-purple-100 text-purple-700' },
  appliances:  { label: 'Appliances',  icon: <ChefHat size={14} />,     color: 'bg-teal-100 text-teal-700' },
  sports:      { label: 'Sports',      icon: <Bike size={14} />,        color: 'bg-cyan-100 text-cyan-700' },
  other:       { label: 'Other',       icon: <Box size={14} />,         color: 'bg-stone-100 text-stone-600' },
};

export function CategoryBadge({ category }: { category: ItemCategory }) {
  const { label, icon, color } = CATEGORY_MAP[category];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {icon}
      {label}
    </span>
  );
}

export function getCategoryMeta(category: ItemCategory) {
  return CATEGORY_MAP[category];
}

export { CATEGORY_MAP };
