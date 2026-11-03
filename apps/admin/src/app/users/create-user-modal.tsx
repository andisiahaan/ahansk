'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { UserPlus, X } from 'lucide-react';
import { CreateUserSchema } from '@ahansk/shared';
import type { z } from 'zod';
import api from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

type CreateUserInput = z.input<typeof CreateUserSchema>;

export function CreateUserModal({ open, onClose, onCreated }: CreateUserModalProps) {
  const t = useTranslations('users');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'USER',
    },
  });

  if (!open) return null;

  const onSubmit = async (data: CreateUserInput) => {
    try {
      const payload = {
        ...data,
        role: data.role ?? 'USER',
        password: data.password && data.password.trim() ? data.password : undefined,
      };
      await api.post('/admin/users', payload);
      toast.success(t('create.success'));
      reset();
      onCreated();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Failed to create user');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-card border border-border/80 rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <UserPlus className="size-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">{t('create.title')}</h2>
              <p className="text-[0.72rem] text-muted-foreground">{t('create.subtitle')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">{t('create.name')}</Label>
            <Input id="name" placeholder={t('create.namePlaceholder')} {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">{t('create.email')}</Label>
            <Input id="email" type="email" placeholder={t('create.emailPlaceholder')} {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">{t('create.password')}</Label>
            <Input id="password" type="password" placeholder={t('create.passwordPlaceholder')} {...register('password')} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role">{t('create.role')}</Label>
            <select
              id="role"
              {...register('role')}
              className="w-full text-sm border border-border rounded-xl px-3 h-10 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
            >
              <option value="USER">{t('roles.USER')}</option>
              <option value="ADMIN">{t('roles.ADMIN')}</option>
            </select>
            {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border/60">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {t('create.cancel')}
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {t('create.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
