// Serverless endpoint for enquiries (Vercel style)
// Methods:
// - GET  /api/enquiries?limit=100         -> list latest enquiries (desc)
// - POST /api/enquiries  { name, email, idea, ... } -> create enquiry
// Uses MongoDB for storage. Requires env MONGODB_URI (falls back to local) and optional MONGODB_DB.

import { verify } from './lib/jwt.js';
import { getDb } from './lib/mongo.js';

export default async function handler(req, res) {
  // Basic CORS for browser calls (adjust origin as needed)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      // Protected: require JWT
      const auth = req.headers.authorization || '';
      let token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
      if (!token) {
        const cookie = req.headers.cookie || '';
        const m = /(?:^|; )session=([^;]+)/.exec(cookie);
        token = m ? m[1] : '';
      }
      try {
        const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
        verify(token, JWT_SECRET);
      } catch {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      const limit = Number(req.query.limit || 100);
      const db = await getDb();
      const rows = await db.collection('enquiries').find({}).sort({ created_at: -1 }).limit(limit).toArray();
      return res.status(200).json({ success: true, data: rows });
    }

    if (req.method === 'POST') {
      const body = req.body && typeof req.body === 'object' ? req.body : safeJson(await readText(req), {});
      const { name, email, idea, company, phone, goals, timeline, budget, notes } = body || {};
      if (!name || !email || !idea) {
        return res.status(400).json({ success: false, message: 'name, email and idea are required' });
      }
      const db = await getDb();
      const doc = { name, email, idea, company, phone, goals, timeline, budget, notes, created_at: new Date() };
      const r = await db.collection('enquiries').insertOne(doc);
      return res.status(200).json({ success: true, data: { _id: r.insertedId, ...doc } });
    }

    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}

function safeJson(text, fallback) {
  try { return JSON.parse(text); } catch { return fallback; }
}

function readText(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}
