import express from 'express';
import cors from 'cors';

// Import handlers (default exports)
import authSignup from './api/auth/signup.js';
import authLogin from './api/auth/login.js';
import authMe from './api/auth/me.js';
import seedAdmin from './api/auth/seed-admin.js';
import invite from './api/auth/invite.js';
import enroll from './api/auth/enroll.js';
import logout from './api/auth/logout.js';
import enquiries from './api/enquiries.js';
import blog from './api/blog.js';
import invites from './api/invites.js';
import settings from './api/settings.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes mapping to serverless-style handlers
app.post('/api/auth/signup', (req, res) => authSignup(req, res));
app.post('/api/auth/login', (req, res) => authLogin(req, res));
app.get('/api/auth/me', (req, res) => authMe(req, res));
app.post('/api/auth/seed-admin', (req, res) => seedAdmin(req, res));
app.post('/api/auth/invite', (req, res) => invite(req, res));
app.post('/api/auth/enroll', (req, res) => enroll(req, res));
app.post('/api/auth/logout', (req, res) => logout(req, res));

app.get('/api/enquiries', (req, res) => enquiries(req, res));
app.post('/api/enquiries', (req, res) => enquiries(req, res));
app.get('/api/blog', (req, res) => blog(req, res));
app.post('/api/blog', (req, res) => blog(req, res));
app.put('/api/blog', (req, res) => blog(req, res));
app.delete('/api/blog', (req, res) => blog(req, res));
app.get('/api/invites', (req, res) => invites(req, res));
app.get('/api/settings', (req, res) => settings(req, res));
app.put('/api/settings', (req, res) => settings(req, res));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
