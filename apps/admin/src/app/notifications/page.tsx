import { getTranslations } from 'next-intl/server';
import { PageLayout, PageHeader } from '@/components/ui/page-layout';
import { AdminNotificationsView } from './notifications-view';

export const metadata = { title: 'Notifications & Broadcasts' };

export default async function AdminNotificationsPage() {
  const t = await getTranslations('notifications');
  return (
    <PageLayout>
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
      />
      <AdminNotificationsView />
    </PageLayout>
  );
}
