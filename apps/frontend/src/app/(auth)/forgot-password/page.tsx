'use client';
import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Logo } from '@ahansk/ui';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email, recaptchaToken: 'bypass-dev' });
      setSent(true);
    } catch { toast.error('Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <main className="min-h-dvh flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 shadow-lg">
        <div className="text-center mb-8">
          <Logo width={120} height={32} className="mx-auto mb-5" />
          <h1 className="text-2xl font-bold text-foreground">Reset password</h1>
          <p className="text-sm text-muted-foreground mt-1">We&apos;ll send a reset link to your email</p>
        </div>

        {sent ? (
          <div className="text-center space-y-3">
            <p className="text-success font-semibold">📬 Check your inbox!</p>
            <p className="text-sm text-muted-foreground">If that email exists, a reset link has been sent.</p>
            <Link href="/login" className="block mt-4 text-sm text-primary hover:underline">← Back to login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Email</Label>
              <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button type="submit" loading={loading} className="w-full">Send Reset Link</Button>
            <Link href="/login" className="text-center text-sm text-primary hover:underline">← Back to login</Link>
          </form>
        )}
      </div>
    </main>
  );
}
