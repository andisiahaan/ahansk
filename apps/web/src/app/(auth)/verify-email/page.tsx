'use client';
import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Logo } from '@ahansk/ui';
import { Button } from '@/components/ui/button';

function VerifyEmailContent() {
  const t = useTranslations('auth');
  const params = useSearchParams();
  const token = params.get('token');

  const { isPending, error, isSuccess } = useQuery({
    queryKey: ['verify-email', token],
    queryFn: async () => {
      if (!token) throw new Error(t('verifyEmail.invalidToken'));
      const res = await api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
      return res.data;
    },
    retry: false,
    enabled: !!token,
  });

  const isInvalidToken = !token;
  const status = isPending && !isInvalidToken ? 'verifying' : (isSuccess ? 'success' : 'error');
  const errorMessage = isInvalidToken
    ? t('verifyEmail.invalidToken')
    : ((error as { response?: { data?: { message?: string } } })?.response?.data?.message || (error as Error)?.message || t('verifyEmail.failed'));

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      {status === 'verifying' && (
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">{t('verifyEmail.verifying')}</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
            <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-medium text-foreground">{t('verifyEmail.success')}</p>
          <Link href="/login">
            <Button>{t('verifyEmail.goToLogin')}</Button>
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-sm font-medium text-destructive">{errorMessage}</p>
          <Link href="/login" className="text-xs font-semibold text-primary hover:underline">
            {t('verifyEmail.backToLogin')}
          </Link>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  const t = useTranslations('auth');

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <Logo />
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {t('verifyEmail.title')}
          </h1>
        </div>
        <Suspense fallback={<div className="text-center text-sm text-muted-foreground animate-pulse">Loading…</div>}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
