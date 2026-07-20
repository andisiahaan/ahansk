'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichEditor } from '@/components/rich-editor';

interface Category { id: string; name: string; }

const EMPTY = { title: '', slug: '', excerpt: '', content: '', status: 'DRAFT', is_featured: false, allow_comments: true, meta_title: '', meta_description: '', meta_keywords: '', categories: [] as string[], tags: '' };

export default function BlogPostEditPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const isNew = id === 'new';
  const [form, setForm]         = useState(EMPTY);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async () => {
    const [catRes] = await Promise.all([api.get('/admin/blog/categories')]);
    setCategories(catRes.data.data ?? []);
    if (!isNew) {
      const { data } = await api.get(`/admin/blog/posts/${id}`);
      const p = data.data;
      setForm({ ...EMPTY, ...p, categories: p.categories.map((c: Category) => c.id), tags: p.tags.map((t: { name: string }) => t.name).join(', ') });
    }
  }, [id, isNew]);

  useEffect(() => { load(); }, [load]);

  const f = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      const tags = form.tags.split(',').map((s) => s.trim()).filter(Boolean);
      const body = { ...form, tags };
      if (isNew) await api.post('/admin/blog/posts', body);
      else       await api.patch(`/admin/blog/posts/${id}`, body);
      toast.success(isNew ? 'Post created.' : 'Post updated.');
      router.push('/blog');
    } catch { toast.error('Failed to save post.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">{isNew ? 'New Post' : 'Edit Post'}</h1>
        <Button variant="outline" size="sm" onClick={() => router.push('/blog')}>← Back</Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5"><Label>Title</Label><Input value={form.title} onChange={f('title')} placeholder="Post title" /></div>
          <div className="flex flex-col gap-1.5"><Label>Slug</Label><Input value={form.slug} onChange={f('slug')} placeholder="post-slug" /></div>
        </div>
        <div className="flex flex-col gap-1.5"><Label>Excerpt</Label><Input value={form.excerpt} onChange={f('excerpt')} placeholder="Short description…" /></div>
        <div className="flex flex-col gap-1.5"><Label>Content</Label><RichEditor content={form.content} onChange={(html) => setForm((p) => ({ ...p, content: html }))} /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <select value={form.status} onChange={f('status')} className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground">
              {['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5"><Label>Tags (comma-separated)</Label><Input value={form.tags} onChange={f('tags')} placeholder="nextjs, typescript, webdev" /></div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Categories</Label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <label key={c.id} className="flex items-center gap-1.5 cursor-pointer text-sm">
                <input type="checkbox" className="accent-primary" checked={form.categories.includes(c.id)}
                  onChange={(e) => setForm((p) => ({ ...p, categories: e.target.checked ? [...p.categories, c.id] : p.categories.filter((x) => x !== c.id) }))} />
                {c.name}
              </label>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" className="accent-primary" checked={form.is_featured}
              onChange={(e) => setForm((p) => ({ ...p, is_featured: e.target.checked }))} /> Featured
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" className="accent-primary" checked={form.allow_comments}
              onChange={(e) => setForm((p) => ({ ...p, allow_comments: e.target.checked }))} /> Allow comments
          </label>
        </div>
        <Button onClick={save} loading={saving} className="w-fit">Save Post</Button>
      </div>
    </div>
  );
}
