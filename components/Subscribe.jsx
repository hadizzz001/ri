'use client';

import { useEffect, useRef, useState } from 'react';

const LOGO = 'https://res.cloudinary.com/dtjcqfoxc/image/upload/v1751030325/black_bgez4v.webp';
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

/**
 * Footer newsletter: a single "Subscribe now" button. It opens a dialog where
 * the visitor enters an email; /api/subscribe stores it and sends a welcome
 * email through Resend.
 */
export default function Subscribe() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const inputRef = useRef(null);

  const close = () => setOpen(false);

  const openDialog = () => {
    if (status === 'done') {
      setStatus('idle');
      setEmail('');
    }
    setError('');
    setOpen(true);
  };

  // Scroll lock, focus handling, Escape and a simple focus trap
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const trigger = triggerRef.current;
    requestAnimationFrame(() => inputRef.current?.focus());

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll(
        'a[href], button:not([disabled]), input:not([tabindex="-1"]):not([disabled])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [open]);

  const submit = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;
    if (!isEmail(email)) {
      setError('Please enter a valid email address.');
      setStatus('error');
      inputRef.current?.focus();
      return;
    }

    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), hp: honeypot }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
      setResult(data);
      setStatus('done');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  const doneText = result?.alreadySubscribed
    ? `${email.trim()} is already on our list — thank you for being with us.`
    : result?.emailSent
      ? `A welcome email is on its way to ${email.trim()}.`
      : 'You’re on the list. We’ll be in touch with our latest news soon.';

  return (
    <section className="rdSub" aria-label="Newsletter">
      <button ref={triggerRef} type="button" className="rd-btn rd-btn--auto" onClick={openDialog}>
        Subscribe now
      </button>

      {open && (
        <div
          className="rdSub__overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            ref={panelRef}
            className="rdSub__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rdSub-title"
            aria-describedby="rdSub-desc"
          >
            <button type="button" className="rdSub__close" onClick={close} aria-label="Close">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /></svg>
            </button>

            {status === 'done' ? (
              <div className="rdSub__body" aria-live="polite">
                <span className="rdSub__check" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                </span>
                <p className="rd-kicker">Newsletter</p>
                <h2 id="rdSub-title" className="rd-title rdSub__title">
                  {result?.alreadySubscribed ? 'Already subscribed' : 'Thank you for subscribing'}
                </h2>
                <p id="rdSub-desc" className="rdSub__text">{doneText}</p>
                <button type="button" className="rd-btn rd-btn--light rdSub__cta" onClick={close}>
                  Continue browsing
                </button>
              </div>
            ) : (
              <form className="rdSub__body" onSubmit={submit} noValidate>
                <img src={LOGO} alt="" className="rdSub__logo" width="56" height="56" />
                <p className="rd-kicker">Newsletter</p>
                <h2 id="rdSub-title" className="rd-title rdSub__title">Stay in the know</h2>
                <p id="rdSub-desc" className="rdSub__text">
                  Be the first to hear about new services, exclusive offers and beauty insights from
                  Rafi Daham.
                </p>

                <div className={`rdSub__field ${status === 'error' ? 'has-error' : ''}`}>
                  <input
                    ref={inputRef}
                    id="rdSub-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder=" "
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === 'error') setStatus('idle');
                    }}
                    aria-invalid={status === 'error'}
                    aria-describedby={status === 'error' ? 'rdSub-error' : undefined}
                  />
                  <label htmlFor="rdSub-email">Email address</label>
                </div>

                {/* Honeypot — hidden from people, bots fill it in */}
                <input
                  className="rdSub__hp"
                  type="text"
                  name="rdsub_extra"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />

                {status === 'error' && (
                  <p id="rdSub-error" className="rdSub__error" role="alert">{error}</p>
                )}

                <button
                  type="submit"
                  className="rd-btn rd-btn--light rdSub__cta"
                  disabled={status === 'sending'}
                >
                  {status === 'sending' ? 'Subscribing…' : 'Subscribe'}
                </button>

                <p className="rdSub__fine">No spam — unsubscribe anytime in one click.</p>
              </form>
            )}
          </div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
