'use client';

/**
 * A select with a search box, for the booking page's country and city fields
 * (Lebanon alone has 100+ cities, the "Your country" list ~250 countries).
 *
 *  - Closed, it looks like the page's other fields (.fr-input).
 *  - Open: a search box above the list. Typing filters it in English or
 *    Arabic whatever the page language, ignoring letter case, accents,
 *    hamza forms and tashkeel. ↑ ↓ move, Enter picks, Esc closes.
 *  - On phones the list opens full screen, rendered in <body> so the site
 *    header and the floating WhatsApp / booking buttons can't cover it.
 *
 * options: [{ value, label, keywords?, tag? }] — `keywords` are matched too
 * (e.g. the English name on the Arabic page), `tag` is a small note shown
 * next to the name (e.g. "Not available").
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const PHONE = '(max-width: 640px)';

/** Text reduced for matching: lower case, no accents / Arabic marks, ى→ي, ة→ه. */
const fold = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[̀-ًͯ-ٰٟـ]/g, '')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

/** 0 = starts with the query, 1 = a word starts with it, 2 = contains it, 9 = no match. */
const rank = (text, q) => (text.startsWith(q) ? 0 : text.includes(` ${q}`) ? 1 : text.includes(q) ? 2 : 9);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-4.2-4.2" />
  </svg>
);

const CheckIcon = () => (
  <svg className="fr-ss-check" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

export default function SearchSelect({
  id,
  labelId,
  label,
  value,
  options,
  onChange,
  placeholder,
  searchPlaceholder,
  noResults,
  closeLabel,
  disabled = false,
  hasError = false,
  dir = 'ltr',
  lang = 'en',
}) {
  const [open, setOpen] = useState(false);
  const [sheet, setSheet] = useState(false); // full screen (phones)
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const triggerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const listId = `${id}-list`;
  const optId = (i) => `${id}-opt-${i}`;
  const selected = options.find((o) => o.value === value) || null;

  const prepared = useMemo(
    () =>
      options.map((o, i) => ({
        ...o,
        i,
        folded: fold(o.label),
        keys: fold(`${o.value} ${o.keywords || ''}`),
      })),
    [options]
  );

  // Best matches first (name starts with the query, then a word does), in list order
  const results = useMemo(() => {
    const q = fold(query);
    if (!q) return prepared;
    return prepared
      .map((o) => [Math.min(rank(o.folded, q), rank(o.keys, q)), o])
      .filter(([r]) => r < 9)
      .sort((a, b) => a[0] - b[0] || a[1].i - b[1].i)
      .map(([, o]) => o);
  }, [prepared, query]);

  const openList = (initial = '') => {
    if (disabled) return;
    setSheet(typeof window !== 'undefined' && !!window.matchMedia?.(PHONE).matches);
    setQuery(initial);
    setActive(initial ? 0 : Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };

  const closeList = (refocus = true) => {
    setOpen(false);
    setQuery('');
    if (refocus) triggerRef.current?.focus({ preventScroll: true });
  };

  const pick = (o) => {
    if (!o) return;
    onChange(o.value);
    closeList(true);
  };

  // Opened: the search box takes the focus; on a computer the whole list is scrolled into view
  useEffect(() => {
    if (!open) return;
    const input = inputRef.current;
    if (input) {
      input.focus({ preventScroll: true });
      const end = input.value.length;
      input.setSelectionRange?.(end, end);
    }
    if (!sheet) panelRef.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
  }, [open, sheet]);

  // A click anywhere else closes it
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (rootRef.current?.contains(e.target) || panelRef.current?.contains(e.target)) return;
      closeList(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Full screen on a phone: the page behind doesn't scroll
  useEffect(() => {
    if (!open || !sheet) return undefined;
    const html = document.documentElement;
    const before = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => {
      html.style.overflow = before;
    };
  }, [open, sheet]);

  // Keep the highlighted option visible (scrolls the list only, never the page)
  useEffect(() => {
    const list = listRef.current;
    const el = list?.querySelector(`[data-idx="${active}"]`);
    if (!open || !list || !el) return;
    const top = el.offsetTop;
    const bottom = top + el.offsetHeight;
    if (top < list.scrollTop) list.scrollTop = top;
    else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
  }, [active, open, results]);

  const onTriggerKey = (e) => {
    if (disabled || open) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      openList();
    } else if (e.key.length === 1 && e.key !== ' ' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // Typing on the closed field starts a search with that letter
      e.preventDefault();
      openList(e.key);
    }
  };

  const onSearchKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      pick(results[active]);
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
      closeList(true);
    }
  };

  const panel = (
    <div className={`fr-ss-panel ${sheet ? 'is-sheet' : ''}`} ref={panelRef}>
      {sheet && (
        <div className="fr-ss-head">
          <span className="fr-ss-title">{label}</span>
          <button type="button" className="fr-ss-close" onClick={() => closeList(true)} aria-label={closeLabel}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      )}

      <div className="fr-ss-searchbox">
        <SearchIcon />
        <input
          ref={inputRef}
          className="fr-ss-search"
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={results[active] ? optId(active) : undefined}
          aria-label={searchPlaceholder}
          placeholder={searchPlaceholder}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          enterKeyHint="go"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onSearchKey}
        />
      </div>

      <div className="fr-ss-list" id={listId} role="listbox" aria-label={label} ref={listRef}>
        {results.map((o, idx) => {
          const isOn = o.value === value;
          return (
            <div
              key={o.value}
              id={optId(idx)}
              data-idx={idx}
              role="option"
              aria-selected={isOn}
              className={`fr-ss-opt ${idx === active ? 'is-active' : ''} ${isOn ? 'is-selected' : ''}`}
              onMouseMove={() => idx !== active && setActive(idx)}
              onMouseDown={(e) => e.preventDefault()} // keep the focus in the search box
              onClick={() => pick(o)}
            >
              <span className="fr-ss-opt-label">{o.label}</span>
              {o.tag ? <span className="fr-ss-tag">{o.tag}</span> : null}
              {isOn ? <CheckIcon /> : null}
            </div>
          );
        })}
        {results.length === 0 && <div className="fr-ss-empty">{noResults}</div>}
      </div>
    </div>
  );

  return (
    <div className={`fr-ss ${open ? 'is-open' : ''}`} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        className={`fr-ss-trigger ${hasError ? 'has-error' : ''} ${selected ? '' : 'is-empty'}`}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-labelledby={labelId ? `${labelId} ${id}` : undefined}
        onClick={() => (open ? closeList(true) : openList())}
        onKeyDown={onTriggerKey}
      >
        <span className="fr-ss-value">{selected ? selected.label : placeholder}</span>
        {selected?.tag ? <span className="fr-ss-tag">{selected.tag}</span> : null}
      </button>

      {open &&
        (sheet
          ? createPortal(
              <div className="fr-ss-sheet" dir={dir} lang={lang} translate="no" data-no-translate>
                {panel}
              </div>,
              document.body
            )
          : panel)}
    </div>
  );
}
