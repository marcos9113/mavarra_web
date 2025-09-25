import { getDb } from './lib/mongo.js';
import { verify } from './lib/jwt.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method Not Allowed' });

  try {
    const { isAdmin } = await getRequestIdentity(req);
    if (!isAdmin) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const db = await getDb();
    const invites = await db.collection('invites').find({}).sort({ created_at: -1 }).limit(200).toArray();
    const users = await db.collection('user').find({}).project({ username: 1, email: 1, last_login_at: 1, login_count: 1, created_at: 1 }).toArray();
    const byEmail = new Map(users.map((u) => [String((u.email || '').toLowerCase()), u]));

    const data = invites.map((invite) => {
      const email = String(invite.email || '').toLowerCase();
      const user = byEmail.get(email);
      return mapInvite(invite, user);
    });

    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}

async function getRequestIdentity(req) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) return { isAdmin: false };
    const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
    const payload = verify(token, JWT_SECRET);
    return { isAdmin: payload?.role === 'admin', user: payload };
  } catch {
    return { isAdmin: false };
  }
}

function mapInvite(invite, user) {
  const used = Boolean(invite.used);
  const usedAt = invite.used_at ? new Date(invite.used_at).toISOString() : null;
  const createdAt = invite.created_at ? new Date(invite.created_at).toISOString() : null;
  return {
    id: invite._id ? String(invite._id) : undefined,
    email: invite.email,
    username: invite.username || null,
    token: invite.token,
    used,
    createdAt,
    expiresAt: invite.expires_at ? new Date(invite.expires_at).toISOString() : null,
    usedAt,
    user: user
      ? {
          username: user.username,
          email: user.email,
          createdAt: user.created_at ? new Date(user.created_at).toISOString() : null,
          lastLoginAt: user.last_login_at ? new Date(user.last_login_at).toISOString() : null,
          loginCount: user.login_count || 0,
        }
      : null,
  };
}
