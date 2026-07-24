import { PublicLayout } from '@/components/layouts/public-layout';

export default function BlogLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
}
