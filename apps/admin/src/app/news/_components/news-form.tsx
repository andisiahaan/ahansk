'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Save, Pin, Globe, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RichEditor } from '@/components/rich-editor';
import { PageLayout, PageHeader } from '@/components/ui/page-layout';

export interface NewsFormState {
  title: string;
  slug: string;
  content: string;
  type: string;
  is_published: boolean;
  is_pinned: boolean;
  published_at: string;
  expires_at: string;
}

interface NewsFormProps {
  isNew: boolean;
  form: NewsFormState;
  saving: boolean;
  onCancel: () => void;
  onSave: () => void;
  setForm: React.Dispatch<React.SetStateAction<NewsFormState>>;
}

export function NewsForm({ isNew, form, saving, onCancel, onSave, setForm }: NewsFormProps) {
  const t = useTranslations('news');

  const f = (k: keyof NewsFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setForm((p) =>
      isNew
        ? { ...p, title, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') }
        : { ...p, title }
    );
  };

  return (
    <PageLayout>
      <PageHeader
        title={isNew ? t('create.title') : t('edit.title')}
        action={
          <Button variant="outline" size="sm" onClick={onCancel} className="gap-1.5 text-xs">
            <ArrowLeft className="size-3.5" />
            <span>{t('actions.cancel')}</span>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Content Area (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-sm font-bold text-foreground">
                {t('fields.title')}
              </Label>
              <Input
                id="title"
                value={form.title}
                onChange={handleTitleChange}
                placeholder="Announcement Headline"
                className="text-base font-semibold h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slug" className="text-xs text-muted-foreground">
                {t('fields.slug')}
              </Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={f('slug')}
                placeholder="announcement-headline"
                className="text-xs font-mono text-muted-foreground"
              />
            </div>

            <div className="space-y-1.5 pt-2">
              <Label className="text-sm font-bold text-foreground">
                {t('fields.content')}
              </Label>
              <RichEditor
                content={form.content}
                onChange={(html) => setForm((p) => ({ ...p, content: html }))}
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar: Publishing Settings (1 col) */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-foreground pb-2 border-b border-border/60">
              Publishing Controls
            </h3>

            {/* Category / Type */}
            <div className="space-y-1.5">
              <Label htmlFor="type">{t('fields.type')}</Label>
              <select
                id="type"
                value={form.type}
                onChange={f('type')}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
              >
                <option value="ANNOUNCEMENT">Announcement</option>
                <option value="UPDATE">Product Update</option>
                <option value="MAINTENANCE">Maintenance Alert</option>
              </select>
            </div>

            {/* Status Switches */}
            <div className="space-y-3 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between p-3 rounded-2xl border border-border/60 bg-muted/20">
                <div className="flex items-center gap-2">
                  <Globe className="size-4 text-primary" />
                  <div>
                    <p className="text-xs font-bold text-foreground">{t('fields.published')}</p>
                    <p className="text-[0.68rem] text-muted-foreground">Visible to users</p>
                  </div>
                </div>
                <Switch
                  checked={form.is_published}
                  onChange={(e) => setForm((p) => ({ ...p, is_published: e.target.checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl border border-border/60 bg-muted/20">
                <div className="flex items-center gap-2">
                  <Pin className="size-4 text-amber-500" />
                  <div>
                    <p className="text-xs font-bold text-foreground">{t('fields.pinned')}</p>
                    <p className="text-[0.68rem] text-muted-foreground">Keep at top of list</p>
                  </div>
                </div>
                <Switch
                  checked={form.is_pinned}
                  onChange={(e) => setForm((p) => ({ ...p, is_pinned: e.target.checked }))}
                />
              </div>
            </div>

            {/* Schedule & Expiration */}
            <div className="space-y-3 pt-2 border-t border-border/60">
              <div className="space-y-1.5">
                <Label htmlFor="published_at" className="flex items-center gap-1.5 text-xs">
                  <Calendar className="size-3.5 text-muted-foreground" />
                  <span>{t('fields.publishDate')}</span>
                </Label>
                <Input
                  id="published_at"
                  type="datetime-local"
                  value={form.published_at}
                  onChange={f('published_at')}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="expires_at" className="flex items-center gap-1.5 text-xs">
                  <Clock className="size-3.5 text-muted-foreground" />
                  <span>{t('fields.expiresAt')}</span>
                </Label>
                <Input
                  id="expires_at"
                  type="datetime-local"
                  value={form.expires_at}
                  onChange={f('expires_at')}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-border/60 space-y-2">
              <Button onClick={onSave} loading={saving} className="w-full gap-2 shadow-xs">
                <Save className="size-4" />
                <span>{t('actions.save')}</span>
              </Button>
              <Button variant="outline" onClick={onCancel} className="w-full text-xs">
                {t('actions.cancel')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
