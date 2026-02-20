import { ElementType, HTMLAttributes } from 'react';
import { cn } from './utils';

type PanelProps<T extends ElementType> = {
  as?: T;
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'className'>;

export function Panel<T extends ElementType = 'div'>({ as, className, ...props }: PanelProps<T>) {
  const Component = as ?? 'div';
  return <Component className={cn('agri-panel', className)} {...props} />;
}
