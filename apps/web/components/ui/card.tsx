import { ElementType, HTMLAttributes } from 'react';
import { cn } from './utils';

type CardProps<T extends ElementType> = {
  as?: T;
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'className'>;

export function Card<T extends ElementType = 'div'>({ as, className, ...props }: CardProps<T>) {
  const Component = as ?? 'div';
  return <Component className={cn('rounded-2xl border border-white/10 bg-white/[0.03]', className)} {...props} />;
}
