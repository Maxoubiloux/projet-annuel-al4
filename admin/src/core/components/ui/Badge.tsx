import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cn } from '@/core/utils/cn';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 rounded-[999px] px-2 py-0.5 text-[9.5px] font-medium tracking-[0.04em] uppercase whitespace-nowrap',
          {
            'bg-[color-mix(in_srgb,var(--faint)_16%,transparent)] text-[var(--faint)]':
              variant === 'default',
            'bg-[color-mix(in_srgb,var(--cmy-green)_13%,transparent)] text-[var(--cmy-green)]':
              variant === 'success',
            'bg-[color-mix(in_srgb,var(--cmy-amber)_15%,transparent)] text-[var(--cmy-amber)]':
              variant === 'warning',
            'bg-[color-mix(in_srgb,var(--cmy-red)_14%,transparent)] text-[var(--cmy-red)]':
              variant === 'danger',
            'bg-[var(--brand-tint)] text-[var(--brand)]':
              variant === 'info',
            'border border-[var(--border)] text-[var(--muted)] bg-transparent':
              variant === 'outline',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

export { Badge };
