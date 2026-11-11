'use client';

import { useState, useEffect } from 'react';
import { Mail, KeyRound, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toast';

function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
}

export function ChangeEmailSection() {
  const user = useAuthStore((s) => s.user);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [currentOtp, setCurrentOtp] = useState('');
  const [ticket, setTicket] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newOtp, setNewOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const resetAll = () => {
    setStep(1);
    setPassword('');
    setCurrentOtp('');
    setTicket('');
    setNewEmail('');
    setNewOtp('');
    setCooldown(0);
  };

  // Step 1: Request OTP to Current Email
  const handleRequestCurrentOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/email-change/request-current-otp', { password });
      toast.success('Verification code sent to your current email.');
      setCooldown(60);
      setStep(2);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP from Current Email
  const handleVerifyCurrentOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post<{ data: { ticket: string } }>(
        '/auth/email-change/verify-current-otp',
        { otp: currentOtp },
      );
      setTicket(data.data.ticket);
      toast.success('Current email verified! Now enter your new email.');
      setCooldown(0);
      setStep(3);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Invalid code from current email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Request OTP to New Email
  const handleRequestNewOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newEmail.toLowerCase() === user?.email.toLowerCase()) {
      toast.error('New email must be different from current email.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/email-change/request-new-otp', {
        ticket,
        new_email: newEmail,
      });
      toast.success(`Verification code sent to ${newEmail}.`);
      setCooldown(60);
      setStep(4);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Failed to send code to new email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Finalize Email Change
  const handleConfirmChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/email-change/confirm', {
        ticket,
        new_email: newEmail,
        otp: newOtp,
      });
      toast.success('Email address updated successfully!');
      await fetchMe();
      resetAll();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Failed to confirm email change.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <Mail className="size-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Change Email Address</h2>
            <p className="text-xs text-muted-foreground">
              Current email: <span className="font-mono text-foreground">{user?.email ? maskEmail(user.email) : '—'}</span>
            </p>
          </div>
        </div>
        {step > 1 && (
          <Button variant="ghost" size="sm" onClick={resetAll} className="text-xs text-muted-foreground">
            Cancel
          </Button>
        )}
      </div>

      {/* Stepper Progress Indicator */}
      <div className="flex items-center justify-between border-y border-border py-2.5 text-xs">
        <div className={`flex items-center gap-1.5 ${step >= 1 ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
          <span className="size-5 rounded-full border flex items-center justify-center text-[10px]">1</span>
          <span>Password</span>
        </div>
        <ArrowRight className="size-3 text-muted-foreground" />
        <div className={`flex items-center gap-1.5 ${step >= 2 ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
          <span className="size-5 rounded-full border flex items-center justify-center text-[10px]">2</span>
          <span>Old OTP</span>
        </div>
        <ArrowRight className="size-3 text-muted-foreground" />
        <div className={`flex items-center gap-1.5 ${step >= 3 ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
          <span className="size-5 rounded-full border flex items-center justify-center text-[10px]">3</span>
          <span>New Email</span>
        </div>
        <ArrowRight className="size-3 text-muted-foreground" />
        <div className={`flex items-center gap-1.5 ${step >= 4 ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
          <span className="size-5 rounded-full border flex items-center justify-center text-[10px]">4</span>
          <span>New OTP</span>
        </div>
      </div>

      {/* Step 1: Current Password */}
      {step === 1 && (
        <form onSubmit={handleRequestCurrentOtp} className="space-y-4">
          <p className="text-xs text-muted-foreground">
            For security, please enter your current password. We will send a verification OTP to your current email address.
          </p>
          <div className="flex flex-col gap-1.5">
            <Label>Current Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" loading={loading} className="gap-2">
            <KeyRound className="size-4" /> Send OTP to Current Email
          </Button>
        </form>
      )}

      {/* Step 2: Verify OTP from Current Email */}
      {step === 2 && (
        <form onSubmit={handleVerifyCurrentOtp} className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Enter the 6-digit code sent to your current email (<strong>{user?.email ? maskEmail(user.email) : ''}</strong>).
          </p>
          <div className="flex flex-col gap-1.5">
            <Label>Verification Code (Current Email)</Label>
            <Input
              placeholder="6-digit code"
              maxLength={6}
              value={currentOtp}
              onChange={(e) => setCurrentOtp(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" loading={loading} className="gap-2">
              <ShieldCheck className="size-4" /> Verify Current Email
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={cooldown > 0 || loading}
              onClick={handleRequestCurrentOtp}
            >
              {cooldown > 0 ? `Resend (${cooldown}s)` : 'Resend Code'}
            </Button>
          </div>
        </form>
      )}

      {/* Step 3: Input New Email */}
      {step === 3 && (
        <form onSubmit={handleRequestNewOtp} className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Current email verified! Now enter the new email address you want to link to your account.
          </p>
          <div className="flex flex-col gap-1.5">
            <Label>New Email Address</Label>
            <Input
              type="email"
              placeholder="new@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" loading={loading} className="gap-2">
            <Mail className="size-4" /> Send OTP to New Email
          </Button>
        </form>
      )}

      {/* Step 4: Verify OTP from New Email */}
      {step === 4 && (
        <form onSubmit={handleConfirmChange} className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Enter the 6-digit code sent to your new email (<strong>{newEmail}</strong>) to confirm the change.
          </p>
          <div className="flex flex-col gap-1.5">
            <Label>Verification Code (New Email)</Label>
            <Input
              placeholder="6-digit code"
              maxLength={6}
              value={newOtp}
              onChange={(e) => setNewOtp(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" loading={loading} className="gap-2">
              <CheckCircle2 className="size-4" /> Confirm & Update Email
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={cooldown > 0 || loading}
              onClick={handleRequestNewOtp}
            >
              {cooldown > 0 ? `Resend (${cooldown}s)` : 'Resend Code'}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}

