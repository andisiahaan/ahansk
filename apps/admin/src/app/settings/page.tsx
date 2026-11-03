'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Sliders, Shield, Code2, Save, Sparkles, FileCode } from 'lucide-react';
import api from '@/lib/api';
import {
  SETTING_KEYS,
  DEFAULT_APP_SETTINGS,
  DEFAULT_AUTH_SETTINGS,
  DEFAULT_CUSTOM_TAGS_SETTINGS,
} from '@ahansk/shared';
import type { AuthSettings, AppGeneralSettings, CustomTagsSettings } from '@ahansk/shared';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PageLayout, PageHeader } from '@/components/ui/page-layout';
import { AuthSettingsTab } from './_components/AuthSettingsTab';

type AnySettings = AuthSettings | AppGeneralSettings | CustomTagsSettings | Record<string, unknown>;

function getDefaultSettings(key: string): AnySettings {
  if (key === SETTING_KEYS.APP) return DEFAULT_APP_SETTINGS;
  if (key === SETTING_KEYS.AUTH) return DEFAULT_AUTH_SETTINGS;
  if (key === SETTING_KEYS.CUSTOM_TAGS) return DEFAULT_CUSTOM_TAGS_SETTINGS;
  return {};
}

export default function SettingsPage() {
  const t = useTranslations('settings');
  const qc = useQueryClient();
  const [tab, setTab] = useState<string>(SETTING_KEYS.APP);
  const [drafts, setDrafts] = useState<Record<string, AnySettings>>({});
  const [saving, setSaving] = useState(false);

  const TABS = [
    { key: SETTING_KEYS.APP, label: t('tabs.app'), icon: Sliders, desc: t('tabs.appDesc') },
    { key: SETTING_KEYS.AUTH, label: t('tabs.auth'), icon: Shield, desc: t('tabs.authDesc') },
    { key: SETTING_KEYS.CUSTOM_TAGS, label: t('tabs.custom_tags'), icon: Code2, desc: t('tabs.customTagsDesc') },
  ];

  const { data: serverSettings, isLoading } = useQuery({
    queryKey: ['admin-settings', tab],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/admin/settings/${tab}`);
        return (data.data?.settings as AnySettings) ?? getDefaultSettings(tab);
      } catch {
        return getDefaultSettings(tab);
      }
    },
  });

  const values = drafts[tab] ?? serverSettings ?? getDefaultSettings(tab);

  const save = async () => {
    setSaving(true);
    try {
      await api.patch(`/admin/settings/${tab}`, { settings: values });
      toast.success(t('actions.saved'));
      await qc.invalidateQueries({ queryKey: ['admin-settings', tab] });
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[tab];
        return next;
      });
    } catch {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (k: string, v: unknown) => {
    setDrafts((prev) => ({
      ...prev,
      [tab]: { ...values, [k]: v },
    }));
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        action={
          <Button onClick={save} loading={saving} disabled={isLoading} className="gap-2 shadow-xs">
            <Save className="size-4" />
            <span>{saving ? t('actions.saving') : t('actions.save')}</span>
          </Button>
        }
      />

      {/* Segmented Tab Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {TABS.map((tabItem) => {
          const Icon = tabItem.icon;
          const isActive = tab === tabItem.key;
          return (
            <button
              key={tabItem.key}
              type="button"
              onClick={() => setTab(tabItem.key)}
              className={`p-4 rounded-3xl border text-left transition-all ${
                isActive
                  ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/20 shadow-xs'
                  : 'border-border/80 bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-1">
                <div className={`size-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  <Icon className="size-4" />
                </div>
                <h3 className="text-sm font-bold text-foreground">{tabItem.label}</h3>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">{tabItem.desc}</p>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="p-8 space-y-4">
          <div className="h-64 rounded-3xl bg-muted/40 animate-pulse" />
        </div>
      ) : (
        <div className="space-y-6">
          {tab === SETTING_KEYS.AUTH && (
            <AuthSettingsTab
              values={values as Partial<AuthSettings>}
              onChange={(key, val) => handleFieldChange(key, val)}
            />
          )}

          {tab === SETTING_KEYS.APP && (
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-5 max-w-4xl">
              <div className="border-b border-border/60 pb-3">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  <span>{t('app.title')}</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{t('app.desc')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="appName">{t('app.name')}</Label>
                  <Input
                    id="appName"
                    placeholder={t('app.namePlaceholder')}
                    value={(values as Partial<AppGeneralSettings>).name ?? ''}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tagline">{t('app.tagline')}</Label>
                  <Input
                    id="tagline"
                    placeholder={t('app.taglinePlaceholder')}
                    value={(values as Partial<AppGeneralSettings>).tagline ?? ''}
                    onChange={(e) => handleFieldChange('tagline', e.target.value)}
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="description">{t('app.description')}</Label>
                  <Textarea
                    id="description"
                    placeholder={t('app.descriptionPlaceholder')}
                    rows={3}
                    value={(values as Partial<AppGeneralSettings>).description ?? ''}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="meta_description">{t('app.metaDescription')}</Label>
                  <Input
                    id="meta_description"
                    value={(values as Partial<AppGeneralSettings>).meta_description ?? ''}
                    onChange={(e) => handleFieldChange('meta_description', e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="meta_keywords">{t('app.metaKeywords')}</Label>
                  <Input
                    id="meta_keywords"
                    value={(values as Partial<AppGeneralSettings>).meta_keywords ?? ''}
                    onChange={(e) => handleFieldChange('meta_keywords', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {tab === SETTING_KEYS.CUSTOM_TAGS && (
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-5 max-w-4xl">
              <div className="border-b border-border/60 pb-3">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <FileCode className="size-4 text-primary" />
                  <span>{t('customTags.title')}</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{t('customTags.desc')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t('customTags.headTop')}</Label>
                  <Textarea
                    rows={4}
                    placeholder="<!-- <script>...</script> -->"
                    className="font-mono text-xs"
                    value={(values as Partial<CustomTagsSettings>).headTop ?? ''}
                    onChange={(e) => handleFieldChange('headTop', e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t('customTags.headBottom')}</Label>
                  <Textarea
                    rows={4}
                    placeholder="<!-- <script>...</script> -->"
                    className="font-mono text-xs"
                    value={(values as Partial<CustomTagsSettings>).headBottom ?? ''}
                    onChange={(e) => handleFieldChange('headBottom', e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t('customTags.bodyTop')}</Label>
                  <Textarea
                    rows={4}
                    placeholder="<!-- <noscript>...</noscript> -->"
                    className="font-mono text-xs"
                    value={(values as Partial<CustomTagsSettings>).bodyTop ?? ''}
                    onChange={(e) => handleFieldChange('bodyTop', e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t('customTags.bodyBottom')}</Label>
                  <Textarea
                    rows={4}
                    placeholder="<!-- <script>...</script> -->"
                    className="font-mono text-xs"
                    value={(values as Partial<CustomTagsSettings>).bodyBottom ?? ''}
                    onChange={(e) => handleFieldChange('bodyBottom', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-2">
            <Button onClick={save} loading={saving} disabled={isLoading} className="gap-2 shadow-xs">
              <Save className="size-4" />
              <span>{saving ? t('actions.saving') : t('actions.save')}</span>
            </Button>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
