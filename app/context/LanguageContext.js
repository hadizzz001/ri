'use client';

/**
 * Site language: English (default), Arabic and French.
 *
 * The site is written in English. When Arabic or French is picked, every
 * visible text (and placeholder / title / alt / aria-label) is translated in
 * place through /api/translate, which tries several free providers in turn and
 * caches each sentence for good. New content (client-side navigation, loaded
 * lists, opened menus…) is picked up by a MutationObserver.
 *
 * Opt out on any element with translate="no", class "notranslate" or the
 * data-no-translate attribute (e.g. the booking page, which has its own
 * hand-written EN / AR / FR wording, brand names, prices).
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

export const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN', dir: 'ltr' },
  { code: 'ar', label: 'العربية', short: 'ع', dir: 'rtl' },
  { code: 'fr', label: 'Français', short: 'FR', dir: 'ltr' },
];

const STORAGE_KEY = 'rd-lang';
const CACHE_KEY = (lang) => `rd-tr2-${lang}`;

const decode = (s) =>
  String(s ?? '')
    .replace(/&#(\d+);?/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);?/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
const ATTRS = ['placeholder', 'title', 'alt', 'aria-label'];
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'TEXTAREA', 'SVG', 'IFRAME', 'CANVAS']);
const BATCH = 60;

const LanguageContext = createContext({ lang: 'en', dir: 'ltr', setLang: () => {} });
export const useLanguage = () => useContext(LanguageContext);

const hasLetters = (s) => /[A-Za-zÀ-ÿ]{2,}/.test(s);

function skipped(el) {
  for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
    if (SKIP_TAGS.has(n.tagName)) return true;
    if (n.getAttribute('translate') === 'no') return true;
    if (n.hasAttribute('data-no-translate')) return true;
    if (n.classList?.contains('notranslate')) return true;
    if (n.isContentEditable) return true;
  }
  return false;
}

function loadCache(lang) {
  try {
    return new Map(Object.entries(JSON.parse(localStorage.getItem(CACHE_KEY(lang)) || '{}')));
  } catch {
    return new Map();
  }
}

function saveCache(lang, map) {
  try {
    // Keep the newest ~4000 entries so localStorage never fills up
    const entries = [...map.entries()].slice(-4000);
    localStorage.setItem(CACHE_KEY(lang), JSON.stringify(Object.fromEntries(entries)));
  } catch {
    /* storage full or blocked: memory cache still works */
  }
}

