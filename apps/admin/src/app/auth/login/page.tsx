'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, ShieldCheck, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import { useAdminAuthStore } from '@/stores/auth.store';
import { LoginSchema, type LoginDto } from '@ahansk/shared';
import { Logo } from '@ahansk/ui';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { CaptchaWidget } from '@/components/ui/captcha-widget';
import { useRecaptcha } from '@/lib/use-recaptcha';

const TotpSchema = z.object({ code: z.string().min(6).max(11, 'Invalid code format') });
type TotpValues = z.infer<typeof TotpSchema>;

interface TotpFormProps {
  partial: string;
  onBack: () => void;
}

function TotpForm({ partial, onBack }: TotpFormProps) {
  const router = useRouter();
  const params = useSearchParams();
  const nextUrl = params.get('from') ?? '/';
  const fetchMe = useAdminAuthStore((s) => s.fetchMe);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<TotpValues>({
    resolver: zodResolver(TotpSchema),
  });

  const onSubmit = async ({ code }: TotpValues) => {
    try {
      await api.post('/auth/2fa/verify', { partialToken: partial, code });
      await fetchMe();
      const user = useAdminAuthStore.getState().user;
      if (!user) {
        toast.error('Access denied. Admins only.');
        return;
      }
      toast.success('Welcome back, ' + user.name + '!');
      router.push(nextUrl);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Invalid 2FA code. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex flex-col items-center text-center space-y-2 mb-2">
        <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20">
          <ShieldCheck className="size-6" />
        </div>
        <h2 className="text-base font-bold text-foreground">Two-Factor Authentication</h2>
        <p className="text-xs text-muted-foreground max-w-xs">
          Enter the 6-digit code from your authenticator app or an 11-character backup recovery code.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="totpCode">Authenticator or Recovery Code</Label>
        <Input
          id="totpCode"
          placeholder="000000 or XXXXX-YYYYY"
          maxLength={11}
          autoFocus
          className="text-center tracking-widest font-mono text-base h-11"
          {...register('code')}
        />
        {errors.code && <p className="text-xs text-destructive text-center">{errors.code.message}</p>}
      </div>

      <Button type="submit" loading={isSubmitting} className="w-full h-10 shadow-xs">
        Verify & Sign In
      </Button>

      <button
        type="button"
        onClick={onBack}
        className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors pt-1"
      >
        <ArrowLeft className="size-3.5" />
        <span>Back to login</span>
      </button>
    </form>
  );
}

function AdminLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const nextUrl = params.get('from') ?? '/';
  const fetchMe = useAdminAuthStore((s) => s.fetchMe);
  const { getRecaptchaToken } = useRecaptcha();
  const [twoFactor, setTwoFactor] = useState<{ partial: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginDto>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginDto) => {
    try {
      const recaptchaToken = await getRecaptchaToken('admin_login');
      const { data: res } = await api.post('/auth/login', { ...data, recaptchaToken });
      if (res.data?.requiresTwoFactor) {
        setTwoFactor({ partial: res.data.partialToken });
        return;
      }
      await fetchMe();
      const user = useAdminAuthStore.getState().user;
      if (!user) {
        toast.error('Access denied. Admins only.');
        return;
      }
      toast.success('Welcome back, ' + user.name + '!');
      router.push(nextUrl);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Login failed.');
    }
  };

  if (twoFactor) {
    return <TotpForm partial={twoFactor.partial} onBack={() => setTwoFactor(null)} />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="flex items-center gap-1.5 text-xs">
          <Mail className="size-3.5 text-muted-foreground" />
          <span>Email Address</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="admin@example.com"
          autoFocus
          className="h-10"
          {...register('email')}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="flex items-center gap-1.5 text-xs">
          <Lock className="size-3.5 text-muted-foreground" />
          <span>Password</span>
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className="h-10 pr-10"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <CaptchaWidget action="admin_login" className="flex justify-center my-1" />
      <Button type="submit" loading={isSubmitting} className="w-full h-10 shadow-xs font-semibold">
        Sign In to Admin
      </Button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="min-h-dvh flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Ambient gradient backdrops */}
      <div className="pointer-events-none absolute -top-40 -left-40 size-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 size-96 rounded-full bg-primary/10 blur-3xl" />

      <div className="absolute top-5 right-5 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-card/90 backdrop-blur-xl border border-border/80 rounded-3xl p-8 shadow-2xl space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <Logo
            frontendUrl={process.env.NEXT_PUBLIC_FRONTEND_URL}
            width={110}
            height={28}
            className="mx-auto mb-3"
          />
          <h1 className="text-xl font-bold tracking-tight text-foreground">Admin Portal</h1>
          <p className="text-xs text-muted-foreground">
            Restricted access — authorized administrators only
          </p>
        </div>

        <Suspense fallback={<div className="h-44 flex items-center justify-center text-xs text-muted-foreground animate-pulse">Loading auth…</div>}>
          <AdminLoginForm />
        </Suspense>
      </div>
    </main>
  );
}
