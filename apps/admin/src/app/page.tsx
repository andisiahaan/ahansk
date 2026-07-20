'use client';
import Link from 'next/link';
import api from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations('dashboard');

  const { data: usersData } = useQuery({
    queryKey: ['admin-stats-users'],
    queryFn: () => api.get('/users').then(res => res.data.data),
  });

  const { data: pagesData } = useQuery({
    queryKey: ['admin-stats-pages'],
    queryFn: () => api.get('/pages').then(res => res.data.data),
  });

  const stats = {
    users: usersData?.length ?? 0,
    pages: pagesData?.length ?? 0,
  };

  const CARDS = [
    { icon: '👥', label: t('stats.totalUsers'), href: '/users', key: 'users' as const, accent: 'text-primary' },
    { icon: '📄', label: t('stats.totalPages'), href: '/pages', key: 'pages' as const, accent: 'text-primary' },
    { icon: '⚡', label: t('stats.apiStatus'), href: '#', key: null, accent: 'text-success' },
  ];

  const QUICK = [
    { href: '/users', label: t('quickLinks.manageUsers') },
    { href: '/blog', label: t('quickLinks.manageBlog') },
    { href: '/pages', label: t('quickLinks.managePages') },
    { href: '/settings', label: t('quickLinks.appSettings') },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">{t('title')}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {CARDS.map((c) => (
          <Link key={c.label} href={c.href}
            className="group border border-border rounded-xl bg-card p-5 hover:border-primary/50 hover:shadow-lg transition-all">
            <div className="text-2xl mb-2">{c.icon}</div>
            <div className={`text-3xl font-bold ${c.accent}`}>
              {c.key ? stats[c.key] : t('quickLinks.online')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{c.label}</div>
          </Link>
        ))}
      </div>

      <div className="border border-border rounded-xl bg-card p-5">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">{t('quickLinks.title')}</h2>
        <div className="flex gap-3 flex-wrap">
          {QUICK.map((l) => (
            <Link key={l.href} href={l.href}
              className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

