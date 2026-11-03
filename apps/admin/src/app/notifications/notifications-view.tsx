'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { Send, Users, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import { NOTIFICATION_TYPE_REGISTRY, type NotificationType } from '@ahansk/shared';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AdminNotif {
  id: number;
  type: string;
  category: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  user: { id: number; name: string; email: string };
}

interface AdminNotifPage {
  items: AdminNotif[];
  meta: { total: number };
}

interface BroadcastDto {
  type: NotificationType;
  title: string;
  message: string;
  target: 'all' | 'admins';
}

async function fetchAll(page: number): Promise<AdminNotifPage> {
  const res = await api.get<{ data: AdminNotifPage }>(`/admin/notifications?page=${page}&limit=20`);
  return res.data.data;
}

const NOTIFICATION_TYPES = Object.keys(NOTIFICATION_TYPE_REGISTRY) as NotificationType[];

export function AdminNotificationsView() {
  const t = useTranslations('notifications');
  const [page, setPage] = useState(1);
  const [type, setType] = useState<NotificationType>(NOTIFICATION_TYPES[0]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState<'all' | 'admins'>('all');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-notifications', page],
    queryFn: () => fetchAll(page),
  });

  const broadcastMutation = useMutation({
    mutationFn: async (dto: BroadcastDto) => {
      await api.post('/admin/notifications/broadcast', dto);
    },
    onSuccess: () => {
      toast.success(t('broadcast.success'));
      setTitle('');
      setMessage('');
      void refetch();
    },
    onError: () => {
      toast.error('Failed to send broadcast');
    },
  });

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    broadcastMutation.mutate({ type, title, message, target });
  };

  const total = data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Broadcast Composer (1 col) */}
      <div className="lg:col-span-1 space-y-6">
        <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
          <div className="border-b border-border/60 pb-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Send className="size-4 text-primary" />
              <span>{t('broadcast.title')}</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">{t('broadcast.subtitle')}</p>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-4">
            {/* Target Audience Cards */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{t('broadcast.targetLabel')}</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTarget('all')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    target === 'all'
                      ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/20'
                      : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  }`}
                >
                  <Users className="size-4 mb-1" />
                  <p className="text-xs font-bold">{t('broadcast.targetAll')}</p>
                  <p className="text-[0.65rem] opacity-80 line-clamp-1">{t('broadcast.targetAllDesc')}</p>
                </button>

                <button
                  type="button"
                  onClick={() => setTarget('admins')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    target === 'admins'
                      ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/20'
                      : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  }`}
                >
                  <ShieldCheck className="size-4 mb-1" />
                  <p className="text-xs font-bold">{t('broadcast.targetAdmins')}</p>
                  <p className="text-[0.65rem] opacity-80 line-clamp-1">{t('broadcast.targetAdminsDesc')}</p>
                </button>
              </div>
            </div>

            {/* Type selector */}
            <div className="space-y-1.5">
              <Label htmlFor="type" className="text-xs font-semibold">{t('broadcast.typeLabel')}</Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as NotificationType)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
              >
                {NOTIFICATION_TYPES.filter((tp) => !NOTIFICATION_TYPE_REGISTRY[tp].adminOnly).map((tp) => (
                  <option key={tp} value={tp}>{tp}</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-semibold">{t('broadcast.titleLabel')}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('broadcast.titlePlaceholder')}
                required
                maxLength={255}
              />
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <Label htmlFor="message" className="text-xs font-semibold">{t('broadcast.messageLabel')}</Label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('broadcast.messagePlaceholder')}
                required
                maxLength={1000}
                rows={4}
                className="w-full text-xs border border-border rounded-xl p-3 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
              />
            </div>

            {/* Live Message Preview Box */}
            {(title || message) && (
              <div className="p-3.5 rounded-2xl border border-primary/20 bg-primary/5 space-y-1">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-primary">
                  {t('broadcast.previewTitle')}
                </span>
                <p className="text-xs font-bold text-foreground">{title || 'Subject'}</p>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap">{message || 'Message content…'}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={broadcastMutation.isPending}
              loading={broadcastMutation.isPending}
              className="w-full gap-2 shadow-xs"
            >
              <Send className="size-4" />
              <span>{t('broadcast.submit')}</span>
            </Button>
          </form>
        </div>
      </div>

      {/* Notifications Audit Logs (2 cols) */}
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
            <div>
              <h2 className="text-sm font-bold text-foreground">{t('history.title')}</h2>
              <p className="text-[0.72rem] text-muted-foreground">{t('history.subtitle')}</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
              {total} total
            </span>
          </div>

          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 rounded-2xl bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : data?.items.length === 0 ? (
            <p className="p-12 text-center text-xs text-muted-foreground">{t('history.empty')}</p>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60 text-muted-foreground text-xs uppercase tracking-wider border-b border-border">
                    <tr>
                      <th className="px-6 py-3.5 text-left font-semibold">{t('history.recipient')}</th>
                      <th className="px-6 py-3.5 text-left font-semibold">{t('history.type')}</th>
                      <th className="px-6 py-3.5 text-left font-semibold">{t('history.subject')}</th>
                      <th className="px-6 py-3.5 text-left font-semibold">{t('history.timestamp')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {data?.items.map((n) => (
                      <tr key={n.id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-6 py-3.5 font-medium text-foreground">{n.user?.name ?? 'Broadcast'}</td>
                        <td className="px-6 py-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[0.68rem] font-bold">
                            {n.type}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-foreground max-w-[200px] truncate">{n.title}</td>
                        <td className="px-6 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(n.created_at), 'dd MMM yyyy, HH:mm')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View (< 768px) */}
              <div className="grid grid-cols-1 divide-y divide-border/60 md:hidden">
                {data?.items.map((n) => (
                  <div key={n.id} className="p-4 space-y-1.5 hover:bg-muted/40 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[0.65rem] font-bold">
                        {n.type}
                      </span>
                      <span className="text-[0.68rem] text-muted-foreground">
                        {format(new Date(n.created_at), 'dd MMM yy')}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-foreground">{n.title}</p>
                    <p className="text-[0.7rem] text-muted-foreground">{n.message}</p>
                    <p className="text-[0.68rem] text-muted-foreground/80 pt-1">
                      To: <span className="font-medium text-foreground">{n.user?.name ?? 'All Recipients'}</span>
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Simple Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-border/60 bg-muted/10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="gap-1 text-xs"
              >
                <ChevronLeft className="size-3.5" /> Prev
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages}
                className="gap-1 text-xs"
              >
                Next <ChevronRight className="size-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
