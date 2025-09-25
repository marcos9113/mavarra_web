import React from 'react';
import { setToken } from './utils/auth';

export default function Signup() {
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.hash.split('?')[1] : '');
  const [email, setEmail] = React.useState(params.get('email') || '');
  const [token, setInviteToken] = React.useState(params.get('invite') || '');
  const [username, setUsername] = React.useState('');
  const [step, setStep] = React.useState<'verify'|'totp'|'done'>('verify');
  const [qr, setQr] = React.useState<{secret:string; qrUrl:string; altQrUrl:string; otpauth:string} | null>(null);
  const [code, setCode] = React.useState('');
  const [msg, setMsg] = React.useState<string | null>(null);

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg(null);
    try {
      const res = await fetch('/api/auth/enroll', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, token, username }) });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || 'Failed');
      const altQr = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.otpauth)}`;
      setQr({ secret: data.secret, qrUrl: data.qrUrl, altQrUrl: altQr, otpauth: data.otpauth });
      setMsg('QR generated. Scan it in Google Authenticator, then enter the 6‑digit code below.');
      setStep('totp');
    } catch (err:any) {
      setMsg(err?.message || 'Verification failed');
    }
  };

  const onComplete = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg(null);
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, code }) });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || 'Login failed');
      setToken(data.token);
      setStep('done');
      setMsg('Setup complete. Redirecting to dashboard…');
      setTimeout(() => { window.location.hash = '#/admin'; }, 800);
    } catch (err:any) {
      setMsg(err?.message || 'Invalid code');
    }
  };

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-dark-slate/50 via-charcoal/30 to-steel/20 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-mavarra-purple via-mavarra-pink to-mavarra-orange bg-clip-text text-transparent">Create Your Account</h1>
          <p className="text-gray-300">Join via invite • Set up TOTP</p>
        </div>

        {msg && <div className="mb-6 rounded-xl border border-mavarra-cyan/30 bg-mavarra-cyan/10 text-mavarra-cyan px-4 py-3 text-sm">{msg}</div>}

        {step === 'verify' && (
          <form onSubmit={onVerify} className="bg-gradient-to-br from-black/40 via-gray-900/30 to-black/40 p-6 rounded-2xl border border-mavarra-purple/20 grid md:grid-cols-3 gap-4">
            <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="email@example.com" className="px-4 py-3 rounded-xl bg-black/40 border border-gray-700 text-white" required />
            <input value={token} onChange={(e)=>setInviteToken(e.target.value)} placeholder="invite token" className="px-4 py-3 rounded-xl bg-black/40 border border-gray-700 text-white" required />
            <input value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="choose a username" className="px-4 py-3 rounded-xl bg-black/40 border border-gray-700 text-white" required />
            <div className="md:col-span-3"><button className="px-6 py-3 rounded-xl bg-gradient-to-r from-mavarra-purple to-mavarra-indigo text-white font-semibold">Verify & Generate QR</button></div>
          </form>
        )}

        {step === 'totp' && qr && (
          <div className="bg-gradient-to-br from-black/40 via-gray-900/30 to-black/40 p-6 rounded-2xl border border-mavarra-emerald/20">
            <div className="text-center">
              <img src={qr.qrUrl} onError={(e)=>{ (e.currentTarget as any).src = qr.altQrUrl; }} alt="QR" className="mx-auto rounded-lg" />
              <div className="text-xs text-gray-400 break-all mt-2">Secret: {qr.secret}</div>
            </div>
            <form onSubmit={onComplete} className="mt-6 grid md:grid-cols-3 gap-4">
              <input value={code} onChange={(e)=>setCode(e.target.value)} placeholder="6-digit code" className="px-4 py-3 rounded-xl bg-black/40 border border-gray-700 text-white" required />
              <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-mavarra-emerald to-mavarra-cyan text-white font-semibold">Complete Setup</button>
            </form>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center text-gray-300">Setup complete. Redirecting…</div>
        )}
      </div>
    </section>
  );
}

