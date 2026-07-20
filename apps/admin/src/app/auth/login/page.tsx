'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { useAdminAuthStore } from '@/stores/auth.store';
import { Logo } from '@ahansk/ui';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/ui/theme-toggle';

function AdminLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const nextUrl = params.get('from') ?? '/';
  const fetchMe = useAdminAuthStore((s) => s.fetchMe);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Cookies are set by the server via Set-Cookie — no token in response body
      const { data } = await api.post('/auth/login', { ...form, recaptchaToken: 'bypass-dev' });
      if (data.data?.requiresTwoFactor) {
        toast.warning('2FA is not yet supported in admin.');
        return;
      }
      // Populate store — verifies ADMIN role via /users/me
      await fetchMe();
      const user = useAdminAuthStore.getState().user;
      if (!user) { toast.error('Access denied. Admins only.'); return; }
      toast.success('Welcome back, ' + user.name + '!');
      router.push(nextUrl);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Login failed.');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>Email</Label>
        <Input type="email" placeholder="admin@example.com"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoFocus />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Password</Label>
        <Input type="password" placeholder="••••••••"
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      </div>
      <Button type="submit" loading={loading} className="w-full">Sign In</Button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="min-h-dvh flex items-center justify-center p-4 bg-background">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 shadow-lg">
        <div className="text-center mb-8">
          <Logo frontendUrl={process.env.NEXT_PUBLIC_FRONTEND_URL} width={110} height={28} className="mx-auto mb-5" />
          <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-xs text-muted-foreground mt-1">Restricted access — administrators only</p>
        </div>
        <Suspense fallback={null}><AdminLoginForm /></Suspense>
      </div>
    </main>
  );
}
