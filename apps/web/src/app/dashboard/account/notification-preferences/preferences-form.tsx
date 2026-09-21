'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Lock, Settings2 } from 'lucide-react';
import api from '@/lib/api';
import { PushDevicesModal } from './push-devices-modal';
import {
  NOTIFICATION_CHANNELS, REQUIRED_CHANNELS,
  type NotificationPreferences
} from '@ahansk/shared';

async function fetchPrefs(): Promise<NotificationPreferences> {
  const res = await api.get<{ data: NotificationPreferences }>('/notifications/preferences');
  return res.data.data;
}

async function savePrefs(prefs: NotificationPreferences): Promise<void> {
  await api.patch('/notifications/preferences', prefs);
}


export function NotificationPreferencesForm() {
  const t  = useTranslations('notifications');
  const qc = useQueryClient();
  const [pushModalOpen, setPushModalOpen] = useState(false);

  const { data: prefs, isLoading } = useQuery({ queryKey: ['notification-prefs'], queryFn: fetchPrefs });

  const mutation = useMutation({
    mutationFn: savePrefs,
    onSuccess:  () => void qc.invalidateQueries({ queryKey: ['notification-prefs'] }),
  });

  const toggle = (key: 'channels', field: string, current: boolean) => {
    if (!prefs) return;
    const updated: NotificationPreferences = {
      channels: { ...prefs.channels },
    };
    if (key === 'channels') updated.channels[field as keyof typeof updated.channels] = !current;
    mutation.mutate(updated);
  };

  if (isLoading) return <div className="space-y-4">{[...Array<undefined>(4)].map((_, i) => <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />)}</div>;

  const channelEnabled = (ch: string): boolean => prefs?.channels[ch as keyof typeof prefs.channels] ?? true;

  return (
    <>
      <div className="space-y-8">
        {/* Channel toggles */}
        <section>
          <h2 className="text-sm font-semibold text-foreground mb-4">{t('preferences.channelSection')}</h2>
          <div className="space-y-3">
            {NOTIFICATION_CHANNELS.map((ch) => {
              const isRequired = REQUIRED_CHANNELS.includes(ch);
              const enabled    = isRequired || channelEnabled(ch);
              const isPush     = ch === 'push';
              return (
                <div key={ch} className={`flex items-center justify-between p-4 rounded-xl border border-border bg-card ${isRequired ? 'opacity-70' : ''}`}>
                  <div>
                    <p className="text-sm font-medium text-foreground capitalize">{t(`channels.${ch}`)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t(`channelDescriptions.${ch}`)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isRequired && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                    {isPush && (
                      <button
                        onClick={() => setPushModalOpen(true)}
                        className="size-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        title="Manage push devices"
                      >
                        <Settings2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      role="switch"
                      aria-checked={enabled}
                      disabled={isRequired}
                      onClick={() => !isRequired && toggle('channels', ch, enabled)}
                      className={`w-10 h-6 rounded-full transition-colors ${enabled ? 'bg-primary' : 'bg-muted'} disabled:cursor-not-allowed`}
                    >
                      <span className={`block w-4 h-4 rounded-full bg-white shadow transition-transform mx-1 ${enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>



        {mutation.isSuccess && <p className="text-sm text-primary">{t('preferences.saved')}</p>}
      </div>

      {pushModalOpen && (
        <PushDevicesModal
          onClose={() => setPushModalOpen(false)}
          pushEnabled={channelEnabled('push')}
        />
      )}
    </>
  );
}
