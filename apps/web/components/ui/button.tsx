import Link from 'next/link';
import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from './utils';

type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'dark';
type ButtonSize = 'sm' | 'md' | 'lg';

const variants: Record<ButtonVariant, string> = {
  solid: 'bg-emerald-400 text-agri-ink-strong hover:bg-emerald-300',
  outline: 'border border-white/20 text-slate-200 hover:border-emerald-300 hover:text-emerald-300',
  ghost: 'text-slate-300 hover:text-emerald-300 hover:bg-white/5',
  dark: 'bg-agri-ink text-emerald-200 hover:bg-[#021607]'
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-2xl'
};

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

interface AgriButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, CommonProps {}

export function Button({ variant = 'solid', size = 'sm', className, ...props }: AgriButtonProps) {
  return <button className={cn('font-bold transition-colors disabled:cursor-not-allowed disabled:bg-slate-500', variants[variant], sizes[size], className)} {...props} />;
}

export function ButtonLink({ href, variant = 'solid', size = 'sm', className, children }: CommonProps & { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={cn('inline-flex items-center justify-center font-bold transition-colors', variants[variant], sizes[size], className)}>
      {children}
    </Link>
  );
}
