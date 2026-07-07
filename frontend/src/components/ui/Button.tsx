import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const VARIANTS = {
  primary: 'bg-[#7E2E32] text-[#F4F1E9] hover:bg-[#651f23] disabled:bg-[#d9cfb8]',
  outline: 'border border-[#1B1A17] text-[#1B1A17] hover:bg-[#1B1A17] hover:text-[#F4F1E9]',
  ghost:   'border border-[#E4DECF] text-[#5d5749] hover:border-[#1B1A17] hover:text-[#1B1A17]',
};

const SIZES = {
  sm: 'text-[11.5px] tracking-[0.1em] px-[18px] py-[10px]',
  md: 'text-[13px] tracking-[0.04em] px-7 py-[13px]',
  lg: 'text-[13.5px] tracking-[0.04em] px-8 py-[15px]',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', ...props }, ref) => {
    const classes = [
      'inline-flex items-center justify-center rounded-full font-mono transition-colors cursor-pointer disabled:cursor-not-allowed',
      VARIANTS[variant],
      SIZES[size],
      className,
    ].join(' ');

    return <button ref={ref} className={classes} {...props} />;
  }
);
Button.displayName = 'Button';

export { Button };
