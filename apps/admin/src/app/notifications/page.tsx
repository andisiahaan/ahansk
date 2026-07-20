import { getTranslations } from 'next-intl/server';
import { AdminNotificationsView } from './notifications-view';

export const metadata = { title: 'Notifications' };

export default async function AdminNotificationsPage() {
  const t = await getTranslations('notifications');
  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('allNotifications')}</p>
      </div>
      <AdminNotificationsView />
    </main>
  );
}
