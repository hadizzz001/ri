'use client';

import { useId, useRef, useState } from 'react';

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

/**
 * Newsletter sign-up, as on amadeussabra.com, in two places:
 *  - variant "band" (default): the "Stay up to date" section, white, centred,
 *    an e-mail field next to the subscribe button;
 *  - variant "footer": the "Newsletter" column of the dark footer.
 * /api/subscribe stores the address and sends a welcome email through Resend.
 */
export default function Subscribe({ variant = 'band' }) {
  const id = useId();
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const inFooter = variant === 'footer';

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
      ? `Thank you for subscribing! A welcome email is on its way to ${email.trim()}.`
      : 'Thank you for subscribing! We’ll be in touch with our latest news soon.';

  const form =
    status === 'done' ? (
      <p className="rdNews__done" role="status">{doneText}</p>
    ) : (
      <form className="rdNews__form" onSubmit={submit} noValidate>
        <div className="rdNews__row">
          <div className="rdNews__control">
            <input
              ref={inputRef}
              id={`${id}-email`}
              className={`rdNews__input${status === 'error' ? ' has-error' : ''}`}
              type="email"
              dir="ltr"
              inputMode="email"
              autoComplete="email"
              enterKeyHint="send"
              placeholder="E-mail"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === 'error') setStatus('idle');
              }}
              aria-invalid={status === 'error'}
              aria-describedby={status === 'error' ? `${id}-error` : undefined}
              required
            />
            <label htmlFor={`${id}-email`} className="sr-only">E-mail</label>
          </div>
          <button type="submit" className={`rd-btn${inFooter ? ' rd-btn--light' : ''}`} disabled={status === 'sending'}>
            {status === 'sending' ? 'Subscribing…' : inFooter ? 'Subscribe' : 'Subscribe now'}
          </button>
        </div>

        {/* Honeypot — hidden from people, bots fill it in */}
        <input
          className="rdNews__hp"
          type="text"
          name="rdnews_extra"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />

        {status === 'error' && (
          <p id={`${id}-error`} className="rdNews__error" role="alert">{error}</p>
        )}
      </form>
    );

  if (inFooter) {
    return (
      <div className="rdNews rdNews--footer">
        <p className="rdFooter__heading">Newsletter</p>
        <p className="rdNews__text">Sign up to our newsletter to receive exclusive offers.</p>
        {form}
        <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      </div>
    );
  }

  return (
    <section className="rdNews rdNews--band" aria-labelledby={`${id}-title`}>
      <div className="rdNews__inner">
        <div className="rdNews__head">
          <p className="rdNews__kicker">Stay up to date</p>
          <h2 id={`${id}-title`} className="rdNews__title">Join our Newsletter</h2>
          <p className="rdNews__text">Subscribe to stay in the loop with our latest news and product discounts</p>
        </div>
        {form}
      </div>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
    </section>
  );
}

/* Band: white with dark text (amadeussabra.com's newsletter colours, inverted).
   Footer column: on the footer's dark background, the button below the field. */
const STYLES = `
.rdNews--band{background:#fff;color:#1c1c1c;border-top:1px solid #dddddd!important;padding:40px 0}
@media(min-width:1000px){.rdNews--band{padding:64px 0}}
.rdNews__inner{display:grid;justify-items:center;gap:32px;margin:0 20px;text-align:center}
@media(min-width:700px){.rdNews__inner{margin:0 32px}}
@media(min-width:1000px){.rdNews__inner{margin:0 48px}}
.rdNews__head{max-width:680px}
.rdNews__kicker,.rdNews__title,.rdNews__text,.rdNews__done,.rdNews__error{margin:0!important}
.rdNews--band :is(.rdNews__kicker,.rdNews__title,.rdNews__text,.rdNews__done){color:#1c1c1c!important}
.rdNews__kicker,.rdNews__title{font-family:var(--font-heading)!important;font-weight:400!important;
  letter-spacing:.18em!important;text-transform:uppercase;overflow-wrap:anywhere}
.rdNews__kicker{font-size:12px!important;line-height:1.7!important}
.rdNews__title{margin-top:16px!important;font-size:clamp(20px,17.07px + .78vw,28px)!important;line-height:1.5!important}
.rdNews__text,.rdNews__done{font-size:14px;line-height:1.65}
.rdNews--band .rdNews__text{margin-top:16px!important}
@media(min-width:1000px){.rdNews--band :is(.rdNews__title,.rdNews__text){margin-top:20px!important}}

.rdNews__form{display:grid;gap:12px;width:100%}
@media(min-width:700px){.rdNews--band .rdNews__form{width:560px}}
.rdNews__row{display:flex;flex-wrap:wrap;gap:16px}
.rdNews__control{position:relative;flex:1 0 224px}
.rdNews__row .rd-btn{flex-grow:1;width:auto;min-height:0;padding:10.4px 28px}
.rdNews__input{display:block;width:100%;margin:0;padding:10.4px 12.8px;border:1px solid #dddddd!important;border-radius:12px;
  background:transparent;color:#1c1c1c!important;font-size:14px!important;line-height:1.65;text-align:left;
  -webkit-appearance:none;appearance:none;outline:none;transition:border-color .1s ease-in-out}
.rdNews__input::placeholder{color:rgba(28,28,28,.6)}
.rdNews__input:focus{border-color:#1c1c1c!important}
.rdNews__input.has-error{border-color:#b42318!important}
.rdNews__input:-webkit-autofill{-webkit-text-fill-color:#1c1c1c;-webkit-box-shadow:0 0 0 40px #fff inset;caret-color:#1c1c1c}
.rdNews__hp{position:absolute!important;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);opacity:0;pointer-events:none}
.rdNews__error{font-size:12.5px;text-align:left;color:#b42318!important}

.rdNews--footer{display:grid;align-content:start;gap:16px}
@media(min-width:700px){.rdNews--footer{gap:20px}}
.rdNews--footer :is(.rdNews__text,.rdNews__done){color:rgba(255,255,255,.65)!important}
.rdNews--footer .rdNews__form{gap:20px}
.rdNews--footer .rdNews__row{display:grid;gap:20px;justify-items:start}
.rdNews--footer .rdNews__control{width:100%}
.rdNews--footer .rdNews__row .rd-btn{flex-grow:0}
.rdNews--footer .rdNews__input{border-color:#3e3e3e!important;color:#fff!important}
.rdNews--footer .rdNews__input::placeholder{color:rgba(255,255,255,.6)}
.rdNews--footer .rdNews__input:focus{border-color:#fff!important}
.rdNews--footer .rdNews__input.has-error{border-color:#e8a598!important}
.rdNews--footer .rdNews__input:-webkit-autofill{-webkit-text-fill-color:#fff;-webkit-box-shadow:0 0 0 40px #1c1c1c inset;caret-color:#fff}
.rdNews--footer .rdNews__error{color:#f3b4a7!important}
`;
