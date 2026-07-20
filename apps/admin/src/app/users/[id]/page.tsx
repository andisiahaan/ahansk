'use client';
import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UserDetail {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  email_verified_at: string | null;
  created_at: string;
  bans: Array<{
    id: string;
    reason: string;
    banned_by: string;
    expires_at: string | null;
    unbanned_at: string | null;
    created_at: string;
  }>;
}

import { useTranslations } from 'next-intl';

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const t = useTranslations('users');
  
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [banReason, setBanReason] = useState('');
  const [banExpiresAt, setBanExpiresAt] = useState('');
  const [isBanning, setIsBanning] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      // API currently might not include bans in /users/:id. Let's assume it returns standard user info.
      // Wait, we need to modify the backend /users/:id to include active ban or bans history if possible.
      // But we can also make a separate call for ban status if not included.
      const { data } = await api.get(`/users/${id}`);
      setUser(data.data);
    } catch {
      toast.error(t('messages.userNotFound'));
      router.push('/users');
    } finally {
      setLoading(false);
    }
  }, [id, router, t]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleBan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!banReason.trim()) return;
    setIsBanning(true);
    try {
      await api.post(`/users/${id}/ban`, {
        reason: banReason,
        expires_at: banExpiresAt ? new Date(banExpiresAt).toISOString() : null,
      });
      toast.success(t('messages.banSuccess'));
      setBanReason('');
      setBanExpiresAt('');
      await fetchUser();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('messages.banFailed'));
    } finally {
      setIsBanning(false);
    }
  };

  const handleUnban = async () => {
    if (!confirm(t('details.confirmLift'))) return;
    try {
      await api.post(`/users/${id}/unban`);
      toast.success(t('messages.unbanSuccess'));
      await fetchUser();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('messages.unbanFailed'));
    }
  };

  if (loading) return <div className="animate-pulse text-muted-foreground">Loading user details...</div>;
  if (!user) return null;

  // Ideally, the backend includes bans in the user fetch. Let's check if there's any active ban.
  const activeBan = user.bans?.find((b) => !b.unbanned_at && (!b.expires_at || new Date(b.expires_at) > new Date()));

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push('/users')}>
            ← {t('details.back')}
          </Button>
          <h1 className="text-2xl font-bold text-foreground">{t('details.title')}</h1>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">{t('details.profile')}</h2>
          <div className="space-y-2 text-sm">
            <p><span className="text-muted-foreground w-24 inline-block">{t('fields.id')}:</span> {user.id}</p>
            <p><span className="text-muted-foreground w-24 inline-block">{t('fields.name')}:</span> <strong className="text-foreground">{user.name}</strong></p>
            <p><span className="text-muted-foreground w-24 inline-block">{t('fields.email')}:</span> {user.email}</p>
            <p><span className="text-muted-foreground w-24 inline-block">{t('fields.role')}:</span> {t(`roles.${user.role as 'ADMIN' | 'USER'}`)}</p>
            <p><span className="text-muted-foreground w-24 inline-block">{t('fields.verified')}:</span> {user.email_verified_at ? t('status.yes') : t('status.no')}</p>
            <p><span className="text-muted-foreground w-24 inline-block">{t('fields.joined')}:</span> {new Date(user.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="border border-destructive/20 bg-destructive/5 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-destructive">{t('details.banManagement')}</h2>
          
          {activeBan ? (
            <div className="space-y-4">
              <div className="p-3 bg-destructive/10 rounded-lg text-sm text-destructive border border-destructive/20">
                <p><strong>{t('fields.status')}:</strong> {t('details.banned')}</p>
                <p><strong>{t('details.reason')}:</strong> {activeBan.reason}</p>
                <p><strong>{t('details.expires')}:</strong> {activeBan.expires_at ? new Date(activeBan.expires_at).toLocaleString() : t('details.permanent')}</p>
              </div>
              <Button variant="outline" onClick={handleUnban} className="w-full">{t('details.liftBan')}</Button>
            </div>
          ) : (
            <form onSubmit={handleBan} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="reason">{t('details.banReason')}</Label>
                <Input
                  id="reason"
                  placeholder={t('details.banReasonPlaceholder')}
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="expires">{t('details.banExpires')}</Label>
                <Input
                  id="expires"
                  type="datetime-local"
                  value={banExpiresAt}
                  onChange={(e) => setBanExpiresAt(e.target.value)}
                />
              </div>
              <Button type="submit" variant="destructive" className="w-full" disabled={isBanning}>
                {isBanning ? t('details.banning') : t('details.banUser')}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
