'use client';

import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2.5 w-full md:w-auto">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        className="flex-1 md:w-64 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-[13px] text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors duration-200"
        required
      />
      <button
        type="submit"
        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-[13px] flex-shrink-0 transition-all duration-300 ${submitted
            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
            : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 hover:shadow-lg hover:shadow-blue-500/30'
          }`}
      >
        {submitted ? (
          <>
            <CheckCircle className="w-3.5 h-3.5" />
            Subscribed!
          </>
        ) : (
          <>
            <Send className="w-3.5 h-3.5" />
            Subscribe
          </>
        )}
      </button>
    </form>
  );
}
