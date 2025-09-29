import React from 'react';
import { setToken, getToken, clearToken } from './utils/auth';
import { verifyTotp } from './utils/totp';

export default function Auth() {
  const [username, setUsername] = React.useState('');
  const [code, setCode] = React.useState('');
  const [message, setMessage] = React.useState<string | null>(null);
  const token = getToken();

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, code }) });
      const ct = res.headers.get('content-type') || '';
      const text = await res.text();
      if (ct.includes('application/json')) {
        const data = JSON.parse(text);
        if (!res.ok || !data?.success) throw new Error(data?.message || 'Login failed');
        setToken(data.token);
        setMessage('Logged in. You can now open the Admin Dashboard.');
      } else {
        // Local fallback: verify using locally stored secret
        const secret = localStorage.getItem(`mavarra:auth:${username}:secret`);
        if (!secret) throw new Error('No local secret found. Please enroll first.');
        const ok = await verifyTotp(secret, code, 30, 1);
        if (!ok) throw new Error('Invalid code');
        setToken('local-dev-token');
        setMessage('Local login successful. You can now open the Admin Dashboard.');
      }
    } catch (err: any) {
      setMessage(err?.message || 'Login failed');
    }
  };

  const onLogout = () => { clearToken(); setMessage('Logged out'); };

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-dark-slate/50 via-charcoal/30 to-steel/20 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-mavarra-purple via-mavarra-pink to-mavarra-orange bg-clip-text text-transparent">Authentication</h1>
          <p className="text-gray-300">Passwordless TOTP (Google Authenticator)</p>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-mavarra-cyan/30 bg-mavarra-cyan/10 text-mavarra-cyan px-4 py-3 text-sm">{message}</div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Onboard CTA */}
          <div className="bg-gradient-to-br from-black/40 via-gray-900/30 to-black/40 p-6 rounded-2xl border border-mavarra-purple/20 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">New here?</h2>
              <p className="text-sm text-gray-400 mb-6">If you have an invite email and token, start onboarding to set up TOTP and create your username.</p>
            </div>
            <div>
              <a href="#/signup" className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-mavarra-purple to-mavarra-indigo text-white font-semibold hover:scale-105 transition">
                Onboard
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
              </a>
            </div>
          </div>

          {/* Login */}
          <div className="bg-gradient-to-br from-black/40 via-gray-900/30 to-black/40 p-6 rounded-2xl border border-mavarra-emerald/20">
            <h2 className="text-xl font-bold text-white mb-4">2) Login</h2>
            <form onSubmit={onLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Username</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-mavarra-emerald text-white placeholder-gray-500" placeholder="yourname" required />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">6‑digit code</label>
                <input value={code} onChange={(e) => setCode(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-mavarra-emerald text-white placeholder-gray-500" placeholder="123456" required />
              </div>
              <button className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-mavarra-emerald to-mavarra-cyan text-white font-semibold hover:scale-105 transition" type="submit">Login</button>
            </form>

            {token && (
              <div className="mt-4 text-sm text-gray-300">
                <div className="mb-2">You are logged in.</div>
                <div className="flex gap-3">
                  <a href="#/admin" className="px-4 py-2 rounded-full bg-mavarra-purple/20 text-white hover:bg-mavarra-purple/30">Open Admin</a>
                  <button onClick={onLogout} className="px-4 py-2 rounded-full bg-mavarra-pink/20 text-white hover:bg-mavarra-pink/30">Logout</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
