import React from 'react';
import { loadEnquiries, Enquiry } from './utils/enquiries';

type BlogPost = {
  id?: string;
  slug: string;
  title: string;
  tag?: string;
  excerpt: string;
  content: string;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
};

type InviteRow = {
  id?: string;
  email: string;
  username: string | null;
  token: string;
  used: boolean;
  createdAt: string | null;
  expiresAt: string | null;
  usedAt: string | null;
  user: {
    username: string;
    email: string;
    createdAt: string | null;
    lastLoginAt: string | null;
    loginCount: number;
  } | null;
};

type SettingsForm = {
  mongodbUri: string;
  mongodbDb: string;
};

export default function Admin() {
  const [loading, setLoading] = React.useState(false);
  const [enquiries, setEnquiries] = React.useState<Enquiry[]>([]);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [blogPosts, setBlogPosts] = React.useState<BlogPost[]>([]);
  const [blogLoading, setBlogLoading] = React.useState(false);
  const [blogNotice, setBlogNotice] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<'leads' | 'invites' | 'blog' | 'settings'>('leads');
  const [invitesData, setInvitesData] = React.useState<InviteRow[]>([]);
  const [invitesLoading, setInvitesLoading] = React.useState(false);
  const [invitesNotice, setInvitesNotice] = React.useState<string | null>(null);
  const [settingsData, setSettingsData] = React.useState<SettingsForm | null>(null);
  const [settingsLoading, setSettingsLoading] = React.useState(false);
  const [settingsNotice, setSettingsNotice] = React.useState<string | null>(null);

  const reload = React.useCallback(async () => {
    setLoading(true);
    let list: Enquiry[] = [];
    // Try server first
    try {
      const headers: HeadersInit = {};
      try {
        const t = localStorage.getItem('mavarra:token');
        if (t) (headers as Record<string, string>).Authorization = `Bearer ${t}`;
      } catch {}
      const res = await fetch('/api/enquiries?limit=100', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data?.success && Array.isArray(data.data)) list = data.data.map(mapServerRowToEnquiry);
      }
    } catch {}
    // Fallback to local demo
    if (!list.length) list = loadEnquiries();
    setEnquiries(list);
    setLoading(false);
  }, []);

  const reloadBlog = React.useCallback(async () => {
    setBlogLoading(true);
    try {
      const headers: HeadersInit = {};
      try {
        const t = localStorage.getItem('mavarra:token');
        if (t) (headers as Record<string, string>).Authorization = `Bearer ${t}`;
      } catch {}
      const res = await fetch('/api/blog', { headers });
      if (!res.ok) throw new Error('Failed to load blog posts');
      const data = await res.json();
      if (!data?.success || !Array.isArray(data.data)) throw new Error('Invalid blog response');
      setBlogPosts(data.data);
      setBlogNotice(null);
    } catch (err: any) {
      setBlogNotice(err?.message || 'Unable to load blog posts');
      setBlogPosts([]);
    } finally {
      setBlogLoading(false);
    }
  }, []);

