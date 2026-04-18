import { cn } from '../../lib/utils';
import { getStatusLabel } from '../../lib/utils';

interface BadgeProps {
  status: string;
  className?: string;
}

const statusClasses: Record<string, string> = {
  open: 'badge-open',
  negotiation: 'badge-negotiation',
  price_locked: 'badge-price_locked',
  active: 'badge-active',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
  draft: 'badge-draft',
  disputed: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-display font-semibold bg-orange-50 text-orange-700',
  pending: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-display font-semibold bg-gray-100 text-gray-600',
  shortlisted: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-display font-semibold bg-blue-50 text-blue-700',
  rejected: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-display font-semibold bg-red-50 text-red-600',
  accepted: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-display font-semibold bg-emerald-50 text-emerald-700',
  available: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-display font-semibold bg-emerald-50 text-emerald-700',
  limited: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-display font-semibold bg-amber-50 text-amber-700',
  unavailable: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-display font-semibold bg-red-50 text-red-600',
};

export function Badge({ status, className }: BadgeProps): JSX.Element {
  const cls = statusClasses[status] ?? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-display font-semibold bg-gray-100 text-gray-600';
  return <span className={cn(cls, className)}>{getStatusLabel(status)}</span>;
}
