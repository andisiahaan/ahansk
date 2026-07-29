'use client';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';
interface AlertProps { variant: AlertVariant; title?: string; message: string; onClose?: () => void; }

const CONFIG: Record<AlertVariant, { bg: string; border: string; icon: string; iconColor: string }> = {
  success: { bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.2)',  icon: '✓', iconColor: '#34d399' },
  error:   { bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)', icon: '✕', iconColor: '#f87171' },
  warning: { bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.2)',  icon: '⚠', iconColor: '#fbbf24' },
  info:    { bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)', icon: 'ℹ', iconColor: '#a78bfa' },
};

export function Alert({ variant, title, message, onClose }: AlertProps) {
  const c = CONFIG[variant];
  return (
    <div role="alert" style={{
      display: 'flex', gap: '0.625rem', padding: '0.75rem 0.875rem',
      background: c.bg, border: `1px solid ${c.border}`, borderRadius: '0.5rem',
    }}>
      <span style={{ color: c.iconColor, fontWeight: 700, fontSize: '0.8rem', lineHeight: 1.6, flexShrink: 0 }}>{c.icon}</span>
      <div style={{ flex: 1 }}>
        {title && <p style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.125rem', color: 'var(--color-text)' }}>{title}</p>}
        <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', lineHeight: 1.5 }}>{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', fontSize: '0.8rem', alignSelf: 'flex-start', padding: '0 0.125rem' }} aria-label="Close">✕</button>
      )}
    </div>
  );
}
