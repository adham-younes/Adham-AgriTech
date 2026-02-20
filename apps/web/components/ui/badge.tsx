import { HTMLAttributes } from 'react';
import { cn } from './utils';

type BadgeVariant = 'emerald' | 'status' | 'amber' | 'slate';

const variants: Record<BadgeVariant, string> = {
  emerald: 'agri-badge',
  status: 'rounded-full border border-emerald-400/30 bg-emerald-500/15 text-emerald-300',
  amber: 'rounded-full border border-amber-400/30 bg-amber-500/15 text-amber-300',
  slate: 'rounded-full border border-slate-400/30 bg-slate-500/15 text-slate-300'
};

export function Badge({ className, variant = 'emerald', ...props }: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return <span className={cn('inline-flex items-center px-3 py-1 text-xs font-bold', variants[variant], className)} {...props} />;
}
