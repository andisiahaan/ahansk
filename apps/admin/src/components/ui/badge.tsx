import { cn } from '@/lib/cn';

type BadgeVariant = 'green' | 'red' | 'blue' | 'gray' | 'yellow';

interface BadgeProps {
  children: React.ReactNode;
  variant: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  green:  'bg-success/12 text-success',
  red:    'bg-destructive/12 text-destructive',
  blue:   'bg-primary/12 text-primary',
  gray:   'bg-muted text-muted-foreground',
  yellow: 'bg-warning/12 text-warning',
};

export function Badge({ children, variant, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-[0.7rem] font-bold tracking-wide whitespace-nowrap',
      variantClasses[variant],
      className,
    )}>
      {children}
    </span>
  );
}
