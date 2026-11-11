'use client';

import { useState } from 'react';
import { Shield, Key, Smartphone } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toast';
import { ChangeEmailSection } from './components/change-email-section';

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
    } finally {
      setLoading(false);
    }
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
          <Input
            type="password"
            placeholder="••••••••"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>New Password</Label>
          <Input
            type="password"
            placeholder="Min 8 characters"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Confirm New Password</Label>
          <Input
            type="password"
            placeholder="Repeat new password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          />
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
  const [disablePassword, setDisablePassword] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);

  const setup = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ data: { secret: string; qrCodeDataUrl: string } }>('/auth/2fa/setup');
      setQrUri(data.data.qrCodeDataUrl);
      setSecret(data.data.secret);
    } catch {
      toast.error('Failed to start 2FA setup.');
    } finally {
      setLoading(false);
    }
  };

  const enable = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post<{ data: { recoveryCodes: string[] } }>('/auth/2fa/enable', { code });
      toast.success('Two-factor authentication enabled!');
      await fetchMe();
      setQrUri(null);
      setCode('');
      setRecoveryCodes(data.data.recoveryCodes);
    } catch {
      toast.error('Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const disable = async () => {
    setLoading(true);
    try {
      await api.post('/auth/2fa/disable', { password: disablePassword });
      toast.success('Two-factor authentication disabled.');
      await fetchMe();
      setDisablePassword('');
    } catch {
      toast.error('Invalid password.');
    } finally {
      setLoading(false);
    }
  };

  const regenerateCodes = async () => {
    setLoading(true);
    try {
      const { data } = await api.post<{ data: { recoveryCodes: string[] } }>(
        '/auth/2fa/recovery-codes/regenerate',
        { password: disablePassword },
      );
      toast.success('Recovery codes regenerated successfully!');
      setRecoveryCodes(data.data.recoveryCodes);
      setDisablePassword('');
    } catch {
      toast.error('Invalid password.');
    } finally {
      setLoading(false);
    }
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

      {!user?.totp_enabled && !qrUri && !recoveryCodes && (
        <Button variant="outline" loading={loading} onClick={setup}>Enable 2FA</Button>
      )}

      {qrUri && !recoveryCodes && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">Scan this QR code with your authenticator app, then enter the 6-digit code.</p>
          <img src={qrUri} alt="2FA QR Code" className="rounded-xl border border-border w-44 h-44" />
          {secret && <p className="text-xs font-mono bg-muted px-3 py-2 rounded-lg text-foreground">Manual: {secret}</p>}
          <form onSubmit={enable} className="flex gap-2">
            <Input placeholder="000000" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} className="w-36" />
            <Button type="submit" loading={loading}>Verify & Enable</Button>
          </form>
        </div>
      )}

      {recoveryCodes && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-border bg-card">
            <h3 className="text-sm font-semibold text-foreground mb-2">Save your Recovery Codes</h3>
            <p className="text-xs text-muted-foreground mb-4">
              If you lose access to your authenticator app, you can use these recovery codes to log in. 
              Each code can only be used once. Keep them in a safe place.
            </p>
            <div className="grid grid-cols-2 gap-2 font-mono text-sm">
              {recoveryCodes.map((c) => <div key={c} className="p-2 bg-muted rounded text-center">{c}</div>)}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => {
              navigator.clipboard.writeText(recoveryCodes.join('\n'));
              toast.success('Copied to clipboard');
            }}>Copy Codes</Button>
            <Button variant="outline" onClick={() => setRecoveryCodes(null)}>I have saved them</Button>
          </div>
        </div>
      )}

      {user?.totp_enabled && !recoveryCodes && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">Enter your current password to manage your 2FA settings.</p>
          <div className="flex items-center gap-2">
            <Input type="password" placeholder="Current password" value={disablePassword} onChange={(e) => setDisablePassword(e.target.value)} />
            <Button variant="outline" loading={loading} onClick={regenerateCodes}>Regenerate Recovery Codes</Button>
            <Button variant="destructive" loading={loading} onClick={disable}>Disable 2FA</Button>
          </div>
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
        <p className="text-sm text-muted-foreground mt-1">Manage your password, email and two-factor authentication.</p>
      </div>
      <ChangePasswordSection />
      <TwoFactorSection />
      <ChangeEmailSection />
    </div>
  );
}

