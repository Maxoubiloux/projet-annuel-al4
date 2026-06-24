import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/core/utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-[9px] font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none',
          {
            'bg-[var(--brand)] text-white hover:bg-[var(--brand-2)] shadow-sm active:scale-[0.98]':
              variant === 'primary',
            'bg-[var(--surface-2)] text-[var(--ink)] hover:bg-[var(--border)] border border-[var(--border)]':
              variant === 'secondary',
            'bg-[var(--cmy-red)] text-white hover:opacity-90 shadow-sm':
              variant === 'danger',
            'text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]':
              variant === 'ghost',
            'border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--ink)] shadow-sm':
              variant === 'outline',
          },
          {
            'h-8 px-3 text-xs gap-1.5': size === 'sm',
            'h-9 px-3.5 text-sm gap-2': size === 'md',
            'h-11 px-5 text-sm gap-2':  size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
