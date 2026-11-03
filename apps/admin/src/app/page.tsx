'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import {
  Users,
  Newspaper,
  Activity,
  ShieldCheck,
  UserPlus,
  Send,
  PlusCircle,
  Database,
  Server,
  Zap,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import api from '@/lib/api';
import { useAdminAuthStore } from '@/stores/auth.store';
import { StatCard } from '@/components/ui/stat-card';
import { PageLayout } from '@/components/ui/page-layout';
import { Badge } from '@/components/ui/badge';

interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  email_verified_at: string | null;
  created_at?: string;
}

interface NewsListItem {
  id: string | number;
  title: string;
  type: string;
  is_published: boolean;
  is_pinned: boolean;
  published_at: string | null;
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const user = useAdminAuthStore((s) => s.user);

  // Dynamic time greeting
  const hour = new Date().getHours();
  const greeting = hour < 12
    ? t('greetingMorning')
    : hour < 18
      ? t('greetingAfternoon')
      : t('greetingEvening');

  // Queries
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-stats-users'],
    queryFn: async () => {
      const res = await api.get('/admin/users', { params: { limit: 5 } });
      return res.data?.data;
    },
  });

  const { data: newsData, isLoading: newsLoading } = useQuery({
    queryKey: ['admin-stats-news'],
    queryFn: async () => {
      const res = await api.get('/admin/news', { params: { limit: 5 } });
      return res.data?.data;
    },
  });

  const totalUsers = usersData?.meta?.total ?? (Array.isArray(usersData?.items) ? usersData.items.length : 0);
  const totalNews = newsData?.meta?.total ?? (Array.isArray(newsData?.items) ? newsData.items.length : 0);
  const recentUsers: UserListItem[] = usersData?.items?.slice(0, 5) ?? [];
  const recentNews: NewsListItem[] = newsData?.items?.slice(0, 5) ?? [];

  return (
    <PageLayout>
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-r from-card via-card/90 to-primary/5 p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.7rem] font-bold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20">
              <Zap className="size-3" />
              <span>Admin Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {greeting}, {user?.name ?? 'Admin'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {t('subtitle')}
            </p>
          </div>

          {/* Hero Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/users"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
            >
              <UserPlus className="size-3.5" />
              <span>{t('quickActions.addUser')}</span>
            </Link>
            <Link
              href="/news"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border border-border bg-card hover:bg-muted text-foreground transition-colors shadow-xs"
            >
              <PlusCircle className="size-3.5" />
              <span>{t('quickActions.createNews')}</span>
            </Link>
            <Link
              href="/notifications"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border border-border bg-card hover:bg-muted text-foreground transition-colors shadow-xs"
            >
              <Send className="size-3.5" />
              <span>{t('quickActions.sendBroadcast')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('stats.totalUsers')}
          value={usersLoading ? '…' : totalUsers}
          description={t('stats.totalUsersDesc')}
          icon={Users}
          badge="Accounts"
          badgeVariant="primary"
          href="/users"
        />
        <StatCard
          title={t('stats.totalNews')}
          value={newsLoading ? '…' : totalNews}
          description={t('stats.totalNewsDesc')}
          icon={Newspaper}
          badge="Live"
          badgeVariant="success"
          href="/news"
        />
        <StatCard
          title={t('stats.apiStatus')}
          value={t('quickLinks.online')}
          description={t('stats.apiStatusDesc')}
          icon={Activity}
          badge="Operational"
          badgeVariant="success"
        />
        <StatCard
          title={t('stats.systemHealth')}
          value="Secured"
          description={t('stats.allHealthy')}
          icon={ShieldCheck}
          badge="Verified"
          badgeVariant="primary"
          href="/settings"
        />
      </div>

      {/* 2-Column Split: Recent Users & Recent News / System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Users (2/3 cols on lg) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
              <div>
                <h2 className="text-sm font-bold text-foreground">{t('recentUsers.title')}</h2>
                <p className="text-[0.72rem] text-muted-foreground">{t('recentUsers.subtitle')}</p>
              </div>
              <Link
                href="/users"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                <span>{t('recentUsers.viewAll')}</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {usersLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 rounded-xl bg-muted/40 animate-pulse" />
                ))}
              </div>
            ) : recentUsers.length === 0 ? (
              <p className="p-8 text-center text-xs text-muted-foreground">{t('recentUsers.empty')}</p>
            ) : (
              <div className="divide-y divide-border/60">
                {recentUsers.map((u) => {
                  const initials = u.name.slice(0, 2).toUpperCase();
                  return (
                    <div
                      key={u.id}
                      className="flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary text-xs font-bold ring-1 ring-border shrink-0">
                          {initials}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{u.name}</p>
                          <p className="text-[0.7rem] text-muted-foreground truncate">{u.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={u.role === 'ADMIN' ? 'blue' : 'gray'}>{u.role}</Badge>
                        <Link
                          href={`/users/${u.id}`}
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          title="View user details"
                        >
                          <ExternalLink className="size-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Infrastructure Health Card */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Server className="size-4 text-primary" />
              <span>{t('systemMetrics.title')}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">{t('systemMetrics.database')}</span>
                  <Database className="size-3.5 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-1.5 text-[0.7rem] font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{t('systemMetrics.statusConnected')}</span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">{t('systemMetrics.cache')}</span>
                  <Zap className="size-3.5 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-1.5 text-[0.7rem] font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{t('systemMetrics.statusConnected')}</span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">{t('systemMetrics.queue')}</span>
                  <Activity className="size-3.5 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-1.5 text-[0.7rem] font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{t('systemMetrics.statusConnected')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Announcements (1/3 col on lg) */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
              <div>
                <h2 className="text-sm font-bold text-foreground">{t('recentNews.title')}</h2>
                <p className="text-[0.72rem] text-muted-foreground">{t('recentNews.subtitle')}</p>
              </div>
              <Link
                href="/news"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                <span>{t('recentNews.viewAll')}</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {newsLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 rounded-xl bg-muted/40 animate-pulse" />
                ))}
              </div>
            ) : recentNews.length === 0 ? (
              <p className="p-8 text-center text-xs text-muted-foreground">{t('recentNews.empty')}</p>
            ) : (
              <div className="divide-y divide-border/60">
                {recentNews.map((n) => (
                  <div key={n.id} className="p-4 hover:bg-muted/40 transition-colors space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {n.type}
                      </span>
                      {n.is_pinned && (
                        <span className="text-[0.65rem] font-semibold text-amber-500">Pinned</span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-foreground line-clamp-1">{n.title}</p>
                    <p className="text-[0.68rem] text-muted-foreground">
                      {n.published_at ? new Date(n.published_at).toLocaleDateString() : 'Draft'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
