'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import {
  Monitor,
  Globe,
  Trash2,
  ShieldOff,
  Activity,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';

interface Session {
  id: number;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
  expires_at: string | null;
}

interface ActivityItem {
  id: number;
  type: string;
  ip_address: string | null;
  success: boolean;
  created_at: string;
}

export function UserSessionsPanel({ userId }: { userId: string | number }) {
  const t = useTranslations('users');
  const [revoking, setRevoking] = useState<number | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);
  const [tab, setTab] = useState<'sessions' | 'activity'>('sessions');

  const { data: sessions = [], refetch: refetchSessions } = useQuery({
    queryKey: ['admin-user-sessions', userId],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${userId}/sessions`);
      return (res.data.data as Session[]) ?? [];
    },
  });

  const { data: activity = [] } = useQuery({
    queryKey: ['admin-user-activity', userId],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${userId}/activity`);
      return (res.data.data as ActivityItem[]) ?? [];
    },
  });

  const revoke = async (tokenId: number) => {
    setRevoking(tokenId);
    try {
      await api.delete(`/admin/users/${userId}/sessions/${tokenId}`);
      await refetchSessions();
      toast.success(t('sessions.revoked'));
    } catch {
      toast.error('Failed to revoke session.');
    } finally {
      setRevoking(null);
    }
  };

  const revokeAll = async () => {
    if (!confirm(t('sessions.confirmRevokeAll'))) return;
    setRevokingAll(true);
    try {
      await api.delete(`/admin/users/${userId}/sessions`);
      await refetchSessions();
      toast.success(t('sessions.revokedAll'));
    } catch {
      toast.error('Failed to revoke sessions.');
    } finally {
      setRevokingAll(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-border/60 bg-muted/20">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/70 border border-border/60 w-fit">
          <button
            type="button"
            onClick={() => setTab('sessions')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              tab === 'sessions'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Monitor className="size-3.5" />
            <span>{t('sessions.title')} ({sessions.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('activity')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              tab === 'activity'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Activity className="size-3.5" />
            <span>{t('sessions.activityTitle')} ({activity.length})</span>
          </button>
        </div>

        {tab === 'sessions' && sessions.length > 0 && (
          <Button variant="destructive" size="sm" loading={revokingAll} onClick={revokeAll} className="gap-1.5 text-xs">
            <ShieldOff className="size-3.5" />
            <span>{t('sessions.revokeAll')}</span>
          </Button>
        )}
      </div>

      {/* Sessions Tab */}
      {tab === 'sessions' && (
        sessions.length === 0 ? (
          <p className="p-8 text-center text-xs text-muted-foreground">{t('sessions.noSessions')}</p>
        ) : (
          <div className="divide-y divide-border/60">
            {sessions.map((s) => (
              <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Monitor className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate max-w-sm">
                      {s.user_agent ? s.user_agent.slice(0, 50) + '…' : 'Unknown Device'}
                    </p>
                    <div className="flex items-center gap-2 text-[0.7rem] text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1">
                        <Globe className="size-3" />
                        {s.ip_address ?? '—'}
                      </span>
                      <span>•</span>
                      <span>{new Date(s.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => revoke(s.id)}
                  disabled={revoking === s.id}
                  className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 self-end sm:self-center"
                >
                  <Trash2 className="size-3.5" />
                  <span>{revoking === s.id ? t('sessions.revoking') : t('sessions.revoke')}</span>
                </Button>
              </div>
            ))}
          </div>
        )
      )}

      {/* Login Activity Tab */}
      {tab === 'activity' && (
        activity.length === 0 ? (
          <p className="p-8 text-center text-xs text-muted-foreground">{t('sessions.noActivity')}</p>
        ) : (
          <div className="divide-y divide-border/60">
            {activity.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`size-8 rounded-xl flex items-center justify-center shrink-0 ${
                    a.success ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-destructive/10 text-destructive'
                  }`}>
                    {a.success ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{a.type}</p>
                    <p className="text-[0.7rem] text-muted-foreground">{a.ip_address ?? '—'}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[0.65rem] font-bold ${
                    a.success ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-destructive/10 text-destructive'
                  }`}>
                    {a.success ? 'Success' : 'Failed'}
                  </span>
                  <p className="text-[0.68rem] text-muted-foreground mt-0.5">{new Date(a.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
