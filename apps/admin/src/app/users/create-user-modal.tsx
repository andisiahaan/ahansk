'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreateUserSchema, type CreateUserDto } from '@ahansk/shared';
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
      toast.success('User created successfully');
      reset();
      onCreated();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Failed to create user');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-lg font-semibold text-foreground">Create New User</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-sm font-semibold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="John Doe" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="john@example.com" {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password (Optional)</Label>
            <Input id="password" type="password" placeholder="Min 8 characters (or leave blank)" {...register('password')} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              {...register('role')}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Create User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
