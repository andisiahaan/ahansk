'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Shield, Key, Smartphone } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toast';

function ChangePasswordSection() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await api.patch('/users/me/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Password updated successfully.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Failed to update password.');
    } finally { setLoading(false); }
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Key className="size-5 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Change Password</h2>
          <p className="text-xs text-muted-foreground">Update your account password</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <Label>Current Password</Label>
          <Input type="password" placeholder="••••••••"
            value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>New Password</Label>
          <Input type="password" placeholder="Min 8 characters"
            value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Confirm New Password</Label>
          <Input type="password" placeholder="Repeat new password"
            value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
        </div>
        <Button type="submit" loading={loading}>Update Password</Button>
      </form>
    </section>
  );
}

function TwoFactorSection() {
  const user = useAuthStore((s) => s.user);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const [loading, setLoading] = useState(false);
  const [qrUri, setQrUri] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState('');

  const enable = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/2fa/enable');
      setQrUri(data.data.otpauthUrl);
      setSecret(data.data.secret);
    } catch { toast.error('Failed to start 2FA setup.'); }
    finally { setLoading(false); }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/2fa/confirm', { code });
      toast.success('Two-factor authentication enabled!');
      await fetchMe();
      setQrUri(null);
    } catch { toast.error('Invalid code. Please try again.'); }
    finally { setLoading(false); }
  };

  const disable = async () => {
    setLoading(true);
    try {
      await api.post('/auth/2fa/disable', { code });
      toast.success('Two-factor authentication disabled.');
      await fetchMe();
      setCode('');
    } catch { toast.error('Invalid code.'); }
    finally { setLoading(false); }
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
          <Smartphone className="size-5 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Two-Factor Authentication</h2>
          <p className="text-xs text-muted-foreground">
            {user?.totp_enabled ? 'Currently enabled — your account is protected.' : 'Add an extra layer of security to your account.'}
          </p>
        </div>
        <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${user?.totp_enabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
          {user?.totp_enabled ? 'Enabled' : 'Disabled'}
        </span>
      </div>

      {!user?.totp_enabled && !qrUri && (
        <Button variant="outline" loading={loading} onClick={enable}>Enable 2FA</Button>
      )}

      {qrUri && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">Scan this QR code with your authenticator app, then enter the 6-digit code.</p>
          <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrUri)}&size=180x180`}
            alt="2FA QR Code" className="rounded-xl border border-border" />
          {secret && <p className="text-xs font-mono bg-muted px-3 py-2 rounded-lg text-foreground">Manual: {secret}</p>}
          <form onSubmit={verify} className="flex gap-2">
            <Input placeholder="000000" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} className="w-36" />
            <Button type="submit" loading={loading}>Verify & Enable</Button>
          </form>
        </div>
      )}

      {user?.totp_enabled && (
        <div className="flex items-center gap-2">
          <Input placeholder="Enter 6-digit code to disable" maxLength={6} value={code}
            onChange={(e) => setCode(e.target.value)} className="w-52" />
          <Button variant="outline" loading={loading} onClick={disable} className="text-destructive border-destructive hover:bg-destructive/10">
            Disable 2FA
          </Button>
        </div>
      )}
    </section>
  );
}

export default function SecurityPage() {
  return (
    <div className="max-w-2xl space-y-6 mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="size-6 text-foreground" /> Security
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your password and two-factor authentication.</p>
      </div>
      <ChangePasswordSection />
      <TwoFactorSection />
    </div>
  );
}
