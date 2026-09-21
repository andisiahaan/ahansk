'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLayout, PageHeader, DataTable, Pagination } from '@/components/ui/page-layout';
import { useAdminTablePagination } from '@/hooks/use-admin-table-pagination';
import { cn } from '@/lib/cn';
import { NewsForm, type NewsFormState } from './_components/news-form';

interface NewsItem {
  id: string | number;
  title: string;
  slug: string;
  type: string;
  is_published: boolean;
  is_pinned: boolean;
  published_at: string | null;
  expires_at: string | null;
}

const EMPTY: NewsFormState = {
  title: '',
  slug: '',
  content: '',
  type: 'ANNOUNCEMENT',
  is_published: false,
  is_pinned: false,
  published_at: '',
  expires_at: '',
};

const PAGE_SIZE = 20;

const TYPE_COLORS: Record<string, string> = {
  ANNOUNCEMENT: 'bg-primary/12 text-primary',
  UPDATE: 'bg-success/12 text-success',
  MAINTENANCE: 'bg-destructive/12 text-destructive',
};

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [editing, setEditing] = useState<string | number | 'new' | null>(null);
  const [form, setForm] = useState<NewsFormState>(EMPTY);
  const [saving, setSaving] = useState(false);

  const { page, setPage, resetPage } = useAdminTablePagination();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('published_at');
  const [order, setOrder] = useState('desc');

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/news', { params: { limit: 100 } });
      setItems(data.data?.items ?? []);
    } catch {
      toast.error('Failed to load news.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const startEdit = async (id: string | number) => {
    try {
      const { data } = await api.get(`/admin/news/${id}`);
      const n = data.data;
      setForm({
        ...EMPTY,
        ...n,
        published_at: n.published_at ? n.published_at.slice(0, 16) : '',
        expires_at: n.expires_at ? n.expires_at.slice(0, 16) : '',
      });
      setEditing(id);
    } catch {
      toast.error('Failed to load item.');
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const body = {
        ...form,
        published_at: form.published_at || null,
        expires_at: form.expires_at || null,
      };
      if (editing === 'new') await api.post('/admin/news', body);
      else await api.patch(`/admin/news/${editing}`, body);
      toast.success('Saved.');
      setEditing(null);
      setForm(EMPTY);
      await load();
    } catch {
      toast.error('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string | number) => {
    if (!confirm('Delete this news item?')) return;
    try {
      await api.delete(`/admin/news/${id}`);
      setItems((p) => p.filter((n) => n.id !== id));
      toast.success('Deleted.');
    } catch {
      toast.error('Failed to delete.');
    }
  };

  if (editing !== null) {
    return (
      <NewsForm
        isNew={editing === 'new'}
        form={form}
        saving={saving}
        setForm={setForm}
        onCancel={() => {
          setEditing(null);
          setForm(EMPTY);
        }}
        onSave={save}
      />
    );
  }

  const filtered = items.filter((n) => {
    if (search && !n.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter && n.type !== typeFilter) return false;
    if (statusFilter === 'PUBLISHED' && !n.is_published) return false;
    if (statusFilter === 'DRAFT' && n.is_published) return false;
    return true;
  });

  filtered.sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'title') cmp = a.title.localeCompare(b.title);
    else if (sortBy === 'published_at') {
      cmp = new Date(a.published_at || 0).getTime() - new Date(b.published_at || 0).getTime();
    }
    return order === 'asc' ? cmp : -cmp;
  });

  return (
    <PageLayout>
      <PageHeader
        title="News"
        description={`${filtered.length} items`}
        action={
          <Button
            onClick={() => {
              const now = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
              setForm({ ...EMPTY, published_at: now, is_published: true });
              setEditing('new');
            }}
          >
            + New Item
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Input
          placeholder="Search news…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            resetPage();
          }}
          className="max-w-sm"
        />
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            resetPage();
          }}
          className="h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All Types</option>
          <option value="ANNOUNCEMENT">ANNOUNCEMENT</option>
          <option value="UPDATE">UPDATE</option>
          <option value="MAINTENANCE">MAINTENANCE</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            resetPage();
          }}
          className="h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All Statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            resetPage();
          }}
          className="h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="published_at">Published At</option>
          <option value="title">Title</option>
        </select>
        <select
          value={order}
          onChange={(e) => {
            setOrder(e.target.value);
            resetPage();
          }}
          className="h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      <DataTable>
        <table className="w-full text-sm border-collapse min-w-[800px]">
          <thead className="bg-muted text-muted-foreground text-xs uppercase">
            <tr>
              {['Title', 'Type', 'Pinned', 'Published', 'Expires', 'Actions'].map((h) => (
                <th key={h} className="px-6 py-3.5 text-left font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((n) => (
              <tr
                key={n.id}
                className="hover:bg-muted/40 transition-colors cursor-pointer"
                onClick={() => startEdit(n.id)}
              >
                <td className="px-6 py-3.5 font-medium text-foreground max-w-[280px] truncate">{n.title}</td>
                <td className="px-6 py-3.5">
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-[0.7rem] font-bold tracking-wide',
                      TYPE_COLORS[n.type] ?? ''
                    )}
                  >
                    {n.type}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-xs text-muted-foreground">{n.is_pinned ? '📌' : '—'}</td>
                <td className="px-6 py-3.5 text-xs text-muted-foreground">
                  {n.is_published ? (n.published_at ? new Date(n.published_at).toLocaleDateString() : 'Yes') : 'Draft'}
                </td>
                <td className="px-6 py-3.5 text-xs text-muted-foreground">
                  {n.expires_at ? new Date(n.expires_at).toLocaleDateString() : '—'}
                </td>
                <td className="px-6 py-3.5">
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="sm" onClick={() => startEdit(n.id)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => del(n.id)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                  No news items
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </DataTable>

      <Pagination
        page={page}
        totalPages={Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))}
        hasPrev={page > 1}
        hasNext={page < Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))}
        onPageChange={setPage}
        total={filtered.length}
        limit={PAGE_SIZE}
      />
    </PageLayout>
  );
}
