import Link from 'next/link';
import { Logo } from '@ahansk/ui';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Home' };

export default function HomePage() {
  return (
    <main className="auth-bg" style={{ flexDirection: 'column', gap: '3rem' }}>
      <div style={{ textAlign: 'center', maxWidth: 640 }}>
        <Logo width={160} height={42} className="mx-auto mb-6" />
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1 }}>
          <span className="gradient-text">Production-Ready</span>
          <br />Full-Stack Starter Kit
        </h1>
        <p style={{ color: 'var(--color-muted)', marginTop: '1rem', fontSize: '1.1rem', lineHeight: 1.6 }}>
          NestJS · Next.js · Prisma · TypeScript · pnpm Monorepo
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
          <Link href="/register">
            <button className="btn-primary" style={{ width: 'auto', padding: '0.75rem 2rem' }}>
              Get Started
            </button>
          </Link>
          <Link href="/login">
            <button style={{
              padding: '0.75rem 2rem', borderRadius: '0.5rem', fontWeight: 600,
              border: '1px solid var(--color-border)', background: 'transparent',
              color: 'var(--color-text)', cursor: 'pointer',
            }}>
              Sign In
            </button>
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', maxWidth: 800, width: '100%' }}>
        {[
          { icon: '🔐', title: 'Auth System', desc: 'JWT, Google OAuth, 2FA TOTP' },
          { icon: '⚡', title: 'Edge Ready', desc: 'Next.js App Router with RSC' },
          { icon: '🎨', title: 'Admin Panel', desc: 'Full CRUD at port 10003' },
          { icon: '🌍', title: 'i18n Ready', desc: 'Translate to any language' },
        ].map((f) => (
          <div key={f.title} className="glass" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{f.icon}</div>
            <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{f.title}</h3>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem' }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
