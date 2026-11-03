'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  ShieldCheck,
  UserCheck,
  UserX,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { DataTable } from '@/components/ui/page-layout';

export interface AdminUserDataItem {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  email_verified_at: string | null;
}

interface UsersDataViewProps {
  users: AdminUserDataItem[];
  onToggleActive: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
}

export function UsersDataView({
  users,
  onToggleActive,
  onDelete,
}: UsersDataViewProps) {
  const t = useTranslations('users');
  const router = useRouter();

  if (users.length === 0) {
    return (
      <div className="rounded-3xl border border-border/80 bg-card p-12 text-center space-y-2">
        <p className="text-sm font-semibold text-foreground">No users found</p>
        <p className="text-xs text-muted-foreground">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <DataTable>
          <table className="w-full text-sm border-collapse">
            <thead className="bg-muted/60 text-muted-foreground text-xs uppercase tracking-wider border-b border-border">
              <tr>
                {[
                  t('fields.name'),
                  t('fields.role'),
                  t('fields.status'),
                  t('fields.verified'),
                  t('fields.actions'),
                ].map((h) => (
                  <th key={h} className="px-6 py-4 text-left font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {users.map((u) => {
                const initials = u.name.slice(0, 2).toUpperCase();
                return (
                  <tr
                    key={u.id}
                    onClick={() => router.push(`/users/${u.id}`)}
                    className="hover:bg-muted/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary text-xs font-bold ring-1 ring-border shrink-0">
                          {initials}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {u.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <ShieldCheck className="size-3" />
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={u.is_active}
                          onChange={(e) => onToggleActive(u.id, e.target.checked)}
                        />
                        <span className="text-xs text-muted-foreground">
                          {u.is_active ? t('status.active') : t('status.inactive')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {u.email_verified_at ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          <UserCheck className="size-3.5" />
                          {t('status.yes')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <UserX className="size-3.5" />
                          {t('status.no')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/users/${u.id}`)}
                          className="gap-1 text-xs"
                        >
                          <ExternalLink className="size-3" />
                          <span>{t('actions.view')}</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onDelete(u.id)}
                          className="size-8 p-0"
                          title={t('actions.delete')}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </DataTable>
      </div>

      {/* Mobile Card List View (< 768px) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {users.map((u) => {
          const initials = u.name.slice(0, 2).toUpperCase();
          return (
            <div
              key={u.id}
              onClick={() => router.push(`/users/${u.id}`)}
              className="p-4 rounded-3xl border border-border/80 bg-card space-y-3 cursor-pointer shadow-xs active:scale-[0.99] transition-transform"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary text-xs font-bold ring-1 ring-border shrink-0">
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                </div>
                <Badge variant={u.role === 'ADMIN' ? 'blue' : 'gray'}>{u.role}</Badge>
              </div>

              <div
                className="flex items-center justify-between pt-2 border-t border-border/60"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2">
                  <Switch
                    checked={u.is_active}
                    onChange={(e) => onToggleActive(u.id, e.target.checked)}
                  />
                  <span className="text-xs text-muted-foreground">
                    {u.is_active ? t('status.active') : t('status.inactive')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/users/${u.id}`)}
                  >
                    {t('actions.view')}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(u.id)}
                    className="size-8 p-0"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

