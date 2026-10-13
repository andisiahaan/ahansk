'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import api from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { PageLayout, PageHeader, DataTable, Pagination } from '@/components/ui/page-layout';
import { useAdminTablePagination } from '@/hooks/use-admin-table-pagination';
import { CreateUserModal } from './create-user-modal';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  email_verified_at: string | null;
}

interface UsersApiResponse {
  items: User[];
  meta: { total: number; totalPages: number };
}

export default function UsersPage() {
  const t = useTranslations('users');
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { page, setPage, resetPage } = useAdminTablePagination();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [isActiveStr, setIsActiveStr] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');

  const { data: usersData, isLoading: loading, refetch } = useQuery({
    queryKey: ['admin-users', page, search, role, isActiveStr, sortBy, order],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(role && { role }),
        ...(isActiveStr && { isActiveStr }),
        sortBy,
        order,
      });
      const res = await api.get<{ data: UsersApiResponse }>(`/admin/users?${params.toString()}`);
      return res.data?.data;
    },
  });

  const users = usersData?.items ?? [];
  const totalPages = usersData?.meta?.totalPages ?? 1;
  const total = usersData?.meta?.total ?? 0;

  const toggleActive = async (id: string, nextActive: boolean) => {
    try {
      await api.patch(`/admin/users/${id}`, { is_active: nextActive });
      toast.success(nextActive ? t('messages.enabled') : t('messages.disabled'));
      void refetch();
    } catch {
      toast.error(t('messages.updateFailed'));
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/admin/users/${deletingId}`);
      toast.success(t('messages.deleted'));
      setDeletingId(null);
      void refetch();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? t('messages.deleteFailed'));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('list.title')}
        description={`${total || users.length} ${t('list.total')}`}
        action={<Button onClick={() => setCreateModalOpen(true)}>+ {t('actions.create') || 'Add User'}</Button>}
      />

      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title={t('details.confirmDelete')}
        description={t('messages.deleteWarning') || 'This action cannot be undone.'}
        confirmLabel={t('actions.delete')}
        cancelLabel={t('actions.cancel') || 'Cancel'}
        isPending={deleteLoading}
      />

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            resetPage();
          }}
          placeholder="Search users..."
          className="h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring w-full max-w-sm"
        />
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            resetPage();
          }}
          className="h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">User</option>
        </select>
        <select
          value={isActiveStr}
          onChange={(e) => {
            setIsActiveStr(e.target.value);
            resetPage();
          }}
          className="h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All Statuses</option>
          <option value="true">Active</option>
          <option value="false">Disabled</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            resetPage();
          }}
          className="h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="created_at">Date Joined</option>
          <option value="name">Name</option>
        </select>
        <select
          value={order}
          onChange={(e) => {
            setOrder(e.target.value);
            resetPage();
          }}
          className="h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground animate-pulse">Loading…</p>
      ) : (
        <DataTable>
          <table className="w-full text-sm border-collapse min-w-[800px]">
            <thead className="bg-muted text-muted-foreground text-xs uppercase">
              <tr>
                {[t('fields.name'), t('fields.email'), t('fields.role'), t('fields.status'), t('fields.verified'), t('fields.actions')].map((h) => (
                  <th key={h} className="px-6 py-3.5 text-left font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-muted/40 transition-colors cursor-pointer" onClick={() => router.push(`/users/${u.id}`)}>
                  <td className="px-6 py-3.5 font-medium text-foreground">{u.name}</td>
                  <td className="px-6 py-3.5 text-muted-foreground">{u.email}</td>
                  <td className="px-6 py-3.5">
                    <Badge variant={u.role === 'ADMIN' ? 'blue' : 'gray'}>{t(`roles.${u.role as 'ADMIN' | 'USER'}`)}</Badge>
                  </td>
                  <td className="px-6 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <Switch checked={u.is_active} onCheckedChange={(checked) => toggleActive(u.id, checked)} />
                  </td>
                  <td className="px-6 py-3.5">
                    <Badge variant={u.email_verified_at ? 'green' : 'gray'}>
                      {u.email_verified_at ? t('status.yes') : t('status.no')}
                    </Badge>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button variant="outline" size="sm" onClick={() => router.push(`/users/${u.id}`)}>{t('actions.view')}</Button>
                      <Button variant="destructive" size="sm" onClick={() => setDeletingId(u.id)}>{t('actions.delete')}</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTable>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        hasPrev={page > 1}
        hasNext={page < totalPages}
        onPageChange={setPage}
        total={total}
        limit={20}
      />

      <CreateUserModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => void refetch()}
      />
    </PageLayout>
  );
}
