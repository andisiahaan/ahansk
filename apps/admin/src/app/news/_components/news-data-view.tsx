'use client';

import { useTranslations } from 'next-intl';
import { Pin, CheckCircle2, FileText, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/page-layout';

export interface AdminNewsItem {
  id: string | number;
  title: string;
  slug: string;
  type: string;
  is_published: boolean;
  is_pinned: boolean;
  published_at: string | null;
  expires_at: string | null;
}

interface NewsDataViewProps {
  items: AdminNewsItem[];
  onStartEdit: (id: string | number) => void;
  onDelete: (id: string | number) => void;
}

export function NewsDataView({ items, onStartEdit, onDelete }: NewsDataViewProps) {
  const t = useTranslations('news');

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'ANNOUNCEMENT':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'UPDATE':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'MAINTENANCE':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border/60';
    }
  };

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-border/80 bg-card p-12 text-center space-y-2">
        <p className="text-sm font-semibold text-foreground">{t('messages.empty')}</p>
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
                  t('fields.title'),
                  t('fields.type'),
                  t('fields.pinned'),
                  t('fields.published'),
                  t('fields.expiresAt'),
                  t('fields.actions'),
                ].map((h) => (
                  <th key={h} className="px-6 py-4 text-left font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {items.map((n) => (
                <tr
                  key={n.id}
                  onClick={() => onStartEdit(n.id)}
                  className="hover:bg-muted/40 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 max-w-sm">
                    <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{n.slug}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold uppercase tracking-wider border ${getTypeBadgeClass(n.type)}`}>
                      {n.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {n.is_pinned ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500">
                        <Pin className="size-3.5 rotate-45" />
                        <span>Pinned</span>
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {n.is_published ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="size-3.5" />
                        <span>{n.published_at ? new Date(n.published_at).toLocaleDateString() : 'Yes'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <FileText className="size-3.5" />
                        <span>Draft</span>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {n.expires_at ? new Date(n.expires_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onStartEdit(n.id)}
                        className="gap-1 text-xs"
                      >
                        <Edit3 className="size-3" />
                        <span>{t('actions.edit')}</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(n.id)}
                        className="size-8 p-0"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTable>
      </div>

      {/* Mobile Card List View (< 768px) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {items.map((n) => (
          <div
            key={n.id}
            onClick={() => onStartEdit(n.id)}
            className="p-4 rounded-3xl border border-border/80 bg-card space-y-3 cursor-pointer shadow-xs active:scale-[0.99] transition-transform"
          >
            <div className="flex items-start justify-between gap-2">
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[0.65rem] font-bold uppercase tracking-wider border ${getTypeBadgeClass(n.type)}`}>
                {n.type}
              </span>
              {n.is_pinned && (
                <span className="inline-flex items-center gap-1 text-[0.7rem] font-bold text-amber-500">
                  <Pin className="size-3 rotate-45" /> Pinned
                </span>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-foreground text-sm line-clamp-2">{n.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{n.slug}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs" onClick={(e) => e.stopPropagation()}>
              <span className="text-muted-foreground">
                {n.is_published ? (n.published_at ? new Date(n.published_at).toLocaleDateString() : 'Published') : 'Draft'}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onStartEdit(n.id)}>
                  {t('actions.edit')}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(n.id)} className="size-8 p-0">
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