/** DOM translator bound to one language at a time. */
function createTranslator() {
  // text node → { original, applied }; element → { attr: { original, applied } }
  const textState = new WeakMap();
  const attrState = new WeakMap();
  const touched = new Set(); // nodes/elements to restore on "English"
  let lang = 'en';
  let cache = new Map();
  let observer = null;
  let pending = new Map(); // original text → [apply callbacks]
  let timer = null;
  let inflight = 0;

  const flush = async () => {
    timer = null;
    if (!pending.size || lang === 'en') return;
    const jobs = pending;
    pending = new Map();
    const texts = [...jobs.keys()];
    const forLang = lang;

    for (let i = 0; i < texts.length; i += BATCH) {
      const chunk = texts.slice(i, i + BATCH);
      inflight += 1;
      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts: chunk, target: forLang }),
        });
        const json = await res.json();
        if (forLang !== lang) return; // language changed meanwhile
        chunk.forEach((t, k) => {
          const raw = json?.translations?.[k];
          const out = raw ? decode(raw) : raw;
          if (out && out !== t) cache.set(t, out);
          (jobs.get(t) || []).forEach((apply) => apply(out || t));
        });
        saveCache(forLang, cache);
      } catch {
        /* offline / all providers down: leave the English text */
      } finally {
        inflight -= 1;
      }
    }
  };

  const request = (original, apply) => {
    const key = original.trim();
    if (cache.has(key)) {
      apply(cache.get(key));
      return;
    }
    if (!pending.has(key)) pending.set(key, []);
    pending.get(key).push(apply);
    if (!timer) timer = setTimeout(flush, 120);
  };

  // Keep the original's surrounding whitespace around the translation
  const wrap = (original, translated) => {
    const lead = original.match(/^\s*/)[0];
    const trail = original.match(/\s*$/)[0];
    let body = translated.trim();
    if (!/\n/.test(original)) body = body.replace(/\s*\n+\s*/g, ' ');
    return lead + body + trail;
  };

  const handleText = (node) => {
    const value = node.nodeValue || '';
    let st = textState.get(node);
    // React (or anything else) replaced the text: that is the new original
    if (st && value !== st.applied && value !== st.original) st = null;
    if (!st) {
      if (!value.trim() || !hasLetters(value)) return;
      st = { original: value, applied: null };
      textState.set(node, st);
    }
    if (!node.parentElement || skipped(node.parentElement)) return;
    touched.add(node);
    const original = st.original;
    request(original, (out) => {
      const cur = textState.get(node);
      if (!cur || cur.original !== original || lang === 'en') return;
      const next = wrap(original, out);
      cur.applied = next;
      if (node.nodeValue !== next) node.nodeValue = next;
    });
  };

  const handleAttrs = (el) => {
    if (skipped(el)) return;
    for (const attr of ATTRS) {
      const value = el.getAttribute(attr);
      if (!value) continue;
      let all = attrState.get(el);
      if (!all) {
        all = {};
        attrState.set(el, all);
      }
      let st = all[attr];
      if (st && value !== st.applied && value !== st.original) st = null;
      if (!st) {
        if (!hasLetters(value)) continue;
        st = { original: value, applied: null };
        all[attr] = st;
      }
      touched.add(el);
      const original = st.original;
      request(original, (out) => {
        const cur = attrState.get(el)?.[attr];
        if (!cur || cur.original !== original || lang === 'en') return;
        cur.applied = out;
        if (el.getAttribute(attr) !== out) el.setAttribute(attr, out);
      });
    }
  };

  const walk = (root) => {
    if (!root) return;
    if (root.nodeType === 3) return handleText(root);
    if (root.nodeType !== 1) return;
    if (skipped(root)) return;
    handleAttrs(root);
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
      acceptNode: (n) =>
        n.nodeType === 1 && (SKIP_TAGS.has(n.tagName) || n.getAttribute('translate') === 'no' || n.hasAttribute('data-no-translate') || n.classList.contains('notranslate'))
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT,
    });
    let n = tw.nextNode();
    while (n) {
      if (n.nodeType === 3) handleText(n);
      else handleAttrs(n);
      n = tw.nextNode();
    }
  };

  const restore = () => {
    touched.forEach((n) => {
      if (n.nodeType === 3) {
        const st = textState.get(n);
        if (st && n.nodeValue === st.applied) n.nodeValue = st.original;
        textState.delete(n);
      } else {
        const all = attrState.get(n) || {};
        Object.entries(all).forEach(([attr, st]) => {
          if (n.getAttribute(attr) === st.applied) n.setAttribute(attr, st.original);
        });
        attrState.delete(n);
      }
    });
    touched.clear();
  };

  return {
    setLang(next) {
      if (observer) observer.disconnect();
      observer = null;
      pending = new Map();
      if (timer) clearTimeout(timer);
      timer = null;
      restore();
      lang = next;
      if (next === 'en') return;
      cache = loadCache(next);
      walk(document.body);
      observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.type === 'characterData') handleText(m.target);
          else if (m.type === 'attributes') handleAttrs(m.target);
          else m.addedNodes.forEach((n) => walk(n));
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ATTRS,
      });
    },
    get busy() {
      return inflight > 0;
    },
  };
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('en');
  const translator = useRef(null);

  // Saved choice (or ?lang=ar / ?lang=fr in the address)
  useEffect(() => {
    let initial = 'en';
    try {
      const fromUrl = new URLSearchParams(window.location.search).get('lang');
      const saved = localStorage.getItem(STORAGE_KEY);
      initial = [fromUrl, saved].find((l) => LANGUAGES.some((x) => x.code === l)) || 'en';
    } catch {
      /* ignore */
    }
    setLangState(initial);
  }, []);

  useEffect(() => {
    const info = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
    const html = document.documentElement;
    html.lang = lang;
    html.dir = info.dir;
    html.classList.toggle('is-rtl', info.dir === 'rtl');
    document.body.classList.toggle('lang-ar', lang === 'ar');
    if (!translator.current) translator.current = createTranslator();
    translator.current.setLang(lang);
  }, [lang]);

  const setLang = useCallback((next) => {
    if (!LANGUAGES.some((l) => l.code === next)) return;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    setLangState(next);
  }, []);

  const dir = (LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0]).dir;

  return <LanguageContext.Provider value={{ lang, dir, setLang }}>{children}</LanguageContext.Provider>;
}
