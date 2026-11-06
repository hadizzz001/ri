'use client';

/**
 * The website's bell, in the header: the appointment and order updates of the
 * signed-in client, or of the guest who booked from this browser. Visitors who
 * have done neither don't see it.
 *
 * Opening it marks everything as read. New ones are looked for every minute
 * while the page is on screen, and right after the page sends the
 * `rd:notifications` event (booked, cancelled). Whatever the salon does shows
 * up as a small message too.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../app/context/AuthContext';
import { useLanguage } from '../app/context/LanguageContext';
import { BELL_TEXT, notificationText, timeAgo } from '../app/lib/notificationText';

const POLL_MS = 60 * 1000;
const TOAST_MS = 8 * 1000;

const ICONS = {
  calendar: (
    <>
      <rect x="4" y="5.5" width="16" height="15" rx="2" />
      <path d="M8 3.5v4M16 3.5v4M4 10h16" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 12.3l2.4 2.4 4.6-5" />
    </>
  ),
  cancel: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.2 9.2l5.6 5.6M14.8 9.2l-5.6 5.6" />
    </>
  ),
  card: (
    <>
      <rect x="3.5" y="6" width="17" height="12" rx="2" />
      <path d="M3.5 10h17M7 14.5h3" />
    </>
  ),
  bag: (
    <>
      <path d="M4.5 8h15v12h-15z" />
      <path d="M8 8c0-2.6 1.8-4.5 4-4.5S16 5.4 16 8" />
    </>
  ),
};

const Icon = ({ name }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    {ICONS[name] || ICONS.calendar}
  </svg>
);

/** Newest first, without doubles; the freshly loaded copy of a notification wins. */
const merge = (fresh, known) => {
  const ids = new Set(fresh.map((n) => n.id));
  return [...fresh, ...known.filter((n) => !ids.has(n.id))].sort((a, b) => (a.id < b.id ? 1 : -1));
};

