'use client';

import { useEffect, useRef, useState } from 'react';
import { LANGUAGES, useLanguage } from '../app/context/LanguageContext';

/** Floating EN / ع / FR picker shown on every page. */
export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div ref={ref} className="rd-langsw" translate="no" data-no-translate dir="ltr">
      {open && (
        <ul className="rd-langsw-menu" role="listbox" aria-label="Language">
          {LANGUAGES.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.code === lang}
                className={l.code === lang ? 'is-on' : ''}
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
              >
                <span className="rd-langsw-code">{l.short}</span>
                <span lang={l.code}>{l.label}</span>
                {l.code === lang && <span className="rd-langsw-check">✓</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        className="rd-langsw-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        onClick={() => setOpen((o) => !o)}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.4 2.6 3.6 5.6 3.6 9s-1.2 6.4-3.6 9c-2.4-2.6-3.6-5.6-3.6-9S9.6 5.6 12 3z" />
        </svg>
        <span>{current.short}</span>
      </button>

      <style>{`
        .rd-langsw{position:fixed;left:14px;bottom:96px;z-index:9999;font-family:Nunito,system-ui,sans-serif}
        .rd-langsw-btn{display:flex;align-items:center;gap:6px;height:42px;padding:0 14px;border-radius:999px;border:1px solid #e4e4e7;background:#fff;color:#0d0d0d;font-weight:700;font-size:14px;box-shadow:0 6px 20px rgba(0,0,0,.12);cursor:pointer}
        .rd-langsw-btn:hover{background:#f4f4f5}
        .rd-langsw-menu{position:absolute;bottom:52px;left:0;list-style:none;margin:0;padding:6px;min-width:180px;background:#fff;border:1px solid #e4e4e7;border-radius:14px;box-shadow:0 12px 32px rgba(0,0,0,.16)}
        .rd-langsw-menu button{display:flex;align-items:center;gap:10px;width:100%;padding:9px 10px;border:0;background:none;border-radius:10px;font-size:14px;color:#0d0d0d;cursor:pointer;text-align:left}
        .rd-langsw-menu button:hover,.rd-langsw-menu button.is-on{background:#f4f4f5}
        .rd-langsw-code{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;background:#0d0d0d;color:#fff;font-size:12px;font-weight:700}
        .rd-langsw-check{margin-left:auto;font-weight:700}
      `}</style>
    </div>
  );
}
