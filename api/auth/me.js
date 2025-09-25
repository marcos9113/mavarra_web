import { verify } from '../lib/jwt.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method Not Allowed' });

  const auth = req.headers.authorization || '';
  let token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) {
    // try cookie
    const cookie = req.headers.cookie || '';
    const m = /(?:^|; )session=([^;]+)/.exec(cookie);
    token = m ? m[1] : '';
  }
  if (!token) return res.status(401).json({ success: false, message: 'missing token' });
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
    const payload = verify(token, JWT_SECRET);
    return res.status(200).json({ success: true, user: { username: payload.sub }, payload });
  } catch (e) {
    return res.status(401).json({ success: false, message: 'invalid token' });
  }
}
