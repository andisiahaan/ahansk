'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import api from '@/lib/api';
import type { NotificationItem } from '@ahansk/shared';

interface UnreadCountResponse { count: number }
interface NotifListResponse { items: NotificationItem[] }

async function fetchUnreadCount(): Promise<number> {
  const res = await api.get<UnreadCountResponse>('/notifications/unread-count');
  return res.data.count;
}

async function fetchRecent(): Promise<NotificationItem[]> {
  const res = await api.get<NotifListResponse>('/notifications?limit=5');
  return res.data.items;
}

async function markAllRead(): Promise<void> {
  await api.patch('/notifications/read-all');
}

export function NotificationBell() {
  const t = useTranslations('notifications');

  const { data: count = 0, refetch: refetchCount } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn:  fetchUnreadCount,
    refetchInterval: 30_000,
  });

  const { data: recent = [] } = useQuery({
    queryKey: ['notifications', 'recent'],
    queryFn:  fetchRecent,
    refetchInterval: 30_000,
  });

  const handleMarkAll = async () => {
    await markAllRead();
    void refetchCount();
  };

  return (
    <div className="relative group">
      <button
        id="notification-bell-btn"
        aria-label="Notifications"
        className="relative p-2 rounded-full hover:bg-muted transition-colors"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold bg-destructive text-destructive-foreground rounded-full">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <div className="absolute right-0 mt-2 w-80 bg-popover border border-border rounded-xl shadow-lg z-50 hidden group-focus-within:block">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-semibold text-foreground">Notifications</span>
          {count > 0 && (
            <button onClick={handleMarkAll} className="text-xs text-primary hover:underline">
              {t('markAllRead')}
            </button>
          )}
        </div>

        <ul className="divide-y divide-border max-h-80 overflow-y-auto">
          {recent.length === 0 && (
            <li className="px-4 py-6 text-sm text-muted-foreground text-center">{t('noNotifications')}</li>
          )}
          {recent.map((n) => (
            <li key={n.id} className={`px-4 py-3 hover:bg-muted/50 transition-colors ${!n.isRead ? 'bg-primary/5' : ''}`}>
              <Link href={(n.data?.url as string) ?? '/notifications'} className="block">
                <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{n.message}</p>
              </Link>
            </li>
          ))}
        </ul>

        <div className="px-4 py-2 border-t border-border">
          <Link href="/notifications" className="text-xs text-primary hover:underline block text-center">
            View all notifications
          </Link>
        </div>
      </div>
    </div>
  );
}
