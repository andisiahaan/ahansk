'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import api from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { PageLayout, PageHeader, Pagination } from '@/components/ui/page-layout';
import { useAdminTablePagination } from '@/hooks/use-admin-table-pagination';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { NewsForm, type NewsFormState } from './_components/news-form';
import { NewsFilterBar } from './_components/news-filter-bar';
import { NewsDataView, type AdminNewsItem } from './_components/news-data-view';

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

export default function NewsPage() {
  const t = useTranslations('news');
  const [editing, setEditing] = useState<string | number | 'new' | null>(null);
  const [form, setForm] = useState<NewsFormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const { page, setPage, resetPage } = useAdminTablePagination();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('published_at');
  const [order, setOrder] = useState('desc');

  const { data: newsData, refetch } = useQuery({
    queryKey: ['admin-news'],
    queryFn: async () => {
      const { data } = await api.get('/admin/news', { params: { limit: 100 } });
      return (data.data?.items as AdminNewsItem[]) ?? [];
    },
  });
  const items = newsData ?? [];

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
      toast.error(t('messages.loadFailed'));
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
      toast.success(t('messages.saved'));
      setEditing(null);
      setForm(EMPTY);
      await refetch();
    } catch {
      toast.error(t('messages.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/admin/news/${deletingId}`);
      await refetch();
      toast.success(t('messages.deleted'));
      setDeletingId(null);
    } catch {
      toast.error(t('messages.deleteFailed'));
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
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.slug.toLowerCase().includes(search.toLowerCase())) return false;
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
        title={t('list.title')}
        description={`${filtered.length} ${t('list.total')}`}
        action={
          <Button
            onClick={() => {
              const now = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
              setForm({ ...EMPTY, published_at: now, is_published: true });
              setEditing('new');
            }}
            className="gap-2 shadow-xs"
          >
            <Plus className="size-4" />
            <span>{t('actions.create')}</span>
          </Button>
        }
      />

      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title={t('messages.confirmDelete')}
        confirmLabel={t('actions.delete')}
        cancelLabel={t('actions.cancel')}
      />

      <NewsFilterBar
        search={search}
        setSearch={setSearch}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        order={order}
        setOrder={setOrder}
        resetPage={resetPage}
      />

      <NewsDataView
        items={filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)}
        onStartEdit={startEdit}
        onDelete={(id) => setDeletingId(id)}
      />

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
