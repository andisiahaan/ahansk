'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export interface Toast { id: string; type: ToastType; message: string; duration?: number; }

type Listener = (toasts: Toast[]) => void;
let toasts: Toast[] = [];
const listeners: Set<Listener> = new Set();
function notify() { listeners.forEach((l) => l([...toasts])); }

export const toast = {
  show(type: ToastType, message: string, duration = 4000): string {
    const id = Math.random().toString(36).slice(2);
    toasts = [...toasts, { id, type, message, duration }];
    notify();
    if (duration > 0) setTimeout(() => toast.dismiss(id), duration);
    return id;
  },
  success: (m: string, d?: number) => toast.show('success', m, d),
  error:   (m: string, d?: number) => toast.show('error',   m, d),
  warning: (m: string, d?: number) => toast.show('warning', m, d),
  info:    (m: string, d?: number) => toast.show('info',    m, d),
  dismiss: (id: string) => { toasts = toasts.filter((t) => t.id !== id); notify(); },
};

const ICONS: Record<ToastType, string> = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
const COLORS: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: { bg: 'rgba(52,211,153,0.1)',   border: 'rgba(52,211,153,0.3)',  icon: '#34d399' },
  error:   { bg: 'rgba(248,113,113,0.1)',  border: 'rgba(248,113,113,0.3)', icon: '#f87171' },
  warning: { bg: 'rgba(251,191,36,0.1)',   border: 'rgba(251,191,36,0.3)',  icon: '#fbbf24' },
  info:    { bg: 'rgba(167,139,250,0.1)',  border: 'rgba(167,139,250,0.3)', icon: '#a78bfa' },
};

function ToastItem({ t }: { t: Toast }) {
  const [visible, setVisible] = useState(false);
  const c = COLORS[t.type];
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  return (
    <div onClick={() => toast.dismiss(t.id)} style={{
      display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
      padding: '0.75rem 1rem',
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: '0.5rem', backdropFilter: 'blur(12px)', cursor: 'pointer',
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      transform: visible ? 'translateX(0)' : 'translateX(120%)',
      opacity: visible ? 1 : 0,
      transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s',
      maxWidth: 340, minWidth: 220,
    }}>
      <span style={{ color: c.icon, fontWeight: 700, fontSize: '0.875rem', lineHeight: 1.5 }}>{ICONS[t.type]}</span>
      <span style={{ fontSize: '0.8rem', lineHeight: 1.5, flex: 1, color: 'var(--color-text)' }}>{t.message}</span>
    </div>
  );
}

export function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); listeners.add(setItems); return () => { listeners.delete(setItems); }; }, []);
  if (!mounted) return null;
  return createPortal(
    <div style={{ position: 'fixed', bottom: '1.25rem', right: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 9999, pointerEvents: 'none' }}>
      {items.map((t) => <div key={t.id} style={{ pointerEvents: 'auto' }}><ToastItem t={t} /></div>)}
    </div>,
    document.body,
  );
}
