import { type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const variants: Record<Variant, string> = {
  primary:     'bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs',
  secondary:   'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost:       'hover:bg-muted hover:text-foreground text-muted-foreground',
  outline:     'border border-border bg-transparent hover:bg-muted text-foreground shadow-xs',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xs',
};

const sizes: Record<Size, string> = {
  sm:   'h-8.5 px-3.5 text-xs  rounded-xl',
  md:   'h-10  px-4   text-sm  rounded-xl',
  lg:   'h-11  px-6   text-base rounded-2xl',
  icon: 'h-10  w-10          rounded-xl',
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

export function Button({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        'disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={loading || disabled}
      {...props}
    >
      {loading && <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  );
}
