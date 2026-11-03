'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import {
  ArrowLeft,
  Trash2,
  ShieldCheck,
  UserCheck,
  UserX,
  AlertTriangle,
  KeyRound,
  ShieldAlert,
  Calendar,
  Save,
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { UserSessionsPanel } from './user-sessions-panel';

interface UserDetail {
  id: string | number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  email_verified_at: string | null;
  created_at: string;
  bans: Array<{
    id: string | number;
    reason: string;
    banned_by: string | number;
    expires_at: string | null;
    unbanned_at: string | null;
    created_at: string;
  }>;
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const t = useTranslations('users');

  const { data: user, isLoading: loading, refetch: fetchUser } = useQuery({
    queryKey: ['admin-user', id],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/admin/users/${id}`);
        return (data.data as UserDetail) ?? null;
      } catch {
        toast.error(t('messages.userNotFound'));
        router.push('/users');
        return null;
      }
    },
  });

  const [draftName, setDraftName] = useState<string | null>(null);
  const [draftEmail, setDraftEmail] = useState<string | null>(null);
  const [draftRole, setDraftRole] = useState<string | null>(null);
  const [draftIsActive, setDraftIsActive] = useState<boolean | null>(null);
  const [editPassword, setEditPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const editName = draftName ?? user?.name ?? '';
  const editEmail = draftEmail ?? user?.email ?? '';
  const editRole = draftRole ?? user?.role ?? 'USER';
  const editIsActive = draftIsActive ?? user?.is_active ?? true;

  const [banReason, setBanReason] = useState('');
  const [banExpiresAt, setBanExpiresAt] = useState('');
  const [isBanning, setIsBanning] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const payload: Record<string, unknown> = {
        name: editName,
        email: editEmail,
        role: editRole,
        is_active: editIsActive,
      };
      if (editPassword) payload['password'] = editPassword;
      await api.patch(`/admin/users/${id}`, payload);
      toast.success(t('messages.updated'));
      setEditPassword('');
      setDraftName(null);
      setDraftEmail(null);
      setDraftRole(null);
      setDraftIsActive(null);
      await fetchUser();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || t('messages.updateFailed'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!banReason.trim()) return;
    setIsBanning(true);
    try {
      await api.post(`/admin/users/${id}/ban`, {
        reason: banReason,
        expires_at: banExpiresAt ? new Date(banExpiresAt).toISOString() : null,
      });
      toast.success(t('messages.banSuccess'));
      setBanReason('');
      setBanExpiresAt('');
      await fetchUser();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || t('messages.banFailed'));
    } finally {
      setIsBanning(false);
    }
  };

  const handleUnban = async () => {
    if (!confirm(t('details.confirmLift'))) return;
    try {
      await api.post(`/admin/users/${id}/unban`);
      toast.success(t('messages.unbanSuccess'));
      await fetchUser();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || t('messages.unbanFailed'));
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('details.confirmDelete'))) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success(t('messages.deleted'));
      router.push('/users');
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || t('messages.deleteFailed'));
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-4">
        <div className="h-28 rounded-3xl bg-muted/40 animate-pulse" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-64 rounded-3xl bg-muted/40 animate-pulse" />
          <div className="h-64 rounded-3xl bg-muted/40 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const activeBan = user.bans?.find((b) => !b.unbanned_at && (!b.expires_at || new Date(b.expires_at) > new Date()));
  const initials = user.name.slice(0, 2).toUpperCase();

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Navigation & Profile Hero Card */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/users')}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            <span>{t('details.back')}</span>
          </Button>

          <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-1.5 text-xs">
            <Trash2 className="size-3.5" />
            <span>{t('details.deleteAccount')}</span>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-border/60">
          <div className="flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary text-lg font-bold ring-2 ring-primary/20 shrink-0">
              {initials}
            </span>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-foreground">{user.name}</h1>
                <Badge variant={user.role === 'ADMIN' ? 'blue' : 'gray'}>
                  <ShieldCheck className="size-3 mr-1 inline" />
                  {user.role}
                </Badge>
                {activeBan && (
                  <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-destructive/10 text-destructive border border-destructive/20">
                    Banned
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {user.email_verified_at ? (
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <UserCheck className="size-3.5" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <UserX className="size-3.5" /> Unverified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Profile Settings & Security / Ban Controls */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Edit Card */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
          <div className="border-b border-border/60 pb-3">
            <h2 className="text-base font-bold text-foreground">{t('details.profile')}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Edit core user credentials and permission levels.</p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">{t('fields.name')}</Label>
              <Input id="name" value={editName} onChange={(e) => setDraftName(e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">{t('fields.email')}</Label>
              <Input id="email" type="email" value={editEmail} onChange={(e) => setDraftEmail(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="role">{t('fields.role')}</Label>
                <select
                  id="role"
                  value={editRole}
                  onChange={(e) => setDraftRole(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
                >
                  <option value="USER">{t('roles.USER')}</option>
                  <option value="ADMIN">{t('roles.ADMIN')}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status">{t('fields.status')}</Label>
                <select
                  id="status"
                  value={editIsActive ? 'true' : 'false'}
                  onChange={(e) => setDraftIsActive(e.target.value === 'true')}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
                >
                  <option value="true">{t('status.active')}</option>
                  <option value="false">{t('status.inactive')}</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="flex items-center gap-1.5">
                <KeyRound className="size-3.5 text-muted-foreground" />
                <span>{t('fields.newPassword')}</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={t('fields.passwordHint')}
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={isUpdating} loading={isUpdating} className="w-full gap-2 shadow-xs">
              <Save className="size-4" />
              <span>{t('details.saveChanges')}</span>
            </Button>
          </form>
        </div>

        {/* Security & Ban Management Card */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
          <div className="border-b border-border/60 pb-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="size-4 text-destructive" />
              <span>{t('details.banManagement')}</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Restrict or suspend user login access.</p>
          </div>

          {activeBan ? (
            <div className="p-4 rounded-2xl border border-destructive/30 bg-destructive/5 space-y-3">
              <div className="flex items-center gap-2 text-destructive font-bold text-sm">
                <AlertTriangle className="size-4 shrink-0" />
                <span>{t('details.banned')}</span>
              </div>
              <p className="text-xs text-foreground/90">
                <strong>{t('details.reason')}:</strong> {activeBan.reason}
              </p>
              <p className="text-xs text-muted-foreground">
                <strong>{t('details.expires')}:</strong>{' '}
                {activeBan.expires_at ? new Date(activeBan.expires_at).toLocaleString() : t('details.permanent')}
              </p>
              <Button variant="outline" onClick={handleUnban} className="w-full text-xs">
                {t('details.liftBan')}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleBan} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="banReason">{t('details.banReason')}</Label>
                <Input
                  id="banReason"
                  placeholder={t('details.banReasonPlaceholder')}
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="banExpires">{t('details.banExpires')}</Label>
                <Input
                  id="banExpires"
                  type="datetime-local"
                  value={banExpiresAt}
                  onChange={(e) => setBanExpiresAt(e.target.value)}
                />
              </div>

              <Button type="submit" variant="destructive" className="w-full text-xs" disabled={isBanning} loading={isBanning}>
                {t('details.banUser')}
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* User Sessions & Activity Audit Panel */}
      <UserSessionsPanel userId={id} />
    </div>
  );
}