function Row({ n, lang, signedIn, onLeave }) {
  const text = notificationText(n, lang);
  const words = BELL_TEXT[lang] || BELL_TEXT.en;
  return (
    <li className={`rd-notif__row ${n.read ? '' : 'is-unread'} ${text.urgent ? 'is-urgent' : ''}`}>
      <span className="rd-notif__icon">
        <Icon name={text.icon} />
      </span>
      <div className="rd-notif__body">
        <p className="rd-notif__title">{text.title}</p>
        <p className="rd-notif__text">{text.body}</p>
        <div className="rd-notif__meta">
          <time dateTime={n.createdAt}>{timeAgo(n.createdAt, lang)}</time>
          {signedIn && (
            <a href={text.href} onClick={onLeave}>
              {text.hrefLabel}
            </a>
          )}
        </div>
        {text.whatsapp && (
          <a
            className="rd-btn rd-btn--sm rd-btn--auto rd-notif__wa"
            href={text.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            {words.continueWhatsApp}
          </a>
        )}
      </div>
    </li>
  );
}

export default function NotificationBell() {
  const { user } = useAuth();
  const { lang: siteLang, dir } = useLanguage();
  const lang = BELL_TEXT[siteLang] ? siteLang : 'en';
  const words = BELL_TEXT[lang];

  const [enabled, setEnabled] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [open, setOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const seen = useRef(null); // ids already shown (null: nothing loaded yet)
  const firstPage = useRef(true); // "Show more" counts from the first load
  const unreadNow = useRef(0); // the server's count, for marking as read only when needed
  const isOpen = useRef(false); // while it is open the badge stays off, whatever comes in
  const closeBtn = useRef(null);
  const bellBtn = useRef(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setEnabled(!!data.enabled);
      unreadNow.current = data.unread || 0;
      setUnread(isOpen.current ? 0 : unreadNow.current);
      setItems((known) => merge(data.items || [], known));
      if (firstPage.current) {
        firstPage.current = false;
        setHasMore(!!data.hasMore);
      }

      const page = data.items || [];
      const known = seen.current;
      seen.current = new Set([...(known || []), ...page.map((n) => n.id)]);
      if (known) {
        // Something the salon did while the client is here: tell them
        const fresh = page.filter((n) => !known.has(n.id) && n.actor === 'admin' && !n.read);
        if (fresh.length) setToasts((list) => [...fresh, ...list].slice(0, 3));
      }
    } catch {
      /* offline: the next round tries again */
    }
  }, []);

  // Signing in or out changes whose notifications these are
  useEffect(() => {
    seen.current = null;
    firstPage.current = true;
    setItems([]);
    load();
  }, [user?._id, load]);

  // The page says something just happened (a guest may have just got their bell)
  useEffect(() => {
    window.addEventListener('rd:notifications', load);
    return () => window.removeEventListener('rd:notifications', load);
  }, [load]);

  // Visitors without a bell don't keep asking
  useEffect(() => {
    if (!enabled) return undefined;
    const refresh = () => {
      if (document.visibilityState === 'visible') load();
    };
    const timer = window.setInterval(refresh, POLL_MS);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [enabled, load]);

  // The small messages leave by themselves
  useEffect(() => {
    if (!toasts.length) return undefined;
    const timer = window.setTimeout(() => setToasts((list) => list.slice(0, -1)), TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [toasts]);

  const markAllRead = useCallback(() => {
    if (unreadNow.current > 0) fetch('/api/notifications', { method: 'PATCH' }).catch(() => {});
    unreadNow.current = 0;
    setUnread(0);
  }, []);

  const openPanel = () => {
    isOpen.current = true;
    setOpen(true);
    setToasts([]);
    markAllRead();
  };

  // Closing it is when the ones just read lose their highlight
  const closePanel = useCallback(() => {
    isOpen.current = false;
    setOpen(false);
    setItems((list) => list.map((n) => (n.read ? n : { ...n, read: true })));
    markAllRead(); // any that came in while it was open
    bellBtn.current?.focus();
  }, [markAllRead]);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtn.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') closePanel();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, closePanel]);

  const loadMore = async () => {
    const last = items[items.length - 1]?.id;
    if (!last || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/notifications?before=${last}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setItems((known) => merge(known, data.items || []));
        setHasMore(!!data.hasMore);
      }
    } finally {
      setLoadingMore(false);
    }
  };

  if (!enabled) return null;

  return (
    <>
      <button
        type="button"
        ref={bellBtn}
        className="nav-btn rd-bell"
        onClick={openPanel}
        aria-label={words.bell(unread)}
        aria-haspopup="dialog"
        aria-expanded={open}
        translate="no"
        data-no-translate
      >
        <svg className="nav-ico" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18 10a6 6 0 0 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 16 18 10z" />
          <path d="M10.2 20.5a2 2 0 0 0 3.6 0" />
        </svg>
        {unread > 0 && <span className="nav-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open &&
        createPortal(
          <div className="rd-notif" role="dialog" aria-modal="true" aria-label={words.title} dir={dir} lang={lang} translate="no" data-no-translate>
            <div className="rd-notif__backdrop" onClick={closePanel} />
            <div className="rd-notif__panel">
              <div className="rd-notif__head">
                <h2>{words.title}</h2>
                <button type="button" ref={closeBtn} className="rd-notif__close" onClick={closePanel} aria-label={words.close}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 5l14 14M19 5L5 19" />
                  </svg>
                </button>
              </div>

              {items.length === 0 ? (
                <div className="rd-notif__empty">
                  <p className="rd-notif__title">{words.empty}</p>
                  <p className="rd-notif__text">{words.emptyText}</p>
                </div>
              ) : (
                <ul className="rd-notif__list">
                  {items.map((n) => (
                    <Row key={n.id} n={n} lang={lang} signedIn={!!user} onLeave={closePanel} />
                  ))}
                </ul>
              )}

              {hasMore && (
                <button type="button" className="rd-btn rd-btn--ghost rd-btn--sm rd-notif__more" disabled={loadingMore} onClick={loadMore}>
                  {words.more}
                </button>
              )}
            </div>
          </div>,
          document.body
        )}

      {toasts.length > 0 &&
        createPortal(
          <div className="rd-ntoasts" dir={dir} lang={lang} translate="no" data-no-translate>
            {toasts.map((n) => {
              const text = notificationText(n, lang);
              return (
                <div className="rd-ntoast" role="status" key={n.id}>
                  <button type="button" className="rd-ntoast__main" onClick={openPanel}>
                    <span className="rd-notif__icon">
                      <Icon name={text.icon} />
                    </span>
                    <span>
                      <strong>{text.title}</strong>
                      <small>{text.body}</small>
                    </span>
                  </button>
                  <button
                    type="button"
                    className="rd-notif__close"
                    aria-label={words.dismiss}
                    onClick={() => setToasts((list) => list.filter((x) => x.id !== n.id))}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 5l14 14M19 5L5 19" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
}
