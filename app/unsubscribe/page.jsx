'use client';

import { useEffect, useState } from 'react';

export default function UnsubscribePage() {
  const [token, setToken] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | working | done | error
  const [error, setError] = useState('');

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get('token') || '');
  }, []);

  const unsubscribe = async () => {
    setStatus('working');
    setError('');
    try {
      const res = await fetch('/api/subscribe/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
      setStatus('done');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  const missingToken = token === '';

  return (
    <section className="rd-section-head" style={{ padding: '4rem 1.25rem 2rem', gap: '1rem', maxWidth: 560 }}>
      <p className="rd-kicker" style={{ color: '#7c7974' }}>Newsletter</p>
      <h1 className="rd-title">{status === 'done' ? 'You’re unsubscribed' : 'Unsubscribe'}</h1>

      {status === 'done' ? (
        <>
          <p style={{ color: '#3b3835', lineHeight: 1.7 }}>
            You won’t receive any more newsletter emails from Rafi Daham. Changed your mind? You can
            subscribe again at the bottom of any page.
          </p>
          <a href="/" className="rd-btn rd-btn--auto" style={{ marginTop: '1rem' }}>Back to the website</a>
        </>
      ) : missingToken ? (
        <p style={{ color: '#3b3835', lineHeight: 1.7 }}>
          This link is incomplete. Please use the unsubscribe link from the bottom of one of our emails.
        </p>
      ) : (
        <>
          <p style={{ color: '#3b3835', lineHeight: 1.7 }}>
            Stop receiving newsletter emails from Rafi Daham? Booking confirmations and reminders are
            not affected.
          </p>
          {status === 'error' && <p className="rd-error" role="alert">{error}</p>}
          <button
            type="button"
            className="rd-btn rd-btn--auto"
            style={{ marginTop: '1rem' }}
            disabled={!token || status === 'working'}
            onClick={unsubscribe}
          >
            {status === 'working' ? 'Unsubscribing…' : 'Unsubscribe'}
          </button>
        </>
      )}
    </section>
  );
}
