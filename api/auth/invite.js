import crypto from 'crypto';
import { getDb } from '../lib/mongo.js';
import { verify } from '../lib/jwt.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method Not Allowed' });

  // Require admin JWT
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
    const payload = verify(token, JWT_SECRET);
    if (payload.role !== 'admin') throw new Error('not admin');
  } catch {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : await readJson(req);
  const email = (body?.email || '').trim().toLowerCase();
  const username = (body?.username || '').trim();
  if (!email) return res.status(400).json({ success: false, message: 'email required' });

  const db = await getDb();
  const token = crypto.randomBytes(16).toString('hex');
  const now = new Date();
  const expires_at = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours
  await db.collection('invites').insertOne({ email, username: username || null, token, used: false, created_at: now, expires_at });

  const base = process.env.APP_BASE_URL || '';
  const inviteUrl = `${base}#/signup?invite=${token}&email=${encodeURIComponent(email)}`;
  return res.status(200).json({ success: true, email, username, token, inviteUrl, expires_at });
}

function readJson(req) {
  return new Promise((resolve) => {
    let data='';
    req.on('data', c => data += c);
    req.on('end', () => { try { resolve(JSON.parse(data||'{}')); } catch { resolve({}); } });
  });
}
