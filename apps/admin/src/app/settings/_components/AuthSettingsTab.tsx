'use client';

import { useTranslations } from 'next-intl';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/cn';
import { ShieldCheck, Lock, AlertCircle, KeySquare } from 'lucide-react';
import type { AuthSettings } from '@ahansk/shared';

interface AuthSettingsTabProps {
  values: Partial<AuthSettings>;
  onChange: (key: keyof AuthSettings, value: unknown) => void;
}

export function AuthSettingsTab({ values, onChange }: AuthSettingsTabProps) {
  const t = useTranslations('settings');
  const isGoogleOnly = Boolean(values.is_google_auth_only);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Google Auth Only Setting */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Lock className="size-4 text-primary" />
            <span>{t('auth.googleAuthOnly.title')}</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('auth.googleAuthOnly.description')}
          </p>
        </div>

        <div className="flex items-start gap-3.5 p-4 rounded-2xl border border-border/60 bg-muted/20">
          <Switch
            checked={isGoogleOnly}
            onChange={(e) => {
              const checked = e.target.checked;
              onChange('is_google_auth_only', checked);
              if (checked) {
                onChange('is_google_auth_enabled', true);
              }
            }}
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              {t('auth.googleAuthOnly.label')}
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">
              {t('auth.googleAuthOnly.description')}
            </span>
          </div>
        </div>

        {isGoogleOnly && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-600 dark:text-amber-400 flex items-start gap-2.5">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{t('auth.googleAuthOnly.activeNotice')}</span>
          </div>
        )}
      </div>

      {/* Standard Auth Settings — Only shown when google_auth_only is NOT checked */}
      <div className={cn('space-y-6 transition-all duration-200', isGoogleOnly && 'hidden')}>
        {/* Standard Authentication & Registration */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
          <div className="border-b border-border/60 pb-3">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              <span>{t('auth.standard.title')}</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('auth.standard.desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3.5 rounded-2xl border border-border/60 bg-muted/20 p-4">
              <Switch
                checked={Boolean(values.is_registration_enabled)}
                onChange={(e) => onChange('is_registration_enabled', e.target.checked)}
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">
                  {t('auth.standard.is_registration_enabled.label')}
                </span>
                <span className="text-xs text-muted-foreground mt-0.5">
                  {t('auth.standard.is_registration_enabled.description')}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3.5 rounded-2xl border border-border/60 bg-muted/20 p-4">
              <Switch
                checked={Boolean(values.is_email_verification_required)}
                onChange={(e) => onChange('is_email_verification_required', e.target.checked)}
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">
                  {t('auth.standard.is_email_verification_required.label')}
                </span>
                <span className="text-xs text-muted-foreground mt-0.5">
                  {t('auth.standard.is_email_verification_required.description')}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3.5 rounded-2xl border border-border/60 bg-muted/20 p-4">
              <Switch
                checked={Boolean(values.is_google_auth_enabled)}
                onChange={(e) => onChange('is_google_auth_enabled', e.target.checked)}
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">
                  {t('auth.standard.is_google_auth_enabled.label')}
                </span>
                <span className="text-xs text-muted-foreground mt-0.5">
                  {t('auth.standard.is_google_auth_enabled.description')}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3.5 rounded-2xl border border-border/60 bg-muted/20 p-4">
              <Switch
                checked={Boolean(values.is_2fa_enabled)}
                onChange={(e) => onChange('is_2fa_enabled', e.target.checked)}
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">
                  {t('auth.standard.is_2fa_enabled.label')}
                </span>
                <span className="text-xs text-muted-foreground mt-0.5">
                  {t('auth.standard.is_2fa_enabled.description')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Password Policies */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
          <div className="border-b border-border/60 pb-3">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <KeySquare className="size-4 text-primary" />
              <span>{t('auth.security.title')}</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('auth.security.desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t('auth.security.password_min_length.label')}
              </Label>
              <Input
                type="number"
                min={6}
                max={32}
                value={values.password_min_length ?? 8}
                onChange={(e) => onChange('password_min_length', Number(e.target.value))}
              />
              <span className="text-[0.7rem] text-muted-foreground">
                {t('auth.security.password_min_length.description')}
              </span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t('auth.security.session_lifetime_days.label')}
              </Label>
              <Input
                type="number"
                min={1}
                max={90}
                value={values.session_lifetime_days ?? 7}
                onChange={(e) => onChange('session_lifetime_days', Number(e.target.value))}
              />
              <span className="text-[0.7rem] text-muted-foreground">
                {t('auth.security.session_lifetime_days.description')}
              </span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t('auth.security.max_login_attempts.label')}
              </Label>
              <Input
                type="number"
                min={3}
                max={20}
                value={values.max_login_attempts ?? 5}
                onChange={(e) => onChange('max_login_attempts', Number(e.target.value))}
              />
              <span className="text-[0.7rem] text-muted-foreground">
                {t('auth.security.max_login_attempts.description')}
              </span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t('auth.security.lockout_duration_minutes.label')}
              </Label>
              <Input
                type="number"
                min={1}
                max={1440}
                value={values.lockout_duration_minutes ?? 15}
                onChange={(e) => onChange('lockout_duration_minutes', Number(e.target.value))}
              />
              <span className="text-[0.7rem] text-muted-foreground">
                {t('auth.security.lockout_duration_minutes.description')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
