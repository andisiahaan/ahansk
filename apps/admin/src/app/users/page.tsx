'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { UserPlus } from 'lucide-react';
import api from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { PageLayout, PageHeader, Pagination } from '@/components/ui/page-layout';
import { useAdminTablePagination } from '@/hooks/use-admin-table-pagination';
import { CreateUserModal } from './create-user-modal';
import { UsersFilterBar } from './_components/users-filter-bar';
import { UsersDataView, type AdminUserDataItem } from './_components/users-data-view';

interface UsersApiResponse {
  items: AdminUserDataItem[];
  meta: { total: number; totalPages: number };
}

export default function UsersPage() {
  const t = useTranslations('users');
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
        action={
          <Button onClick={() => setCreateModalOpen(true)} className="gap-2 shadow-xs">
            <UserPlus className="size-4" />
            <span>{t('actions.create')}</span>
          </Button>
        }
      />

      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title={t('details.confirmDelete')}
        description={t('messages.deleteWarning')}
        confirmLabel={t('actions.delete')}
        cancelLabel={t('actions.cancel')}
        isPending={deleteLoading}
      />

      <UsersFilterBar
        search={search}
        setSearch={setSearch}
        role={role}
        setRole={setRole}
        isActiveStr={isActiveStr}
        setIsActiveStr={setIsActiveStr}
        sortBy={sortBy}
        setSortBy={setSortBy}
        order={order}
        setOrder={setOrder}
        resetPage={resetPage}
      />

      {loading ? (
        <div className="p-8 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : (
        <UsersDataView
          users={users}
          onToggleActive={toggleActive}
          onDelete={(id) => setDeletingId(id)}
        />
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
