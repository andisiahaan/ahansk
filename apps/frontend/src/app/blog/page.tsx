import type { Metadata } from 'next';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { getTranslations } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Read our latest articles, updates, and insights.',
};

interface Post {
  id: string; title: string; slug: string; excerpt: string | null;
  cover_image: string | null; is_featured: boolean;
  published_at: string | null; view_count: number;
  author: { name: string };
  categories: { id: string; name: string; slug: string }[];
}

async function getPosts(): Promise<Post[]> {
  try {
    const res = await apiFetch('/blog/posts?limit=20');
    if (!res.ok) return [];
    const data = await res.json();
    return data.data?.posts ?? [];
  } catch { return []; }
}

export default async function BlogPage() {
  const posts = await getPosts();
  const t = await getTranslations('blog.list');

  return (
    <main className="min-h-dvh bg-background py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-3">{t('heading')}</h1>
          <p className="text-muted-foreground text-lg">{t('description')}</p>
        </header>

        {posts.length === 0 ? (
          <p className="text-center text-muted-foreground">{t('noPosts')}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}
                className="group border border-border rounded-2xl overflow-hidden bg-card hover:border-primary/40 transition-colors">
                {post.cover_image && (
                  <div className="h-48 bg-muted overflow-hidden">
                    <img src={post.cover_image} alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                <div className="p-5 space-y-2">
                  {post.categories.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {post.categories.map((c) => (
                        <span key={c.id} className="text-[0.65rem] font-bold uppercase tracking-widest text-primary">{c.name}</span>
                      ))}
                    </div>
                  )}
                  <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug">{post.title}</h2>
                  {post.excerpt && <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>}
                  <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                    <span>{post.author.name}</span>
                    <span>{post.published_at ? new Date(post.published_at).toLocaleDateString() : ''}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
