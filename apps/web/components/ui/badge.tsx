import { HTMLAttributes } from 'react';
import { cn } from './utils';

type BadgeVariant = 'emerald' | 'status' | 'amber' | 'slate';

const variants: Record<BadgeVariant, string> = {
  emerald: 'agri-badge',
  status: 'rounded-full border border-[rgba(212,175,55,0.48)] bg-[rgba(111,127,57,0.23)] text-[var(--agri-royal-gold)]',
  amber: 'rounded-full border border-[rgba(212,175,55,0.48)] bg-[rgba(185,142,44,0.22)] text-[var(--agri-royal-gold)]',
  slate: 'rounded-full border border-slate-400/30 bg-slate-500/15 text-slate-300'
};

export function Badge({ className, variant = 'emerald', ...props }: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return <span className={cn('inline-flex items-center px-3 py-1 text-xs font-bold', variants[variant], className)} {...props} />;
}
