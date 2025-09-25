import React from 'react';

type Post = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: React.ReactNode;
  tag?: string;
  rawContent?: string;
  published: boolean;
  searchText: string;
};

function useBlogRoute() {
  const [hash, setHash] = React.useState<string>(window.location.hash);
  React.useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const parts = hash.split('/');
  const base = parts[1] || '';
  const slug = parts[2] || '';
  return { slug: base === 'blog' ? slug : '' };
}

export default function Blog() {
  const { slug } = useBlogRoute();
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [query, setQuery] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const loadPosts = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/blog');
        if (!res.ok) throw new Error('Failed to load posts');
        const data = await res.json();
        if (!data?.success || !Array.isArray(data.data)) throw new Error('Invalid response');
        const mapped = data.data.map(mapServerPost).filter((p: Post | null): p is Post => Boolean(p));
        if (!cancelled) {
          setPosts(mapped);
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'Unable to load articles right now.');
          setPosts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadPosts();
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (!slug) return;
    if (posts.some((p) => p.slug === slug)) return;
    let cancelled = false;
    const fetchSingle = async () => {
      try {
        const res = await fetch(`/api/blog?slug=${encodeURIComponent(slug)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!data?.success || !data.data) return;
        const mapped = mapServerPost(data.data);
        if (!cancelled && mapped) {
          setPosts((prev) => [...prev, mapped]);
        }
      } catch {
        /* ignore */
      }
    };
    fetchSingle();
    return () => {
      cancelled = true;
    };
  }, [slug, posts]);

  const post = posts.find((p) => p.slug === slug);

  const filteredPosts = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return posts.filter((p) => p.published);
    return posts.filter((p) => p.published && p.searchText.includes(term));
  }, [query, posts]);

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-dark-slate/50 via-charcoal/30 to-steel/20 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 left-20 w-64 h-64 bg-gradient-to-br from-mavarra-purple/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-br from-mavarra-cyan/10 to-transparent rounded-full blur-3xl"></div>
      </div>
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-mavarra-purple/10 border border-mavarra-purple/30 rounded-full px-6 py-3 mb-6">
            <div className="w-3 h-3 bg-mavarra-purple rounded-full animate-pulse"></div>
            <span className="text-mavarra-purple font-semibold">Insights</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-mavarra-purple via-mavarra-pink to-mavarra-orange bg-clip-text text-transparent">
            Blog
          </h1>
          {!post && (
            <>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Ideas, playbooks, and behind-the-scenes on building with AI, no-code, and modern web technologies.
              </p>
              <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
                Explore our latest articles or search for a specific topic to get tailored insights for your next build.
              </p>
            </>
          )}
        </div>

        {!post && (
          <>
            <div className="mb-12 max-w-2xl mx-auto">
              <label htmlFor="blog-search" className="block text-sm text-gray-400 mb-2 text-left">Search articles</label>
              <div className="relative">
                <input
                  id="blog-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by topic, keyword, or insight"
                  className="w-full px-5 py-3 rounded-2xl bg-black/40 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-mavarra-purple text-white placeholder-gray-500"
                />
                <svg className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18.5a7.5 7.5 0 006.15-3.85z" />
                </svg>
              </div>
              {error && <div className="mt-3 text-sm text-pink-300">{error}</div>}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {filteredPosts.map((p) => (
                <a key={p.slug} href={`#/blog/${p.slug}`} className="group block bg-gradient-to-br from-black/40 via-gray-900/30 to-black/40 p-6 rounded-2xl border border-mavarra-purple/20 hover:border-mavarra-purple/60 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs uppercase tracking-wider text-mavarra-purple font-semibold">{p.tag || 'Article'}</span>
                    <span className="text-xs text-gray-500">{p.date || '—'}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-mavarra-pink transition-colors">{p.title}</h2>
                  <p className="text-gray-300">{p.excerpt}</p>
                  <div className="mt-4 inline-flex items-center gap-2 text-mavarra-purple font-semibold">
                    Read Post
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </a>
              ))}
              {!loading && !filteredPosts.length && (
                <div className="md:col-span-2 text-center text-gray-400">
                  No published articles yet. Check back soon!
                </div>
              )}
              {loading && filteredPosts.length === 0 && (
                <div className="md:col-span-2 text-center text-gray-500">Loading articles…</div>
              )}
            </div>
          </>
        )}

        {post && (
          <article className="bg-gradient-to-br from-black/40 via-gray-900/30 to-black/40 p-8 md:p-10 rounded-2xl border border-mavarra-purple/20">
            <a href="#/blog" className="text-gray-400 hover:text-white transition-colors text-sm">← Back to Blog</a>
            <div className="mt-2 text-sm text-gray-400">{post.date || 'Recently updated'}{post.tag ? ` • ${post.tag}` : ''}</div>
            <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-white">{post.title}</h2>
            <div className="mt-6 prose prose-invert max-w-none">
              {post.content}
            </div>
          </article>
        )}
      </div>
    </section>
  );
}

function mapServerPost(row: any): Post | null {
  if (!row) return null;
  const slug = (row.slug || '').trim();
  const title = (row.title || '').trim();
  const excerpt = (row.excerpt || '').trim();
  const content = typeof row.content === 'string' ? row.content : '';
  if (!slug || !title || !content) return null;

  const tag = (row.tag || '').trim() || undefined;
  const date = formatDateLabel(row.publishedAt || row.createdAt || row.updatedAt);

  return {
    slug,
    title,
    date,
    excerpt,
    tag,
    content: renderContent(content),
    rawContent: content,
    published: Boolean(row.published),
    searchText: [title, excerpt, tag ?? '', content].join(' ').toLowerCase(),
  };
}

function formatDateLabel(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function renderContent(text: string) {
  const blocks = text.split(/\n\s*\n/);
  return (
    <div className="space-y-6 text-gray-300 leading-relaxed">
      {blocks.map((block, idx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;
        if (/^#+\s+/.test(trimmed)) {
          const heading = trimmed.replace(/^#+\s+/, '');
          return <h3 key={`h-${idx}`} className="text-2xl font-bold text-white">{heading}</h3>;
        }
        const lines = trimmed.split(/\n/).map((line) => line.trim()).filter(Boolean);
        if (lines.length && lines.every((line) => /^[-*]\s+/.test(line))) {
          return (
            <ul key={`ul-${idx}`} className="list-disc pl-6 space-y-2 text-gray-300">
              {lines.map((line, li) => (
                <li key={li}>{line.replace(/^[-*]\s+/, '')}</li>
              ))}
            </ul>
          );
        }
        return <p key={`p-${idx}`}>{trimmed}</p>;
      })}
    </div>
  );
}
