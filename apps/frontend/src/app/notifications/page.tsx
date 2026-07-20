import { getTranslations } from 'next-intl/server';
import { NotificationsList } from './notifications-list';

export const metadata = { title: 'Notifications' };

export default async function NotificationsPage() {
  const t = await getTranslations('notifications');
  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">{t('preferences.title')}</h1>
      <NotificationsList />
    </main>
  );
}
