import React from 'react';

function StartTransformation() {
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    idea: '',
    goals: '',
    timeline: '',
    budget: '',
    notes: '',
  });
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState<null | { type: 'success' | 'error'; message: string }>(null);

  const onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    const formElement = e.currentTarget as HTMLFormElement;
    try {
      const resp = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const contentType = resp.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await resp.json() : null;
      if (!resp.ok || !data?.success) {
        const message = data?.message || 'Unable to submit your enquiry right now. Please try again later.';
        throw new Error(message);
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mavarra:enquiries-updated'));
      }
      setStatus({ type: 'success', message: "Thanks! We've received your details and will reach out shortly." });
      setForm({ name: '', email: '', company: '', phone: '', idea: '', goals: '', timeline: '', budget: '', notes: '' });
      formElement.reset();
    } catch (err: any) {
      setStatus({ type: 'error', message: err?.message || 'Could not submit your enquiry. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-gradient-to-br from-mavarra-purple/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-mavarra-cyan/10 to-transparent rounded-full blur-3xl"></div>
      </div>
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-mavarra-purple/10 border border-mavarra-purple/30 rounded-full px-6 py-3 mb-6">
            <div className="w-3 h-3 bg-mavarra-purple rounded-full animate-pulse"></div>
            <span className="text-mavarra-purple font-semibold">Get Started</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-mavarra-purple via-mavarra-pink to-mavarra-orange bg-clip-text text-transparent">
            Start Your Transformation
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            We partner with you to bring your ideas to life using technology. Share a few details below and we\'ll reach out with next steps.
          </p>
        </div>

        {/* Status banner */}
        {status && (
          <div className={`${status.type === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-pink-500/30 bg-pink-500/10 text-pink-300'} rounded-xl px-4 py-3 text-sm border` }>
            {status.message}
          </div>
        )}
        <form onSubmit={onSubmit} className="bg-gradient-to-br from-black/40 via-gray-900/30 to-black/40 p-8 md:p-10 rounded-2xl border border-mavarra-purple/20 backdrop-blur-sm space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2" htmlFor="name">Full Name</label>
              <input id="name" name="name" required value={form.name} onChange={onChange}
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-mavarra-purple text-white placeholder-gray-500"
                placeholder="Jane Doe" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required value={form.email} onChange={onChange}
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-mavarra-purple text-white placeholder-gray-500"
                placeholder="jane@example.com" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2" htmlFor="company">Company / Organization (optional)</label>
              <input id="company" name="company" value={form.company} onChange={onChange}
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-mavarra-purple text-white placeholder-gray-500"
                placeholder="Acme Inc." />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2" htmlFor="phone">Phone (optional)</label>
              <input id="phone" name="phone" value={form.phone} onChange={onChange}
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-mavarra-purple text-white placeholder-gray-500"
                placeholder="+1 555 123 4567" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2" htmlFor="idea">What dream are you bringing to reality?</label>
            <textarea id="idea" name="idea" required value={form.idea} onChange={onChange}
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-mavarra-purple text-white placeholder-gray-500 min-h-[120px]"
              placeholder="Describe your idea, users, and what success looks like." />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2" htmlFor="goals">Primary Goal</label>
              <input id="goals" name="goals" value={form.goals} onChange={onChange}
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-mavarra-purple text-white placeholder-gray-500"
                placeholder="e.g., MVP, automation, scale" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2" htmlFor="timeline">Timeline</label>
              <select id="timeline" name="timeline" value={form.timeline} onChange={onChange}
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-mavarra-purple text-white">
                <option value="">Select</option>
                <option value="2-4 weeks">2-4 weeks</option>
                <option value="1-3 months">1-3 months</option>
                <option value="3-6 months">3-6 months</option>
                <option value="Flexible">Flexible</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2" htmlFor="budget">Budget Range</label>
              <select id="budget" name="budget" value={form.budget} onChange={onChange}
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-mavarra-purple text-white">
                <option value="">Select</option>
                <option value="<$2k">Below $2k</option>
                <option value="$2k-$5k">$2k - $5k</option>
                <option value="$5k-$15k">$5k - $15k</option>
                <option value=">$15k">Above $15k</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2" htmlFor="notes">Anything else we should know? (optional)</label>
            <textarea id="notes" name="notes" value={form.notes} onChange={onChange}
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-mavarra-purple text-white placeholder-gray-500 min-h-[80px]"
              placeholder="Links, references, preferred tools, or constraints." />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button type="submit" disabled={loading} className={`group relative px-8 py-4 rounded-full text-white font-bold text-lg overflow-hidden transition-all duration-300 focus:outline-none focus:ring-2 ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-mavarra-purple to-mavarra-indigo hover:scale-105'}`}>
              <span className="relative z-10 flex items-center gap-3">
                {loading ? 'Submitting…' : 'Start Transformation'}
                {!loading && (
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
              {!loading && (<div className="absolute inset-0 bg-gradient-to-r from-mavarra-pink to-mavarra-orange opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>)}
            </button>
            <a href="#home" className="text-gray-400 hover:text-white transition-colors">Back to Home</a>
          </div>
        </form>
      </div>
    </section>
  );
}

export default StartTransformation;
