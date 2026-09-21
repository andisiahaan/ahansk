'use client';

import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isPending?: boolean;
  variant?: 'destructive' | 'primary';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isPending = false,
  variant = 'destructive',
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="max-w-sm">
      <p className="text-sm text-muted-foreground mb-6">{description}</p>
      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={onClose} disabled={isPending}>
          {cancelLabel}
        </Button>
        <Button variant={variant} onClick={onConfirm} disabled={isPending}>
          {isPending ? '...' : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
