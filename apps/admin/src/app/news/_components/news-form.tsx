'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
        title={isNew ? 'New News Item' : 'Edit News Item'}
        action={
          <Button variant="outline" size="sm" onClick={onCancel}>
            ← Back
          </Button>
        }
      />
      <div className="max-w-3xl flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Title</Label>
            <Input value={form.title} onChange={handleTitleChange} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Slug</Label>
            <Input value={form.slug} onChange={f('slug')} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Type</Label>
          <select
            value={form.type}
            onChange={f('type')}
            className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground"
          >
            {['ANNOUNCEMENT', 'UPDATE', 'MAINTENANCE'].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Content</Label>
          <RichEditor content={form.content} onChange={(html) => setForm((p) => ({ ...p, content: html }))} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Publish At</Label>
            <Input type="datetime-local" value={form.published_at} onChange={f('published_at')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Expires At</Label>
            <Input type="datetime-local" value={form.expires_at} onChange={f('expires_at')} />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              className="accent-primary"
              checked={form.is_published}
              onChange={(e) => setForm((p) => ({ ...p, is_published: e.target.checked }))}
            />{' '}
            Published
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              className="accent-primary"
              checked={form.is_pinned}
              onChange={(e) => setForm((p) => ({ ...p, is_pinned: e.target.checked }))}
            />{' '}
            Pinned
          </label>
        </div>
        <Button onClick={onSave} loading={saving} className="w-fit">
          Save
        </Button>
      </div>
    </PageLayout>
  );
}