const reloadInvites = React.useCallback(async () => {
    setInvitesLoading(true);
    try {
      const headers: HeadersInit = {};
      try {
        const t = localStorage.getItem('mavarra:token');
        if (t) (headers as Record<string, string>).Authorization = `Bearer ${t}`;
      } catch {}
      const res = await fetch('/api/invites', { headers });
      if (!res.ok) throw new Error('Failed to load invites');
      const data = await res.json();
      if (!data?.success || !Array.isArray(data.data)) throw new Error('Invalid invite response');
      setInvitesData(data.data);
      setInvitesNotice(null);
    } catch (err: any) {
      setInvitesNotice(err?.message || 'Unable to load invites');
      setInvitesData([]);
    } finally {
      setInvitesLoading(false);
    }
  }, []);

  const reloadSettings = React.useCallback(async () => {
    setSettingsLoading(true);
    try {
      const headers: HeadersInit = {};
      try {
        const t = localStorage.getItem('mavarra:token');
        if (t) (headers as Record<string, string>).Authorization = `Bearer ${t}`;
      } catch {}
      const res = await fetch('/api/settings', { headers });
      if (!res.ok) throw new Error('Failed to load settings');
      const data = await res.json();
      if (!data?.success || !data.data) throw new Error('Invalid settings response');
      setSettingsData(data.data);
      setSettingsNotice(null);
    } catch (err: any) {
      setSettingsNotice(err?.message || 'Unable to load settings');
      setSettingsData(null);
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  function mapServerRowToEnquiry(row: any): Enquiry {
    return {
      id: row.id || row.uuid || String(row.created_at || Date.now()),
      createdAt: row.created_at || row.date || new Date().toISOString(),
      name: row.name || '',
      email: row.email || '',
      company: row.company || '',
      phone: row.phone || '',
      idea: row.idea || row.message || '',
      goals: row.goals || '',
      timeline: row.timeline || '',
      budget: row.budget || '',
      notes: row.notes || '',
    };
  }

  React.useEffect(() => {
    reload();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'mavarra:enquiries') reload();
    };
    const onCustom = () => reload();
    window.addEventListener('storage', onStorage);
    window.addEventListener('mavarra:enquiries-updated', onCustom as any);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('mavarra:enquiries-updated', onCustom as any);
    };
  }, [reload]);

  React.useEffect(() => {
    reloadBlog();
    const onBlog = () => reloadBlog();
    window.addEventListener('mavarra:blog-updated', onBlog as any);
    return () => {
      window.removeEventListener('mavarra:blog-updated', onBlog as any);
    };
  }, [reloadBlog]);

  React.useEffect(() => {
    reloadInvites();
    const onInviteChange = () => reloadInvites();
    window.addEventListener('mavarra:invites-updated', onInviteChange as any);
    return () => {
      window.removeEventListener('mavarra:invites-updated', onInviteChange as any);
    };
  }, [reloadInvites]);

  React.useEffect(() => {
    reloadSettings();
    const onSettings = () => reloadSettings();
    window.addEventListener('mavarra:settings-updated', onSettings as any);
    return () => {
      window.removeEventListener('mavarra:settings-updated', onSettings as any);
    };
  }, [reloadSettings]);

  // Analytics
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(startOfToday);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const toDate = (s?: string) => (s ? new Date(s) : undefined);

  const totalLeads = enquiries.length;
  const thisWeek = enquiries.filter((s) => {
    const d = toDate(s.createdAt);
    return d ? d >= sevenDaysAgo : false;
  }).length;
  const today = enquiries.filter((s) => {
    const d = toDate(s.createdAt);
    return d ? d >= startOfToday : false;
  }).length;

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-dark-slate/50 via-charcoal/30 to-steel/20 relative overflow-hidden min-h-screen">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 left-16 w-72 h-72 bg-gradient-to-br from-mavarra-purple/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-10 w-80 h-80 bg-gradient-to-br from-mavarra-emerald/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-mavarra-purple via-mavarra-pink to-mavarra-orange bg-clip-text text-transparent">Admin Dashboard</h1>
            <p className="text-gray-300 mt-2">Lightweight admin UI. Authentication and live data wiring coming next.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={async()=>{
              try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
              try { localStorage.removeItem('mavarra:token'); } catch {}
              setNotice('Logged out');
              setTimeout(()=>{ window.location.hash = '#/auth'; }, 500);
            }} className="px-4 py-2 rounded-full bg-mavarra-pink/20 text-white hover:bg-mavarra-pink/30">Logout</button>
          </div>
        </div>
        {notice && <div className="mb-4 text-sm text-emerald-300">{notice}</div>}

        <div className="flex items-center gap-4 border-b border-gray-800 mb-10">
          {[
            { key: 'leads', label: 'Leads' },
            { key: 'invites', label: 'Invites' },
            { key: 'blog', label: 'Blog Posts' },
            { key: 'settings', label: 'Settings' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'leads' | 'invites' | 'blog' | 'settings')}
              className={`px-4 py-2 text-sm font-semibold transition rounded-t-lg ${
                activeTab === tab.key
                  ? 'text-white border-b-2 border-mavarra-purple'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'leads' && (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="bg-gradient-to-br from-black/40 via-gray-900/30 to-black/40 p-6 rounded-2xl border border-mavarra-purple/20">
                <div className="text-sm text-gray-400 mb-1">Total Leads</div>
                <div className="text-3xl font-extrabold text-white">{loading ? '…' : totalLeads}</div>
                <div className="text-xs text-gray-500 mt-1">Live data from the Mavarra backend</div>
              </div>
              <div className="bg-gradient-to-br from-black/40 via-gray-900/30 to-black/40 p-6 rounded-2xl border border-mavarra-emerald/20">
                <div className="text-sm text-gray-400 mb-1">This Week</div>
                <div className="text-3xl font-extrabold text-white">{loading ? '…' : thisWeek}</div>
                <div className="text-xs text-gray-500 mt-1">Last 7 days</div>
              </div>
              <div className="bg-gradient-to-br from-black/40 via-gray-900/30 to-black/40 p-6 rounded-2xl border border-mavarra-cyan/20">
                <div className="text-sm text-gray-400 mb-1">Today</div>
                <div className="text-3xl font-extrabold text-white">{loading ? '…' : today}</div>
                <div className="text-xs text-gray-500 mt-1">Submissions since midnight</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-black/40 via-gray-900/30 to-black/40 p-6 rounded-2xl border border-mavarra-purple/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Recent Submissions</h2>
                <span className="text-xs text-gray-400">Live data from the Mavarra backend</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-gray-400">
                    <tr>
                      <th className="py-3 pr-4">Date</th>
                      <th className="py-3 pr-4">Name</th>
                      <th className="py-3 pr-4">Email</th>
                      <th className="py-3 pr-4">Goal</th>
                      <th className="py-3 pr-4">Budget</th>
                      <th className="py-3">Idea</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-gray-200">
                    {(loading ? Array.from({ length: 5 }).map((_, i) => ({ id: i })) : enquiries)
                      .slice(0, 10)
                      .map((r: any, idx: number) => {
                        const d = toDate(r.createdAt);
                        const dateStr = d ? d.toLocaleDateString() + ' ' + d.toLocaleTimeString() : '—';
                        return (
                          <tr key={r.id || idx} className="hover:bg-white/5 align-top">
                            <td className="py-3 pr-4 text-gray-400">{loading ? '…' : dateStr}</td>
                            <td className="py-3 pr-4">{loading ? '…' : (r.name || '—')}</td>
                            <td className="py-3 pr-4">{loading ? '…' : (r.email || '—')}</td>
                            <td className="py-3 pr-4">{loading ? '…' : (r.goals || '—')}</td>
                            <td className="py-3 pr-4">{loading ? '…' : (r.budget || '—')}</td>
                            <td className="py-3 truncate max-w-xs">{loading ? '…' : (r.idea || '—')}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 text-sm text-gray-400">Leads are stored securely in MongoDB. The dashboard refreshes automatically when new enquiries arrive.</div>
            </div>
          </>
        )}

        {activeTab === 'invites' && (
          <InviteTab invites={invitesData} loading={invitesLoading} notice={invitesNotice} onRefresh={reloadInvites} />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            settings={settingsData}
            loading={settingsLoading}
            notice={settingsNotice}
            onReload={reloadSettings}
            onSaved={(updated) => setSettingsData(updated)}
          />
        )}

        {activeTab === 'blog' && (
          <BlogManager posts={blogPosts} loading={blogLoading} notice={blogNotice} onCreated={reloadBlog} />
        )}
      </div>
    </section>
  );
}

function BlogManager({ posts, loading, notice, onCreated }: { posts: BlogPost[]; loading: boolean; notice: string | null; onCreated: () => void }) {
  const [title, setTitle] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [tag, setTag] = React.useState('');
  const [excerpt, setExcerpt] = React.useState('');
  const [content, setContent] = React.useState('');
  const [published, setPublished] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<null | { type: 'success' | 'error'; text: string }>(null);
  const slugTouched = React.useRef(false);
  const [editingSlug, setEditingSlug] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (editingSlug) return;
    if (!slugTouched.current) {
      setSlug(slugify(title));
    }
  }, [title, editingSlug]);

  const resetForm = React.useCallback(() => {
    setTitle('');
    setSlug('');
    setTag('');
    setExcerpt('');
    setContent('');
    setPublished(false);
    setEditingSlug(null);
    slugTouched.current = false;
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      try {
        const t = localStorage.getItem('mavarra:token');
        if (t) (headers as Record<string, string>).Authorization = `Bearer ${t}`;
      } catch {}
      const payload = { title, slug, tag, excerpt, content, published };
      const method = editingSlug ? 'PUT' : 'POST';
      const body = editingSlug ? { ...payload, slug: editingSlug } : payload;
      const res = await fetch('/api/blog', {
        method,
        headers,
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || 'Failed to publish blog post');
      setMessage({ type: 'success', text: editingSlug ? (published ? 'Post published.' : 'Draft updated.') : (published ? 'Post published.' : 'Draft saved.') });
      resetForm();
      onCreated();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mavarra:blog-updated'));
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Could not save blog post.' });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (post: BlogPost) => {
    setTitle(post.title);
    setSlug(post.slug);
    setTag(post.tag || '');
    setExcerpt(post.excerpt);
    setContent(post.content);
    setPublished(post.published);
    setEditingSlug(post.slug);
    slugTouched.current = true;
    setMessage(null);
  };

  const togglePublish = async (post: BlogPost, nextPublished: boolean) => {
    setMessage(null);
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      try {
        const t = localStorage.getItem('mavarra:token');
        if (t) (headers as Record<string, string>).Authorization = `Bearer ${t}`;
      } catch {}
      const res = await fetch('/api/blog', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ slug: post.slug, published: nextPublished }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || 'Failed to update post');
      onCreated();
      setMessage({ type: 'success', text: nextPublished ? 'Post published.' : 'Post moved to drafts.' });
      if (editingSlug === post.slug) {
        setPublished(nextPublished);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mavarra:blog-updated'));
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Unable to update publish status.' });
    }
  };

  const deletePost = async (post: BlogPost) => {
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm(`Delete “${post.title}”? This cannot be undone.`);
      if (!confirmed) return;
    }
    setMessage(null);
    try {
      const headers: HeadersInit = {};
      try {
        const t = localStorage.getItem('mavarra:token');
        if (t) (headers as Record<string, string>).Authorization = `Bearer ${t}`;
      } catch {}
      const res = await fetch(`/api/blog?slug=${encodeURIComponent(post.slug)}`, {
        method: 'DELETE',
        headers,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || (data && data.success === false)) throw new Error(data?.message || 'Failed to delete post');
      setMessage({ type: 'success', text: 'Post deleted.' });
      if (editingSlug === post.slug) resetForm();
      onCreated();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mavarra:blog-updated'));
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Unable to delete post.' });
    }
  };

  const fmtDate = (iso?: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-gradient-to-br from-black/40 via-gray-900/30 to-black/40 p-6 rounded-2xl border border-mavarra-purple/20 mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Publish Blog Posts</h2>
        <span className="text-xs text-gray-400">Create and share new articles</span>
      </div>
      {notice && <div className="mb-4 text-sm text-pink-300">{notice}</div>}
      {message && (
        <div className={`mb-4 text-sm px-4 py-2 rounded-xl ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-400/40 text-emerald-200' : 'bg-pink-500/10 border border-pink-400/40 text-pink-200'}`}>
          {message.text}
        </div>
      )}
      <form onSubmit={onSubmit} className="grid gap-4 mb-8">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2" htmlFor="blog-title">Title</label>
            <input id="blog-title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-700 text-white" placeholder="e.g., How we built our latest MVP" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2" htmlFor="blog-slug">Slug</label>
            <input
              id="blog-slug"
              value={slug}
              onChange={(e) => {
                slugTouched.current = true;
                setSlug(e.target.value);
              }}
              required
              disabled={Boolean(editingSlug)}
              className={`w-full px-4 py-3 rounded-xl border text-white ${editingSlug ? 'bg-black/30 border-gray-700 cursor-not-allowed text-gray-400' : 'bg-black/40 border-gray-700'}`}
              placeholder="how-we-built-our-latest-mvp"
            />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2" htmlFor="blog-tag">Tag</label>
            <input id="blog-tag" value={tag} onChange={(e) => setTag(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-700 text-white" placeholder="AI & Automation" />
          </div>
          <div className="flex items-center gap-3 mt-6 md:mt-0">
            <input id="blog-published" type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-5 w-5 rounded border-gray-600 bg-black/40" />
            <label htmlFor="blog-published" className="text-sm text-gray-300">Publish immediately</label>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2" htmlFor="blog-excerpt">Excerpt</label>
          <textarea id="blog-excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} required className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-700 text-white min-h-[80px]" placeholder="Short overview shown on the blog list." />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2" htmlFor="blog-content">Content</label>
          <textarea
            id="blog-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-700 text-white min-h-[200px]"
            placeholder="Write your article here. Separate paragraphs with blank lines."
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">All posts are saved to the Mavarra database.</span>
            {editingSlug && (
              <button type="button" onClick={resetForm} className="text-sm px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20">Cancel</button>
            )}
          </div>
          <button type="submit" disabled={saving} className={`px-6 py-3 rounded-full font-semibold ${saving ? 'bg-gray-600 text-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-mavarra-purple to-mavarra-indigo text-white hover:-translate-y-0.5 transition'}`}>
            {saving ? 'Saving…' : editingSlug ? 'Update Post' : published ? 'Publish Post' : 'Save Draft'}
          </button>
        </div>
      </form>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Recent Posts</h3>
          {loading && <span className="text-sm text-gray-400">Loading…</span>}
        </div>
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id || post.slug} className="bg-black/40 border border-gray-800 rounded-xl px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-white font-semibold">{post.title}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${post.published ? 'bg-emerald-500/20 text-emerald-200' : 'bg-gray-600/20 text-gray-300'}`}>{post.published ? 'Published' : 'Draft'}</span>
                </div>
                <div className="text-sm text-gray-400">/{post.slug}</div>
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-3 text-sm text-gray-400">
                <span>{post.published ? `Published ${fmtDate(post.publishedAt || post.createdAt)}` : `Created ${fmtDate(post.createdAt)}`}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(post)} className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs">Edit</button>
                  <button
                    onClick={() => togglePublish(post, !post.published)}
                    className={`px-3 py-1.5 rounded-full text-xs ${post.published ? 'bg-pink-500/20 text-pink-200 hover:bg-pink-500/30' : 'bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30'}`}
                  >
                    {post.published ? 'Move to Draft' : 'Publish'}
                  </button>
                  <button
                    onClick={() => deletePost(post)}
                    className="px-3 py-1.5 rounded-full bg-red-500/20 text-red-200 hover:bg-red-500/30 text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!loading && !posts.length && (
            <div className="text-sm text-gray-400">No posts yet. Publish your first article above.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function InviteCard() {
  const [email, setEmail] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [result, setResult] = React.useState<null | { inviteUrl: string; token: string }>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState<string | null>(null);

  const onInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setResult(null);
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      try {
        const t = localStorage.getItem('mavarra:token');
        if (t) (headers as Record<string, string>).Authorization = `Bearer ${t}`;
      } catch {}
      const res = await fetch('/api/auth/invite', { method: 'POST', headers, body: JSON.stringify({ email, username }) });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || 'Failed');
      setResult({ inviteUrl: data.inviteUrl, token: data.token });
      setCopied(null);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mavarra:invites-updated'));
      }
    } catch (err:any) {
      setError(err?.message || 'Error sending invite');
    }
  };

  return (
    <div className="bg-gradient-to-br from-black/40 via-gray-900/30 to-black/40 p-6 rounded-2xl border border-mavarra-orange/20 mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Invite New User</h2>
        <span className="text-xs text-gray-400">Only invited users can enroll</span>
      </div>
      <form onSubmit={onInvite} className="grid md:grid-cols-3 gap-4">
        <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="email@example.com" className="px-4 py-3 rounded-xl bg-black/40 border border-gray-700 text-white" required />
        <input value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="(optional) suggested username" className="px-4 py-3 rounded-xl bg-black/40 border border-gray-700 text-white" />
        <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-mavarra-orange to-mavarra-pink text-white font-semibold">Send Invite</button>
      </form>
      {error && <div className="mt-3 text-sm text-pink-300">{error}</div>}
      {result && (
        <div className="mt-4 text-sm text-gray-300">
          <div className="mb-2">Invite created. Share this token securely with the user.</div>
          <div>
            <div className="text-gray-400">Invite Token</div>
            <div className="mt-1 break-all text-mavarra-cyan">{result.token}</div>
              <div className="mt-1 flex gap-2">
                <button onClick={async()=>{ try{ await navigator.clipboard.writeText(result.token); setCopied('token'); }catch{}}} className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white">Copy Token</button>
                {copied==='token' && <span className="text-emerald-300">Copied</span>}
              </div>
            </div>
        </div>
      )}
    </div>
  );
}

function InviteTab({ invites, loading, notice, onRefresh }: { invites: InviteRow[]; loading: boolean; notice: string | null; onRefresh: () => void }) {
  return (
    <div className="space-y-6">
      <InviteCard />
      <div className="bg-gradient-to-br from-black/40 via-gray-900/30 to-black/40 p-6 rounded-2xl border border-mavarra-orange/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Invite Status</h2>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            {loading && <span>Loading…</span>}
            <button onClick={onRefresh} className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white">Refresh</button>
          </div>
        </div>
        {notice && <div className="mb-4 text-sm text-pink-300">{notice}</div>}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-gray-400">
              <tr>
                <th className="py-3 pr-4">Email</th>
                <th className="py-3 pr-4">Invited Username</th>
                <th className="py-3 pr-4">Invite Created</th>
                <th className="py-3 pr-4">Invite Status</th>
                <th className="py-3 pr-4">Account</th>
                <th className="py-3">Last Login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-200">
              {(loading ? Array.from({ length: 5 }).map((_, idx) => ({ id: idx })) : invites).map((row: any, idx: number) => {
                if (loading) {
                  return (
                    <tr key={idx} className="opacity-70">
                      <td className="py-3 pr-4 text-gray-500">…</td>
                      <td className="py-3 pr-4 text-gray-500">…</td>
                      <td className="py-3 pr-4 text-gray-500">…</td>
                      <td className="py-3 pr-4 text-gray-500">…</td>
                      <td className="py-3 pr-4 text-gray-500">…</td>
                      <td className="py-3 text-gray-500">…</td>
                    </tr>
                  );
                }

                const invite: InviteRow = row;
                const statusBadge = invite.used
                  ? <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-200">Accepted</span>
                  : <span className="text-xs px-2 py-1 rounded-full bg-gray-600/20 text-gray-300">Pending</span>;
                const dateFmt = (iso?: string | null) => {
                  if (!iso) return '—';
                  const d = new Date(iso);
                  if (Number.isNaN(d.getTime())) return '—';
                  return d.toLocaleString();
                };
                return (
                  <tr key={invite.id || invite.token} className="align-top">
                    <td className="py-3 pr-4">
                      <div className="text-white">{invite.email}</div>
                      <div className="text-xs text-gray-500">Token: {invite.token.slice(0, 6)}…</div>
                    </td>
                    <td className="py-3 pr-4">{invite.username || '—'}</td>
                    <td className="py-3 pr-4">{dateFmt(invite.createdAt)}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        {statusBadge}
                        {invite.usedAt && <span className="text-xs text-gray-400">Used {dateFmt(invite.usedAt)}</span>}
                        {!invite.used && invite.expiresAt && <span className="text-xs text-gray-500">Expires {dateFmt(invite.expiresAt)}</span>}
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      {invite.user ? (
                        <div>
                          <div className="text-white">{invite.user.username}</div>
                          <div className="text-xs text-gray-500">Created {dateFmt(invite.user.createdAt)}</div>
                          <div className="text-xs text-gray-500">Logins: {invite.user.loginCount || 0}</div>
                        </div>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="py-3">{invite.user ? dateFmt(invite.user.lastLoginAt) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SettingsTab({ settings, loading, notice, onReload, onSaved }: { settings: SettingsForm | null; loading: boolean; notice: string | null; onReload: () => void; onSaved: (value: SettingsForm) => void }) {
  const [form, setForm] = React.useState<SettingsForm>({ mongodbUri: '', mongodbDb: '' });
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<null | { type: 'success' | 'error'; text: string }>(null);

  React.useEffect(() => {
    if (settings) {
      setForm(settings);
    }
  }, [settings]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      try {
        const t = localStorage.getItem('mavarra:token');
        if (t) (headers as Record<string, string>).Authorization = `Bearer ${t}`;
      } catch {}
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers,
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || 'Failed to update settings');
      onSaved(data.data);
      setMessage({ type: 'success', text: 'Settings updated successfully.' });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mavarra:settings-updated'));
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Unable to update settings.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-black/40 via-gray-900/30 to-black/40 p-6 rounded-2xl border border-mavarra-purple/20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Application Settings</h2>
          <p className="text-sm text-gray-400">Manage backend configuration values.</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          {loading && <span>Loading…</span>}
          <button onClick={onReload} className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white">Refresh</button>
        </div>
      </div>

      {notice && <div className="mb-4 text-sm text-pink-300">{notice}</div>}
      {message && (
        <div className={`mb-4 text-sm px-4 py-2 rounded-xl ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-400/40 text-emerald-200' : 'bg-pink-500/10 border border-pink-400/40 text-pink-200'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5 text-left">
        <div>
          <label className="block text-sm text-gray-400 mb-2" htmlFor="mongodbUri">MongoDB Connection String</label>
          <input
            id="mongodbUri"
            name="mongodbUri"
            value={form.mongodbUri}
            onChange={onChange}
            required
            className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-700 text-white"
            placeholder="mongodb+srv://user:pass@host"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2" htmlFor="mongodbDb">Database Name</label>
          <input
            id="mongodbDb"
            name="mongodbDb"
            value={form.mongodbDb}
            onChange={onChange}
            required
            className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-700 text-white"
            placeholder="mavarra"
          />
        </div>
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>Changes apply immediately for all API calls.</span>
          <button type="submit" disabled={saving} className={`px-6 py-3 rounded-full font-semibold ${saving ? 'bg-gray-600 text-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-mavarra-purple to-mavarra-indigo text-white hover:-translate-y-0.5 transition'}`}>
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
