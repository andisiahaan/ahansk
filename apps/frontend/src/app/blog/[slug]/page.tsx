import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import api from '@/lib/api';

interface Post {
  title: string; slug: string; excerpt: string | null; content: string;
  cover_image: string | null; published_at: string | null; view_count: number;
  meta_title: string | null; meta_description: string | null;
  author: { name: string; avatar: string | null };
  categories: { id: string; name: string; slug: string }[];
  tags: { id: string; name: string; slug: string }[];
}

async function getPost(slug: string): Promise<Post | null> {
  try {
    const { data } = await api.get(`/blog/posts/${slug}`);
    return data.data;
  } catch { return null; }
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Not Found' };
  return {
    title: post.meta_title ?? post.title,
    description: post.meta_description ?? post.excerpt ?? '',
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <main className="min-h-dvh bg-background py-16 px-4">
      <article className="max-w-3xl mx-auto">
        {post.cover_image && (
          <div className="mb-8 rounded-2xl overflow-hidden h-64 md:h-80">
            <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <header className="mb-8">
          {post.categories.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-3">
              {post.categories.map((c) => (
                <span key={c.id} className="text-xs font-bold uppercase tracking-widest text-primary">{c.name}</span>
              ))}
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">{post.title}</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{post.author.name}</span>
            {post.published_at && <><span>·</span><span>{new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></>}
          </div>
        </header>

        <div
          className="prose prose-neutral dark:prose-invert max-w-none text-foreground"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2 pt-6 border-t border-border">
            {post.tags.map((t) => (
              <span key={t.id} className="px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground">{t.name}</span>
            ))}
          </div>
        )}
      </article>
    </main>
  );
}
