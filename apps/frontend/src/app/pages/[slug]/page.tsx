import api from '@/lib/api';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { data } = await api.get(`/pages/${slug}`);
    return { title: data.data.title, description: data.data.meta_description ?? undefined };
  } catch { return { title: 'Page Not Found' }; }
}

export default async function PublicPage({ params }: Props) {
  const { slug } = await params;
  let page: { title: string; content: string } | null = null;

  try {
    const { data } = await api.get(`/pages/${slug}`);
    page = data.data;
  } catch { notFound(); }

  if (!page) notFound();

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem' }}>{page.title}</h1>
      <div
        className="prose"
        style={{ color: 'var(--color-muted)', lineHeight: 1.8 }}
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </main>
  );
}
