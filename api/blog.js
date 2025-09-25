import { getDb } from './lib/mongo.js';
import { verify } from './lib/jwt.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      return await handleGet(req, res);
    }

    if (req.method === 'POST') {
      return await handlePost(req, res);
    }

    if (req.method === 'PUT') {
      return await handlePut(req, res);
    }

    if (req.method === 'DELETE') {
      return await handleDelete(req, res);
    }

    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  } catch (err) {
    const message = err?.message || 'Server error';
    return res.status(500).json({ success: false, message });
  }
}

async function handleGet(req, res) {
  const db = await getDb();
  const collection = db.collection('blog_posts');
  const slug = typeof req.query?.slug === 'string' ? req.query.slug.trim() : '';

  const { isAdmin } = await getRequestIdentity(req);
  const filter = {};
  if (!isAdmin) filter.published = true;
  if (slug) filter.slug = slug;

  if (slug) {
    const doc = await collection.findOne(filter, { sort: { published_at: -1, created_at: -1 } });
    if (!doc) return res.status(404).json({ success: false, message: 'Not Found' });
    return res.status(200).json({ success: true, data: mapDoc(doc) });
  }

  const docs = await collection
    .find(filter)
    .sort({ published_at: -1, created_at: -1 })
    .limit(50)
    .toArray();
  return res.status(200).json({ success: true, data: docs.map(mapDoc) });
}

async function handlePost(req, res) {
  const { isAdmin } = await getRequestIdentity(req);
  if (!isAdmin) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const body = req.body && typeof req.body === 'object' ? req.body : await readJson(req);
  const title = (body?.title || '').trim();
  const slugInput = (body?.slug || '').trim();
  const excerpt = (body?.excerpt || '').trim();
  const tag = (body?.tag || '').trim();
  const content = (body?.content || '').trim();
  const published = Boolean(body?.published);

  if (!title) return res.status(400).json({ success: false, message: 'title required' });
  if (!content) return res.status(400).json({ success: false, message: 'content required' });
  if (!excerpt) return res.status(400).json({ success: false, message: 'excerpt required' });

  const slug = slugify(slugInput || title);
  if (!slug) return res.status(400).json({ success: false, message: 'invalid slug' });

  const now = new Date();
  const doc = {
    title,
    slug,
    excerpt,
    tag: tag || null,
    content,
    published,
    created_at: now,
    updated_at: now,
    published_at: published ? now : null,
  };

  const db = await getDb();
  const collection = db.collection('blog_posts');
  try {
    const result = await collection.insertOne(doc);
    doc._id = result.insertedId;
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ success: false, message: 'A post with that slug already exists' });
    }
    throw err;
  }

  return res.status(201).json({ success: true, data: mapDoc(doc) });
}

async function handlePut(req, res) {
  const { isAdmin } = await getRequestIdentity(req);
  if (!isAdmin) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const body = req.body && typeof req.body === 'object' ? req.body : await readJson(req);
  const slug = (body?.slug || body?.originalSlug || '').trim();
  if (!slug) return res.status(400).json({ success: false, message: 'slug required' });

  const update = { updated_at: new Date() };
  if (typeof body?.title === 'string' && body.title.trim()) update.title = body.title.trim();
  if (typeof body?.excerpt === 'string' && body.excerpt.trim()) update.excerpt = body.excerpt.trim();
  if (typeof body?.content === 'string' && body.content.trim()) update.content = body.content.trim();
  if (typeof body?.tag === 'string') update.tag = body.tag.trim() || null;
  if (typeof body?.published === 'boolean') {
    update.published = body.published;
    update.published_at = body.published ? new Date() : null;
  }

  const db = await getDb();
  const collection = db.collection('blog_posts');
  const result = await collection.findOneAndUpdate(
    { slug },
    { $set: update },
    { returnDocument: 'after' }
  );

  if (!result.value) return res.status(404).json({ success: false, message: 'Post not found' });
  return res.status(200).json({ success: true, data: mapDoc(result.value) });
}

async function handleDelete(req, res) {
  const { isAdmin } = await getRequestIdentity(req);
  if (!isAdmin) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const slug = typeof req.query?.slug === 'string' ? req.query.slug.trim() : '';
  if (!slug) return res.status(400).json({ success: false, message: 'slug required' });

  const db = await getDb();
  const collection = db.collection('blog_posts');
  const result = await collection.deleteOne({ slug });
  if (!result.deletedCount) return res.status(404).json({ success: false, message: 'Post not found' });
  return res.status(200).json({ success: true });
}

async function getRequestIdentity(req) {
  try {
    const auth = req.headers?.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) return { isAdmin: false };
    const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
    const payload = verify(token, JWT_SECRET);
    return { isAdmin: payload?.role === 'admin', user: payload };
  } catch {
    return { isAdmin: false };
  }
}

function mapDoc(doc) {
  if (!doc) return null;
  return {
    id: doc._id ? String(doc._id) : undefined,
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt,
    tag: doc.tag || undefined,
    content: doc.content,
    published: Boolean(doc.published),
    createdAt: doc.created_at ? new Date(doc.created_at).toISOString() : undefined,
    updatedAt: doc.updated_at ? new Date(doc.updated_at).toISOString() : undefined,
    publishedAt: doc.published_at ? new Date(doc.published_at).toISOString() : undefined,
  };
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function readJson(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'));
      } catch {
        resolve({});
      }
    });
  });
}
