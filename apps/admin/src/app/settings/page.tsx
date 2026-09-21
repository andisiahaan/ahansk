'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
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
import { cn } from '@/lib/cn';

type AnySettings = AuthSettings | AppGeneralSettings | CustomTagsSettings | Record<string, unknown>;

export default function SettingsPage() {
  const t = useTranslations('settings');
  const [tab, setTab] = useState<string>(SETTING_KEYS.APP);
  const [values, setValues] = useState<AnySettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const TABS = [
    { key: SETTING_KEYS.APP, label: t('tabs.app') },
    { key: SETTING_KEYS.AUTH, label: t('tabs.auth') },
    { key: SETTING_KEYS.CUSTOM_TAGS, label: t('tabs.custom_tags') },
  ];

  const load = useCallback(async (key: string) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/settings/${key}`);
      const fetched = (data.data?.settings as AnySettings) ?? {};
      setValues(fetched);
    } catch {
      if (key === SETTING_KEYS.APP) setValues(DEFAULT_APP_SETTINGS);
      else if (key === SETTING_KEYS.AUTH) setValues(DEFAULT_AUTH_SETTINGS);
      else if (key === SETTING_KEYS.CUSTOM_TAGS) setValues(DEFAULT_CUSTOM_TAGS_SETTINGS);
      else setValues({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(tab);
  }, [tab, load]);

  const save = async () => {
    setSaving(true);
    try {
      await api.patch(`/admin/settings/${tab}`, { settings: values });
      toast.success(t('actions.saved'));
    } catch {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (k: string, v: unknown) => {
    setValues((prev) => ({ ...prev, [k]: v }));
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('title')}
        description="Configure system preferences, authentication policies, and external tags."
      />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border pb-3">
        {TABS.map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key)}
            className={cn(
              'px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors',
              tab === tabItem.key
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground animate-pulse py-8">Loading settings…</p>
      ) : (
        <div className="space-y-6">
          {tab === SETTING_KEYS.AUTH && (
            <AuthSettingsTab
              values={values as Partial<AuthSettings>}
              onChange={(key, val) => handleFieldChange(key, val)}
            />
          )}

          {tab === SETTING_KEYS.APP && (
            <div className="rounded-xl border border-border bg-card p-5 space-y-4 max-w-3xl">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>App Name</Label>
                  <Input
                    value={(values as Partial<AppGeneralSettings>).name ?? ''}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Tagline</Label>
                  <Input
                    value={(values as Partial<AppGeneralSettings>).tagline ?? ''}
                    onChange={(e) => handleFieldChange('tagline', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Description</Label>
                  <Textarea
                    value={(values as Partial<AppGeneralSettings>).description ?? ''}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Meta Description</Label>
                  <Input
                    value={(values as Partial<AppGeneralSettings>).meta_description ?? ''}
                    onChange={(e) => handleFieldChange('meta_description', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Meta Keywords</Label>
                  <Input
                    value={(values as Partial<AppGeneralSettings>).meta_keywords ?? ''}
                    onChange={(e) => handleFieldChange('meta_keywords', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {tab === SETTING_KEYS.CUSTOM_TAGS && (
            <div className="rounded-xl border border-border bg-card p-5 space-y-4 max-w-3xl">
              <div>
                <h3 className="text-sm font-bold text-foreground">Global Head & Body Tags</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Inject scripts, Google Analytics, or Meta tags into pages.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 pt-2">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold">Head Top (Right after &lt;head&gt;)</Label>
                  <Textarea
                    rows={3}
                    placeholder="<script>...</script>"
                    value={(values as Partial<CustomTagsSettings>).headTop ?? ''}
                    onChange={(e) => handleFieldChange('headTop', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold">Head Bottom (Before &lt;/head&gt;)</Label>
                  <Textarea
                    rows={3}
                    placeholder="<script>...</script>"
                    value={(values as Partial<CustomTagsSettings>).headBottom ?? ''}
                    onChange={(e) => handleFieldChange('headBottom', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold">Body Top (Right after &lt;body&gt;)</Label>
                  <Textarea
                    rows={3}
                    placeholder="<noscript>...</noscript>"
                    value={(values as Partial<CustomTagsSettings>).bodyTop ?? ''}
                    onChange={(e) => handleFieldChange('bodyTop', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold">Body Bottom (Before &lt;/body&gt;)</Label>
                  <Textarea
                    rows={3}
                    placeholder="<script>...</script>"
                    value={(values as Partial<CustomTagsSettings>).bodyBottom ?? ''}
                    onChange={(e) => handleFieldChange('bodyBottom', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-2">
            <Button onClick={save} loading={saving} disabled={loading}>
              {saving ? t('actions.saving') : t('actions.save')}
            </Button>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