.rdSub{display:flex;justify-content:center;padding:1.5rem 1rem 3.5rem;border-bottom:1px solid #e6e2dd !important}
.rdSub__overlay{position:fixed;inset:0;z-index:10050;display:flex;align-items:center;justify-content:center;padding:1rem;background:rgba(16,5,1,.55);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);animation:rdSubFade .25s ease both}
.rdSub__panel{position:relative;width:100%;max-width:440px;max-height:calc(100dvh - 2rem);overflow-y:auto;background:#1c1c1c;color:#fff;padding:3rem 2rem 2.25rem;box-shadow:0 30px 80px -20px rgba(0,0,0,.6);animation:rdSubIn .35s cubic-bezier(.22,.8,.3,1) both}
@media (min-width:640px){.rdSub__panel{padding:3.5rem 3rem 2.75rem}}
.rdSub__panel *{color:#fff}
.rdSub__close{position:absolute;top:14px;right:14px;width:36px;height:36px;display:grid;place-items:center;background:none;border:0;border-radius:50%;cursor:pointer;transition:background .2s}
.rdSub__close:hover{background:rgba(255,255,255,.08)}
.rdSub__close:focus-visible{outline:2px solid #fff !important;outline-offset:2px}
.rdSub__close svg{width:18px;height:18px;fill:none;stroke:#fff;stroke-width:1.2;stroke-linecap:round}
.rdSub__body{display:flex;flex-direction:column;align-items:center;text-align:center;gap:.85rem}
.rdSub__logo{width:56px;height:56px;filter:invert(1);margin-bottom:.4rem}
.rdSub__title{font-size:clamp(18px,1rem + .6vw,22px) !important}
.rdSub__text{margin:0 !important;font-size:14px;line-height:1.7;color:rgba(255,255,255,.75) !important;max-width:320px}
.rdSub__field{position:relative;width:100%;margin-top:.9rem}
.rdSub__field input{width:100%;height:52px;padding:18px 16px 6px;background:transparent;border:1px solid rgba(255,255,255,.3) !important;border-radius:12px;color:#fff !important;font-size:15px;outline:none;transition:border-color .2s}
.rdSub__field input:focus{border-color:#fff !important}
.rdSub__field.has-error input{border-color:#e8a598 !important}
.rdSub__field label{position:absolute;left:17px;top:50%;transform:translateY(-50%);font-size:14px;color:rgba(255,255,255,.6) !important;pointer-events:none;transition:all .18s ease}
.rdSub__field input:focus+label,.rdSub__field input:not(:placeholder-shown)+label{top:15px;font-size:11px;letter-spacing:.04em}
.rdSub__field input:-webkit-autofill{-webkit-text-fill-color:#fff;-webkit-box-shadow:0 0 0 40px #1c1c1c inset;caret-color:#fff}
.rdSub__hp{position:absolute !important;left:-9999px !important;width:1px;height:1px;opacity:0}
.rdSub__error{margin:0 !important;align-self:flex-start;font-size:12.5px;color:#f3b4a7 !important}
.rdSub__cta{margin-top:.4rem}
.rdSub__fine{margin:.3rem 0 0 !important;font-size:11.5px;color:rgba(255,255,255,.55) !important}
.rdSub__check{width:56px;height:56px;border-radius:50%;border:1px solid rgba(255,255,255,.35) !important;display:grid;place-items:center;margin-bottom:.4rem}
.rdSub__check svg{width:24px;height:24px;fill:none;stroke:#fff;stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round}
@keyframes rdSubFade{from{opacity:0}to{opacity:1}}
@keyframes rdSubIn{from{opacity:0;transform:translateY(16px) scale(.98)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.rdSub__overlay,.rdSub__panel{animation:none}}
`,
        }}
      />
    </section>
  );
}
