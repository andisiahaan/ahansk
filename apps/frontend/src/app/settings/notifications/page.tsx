import { getTranslations } from 'next-intl/server';
import { NotificationPreferencesForm } from './preferences-form';

export const metadata = { title: 'Notification Preferences' };

export default async function NotificationPreferencesPage() {
  const t = await getTranslations('notifications');
  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-2">{t('preferences.title')}</h1>
      <p className="text-sm text-muted-foreground mb-8">{t('preferences.channelSection')}</p>
      <NotificationPreferencesForm />
    </main>
  );
}
